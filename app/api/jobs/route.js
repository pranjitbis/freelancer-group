import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Fetch jobs with filtering and pagination
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 12;
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const minBudget = parseFloat(searchParams.get("minBudget"));
    const maxBudget = parseFloat(searchParams.get("maxBudget"));
    const experienceLevel = searchParams.get("experienceLevel");
    const sortBy = searchParams.get("sortBy") || "createdAt";

    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};

    if (userId) {
      where.userId = parseInt(userId);
    }

    if (category && category !== "all") {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { skills: { contains: search, mode: "insensitive" } },
      ];
    }

    if (minBudget || maxBudget) {
      where.budget = {};
      if (minBudget) where.budget.gte = minBudget;
      if (maxBudget) where.budget.lte = maxBudget;
    }

    if (experienceLevel && experienceLevel !== "all") {
      where.experienceLevel = experienceLevel;
    }

    where.status = "active";

    // Build orderBy
    const orderBy = {};
    if (sortBy === "budget") {
      orderBy.budget = "desc";
    } else if (sortBy === "deadline") {
      orderBy.deadline = "asc";
    } else {
      orderBy.createdAt = "desc";
    }

    const [jobs, totalCount] = await Promise.all([
      prisma.jobPost.findMany({
        where,
        include: {
          _count: {
            select: {
              proposals: true,
            },
          },
          user: {
            include: {
              profile: {
                select: {
                  avatar: true,
                  hourlyRate: true,
                },
              },
              reviewsReceived: {
                select: {
                  rating: true,
                },
              },
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.jobPost.count({ where }),
    ]);

    // Calculate average ratings for clients
    const jobsWithClientRating = jobs.map((job) => {
      const reviews = job.user.reviewsReceived;
      const avgRating =
        reviews.length > 0
          ? reviews.reduce((sum, review) => sum + review.rating, 0) /
            reviews.length
          : 0;

      let skills = [];
      try {
        if (job.skills) {
          skills = JSON.parse(job.skills);
        }
      } catch (error) {
        console.error("Error parsing skills for job", job.id, error);
        skills = [];
      }

      return {
        ...job,
        skills,
        user: {
          ...job.user,
          avgRating: Math.round(avgRating * 10) / 10,
          reviewCount: reviews.length,
        },
        createdAt: job.createdAt.toISOString(),
        updatedAt: job.updatedAt.toISOString(),
        deadline: job.deadline.toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      jobs: jobsWithClientRating,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("❌ Get jobs error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch jobs",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// POST - Create a new job
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      category,
      skills,
      budget,
      deadline,
      experienceLevel,
      userId,
    } = body;

    // Validation
    if (
      !title ||
      !description ||
      !category ||
      !budget ||
      !deadline ||
      !userId
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 }
      );
    }

    if (budget < 50) {
      return NextResponse.json(
        {
          success: false,
          error: "Budget must be at least $50",
        },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    // Create the job post
    const job = await prisma.jobPost.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        category,
        skills: JSON.stringify(skills),
        budget: parseFloat(budget),
        deadline: new Date(deadline),
        experienceLevel: experienceLevel || "intermediate",
        status: "active",
        userId: parseInt(userId),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                avatar: true,
              },
            },
          },
        },
      },
    });

    // Parse skills for response
    let parsedSkills = [];
    try {
      if (job.skills) {
        parsedSkills = JSON.parse(job.skills);
      }
    } catch (error) {
      console.error("Error parsing skills:", error);
    }

    const responseJob = {
      ...job,
      skills: parsedSkills,
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt.toISOString(),
      deadline: job.deadline.toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        job: responseJob,
        message: "Job posted successfully!",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Create job error:", error);

    // Handle Prisma errors
    if (error.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          error: "A job with similar details already exists",
        },
        { status: 409 }
      );
    }

    if (error.code === "P2003") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid user ID",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create job",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// PUT - Update a job (optional)
export async function PUT(request) {
  try {
    const body = await request.json();
    const { jobId, ...updateData } = body;

    if (!jobId) {
      return NextResponse.json(
        {
          success: false,
          error: "Job ID is required",
        },
        { status: 400 }
      );
    }

    // Handle skills serialization if present
    if (updateData.skills && Array.isArray(updateData.skills)) {
      updateData.skills = JSON.stringify(updateData.skills);
    }

    const updatedJob = await prisma.jobPost.update({
      where: { id: parseInt(jobId) },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Parse skills for response
    let parsedSkills = [];
    try {
      if (updatedJob.skills) {
        parsedSkills = JSON.parse(updatedJob.skills);
      }
    } catch (error) {
      console.error("Error parsing skills:", error);
    }

    const responseJob = {
      ...updatedJob,
      skills: parsedSkills,
      createdAt: updatedJob.createdAt.toISOString(),
      updatedAt: updatedJob.updatedAt.toISOString(),
      deadline: updatedJob.deadline.toISOString(),
    };

    return NextResponse.json({
      success: true,
      job: responseJob,
      message: "Job updated successfully",
    });
  } catch (error) {
    console.error("❌ Update job error:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        {
          success: false,
          error: "Job not found",
        },
        { status: 404 }
      );
    }

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

// DELETE - Delete a job (optional)
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) {
      return NextResponse.json(
        {
          success: false,
          error: "Job ID is required",
        },
        { status: 400 }
      );
    }

    await prisma.jobPost.delete({
      where: { id: parseInt(jobId) },
    });

    return NextResponse.json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete job error:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        {
          success: false,
          error: "Job not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete job",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
