// app\api\reviews\freelancer\route.js
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
      reviews: reviews || [],
    });
  } catch (error) {
    console.error("Error fetching freelancer reviews:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch reviews",
        reviews: [], // Return empty array on error
      },
      { status: 500 }
    );
  }
}
