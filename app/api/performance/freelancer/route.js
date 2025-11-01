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

    console.log(`📊 Fetching performance data for freelancer: ${userId}`);

    // Get completed projects count
    const completedProjects = await prisma.project.count({
      where: {
        freelancerId: parseInt(userId),
        status: "completed",
      },
    });

    // Get on-time projects (completed before or on deadline)
    const onTimeProjects = await prisma.project.count({
      where: {
        freelancerId: parseInt(userId),
        status: "completed",
        completedAt: {
          lte: prisma.project.fields.deadline, // Using raw condition for field comparison
        },
      },
    });

    // Get repeat clients (clients who have hired this freelancer more than once)
    const clientProjects = await prisma.project.groupBy({
      by: ["clientId"],
      where: {
        freelancerId: parseInt(userId),
        status: "completed",
      },
      _count: {
        id: true,
      },
    });

    const repeatClients = clientProjects.filter(
      (client) => client._count.id > 1
    ).length;

    // Calculate average response time (simplified - you might want to use message timestamps)
    const averageResponseTime = 2; // Default value in hours

    const performanceData = {
      onTimeProjects,
      repeatClients,
      averageResponseTime,
      totalCompletedProjects: completedProjects,
    };

    console.log(`✅ Performance data:`, performanceData);

    return NextResponse.json({
      success: true,
      data: performanceData,
    });
  } catch (error) {
    console.error("❌ Error fetching performance data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch performance data",
        data: null,
      },
      { status: 500 }
    );
  }
}
