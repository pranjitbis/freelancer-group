import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      clientId,
      freelancerId,
      projectTitle,
      projectDescription,
      coverLetter,
      bidAmount,
      timeframe,
    } = body;

    console.log("📨 Creating client-to-freelancer proposal:", {
      clientId,
      freelancerId,
      projectTitle,
    });

    // Validate required fields
    if (
      !clientId ||
      !freelancerId ||
      !projectTitle ||
      !projectDescription ||
      !coverLetter ||
      !bidAmount ||
      !timeframe
    ) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    // Verify both users exist and have correct roles
    const [client, freelancer] = await Promise.all([
      prisma.user.findUnique({
        where: {
          id: parseInt(clientId),
          role: "client",
        },
      }),
      prisma.user.findUnique({
        where: {
          id: parseInt(freelancerId),
          role: "freelancer",
        },
      }),
    ]);

    if (!client) {
      return NextResponse.json(
        { success: false, error: "Client not found or invalid role" },
        { status: 404 }
      );
    }

    if (!freelancer) {
      return NextResponse.json(
        { success: false, error: "Freelancer not found or invalid role" },
        { status: 404 }
      );
    }

    // Check if proposal already exists
    const existingProposal = await prisma.clientToFreelancerProposal.findFirst({
      where: {
        clientId: parseInt(clientId),
        freelancerId: parseInt(freelancerId),
        projectTitle: projectTitle,
        status: "pending",
      },
    });

    if (existingProposal) {
      return NextResponse.json(
        {
          success: false,
          error:
            "You have already sent a proposal for this project to this freelancer",
        },
        { status: 400 }
      );
    }

    // Create the proposal
    const proposal = await prisma.clientToFreelancerProposal.create({
      data: {
        projectTitle: projectTitle.trim(),
        projectDescription: projectDescription.trim(),
        coverLetter: coverLetter.trim(),
        bidAmount: parseFloat(bidAmount),
        timeframe: parseInt(timeframe),
        status: "pending",
        clientId: parseInt(clientId),
        freelancerId: parseInt(freelancerId),
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
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
              },
            },
          },
        },
      },
    });

    console.log(`✅ Client-to-freelancer proposal created: ${proposal.id}`);

    return NextResponse.json({
      success: true,
      proposal: proposal,
      message: "Proposal sent successfully",
    });
  } catch (error) {
    console.error("❌ Create client-to-freelancer proposal error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send proposal" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Optional: GET method to fetch sent proposals
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

    console.log("📋 Fetching client-to-freelancer proposals for user:", userId);

    const proposals = await prisma.clientToFreelancerProposal.findMany({
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
        conversation: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(`✅ Found ${proposals.length} client-to-freelancer proposals`);

    return NextResponse.json({
      success: true,
      proposals: proposals,
    });
  } catch (error) {
    console.error("❌ Error fetching client-to-freelancer proposals:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch proposals" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
