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

    // Fetch freelancer's projects (both as freelancer and client for demo)
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { freelancerId: parseInt(userId) },
          { clientId: parseInt(userId) },
        ],
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
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
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

    // Calculate project progress and add details
    const projectsWithDetails = projects.map((project) => {
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

      // Determine project type based on user role
      const projectType =
        project.freelancerId === parseInt(userId) ? "freelancer" : "client";

      return {
        id: project.id,
        title: project.title,
        description: project.description,
        status: project.status,
        budget: project.budget,
        progress: Math.round(progress),
        totalPaid,
        createdAt: project.createdAt,
        completedAt: project.completedAt,
        deadline: project.deadline,

        // Client information
        client: project.client,
        freelancer: project.freelancer,

        // Additional details
        category: "Development", // You might want to add this field to your Project model
        type: projectType,
        clientRating: 4.5, // You can calculate this from reviews
        reviewCount: 12,

        // Conversation details
        conversationId: conversation?.id,
        lastMessage: conversation?.messages[0],
        paymentRequests,
      };
    });

    console.log(
      `✅ Found ${projectsWithDetails.length} projects for user ${userId}`
    );

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
