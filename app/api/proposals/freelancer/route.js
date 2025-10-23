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

    const proposals = await prisma.proposal.findMany({
      where: {
        freelancerId: parseInt(userId),
      },
      include: {
        job: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
        freelancer: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      proposals,
    });
  } catch (error) {
    console.error("Error fetching freelancer proposals:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch proposals" },
      { status: 500 }
    );
  }
}
