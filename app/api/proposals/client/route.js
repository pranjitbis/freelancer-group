import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    // Verify user is a client
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user || user.role !== "client") {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 403 }
      );
    }

    // Fetch proposals for client's jobs
    const proposals = await prisma.proposal.findMany({
      where: {
        job: {
          userId: parseInt(userId),
        },
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            budget: true,
            experienceLevel: true,
            deadline: true,
            status: true,
          },
        },
        freelancer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            profile: {
              select: {
                title: true,
                bio: true,
                skills: true,
                experience: true,
                education: true,
                location: true,
                hourlyRate: true,
                portfolio: true,
              },
            },
            reviewsReceived: {
              select: {
                rating: true,
                comment: true,
              },
            },
          },
        },
        conversation: {
          select: {
            id: true,
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate average ratings for freelancers
    const proposalsWithRatings = proposals.map((proposal) => {
      const reviews = proposal.freelancer.reviewsReceived || [];
      const avgRating =
        reviews.length > 0
          ? reviews.reduce((sum, review) => sum + review.rating, 0) /
            reviews.length
          : 0;

      return {
        ...proposal,
        freelancer: {
          ...proposal.freelancer,
          avgRating: Math.round(avgRating * 10) / 10,
          reviewCount: reviews.length,
        },
      };
    });

    return NextResponse.json({
      success: true,
      proposals: proposalsWithRatings,
    });
  } catch (error) {
    console.error("Get client proposals error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch proposals",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
