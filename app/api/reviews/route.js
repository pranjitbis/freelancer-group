// app/api/reviews/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET handler for fetching reviews
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const userId = searchParams.get("userId");

    if (projectId) {
      // Get reviews for a specific project
      const reviews = await prisma.review.findMany({
        where: {
          projectId: parseInt(projectId),
        },
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          reviewee: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          project: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return NextResponse.json({
        success: true,
        reviews: reviews,
      });
    }

    // If no specific parameters, return method info
    return NextResponse.json({
      success: true,
      message:
        "Reviews API - Use specific endpoints for client/freelancer reviews",
      availableEndpoints: [
        "/api/reviews/client?clientId=ID",
        "/api/reviews/freelancer?freelancerId=ID",
      ],
    });
  } catch (error) {
    console.error("❌ Error fetching reviews:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch reviews",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST handler for creating reviews
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      rating,
      comment,
      freelancerId,
      clientId,
      projectId,
      reviewerId,
      type = "CLIENT_TO_FREELANCER",
      aspects = [],
    } = body;

    console.log("📝 Received review submission:", {
      rating,
      projectId,
      reviewerId,
      type,
      freelancerId,
      clientId,
    });

    // Validate required fields
    if (!rating || !projectId || !reviewerId) {
      return NextResponse.json(
        {
          success: false,
          error: "Rating, projectId, and reviewerId are required",
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

    // Determine revieweeId based on review type
    let revieweeId;
    if (type === "CLIENT_TO_FREELANCER") {
      if (!freelancerId) {
        return NextResponse.json(
          {
            success: false,
            error: "Freelancer ID is required for client reviews",
          },
          { status: 400 }
        );
      }
      revieweeId = freelancerId;
    } else if (type === "FREELANCER_TO_CLIENT") {
      if (!clientId) {
        return NextResponse.json(
          {
            success: false,
            error: "Client ID is required for freelancer reviews",
          },
          { status: 400 }
        );
      }
      revieweeId = clientId;
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid review type" },
        { status: 400 }
      );
    }

    // Check if project exists and is completed
    const project = await prisma.project.findFirst({
      where: {
        id: parseInt(projectId),
        status: "completed",
      },
      include: {
        reviews: {
          where: {
            reviewerId: parseInt(reviewerId),
            type: type,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: "Project not found or not completed",
        },
        { status: 404 }
      );
    }

    // Check if review already exists for this project and type
    if (project.reviews.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "You have already reviewed for this project",
        },
        { status: 400 }
      );
    }

    // Create the review (REMOVED wouldWorkAgain field)
    const review = await prisma.review.create({
      data: {
        rating: parseInt(rating),
        comment: comment || null,
        reviewerId: parseInt(reviewerId),
        revieweeId: parseInt(revieweeId),
        projectId: parseInt(projectId),
        type: type,
        aspects: aspects.length > 0 ? JSON.stringify(aspects) : null,
        // Removed: wouldWorkAgain: wouldWorkAgain,
      },
      include: {
        reviewer: {
          select: {
            name: true,
            avatar: true,
          },
        },
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

    console.log("✅ Review created successfully:", review.id);

    // Check if both reviews are submitted (optional tracking)
    const allProjectReviews = await prisma.review.findMany({
      where: {
        projectId: parseInt(projectId),
      },
    });

    const hasClientReview = allProjectReviews.some(
      (r) => r.type === "CLIENT_TO_FREELANCER"
    );
    const hasFreelancerReview = allProjectReviews.some(
      (r) => r.type === "FREELANCER_TO_CLIENT"
    );

    console.log("📊 Review status:", {
      hasClientReview,
      hasFreelancerReview,
      totalReviews: allProjectReviews.length,
    });

    return NextResponse.json({
      success: true,
      review: {
        ...review,
        aspects: aspects, // Return the original aspects array
      },
      reviewStatus: {
        hasClientReview,
        hasFreelancerReview,
        bothReviewed: hasClientReview && hasFreelancerReview,
      },
      message: "Review submitted successfully",
    });
  } catch (error) {
    console.error("❌ Error submitting review:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to submit review",
        details: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
