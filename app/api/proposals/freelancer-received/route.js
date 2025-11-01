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

    console.log("📋 Fetching received proposals for freelancer:", userId);

    const proposals = await prisma.clientToFreelancerProposal.findMany({
      where: {
        freelancerId: parseInt(userId),
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            profile: {
              select: {
                title: true,
                location: true,
                // REMOVED: company: true, - This field doesn't exist
                bio: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(`✅ Found ${proposals.length} received proposals`);

    return NextResponse.json({
      success: true,
      proposals: proposals,
    });
  } catch (error) {
    console.error("❌ Error fetching freelancer received proposals:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch proposals" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
