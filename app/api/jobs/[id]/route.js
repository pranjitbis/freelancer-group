import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    // Await params in Next.js 14
    const { id } = await params;
    const jobId = parseInt(id);

    const job = await prisma.jobPost.findUnique({
      where: { id: jobId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true, // Added avatar field from User model
            profile: {
              // ✅ Changed from UserProfile to profile
              select: {
                avatar: true,
                bio: true,
              },
            },
          },
        },
        proposals: {
          include: {
            freelancer: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true, // Added avatar field from User model
                profile: {
                  // ✅ Changed from UserProfile to profile
                  select: {
                    avatar: true,
                    bio: true,
                    skills: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                avatar: true, // Added avatar field from User model
                profile: {
                  // ✅ Changed from UserProfile to profile
                  select: {
                    avatar: true,
                  },
                },
              },
            },
            replies: {
              include: {
                sender: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true, // Added avatar field from User model
                    profile: {
                      // ✅ Changed from UserProfile to profile
                      select: {
                        avatar: true,
                      },
                    },
                  },
                },
              },
              orderBy: { createdAt: "asc" },
            },
          },
          where: { parentId: null },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            proposals: true,
            messages: true,
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Parse skills from JSON string safely
    let skills = [];
    try {
      if (job.skills) {
        skills = JSON.parse(job.skills);
      }
    } catch (error) {
      console.error("Error parsing skills:", error);
      skills = [];
    }

    const jobWithParsedSkills = {
      ...job,
      skills,
    };

    return NextResponse.json({ job: jobWithParsedSkills });
  } catch (error) {
    console.error("Get job error:", error);
    return NextResponse.json({ error: "Failed to fetch job" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    // Await params in Next.js 14
    const { id } = await params;
    const jobId = parseInt(id);

    const body = await request.json();

    console.log("🔄 Updating job ID:", jobId, "with data:", body);

    const {
      title,
      description,
      category,
      skills,
      budget,
      deadline,
      experienceLevel,
      status,
      userId,
    } = body;

    // Validation
    if (!title || !description || !category || !budget || !deadline) {
      return NextResponse.json(
        {
          success: false,
          error: "All required fields must be filled",
        },
        { status: 400 }
      );
    }

    // Validate date format
    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid date format for deadline",
        },
        { status: 400 }
      );
    }

    // Validate budget
    const budgetValue = parseFloat(budget);
    if (isNaN(budgetValue) || budgetValue <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Budget must be a valid positive number",
        },
        { status: 400 }
      );
    }

    // Verify job exists and belongs to user
    const existingJob = await prisma.jobPost.findUnique({
      where: { id: jobId },
    });

    if (!existingJob) {
      return NextResponse.json(
        {
          success: false,
          error: "Job not found",
        },
        { status: 404 }
      );
    }

    if (existingJob.userId !== parseInt(userId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized to edit this job",
        },
        { status: 403 }
      );
    }

    // Update the job
    const updatedJob = await prisma.jobPost.update({
      where: { id: jobId },
      data: {
        title,
        description,
        category,
        skills: JSON.stringify(skills || []),
        budget: budgetValue,
        deadline: deadlineDate,
        experienceLevel: experienceLevel || "intermediate",
        status: status || "active",
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    console.log("✅ Job updated successfully:", jobId);

    // Parse skills for response
    let parsedSkills = [];
    try {
      if (updatedJob.skills) {
        parsedSkills = JSON.parse(updatedJob.skills);
      }
    } catch (error) {
      console.error("Error parsing skills in response:", error);
      parsedSkills = [];
    }

    return NextResponse.json({
      success: true,
      job: {
        ...updatedJob,
        skills: parsedSkills,
      },
    });
  } catch (error) {
    console.error("❌ Update job error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update job",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    // Await params in Next.js 14
    const { id } = await params;
    const jobId = parseInt(id);

    console.log("🗑️ Deleting job ID:", jobId);

    // Verify job exists
    const job = await prisma.jobPost.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json(
        {
          success: false,
          error: "Job not found",
        },
        { status: 404 }
      );
    }

    // Delete the job
    await prisma.jobPost.delete({
      where: { id: jobId },
    });

    console.log("✅ Job deleted successfully:", jobId);

    return NextResponse.json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete job error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete job",
      },
      { status: 500 }
    );
  }
}
