// app\api\projects\reviewable\route.js
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

    console.log(`🔍 Finding reviewable projects for freelancer: ${freelancerId}`);

    // Get completed projects where freelancer hasn't reviewed the client yet
    const completedProjects = await prisma.project.findMany({
      where: {
        freelancerId: parseInt(freelancerId),
        status: "completed",
        completedAt: { not: null },
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        // Check if there's already a review from freelancer to client for this project
        reviews: {
          where: {
            reviewerId: parseInt(freelancerId),
            type: "FREELANCER_TO_CLIENT",
          },
        },
      },
      orderBy: {
        completedAt: "desc",
      },
    });

    console.log(`✅ Found ${completedProjects.length} completed projects`);

    // Filter out projects that already have a review from this freelancer
    const reviewableProjects = completedProjects.filter(
      (project) => project.reviews.length === 0
    );

    console.log(`📝 ${reviewableProjects.length} projects need client reviews`);

    // Format the response
    const formattedProjects = reviewableProjects.map(project => ({
      id: project.id,
      title: project.title,
      clientId: project.clientId,
      client: project.client,
      completedAt: project.completedAt,
      freelancerId: project.freelancerId,
    }));

    return NextResponse.json({
      success: true,
      projects: formattedProjects,
      stats: {
        totalCompleted: completedProjects.length,
        needReview: reviewableProjects.length,
        alreadyReviewed: completedProjects.length - reviewableProjects.length,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching reviewable projects:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch reviewable projects",
        details: error.message 
      },
      { status: 500 }
    );
  }
}