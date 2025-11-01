// app/api/freelancer/[id]/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    console.log("🔍 API Route Called - Freelancer by ID");
    console.log("Params:", params);

    const { id } = params;

    if (!id) {
      console.log("❌ No ID provided");
      return NextResponse.json(
        {
          success: false,
          error: "Freelancer ID is required",
        },
        { status: 400 }
      );
    }

    const freelancerId = parseInt(id);

    if (isNaN(freelancerId)) {
      console.log("❌ Invalid ID format:", id);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid freelancer ID format",
        },
        { status: 400 }
      );
    }

    console.log(`🔍 Fetching freelancer with ID: ${freelancerId}`);

    // Simple query first to test
    const freelancer = await prisma.user.findUnique({
      where: {
        id: freelancerId,
      },
      include: {
        profile: true,
        reviewsReceived: {
          where: {
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
          },
        },
        _count: {
          select: {
            freelancerProjects: {
              where: {
                status: "completed",
              },
            },
            reviewsReceived: {
              where: {
                type: "CLIENT_TO_FREELANCER",
              },
            },
          },
        },
      },
    });

    console.log(
      "📊 Database query result:",
      freelancer ? "Found" : "Not found"
    );

    if (!freelancer) {
      return NextResponse.json(
        {
          success: false,
          error: "Freelancer not found",
        },
        { status: 404 }
      );
    }

    // Calculate average rating
    const totalRating = freelancer.reviewsReceived.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    const avgRating =
      freelancer.reviewsReceived.length > 0
        ? (totalRating / freelancer.reviewsReceived.length).toFixed(1)
        : "0.0";

    // Process skills
    const skillsArray = freelancer.profile?.skills
      ? freelancer.profile.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter((skill) => skill.length > 0)
      : [];

    // Handle profile image
    let profileImage = freelancer.avatar || freelancer.profile?.avatar || null;

    const processedFreelancer = {
      id: freelancer.id,
      name: freelancer.name,
      email: freelancer.email,
      avatar: profileImage,
      profile: {
        ...freelancer.profile,
        avatar: profileImage,
      },
      avgRating,
      skills: skillsArray,
      reviewCount: freelancer._count.reviewsReceived,
      completedProjects: freelancer._count.freelancerProjects,
      isAvailable: freelancer.profile?.available ?? true,
      reviews: freelancer.reviewsReceived,
      memberSince: freelancer.createdAt,
    };

    console.log(
      `✅ Successfully processed freelancer: ${processedFreelancer.name}`
    );

    return NextResponse.json({
      success: true,
      freelancer: processedFreelancer,
    });
  } catch (error) {
    console.error("❌ Error in freelancer API route:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
