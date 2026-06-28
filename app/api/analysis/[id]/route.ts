import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

/**
 * GET /api/analysis/[id]
 * Returns the full analysis for a given resume ID.
 * The resume must belong to the authenticated user.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const resume = await db.resume.findUnique({
      where: { id },
      select: {
        id: true,
        fileName: true,
        userId: true,
        createdAt: true,
        analysis: {
          select: {
            score: true,
            feedbackJson: true,
          },
        },
      },
    });

    // 404 if not found OR if it doesn't belong to this user
    if (!resume || resume.userId !== userId) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        resumeId: resume.id,
        fileName: resume.fileName,
        createdAt: resume.createdAt,
        score: resume.analysis?.score ?? null,
        feedbackJson: resume.analysis?.feedbackJson ?? null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[ANALYSIS_GET_ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch analysis" }, { status: 500 });
  }
}
