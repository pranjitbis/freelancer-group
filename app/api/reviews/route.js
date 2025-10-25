import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { rating, comment, freelancerId, projectId, reviewerId } = body;

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        reviewerId,
        revieweeId: freelancerId,
        projectId,
      },
    });

    return NextResponse.json({
      success: true,
      review,
    });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create review" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const freelancerId = searchParams.get("freelancerId");

    const reviews = await prisma.review.findMany({
      where: {
        revieweeId: parseInt(freelancerId),
      },
      include: {
        reviewer: {
          select: {
            name: true,
            avatar: true,
          },
        },
        project: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
