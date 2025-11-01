// app\api\reviews\freelancer-given\route.js - Updated to parse JSON aspects
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

    console.log(`📝 Fetching reviews given by freelancer: ${freelancerId}`);

    // Get reviews where freelancer is the reviewer (reviews given to clients)
    const reviews = await prisma.review.findMany({
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

    console.log(`✅ Found ${reviews.length} reviews given to clients`);

    // Parse aspects from JSON string to array
    const parsedReviews = reviews.map((review) => {
      let aspects = [];
      try {
        if (review.aspects) {
          aspects = JSON.parse(review.aspects);
        }
      } catch (error) {
        console.error("Error parsing aspects:", error);
        aspects = [];
      }

      return {
        ...review,
        aspects: Array.isArray(aspects) ? aspects : [],
      };
    });

    return NextResponse.json({
      success: true,
      reviews: parsedReviews,
    });
  } catch (error) {
    console.error("❌ Error fetching freelancer-given reviews:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch reviews",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
