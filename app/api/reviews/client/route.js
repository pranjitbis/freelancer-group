// app\api\reviews\client\route.js - Updated to handle JSON aspects
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      rating,
      comment,
      clientId,
      projectId,
      reviewerId,
      aspects = [],
    } = body;

    console.log("📝 Submitting client review:", {
      rating,
      clientId,
      projectId,
      reviewerId,
      aspects,
      commentLength: comment?.length || 0,
    });

    // Validate required fields
    if (!rating || !clientId || !projectId || !reviewerId) {
      return NextResponse.json(
        {
          success: false,
          error: "Rating, clientId, projectId, and reviewerId are required",
        },
        { status: 400 }
      );
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Check if project exists and belongs to this freelancer
    const project = await prisma.project.findFirst({
      where: {
        id: parseInt(projectId),
        freelancerId: parseInt(reviewerId),
        status: "completed",
      },
    });

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: "Project not found or you don't have permission to review it",
        },
        { status: 404 }
      );
    }

    // Check if review already exists for this project
    const existingReview = await prisma.review.findFirst({
      where: {
        projectId: parseInt(projectId),
        reviewerId: parseInt(reviewerId),
        type: "FREELANCER_TO_CLIENT",
      },
    });

    if (existingReview) {
      return NextResponse.json(
        {
          success: false,
          error: "You have already reviewed this client for this project",
        },
        { status: 400 }
      );
    }

    // Create the review with aspects as JSON string
    const review = await prisma.review.create({
      data: {
        rating: parseInt(rating),
        comment: comment || null,
        reviewerId: parseInt(reviewerId),
        revieweeId: parseInt(clientId),
        projectId: parseInt(projectId),
        type: "FREELANCER_TO_CLIENT",
        aspects: JSON.stringify(aspects), // Store as JSON string
      },
      include: {
        reviewee: {
          select: {
            name: true,
            avatar: true,
          },
        },
        project: {
          select: {
            title: true,
          },
        },
      },
    });

    console.log("✅ Client review submitted successfully:", {
      reviewId: review.id,
      client: review.reviewee.name,
      project: review.project.title,
      rating: review.rating,
    });

    return NextResponse.json({
      success: true,
      review: {
        ...review,
        aspects: Array.isArray(aspects) ? aspects : [], // Return as array
      },
      message: "Client review submitted successfully",
    });
  } catch (error) {
    console.error("❌ Error submitting client review:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to submit review",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
