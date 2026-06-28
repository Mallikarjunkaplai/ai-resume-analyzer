import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

/**
 * GET /api/resumes
 * Returns all resumes (with their analyses) for the currently authenticated user.
 * Ordered newest-first.
 */
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resumes = await db.resume.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fileName: true,
        createdAt: true,
        analysis: {
          select: {
            score: true,
            feedbackJson: true,
          },
        },
      },
    });

    return NextResponse.json({ resumes }, { status: 200 });
  } catch (error) {
    console.error("[RESUMES_GET_ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch resumes" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Resume ID is required" }, { status: 400 });
    }

    // Verify ownership
    const resume = await db.resume.findUnique({
      where: { id },
    });

    if (!resume || resume.userId !== userId) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    await db.resume.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[RESUMES_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Failed to delete resume" }, { status: 500 });
  }
}
