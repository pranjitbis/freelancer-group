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

    // Verify user is a freelancer
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Fetch freelancer's projects
    const projects = await prisma.project.findMany({
      where: {
        freelancerId: parseInt(userId),
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            profile: {
              select: {
                title: true,
                location: true,
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
        conversations: {
          include: {
            paymentRequests: {
              orderBy: { createdAt: "desc" },
            },
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

    // Calculate client ratings and add project progress
    const projectsWithDetails = projects.map((project) => {
      const reviews = project.client.reviewsReceived || [];
      const avgRating =
        reviews.length > 0
          ? reviews.reduce((sum, review) => sum + review.rating, 0) /
            reviews.length
          : 0;

      const conversation = project.conversations[0];
      const paymentRequests = conversation?.paymentRequests || [];

      // Calculate project progress based on payment requests
      let progress = 0;
      let totalPaid = 0;

      paymentRequests.forEach((request) => {
        if (request.status === "completed") {
          totalPaid += request.amount;
        }
      });

      if (project.budget > 0) {
        progress = Math.min(100, (totalPaid / project.budget) * 100);
      }

      return {
        ...project,
        client: {
          ...project.client,
          avgRating: Math.round(avgRating * 10) / 10,
          reviewCount: reviews.length,
        },
        progress: Math.round(progress),
        totalPaid,
        conversationId: conversation?.id,
        lastMessage: conversation?.messages[0],
        paymentRequests,
      };
    });

    return NextResponse.json({
      success: true,
      projects: projectsWithDetails,
    });
  } catch (error) {
    console.error("Get freelancer projects error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch projects",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
