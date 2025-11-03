import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const includeJob = searchParams.get("includeJob") === "true";
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build where clause
    const where = {
      freelancerId: parseInt(userId),
    };

    // Add status filter if provided
    if (status && status !== "all") {
      where.status = status;
    }

    // Fetch proposals with related data
    const proposals = await prisma.proposal.findMany({
      where,
      include: {
        job: includeJob
          ? {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            }
          : false,
        freelancer: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                title: true,
                skills: true,
                hourlyRate: true,
                location: true,
                avatar: true,
              },
            },
          },
        },
        conversation: {
          select: {
            id: true,
            clientId: true,
            freelancerId: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    // Get total count for pagination
    const totalCount = await prisma.proposal.count({ where });
    const totalPages = Math.ceil(totalCount / limit);

    // Transform the data to include client information
    const transformedProposals = proposals.map((proposal) => {
      const transformedProposal = {
        id: proposal.id,
        coverLetter: proposal.coverLetter,
        bidAmount: proposal.bidAmount,
        timeframe: proposal.timeframe,
        status: proposal.status,
        createdAt: proposal.createdAt,
        updatedAt: proposal.updatedAt,
        freelancer: proposal.freelancer,
        conversationId: proposal.conversationId,
        jobId: proposal.jobId,
      };

      // Include job and client info if requested
      if (includeJob && proposal.job) {
        transformedProposal.job = {
          id: proposal.job.id,
          title: proposal.job.title,
          description: proposal.job.description,
          category: proposal.job.category,
          skills: proposal.job.skills,
          budget: proposal.job.budget,
          deadline: proposal.job.deadline,
          experienceLevel: proposal.job.experienceLevel,
          status: proposal.job.status,
          createdAt: proposal.job.createdAt,
        };

        transformedProposal.client = proposal.job.user
          ? {
              id: proposal.job.user.id,
              name: proposal.job.user.name,
              email: proposal.job.user.email,
            }
          : null;
      }

      return transformedProposal;
    });

    return NextResponse.json({
      success: true,
      proposals: transformedProposals,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching freelancer proposals:", error);
    return NextResponse.json(
      { error: "Failed to fetch proposals" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { jobId, freelancerId, coverLetter, bidAmount, timeframe } = body;

    // Validate required fields
    if (!jobId || !freelancerId || !coverLetter || !bidAmount || !timeframe) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if job exists and is active
    const job = await prisma.jobPost.findUnique({
      where: {
        id: parseInt(jobId),
        status: "active",
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found or not active" },
        { status: 404 }
      );
    }

    // Check if freelancer has already applied to this job
    const existingProposal = await prisma.proposal.findUnique({
      where: {
        jobId_freelancerId: {
          jobId: parseInt(jobId),
          freelancerId: parseInt(freelancerId),
        },
      },
    });

    if (existingProposal) {
      return NextResponse.json(
        { error: "You have already submitted a proposal for this job" },
        { status: 400 }
      );
    }

    // Check freelancer's plan for connect availability
    const userPlan = await prisma.userPlan.findUnique({
      where: { userId: parseInt(freelancerId) },
    });

    if (!userPlan || userPlan.usedConnects >= userPlan.connects) {
      return NextResponse.json(
        { error: "Insufficient connects. Please upgrade your plan." },
        { status: 400 }
      );
    }

    // Create the proposal
    const proposal = await prisma.proposal.create({
      data: {
        jobId: parseInt(jobId),
        freelancerId: parseInt(freelancerId),
        coverLetter: coverLetter.trim(),
        bidAmount: parseFloat(bidAmount),
        timeframe: parseInt(timeframe),
        status: "pending",
      },
      include: {
        job: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        freelancer: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                title: true,
                skills: true,
              },
            },
          },
        },
      },
    });

    // Deduct one connect from freelancer's plan
    await prisma.userPlan.update({
      where: { userId: parseInt(freelancerId) },
      data: {
        usedConnects: {
          increment: 1,
        },
      },
    });

    // Record connect transaction
    await prisma.connectTransaction.create({
      data: {
        userId: parseInt(freelancerId),
        proposalId: proposal.id,
        type: "DEBIT",
        amount: 1,
        description: `Applied to job: ${job.title}`,
      },
    });

    // Create conversation between client and freelancer
    const conversation = await prisma.conversation.upsert({
      where: {
        clientId_freelancerId_jobId: {
          clientId: job.userId,
          freelancerId: parseInt(freelancerId),
          jobId: parseInt(jobId),
        },
      },
      update: {},
      create: {
        clientId: job.userId,
        freelancerId: parseInt(freelancerId),
        jobId: parseInt(jobId),
      },
    });

    // Link proposal to conversation
    await prisma.proposal.update({
      where: { id: proposal.id },
      data: { conversationId: conversation.id },
    });

    // Send initial message in the conversation
    await prisma.message.create({
      data: {
        content: `I've submitted a proposal for your job "${job.title}" with a bid of $${bidAmount} and timeline of ${timeframe} days.`,
        messageType: "PROJECT_UPDATE",
        senderId: parseInt(freelancerId),
        conversationId: conversation.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Proposal submitted successfully",
      proposal: {
        ...proposal,
        conversationId: conversation.id,
        client: proposal.job.user,
      },
    });
  } catch (error) {
    console.error("Error creating proposal:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "You have already submitted a proposal for this job" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to submit proposal" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { proposalId, freelancerId, coverLetter, bidAmount, timeframe } =
      body;

    if (!proposalId || !freelancerId) {
      return NextResponse.json(
        { error: "Proposal ID and freelancer ID are required" },
        { status: 400 }
      );
    }

    // Verify the proposal belongs to the freelancer
    const existingProposal = await prisma.proposal.findFirst({
      where: {
        id: parseInt(proposalId),
        freelancerId: parseInt(freelancerId),
        status: "pending", // Only allow editing pending proposals
      },
    });

    if (!existingProposal) {
      return NextResponse.json(
        { error: "Proposal not found or cannot be edited" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData = {};
    if (coverLetter !== undefined) updateData.coverLetter = coverLetter.trim();
    if (bidAmount !== undefined) updateData.bidAmount = parseFloat(bidAmount);
    if (timeframe !== undefined) updateData.timeframe = parseInt(timeframe);

    // Update the proposal
    const updatedProposal = await prisma.proposal.update({
      where: { id: parseInt(proposalId) },
      data: updateData,
      include: {
        job: {
          select: {
            id: true,
            title: true,
            budget: true,
          },
        },
        freelancer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Proposal updated successfully",
      proposal: updatedProposal,
    });
  } catch (error) {
    console.error("Error updating proposal:", error);
    return NextResponse.json(
      { error: "Failed to update proposal" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const proposalId = searchParams.get("proposalId");
    const freelancerId = searchParams.get("freelancerId");

    if (!proposalId || !freelancerId) {
      return NextResponse.json(
        { error: "Proposal ID and freelancer ID are required" },
        { status: 400 }
      );
    }

    // Verify the proposal belongs to the freelancer and is pending
    const proposal = await prisma.proposal.findFirst({
      where: {
        id: parseInt(proposalId),
        freelancerId: parseInt(freelancerId),
        status: "pending",
      },
    });

    if (!proposal) {
      return NextResponse.json(
        { error: "Proposal not found or cannot be withdrawn" },
        { status: 404 }
      );
    }

    // Delete the proposal
    await prisma.proposal.delete({
      where: { id: parseInt(proposalId) },
    });

    // Refund the connect (if applicable)
    const userPlan = await prisma.userPlan.findUnique({
      where: { userId: parseInt(freelancerId) },
    });

    if (userPlan) {
      await prisma.userPlan.update({
        where: { userId: parseInt(freelancerId) },
        data: {
          usedConnects: {
            decrement: 1,
          },
        },
      });

      // Record refund transaction
      await prisma.connectTransaction.create({
        data: {
          userId: parseInt(freelancerId),
          type: "CREDIT",
          amount: 1,
          description: `Proposal withdrawal refund for job application`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Proposal withdrawn successfully",
    });
  } catch (error) {
    console.error("Error withdrawing proposal:", error);
    return NextResponse.json(
      { error: "Failed to withdraw proposal" },
      { status: 500 }
    );
  }
}
