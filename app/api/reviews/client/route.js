import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: "Client ID is required" },
        { status: 400 }
      );
    }

    // Get reviews where client is reviewer (given to freelancers)
    const givenReviews = await prisma.review.findMany({
      where: {
        reviewerId: parseInt(clientId),
        type: "CLIENT_TO_FREELANCER",
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

    // Get reviews where client is reviewee (received from freelancers)
    const receivedReviews = await prisma.review.findMany({
      where: {
        revieweeId: parseInt(clientId),
        type: "FREELANCER_TO_CLIENT",
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
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get projects that can be reviewed by client
    const reviewableProjects = await prisma.project.findMany({
      where: {
        clientId: parseInt(clientId),
        status: "completed",
        reviews: {
          none: {
            type: "CLIENT_TO_FREELANCER",
            reviewerId: parseInt(clientId),
          },
        },
      },
      include: {
        freelancer: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
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

    const parsedGivenReviews = givenReviews.map(parseAspects);
    const parsedReceivedReviews = receivedReviews.map(parseAspects);

    return NextResponse.json({
      success: true,
      reviews: {
        given: parsedGivenReviews,
        received: parsedReceivedReviews,
        reviewableProjects,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching client reviews:", error);
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
