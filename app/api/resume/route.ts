// ── Imports ────────────────────────────────────────────────────────────────
import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import Groq from "groq-sdk";

// Force this route to be dynamic to prevent static generation errors
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ── Upstash Redis + Rate Limiter (module-level singleton) ──────────────────
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || "",
    token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 m"),
});

// ── Input validation schema ────────────────────────────────────────────────
const resumeSchema = z.object({
    fileName: z.string().min(1).max(255),
    rawText: z.string().min(10).max(50000),
    jobDescription: z.string().max(20000).optional(),
});

// ── Groq API Client ────────────────────────────────────────────────────────
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || "",
});

const SYSTEM_PROMPT = `You are an expert ATS. Analyze the resume. Output ONLY raw JSON: {"score": <int>, "feedbackJson": {"missingKeywords": [], "formattingTips": [], "summary": ""}}`;

// ── Route Handler ──────────────────────────────────────────────────────────
export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const { success } = await ratelimit.limit(userId);
        if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

        const body = await req.json();
        const parsed = resumeSchema.safeParse(body);
        if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

        const { fileName, rawText, jobDescription } = parsed.data;

        // Ensure user exists
        const userExists = await db.user.findUnique({ where: { id: userId } });
        if (!userExists) {
            const clerkUser = await currentUser();
            await db.user.upsert({
                where: { id: userId },
                create: {
                    id: userId,
                    email: clerkUser?.emailAddresses[0]?.emailAddress || `user-${userId}@temp.com`,
                },
                update: {},
            });
        }

        // Groq Analysis
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: `Resume:\n${rawText}\n\nTarget Job Description:\n${jobDescription || "Standard"}` }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.2,
            response_format: { type: "json_object" }
        });

        const aiResponse = chatCompletion.choices[0]?.message?.content || "{}";
        const parsedData = JSON.parse(aiResponse);

        // Database Transaction (using any to bypass strict TS build types if needed)
        const savedResume = await (db as any).$transaction(async (tx: any) => {
            const resume = await tx.resume.create({
                data: { userId, fileName, rawText },
            });
            await tx.analysis.create({
                data: {
                    resumeId: resume.id,
                    score: Number(parsedData.score) || 70,
                    feedbackJson: parsedData.feedbackJson || {},
                },
            });
            return resume;
        });

        return NextResponse.json({ success: true, resumeId: savedResume.id }, { status: 200 });

    } catch (error) {
        console.error("[RESUME_POST_ERROR]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}