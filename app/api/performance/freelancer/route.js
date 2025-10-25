// app/api/performance/freelancer/route.js
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

    // Get completed projects - since there's no deadline, we'll use created date + 30 days as estimated deadline
    const completedProjects = await prisma.project.findMany({
      where: {
        freelancerId: parseInt(userId),
        status: "completed",
        completedAt: { not: null },
      },
      select: {
        id: true,
        createdAt: true,
        completedAt: true,
        clientId: true,
        title: true,
      },
    });

    // Calculate on-time delivery using estimated deadline (created date + 30 days)
    const onTimeProjects = completedProjects.filter((project) => {
      if (!project.createdAt || !project.completedAt) return false;

      // Estimate deadline as 30 days from project creation
      const estimatedDeadline = new Date(project.createdAt);
      estimatedDeadline.setDate(estimatedDeadline.getDate() + 30);

      return new Date(project.completedAt) <= estimatedDeadline;
    }).length;

    // Calculate repeat clients
    const clientProjects = await prisma.project.groupBy({
      by: ["clientId"],
      where: {
        freelancerId: parseInt(userId),
        status: { in: ["completed", "active"] },
      },
      _count: {
        id: true,
      },
    });

    const repeatClients = clientProjects.filter(
      (client) => client._count.id > 1
    ).length;

    // Get total unique clients for retention calculation
    const totalClients = await prisma.project.groupBy({
      by: ["clientId"],
      where: {
        freelancerId: parseInt(userId),
        status: { in: ["completed", "active"] },
      },
    });

    // Calculate response time from conversations
    const conversations = await prisma.conversation.findMany({
      where: {
        freelancerId: parseInt(userId),
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
          select: {
            id: true,
            content: true,
            createdAt: true,
            senderId: true,
          },
        },
      },
    });

    let totalResponseTime = 0;
    let responseCount = 0;

    // Calculate response times from conversation messages
    conversations.forEach((conversation) => {
      const messages = conversation.messages;

      for (let i = 1; i < messages.length; i++) {
        const currentMsg = messages[i];
        const previousMsg = messages[i - 1];

        // If freelancer responded to client's message
        if (
          currentMsg.senderId === parseInt(userId) &&
          previousMsg.senderId !== parseInt(userId)
        ) {
          const responseTimeHours =
            (new Date(currentMsg.createdAt) - new Date(previousMsg.createdAt)) /
            (1000 * 60 * 60); // Convert to hours

          if (responseTimeHours > 0) {
            totalResponseTime += responseTimeHours;
            responseCount++;
          }
        }
      }
    });

    const averageResponseTime =
      responseCount > 0 ? Math.round(totalResponseTime / responseCount) : 0;

    // Get project success rate based on reviews
    const reviews = await prisma.review.findMany({
      where: {
        revieweeId: parseInt(userId),
      },
      select: {
        rating: true,
        projectId: true,
      },
    });

    const successfulProjects = reviews.filter(
      (review) => review.rating >= 4
    ).length;
    const projectSuccessRate =
      completedProjects.length > 0
        ? Math.round((successfulProjects / completedProjects.length) * 100)
        : 0;

    const performanceData = {
      onTimeProjects,
      onTimeDeliveryRate:
        completedProjects.length > 0
          ? Math.round((onTimeProjects / completedProjects.length) * 100)
          : 0,
      repeatClients,
      clientRetentionRate:
        totalClients.length > 0
          ? Math.round((repeatClients / totalClients.length) * 100)
          : 0,
      averageResponseTime,
      projectSuccessRate,
      totalProjectsAnalyzed: completedProjects.length,
      totalConversations: conversations.length,
      totalResponseCalculations: responseCount,
    };

    return NextResponse.json({
      success: true,
      data: performanceData,
    });
  } catch (error) {
    console.error("Error fetching performance data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch performance data",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
