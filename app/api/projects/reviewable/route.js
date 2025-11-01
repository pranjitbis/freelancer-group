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

    console.log(
      `📋 Fetching reviewable projects for freelancer: ${freelancerId}`
    );

    // Get completed projects for this freelancer - simplified query
    const completedProjects = await prisma.project.findMany({
      where: {
        freelancerId: parseInt(freelancerId),
        status: "completed",
        completedAt: {
          not: null,
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
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        completedAt: "desc",
      },
    });

    console.log(`✅ Found ${completedProjects.length} completed projects`);

    // Filter projects where freelancer can review client
    const reviewableProjects = completedProjects.filter((project) => {
      const clientReview = project.reviews.find(
        (review) => review.type === "CLIENT_TO_FREELANCER"
      );

      const freelancerReview = project.reviews.find(
        (review) =>
          review.reviewerId === parseInt(freelancerId) &&
          review.type === "FREELANCER_TO_CLIENT"
      );

      // Can review if project is completed and freelancer hasn't reviewed yet
      return !freelancerReview;
    });

    // Enhance with client review info
    const enhancedProjects = reviewableProjects.map((project) => {
      const clientReview = project.reviews.find(
        (review) => review.type === "CLIENT_TO_FREELANCER"
      );

      return {
        id: project.id,
        title: project.title,
        budget: project.budget,
        completedAt: project.completedAt,
        clientId: project.clientId,
        client: project.client,
        clientReview: clientReview
          ? {
              id: clientReview.id,
              rating: clientReview.rating,
              comment: clientReview.comment,
              createdAt: clientReview.createdAt,
              reviewer: clientReview.reviewer,
            }
          : null,
        hasClientReview: !!clientReview,
      };
    });

    console.log(`📝 Found ${enhancedProjects.length} reviewable projects`);

    return NextResponse.json({
      success: true,
      projects: enhancedProjects,
    });
  } catch (error) {
    console.error("❌ Error fetching reviewable projects:", error);

    // Handle column missing error gracefully
    if (error.code === "P2022") {
      console.log("🔄 Column missing, returning empty projects");
      return NextResponse.json({
        success: true,
        projects: [],
        message: "Database schema needs update",
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch reviewable projects",
        details: error.message,
        projects: [],
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
