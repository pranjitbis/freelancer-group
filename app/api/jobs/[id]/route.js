import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    // Get the job ID from params - await params in Next.js 15
    const { id } = await params;
    const jobId = parseInt(id);

    console.log("🔍 Fetching job with ID:", jobId, "from params:", id);

    // Validate jobId
    if (isNaN(jobId) || jobId <= 0) {
      console.log("❌ Invalid job ID:", id);
      return NextResponse.json(
        { 
          success: false,
          error: "Invalid job ID" 
        }, 
        { status: 400 }
      );
    }

    // Fetch job with related data
    const job = await prisma.jobPost.findUnique({
      where: { 
        id: jobId,
        status: "active" // Only fetch active jobs
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            avatar: true,
            profile: {
              select: {
                avatar: true,
                bio: true,
                title: true,
                location: true,
              },
            },
            reviewsReceived: {
              select: {
                rating: true,
                comment: true,
                createdAt: true,
              },
            },
          },
        },
        proposals: {
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
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
      console.log("❌ Job not found with ID:", jobId);
      return NextResponse.json(
        { 
          success: false,
          error: "Job not found or has been removed" 
        }, 
        { status: 404 }
      );
    }

    console.log("✅ Job found:", job.title);

    // Parse skills from JSON string safely
    let skills = [];
    try {
      if (job.skills && typeof job.skills === 'string') {
        skills = JSON.parse(job.skills);
        // Ensure skills is an array
        if (!Array.isArray(skills)) {
          skills = [];
        }
      }
    } catch (error) {
      console.error("❌ Error parsing skills:", error);
      skills = [];
    }

    // Calculate average rating and review count for client
    const reviews = job.user?.reviewsReceived || [];
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    // Format the response data
    const formattedJob = {
      id: job.id,
      title: job.title,
      description: job.description || "No description provided",
      category: job.category,
      skills: skills,
      budget: job.budget,
      deadline: job.deadline?.toISOString() || null,
      experienceLevel: job.experienceLevel,
      status: job.status,
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt.toISOString(),
      user: job.user ? {
        id: job.user.id,
        name: job.user.name,
        email: job.user.email,
        avatar: job.user.avatar,
        createdAt: job.user.createdAt.toISOString(),
        profile: {
          avatar: job.user.profile?.avatar || null,
          bio: job.user.profile?.bio || null,
          title: job.user.profile?.title || null,
          location: job.user.profile?.location || null,
        },
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: reviews.length,
      } : null,
      _count: {
        proposals: job._count?.proposals || 0,
        messages: job._count?.messages || 0,
      },
      proposalCount: job.proposals?.length || 0,
    };

    console.log("✅ Job data formatted successfully");

    return NextResponse.json({
      success: true,
      job: formattedJob
    });

  } catch (error) {
    console.error("❌ Get job error:", error);

    // Handle specific Prisma errors
    if (error.code === 'P2025') {
      return NextResponse.json(
        { 
          success: false,
          error: "Job not found" 
        }, 
        { status: 404 }
      );
    }

    if (error.code === 'P2023') {
      return NextResponse.json(
        { 
          success: false,
          error: "Invalid job ID format" 
        }, 
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch job details",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }, 
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const jobId = parseInt(id);

    // Validate jobId
    if (isNaN(jobId) || jobId <= 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid job ID" 
        }, 
        { status: 400 }
      );
    }

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
        title: title.trim(),
        description: description.trim(),
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
            createdAt: true,
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
        description: updatedJob.description,
        createdAt: updatedJob.createdAt.toISOString(),
        updatedAt: updatedJob.updatedAt.toISOString(),
        deadline: updatedJob.deadline.toISOString(),
        user: {
          ...updatedJob.user,
          createdAt: updatedJob.user.createdAt.toISOString(),
        },
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
    const { id } = await params;
    const jobId = parseInt(id);

    // Validate jobId
    if (isNaN(jobId) || jobId <= 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid job ID" 
        }, 
        { status: 400 }
      );
    }

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

    // Delete the job (this will cascade delete related proposals and messages)
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
    
    if (error.code === 'P2025') {
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

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}