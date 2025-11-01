import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const freelancerId = searchParams.get("freelancerId");

    if (!freelancerId) {
      return NextResponse.json(
        { success: false, error: "Freelancer ID is required" },
        { status: 400 }
      );
    }

    // Get reviews where freelancer is reviewee (received from clients)
    const receivedReviews = await prisma.review.findMany({
      where: {
        revieweeId: parseInt(freelancerId),
        type: "CLIENT_TO_FREELANCER",
      },
      include: {
        reviewer: {
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
            budget: true,
            completedAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get reviews where freelancer is reviewer (given to clients)
    const givenReviews = await prisma.review.findMany({
      where: {
        reviewerId: parseInt(freelancerId),
        type: "FREELANCER_TO_CLIENT",
      },
      include: {
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

    // Get projects that can be reviewed (where client reviewed but freelancer hasn't returned review)
    const reviewableProjects = await prisma.project.findMany({
      where: {
        freelancerId: parseInt(freelancerId),
        status: "completed",
        reviews: {
          some: {
            type: "CLIENT_TO_FREELANCER",
            revieweeId: parseInt(freelancerId),
          },
          none: {
            type: "FREELANCER_TO_CLIENT",
            reviewerId: parseInt(freelancerId),
          },
        },
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        reviews: {
          where: {
            type: "CLIENT_TO_FREELANCER",
          },
          take: 1,
        },
      },
    });

    // Parse aspects from JSON string to array
    const parseAspects = (review) => {
      let aspects = [];
      try {
        if (review.aspects) {
          aspects = JSON.parse(review.aspects);
        }
      } catch (error) {
        aspects = [];
      }
      return {
        ...review,
        aspects: Array.isArray(aspects) ? aspects : [],
      };
    };

    const parsedReceivedReviews = receivedReviews.map(parseAspects);
    const parsedGivenReviews = givenReviews.map(parseAspects);

    return NextResponse.json({
      success: true,
      data: {
        receivedReviews: parsedReceivedReviews,
        givenReviews: parsedGivenReviews,
        reviewableProjects: reviewableProjects.map(project => ({
          ...project,
          hasClientReview: project.reviews.length > 0,
          clientReview: project.reviews[0] || null,
        })),
        stats: {
          totalReceived: receivedReviews.length,
          totalGiven: givenReviews.length,
          averageRating:
            receivedReviews.length > 0
              ? receivedReviews.reduce((sum, review) => sum + review.rating, 0) /
                receivedReviews.length
              : 0,
          pendingReturns: reviewableProjects.length,
        },
      },
    });
  } catch (error) {
    console.error("❌ Error fetching freelancer reviews:", error);
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