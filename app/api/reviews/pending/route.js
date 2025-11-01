// app/api/reviews/pending/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const userType = searchParams.get("userType"); // "client" or "freelancer"

    if (!userId || !userType) {
      return NextResponse.json(
        { success: false, error: "User ID and type are required" },
        { status: 400 }
      );
    }

    let pendingReviews = [];

    if (userType === "freelancer") {
      // Get projects where freelancer needs to review client
      pendingReviews = await prisma.project.findMany({
        where: {
          freelancerId: parseInt(userId),
          status: "completed",
          reviewStatus: {
            in: ["pending_reviews", "client_reviewed"]
          },
          reviews: {
            none: {
              reviewerId: parseInt(userId),
              type: "FREELANCER_TO_CLIENT"
            }
          }
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          freelancer: {
            include: {
              profile: {
                select: {
                  title: true,
                  skills: true,
                  bio: true,
                  experience: true,
                },
              },
            },
          },
          reviews: {
            where: {
              type: "CLIENT_TO_FREELANCER"
            },
            take: 1,
          },
        },
        orderBy: {
          completedAt: "desc",
        },
      });
    } else if (userType === "client") {
      // Get projects where client needs to review freelancer
      pendingReviews = await prisma.project.findMany({
        where: {
          clientId: parseInt(userId),
          status: "completed",
          reviewStatus: {
            in: ["pending_reviews", "freelancer_reviewed"]
          },
          reviews: {
            none: {
              reviewerId: parseInt(userId),
              type: "CLIENT_TO_FREELANCER"
            }
          }
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          freelancer: {
            include: {
              profile: {
                select: {
                  title: true,
                  skills: true,
                  bio: true,
                  experience: true,
                  hourlyRate: true,
                },
              },
            },
          },
          reviews: {
            where: {
              type: "FREELANCER_TO_CLIENT"
            },
            take: 1,
          },
        },
        orderBy: {
          completedAt: "desc",
        },
      });
    }

    // Format the response
    const formattedReviews = pendingReviews.map(project => ({
      id: project.id,
      title: project.title,
      description: project.description,
      budget: project.budget,
      completedAt: project.completedAt,
      client: project.client,
      freelancer: project.freelancer,
      hasClientReview: project.reviews.some(r => r.type === "CLIENT_TO_FREELANCER"),
      hasFreelancerReview: project.reviews.some(r => r.type === "FREELANCER_TO_CLIENT"),
      reviewStatus: project.reviewStatus,
    }));

    return NextResponse.json({
      success: true,
      pendingReviews: formattedReviews,
      count: formattedReviews.length,
    });
  } catch (error) {
    console.error("Error fetching pending reviews:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch pending reviews",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}