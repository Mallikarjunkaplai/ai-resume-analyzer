// ── Imports ────────────────────────────────────────────────────────────────
import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = 'force-dynamic';
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import Groq from "groq-sdk";

// ── Upstash Redis + Rate Limiter (module-level singleton) ──────────────────
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Sliding window: max 5 requests per user per minute
const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 m"),
});

// ── Input validation schema ────────────────────────────────────────────────
const resumeSchema = z.object({
    fileName: z.string().min(1).max(255),
    rawText: z.string().min(10).max(50000), // 50k chars ≈ ~12,500 tokens
    jobDescription: z.string().max(20000).optional(),
});

// ── Groq API Client ────────────────────────────────────────────────────────
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `
You are an expert Applicant Tracking System (ATS) and a senior technical recruiter.
You will receive the raw text of a candidate's resume and optionally the job description they are targeting.

You MUST analyze the resume against these specific criteria:
1. Keyword match percentage against the target job description (if no job description is provided, analyze against typical/standard keyword density and industry-standard expectations for the candidate's target field).
2. Formatting standards (assess structure, readability, clean sections, contact details, fonts).
3. Impact of bullet points (assess action verbs, metrics, achievements, STAR method).
4. Clarity of summary (assess executive summary or objective effectiveness, tone, relevance).

Your JSON output MUST exactly match this structure:
{
  "score": <an integer between 0 and 100 representing calculated overall ATS strength, based on the four criteria>,
  "feedbackJson": {
    "missingKeywords": ["keyword1", "keyword2"],
    "formattingTips": ["tip1", "tip2"],
    "summary": "<a detailed, structured analysis of the resume's strengths and weaknesses against the four criteria, providing constructive feedback>"
  }
}

Do NOT include any markdown formatting, conversational text, or backticks. Output ONLY the raw JSON object.
`;

// ── Route Handler ──────────────────────────────────────────────────────────
export async function POST(req: Request) {
    try {
        // 1. Secure the route: Get the user ID from Clerk
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // 2. Enforce rate limit — keyed per user so each user gets 5 req/min
        const { success, limit, remaining, reset } = await ratelimit.limit(userId);
        if (!success) {
            return NextResponse.json(
                { error: "Too many requests. Please wait before trying again." },
                {
                    status: 429,
                    headers: {
                        "X-RateLimit-Limit": String(limit),
                        "X-RateLimit-Remaining": String(remaining),
                        "X-RateLimit-Reset": String(reset),
                    },
                }
            );
        }

        // 3. Parse and validate the request body with Zod
        const body = await req.json();
        const parsed = resumeSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }
        const { fileName, rawText, jobDescription } = parsed.data;

        // 4. Ensure the User record exists in the database
        // (Avoids foreign key violations if the Clerk sync webhook is delayed)
        const userExists = await db.user.findUnique({ where: { id: userId } });
        if (!userExists) {
            console.log(`[RESUME_UPLOAD] User ${userId} not found in DB. Performing dynamic sync.`);
            const clerkUser = await currentUser();
            if (clerkUser) {
                const primaryEmail = clerkUser.emailAddresses.find(
                    (e) => e.id === clerkUser.primaryEmailAddressId
                )?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress ?? "";

                await db.user.upsert({
                    where: { id: userId },
                    create: {
                        id: userId,
                        email: primaryEmail,
                        firstName: clerkUser.firstName,
                        lastName: clerkUser.lastName,
                    },
                    update: {},
                });
            } else {
                // Fail-safe placeholder user
                await db.user.upsert({
                    where: { id: userId },
                    create: {
                        id: userId,
                        email: `user-${userId}@temp-clerk-sync.com`,
                    },
                    update: {},
                });
            }
        }

        // 5. Query the Groq model directly (removes dependency on internal server HTTP fetches)
        let score = 70;
        let feedbackJson = {
            missingKeywords: [] as string[],
            formattingTips: [] as string[],
            summary: "Analysis completed with fallback parameters.",
        };

        try {
            const chatCompletion = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { 
                        role: "user", 
                        content: `Resume:\n${rawText}\n\nTarget Job Description:\n${jobDescription || "Not provided (evaluate against industry standards)."}`
                    }
                ],
                model: "llama-3.1-8b-instant",
                temperature: 0.2,
                response_format: { type: "json_object" }
            });

            const aiResponse = chatCompletion.choices[0]?.message?.content || "{}";
            const parsedData = JSON.parse(aiResponse);

            if (typeof parsedData.score === "number") {
                score = parsedData.score;
            } else if (typeof parsedData.score === "string") {
                score = parseInt(parsedData.score, 10) || 70;
            }

            if (parsedData.feedbackJson && typeof parsedData.feedbackJson === "object") {
                feedbackJson = {
                    missingKeywords: Array.isArray(parsedData.feedbackJson.missingKeywords) ? parsedData.feedbackJson.missingKeywords : [],
                    formattingTips: Array.isArray(parsedData.feedbackJson.formattingTips) ? parsedData.feedbackJson.formattingTips : [],
                    summary: typeof parsedData.feedbackJson.summary === "string" ? parsedData.feedbackJson.summary : "No summary provided.",
                };
            } else if (parsedData.missingKeywords || parsedData.formattingTips || parsedData.summary) {
                feedbackJson = {
                    missingKeywords: Array.isArray(parsedData.missingKeywords) ? parsedData.missingKeywords : [],
                    formattingTips: Array.isArray(parsedData.formattingTips) ? parsedData.formattingTips : [],
                    summary: typeof parsedData.summary === "string" ? parsedData.summary : "No summary provided.",
                };
            }
        } catch (groqErr) {
            console.error("[GROQ_ANALYSIS_ERROR]", groqErr);
            throw new Error("Failed to generate ATS analysis via Groq. Please check your API key.");
        }

        // 6. Save EVERYTHING to Neon Database safely using a Transaction
        const savedResume = await db.$transaction(async (tx: any) => {
            // Create the Resume record
            const resume = await tx.resume.create({
                data: {
                    userId,
                    fileName,
                    rawText,
                },
            });

            // Create the Analysis record linked to the newly created Resume
            await tx.analysis.create({
                data: {
                    resumeId: resume.id,
                    score,
                    feedbackJson,
                },
            });

            return resume;
        });

        // 7. Send success response back to the frontend UI
        return NextResponse.json({
            success: true,
            resumeId: savedResume.id,
            message: "Resume saved and analyzed perfectly."
        }, { status: 200 });

    } catch (error) {
        console.error("[RESUME_POST_ERROR]", error);
        return new NextResponse(
            error instanceof Error ? error.message : "Internal Server Error",
            { status: 500 }
        );
    }
}