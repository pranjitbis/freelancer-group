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

    console.log("📋 Fetching client sent proposals for user:", userId);

    // Fetch client-to-freelancer proposals (client sending proposals to freelancers)
    const clientToFreelancerProposals =
      await prisma.clientToFreelancerProposal.findMany({
        where: {
          clientId: parseInt(userId),
        },
        include: {
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
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    // Fetch regular proposals (freelancers applying to client's jobs)
    const receivedProposals = await prisma.proposal.findMany({
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
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const allProposals = {
      sent: clientToFreelancerProposals,
      received: receivedProposals,
    };

    console.log(
      `✅ Found ${clientToFreelancerProposals.length} sent proposals and ${receivedProposals.length} received proposals`
    );

    return NextResponse.json({
      success: true,
      ...allProposals,
    });
  } catch (error) {
    console.error("❌ Error fetching client proposals:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch proposals" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
