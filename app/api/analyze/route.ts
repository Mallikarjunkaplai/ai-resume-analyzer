import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { auth } from "@clerk/nextjs/server";

export const dynamic = 'force-dynamic';

// ── The Master Prompt: Forcing the AI to match your Prisma Analysis model ──
const SYSTEM_PROMPT = `
You are an expert Applicant Tracking System (ATS) and a senior technical recruiter.
You will receive the raw text of a candidate's resume.
You MUST analyze the text and respond strictly in valid JSON format.

Your JSON output MUST exactly match this structure:
{
  "score": <an integer between 0 and 100 representing overall ATS strength>,
  "feedbackJson": {
    "missingKeywords": ["keyword1", "keyword2"],
    "formattingTips": ["tip1", "tip2"],
    "summary": "<a short professional summary of the resume's strengths and weaknesses>"
  }
}

Do NOT include any markdown formatting, conversational text, or backticks. Output ONLY the raw JSON object.
`;

// ── Lazy singleton ──────────────────────────────────────────────────────────
// Initialized on first request, NOT at module evaluation time.
// This prevents Vercel from crashing during build/page-data collection when
// GROQ_API_KEY is not yet injected into the process environment.

let _groq: Groq | null = null;

function getGroq(): Groq {
    if (_groq) return _groq;
    _groq = new Groq({
        apiKey: process.env.GROQ_API_KEY || "dummy-key",
    });
    return _groq;
}

export async function POST(req: Request) {
    try {
        // Guard: only authenticated users (or our own server-side fetch) can call this
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Parse the incoming request (we will send the resume text here later)
        const body = await req.json();
        const { rawText } = body;

        if (!rawText) {
            return NextResponse.json({ error: "No resume text provided" }, { status: 400 });
        }

        // Call the blazing-fast Groq LLM (Llama 3.1)
        const chatCompletion = await getGroq().chat.completions.create({
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: rawText }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.2, // Low temperature ensures consistent, logical scoring
            response_format: { type: "json_object" } // The magic parameter that guarantees valid JSON
        });

        // Extract the AI's response and parse it into an actual object
        const aiResponse = chatCompletion.choices[0]?.message?.content || "{}";
        const parsedData = JSON.parse(aiResponse);

        // Send the perfect data back to our app
        return NextResponse.json(parsedData, { status: 200 });

    } catch (error) {
        console.error("AI Analysis Error:", error);
        return NextResponse.json(
            { error: "Failed to analyze resume" },
            { status: 500 }
        );
    }
}