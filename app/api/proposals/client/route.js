import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const proposals = await prisma.proposal.findMany({
      where: {
        job: {
          userId: parseInt(userId),
        },
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            description: true,
            budget: true,
            category: true,
            experienceLevel: true,
          },
        },
        freelancer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            profile: {
              select: {
                title: true,
                hourlyRate: true,
                location: true,
                skills: true,
                bio: true,
                experience: true,
                resumeUrl: true, // ✅ ADD THIS LINE - This was missing!
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log("📥 Proposals fetched:", proposals.length);

    // Debug: Check if resume URLs are included
    proposals.forEach((proposal, index) => {
      console.log(`🔍 Proposal ${index + 1}:`, {
        freelancer: proposal.freelancer?.name,
        hasProfile: !!proposal.freelancer?.profile,
        resumeUrl: proposal.freelancer?.profile?.resumeUrl || "NO RESUME URL",
        hasResume: !!proposal.freelancer?.profile?.resumeUrl,
      });
    });

    return NextResponse.json({
      success: true,
      proposals: proposals,
    });
  } catch (error) {
    console.error("Error fetching client proposals:", error);
    return NextResponse.json(
      { error: "Failed to fetch proposals" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
