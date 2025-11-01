import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Fetch saved jobs for a user
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const savedJobs = await prisma.savedJob.findMany({
      where: {
        userId: parseInt(userId),
      },
      include: {
        job: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
            _count: {
              select: {
                proposals: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ savedJobs });
  } catch (error) {
    console.error("Error fetching saved jobs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Save a job
export async function POST(request) {
  try {
    const { userId, jobId } = await request.json();

    if (!userId || !jobId) {
      return NextResponse.json(
        { error: "User ID and Job ID are required" },
        { status: 400 }
      );
    }

    // Check if job is already saved
    const existingSavedJob = await prisma.savedJob.findUnique({
      where: {
        userId_jobId: {
          userId: parseInt(userId),
          jobId: parseInt(jobId),
        },
      },
    });

    if (existingSavedJob) {
      return NextResponse.json({ error: "Job already saved" }, { status: 400 });
    }

    const savedJob = await prisma.savedJob.create({
      data: {
        userId: parseInt(userId),
        jobId: parseInt(jobId),
      },
      include: {
        job: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
            _count: {
              select: {
                proposals: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ savedJob });
  } catch (error) {
    console.error("Error saving job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
