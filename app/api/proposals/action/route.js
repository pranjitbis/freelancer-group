import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { proposalId, action } = body;

    if (!proposalId || !action) {
      return NextResponse.json(
        { success: false, error: "Proposal ID and action are required" },
        { status: 400 }
      );
    }

    // Validate action
    const validActions = ["accepted", "rejected"];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { success: false, error: "Invalid action" },
        { status: 400 }
      );
    }

    // Find the proposal
    const proposal = await prisma.proposal.findUnique({
      where: { id: parseInt(proposalId) },
      include: {
        job: true,
        freelancer: true,
      },
    });

    if (!proposal) {
      return NextResponse.json(
        { success: false, error: "Proposal not found" },
        { status: 404 }
      );
    }

    // Update proposal status
    const updatedProposal = await prisma.proposal.update({
      where: { id: parseInt(proposalId) },
      data: {
        status: action,
        updatedAt: new Date(),
      },
      include: {
        job: true,
        freelancer: {
          include: {
            profile: true,
          },
        },
      },
    });

    // If accepted, create a project and conversation
    if (action === "accepted") {
      // Create or find conversation
      let conversation = await prisma.conversation.findFirst({
        where: {
          clientId: proposal.job.userId,
          freelancerId: proposal.freelancerId,
          projectId: null,
        },
      });

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            clientId: proposal.job.userId,
            freelancerId: proposal.freelancerId,
          },
        });
      }

      // Create project
      const project = await prisma.project.create({
        data: {
          title: proposal.job.title,
          description: proposal.job.description,
          budget: proposal.bidAmount,
          status: "active",
          clientId: proposal.job.userId,
          freelancerId: proposal.freelancerId,
        },
      });

      // Update conversation with project
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          projectId: project.id,
        },
      });

      // Update proposal with conversation
      await prisma.proposal.update({
        where: { id: parseInt(proposalId) },
        data: {
          conversationId: conversation.id,
        },
      });

      // Create initial message
      await prisma.message.create({
        data: {
          content: `Congratulations! Your proposal for "${proposal.job.title}" has been accepted. The project budget is $${proposal.bidAmount}.`,
          messageType: "SYSTEM",
          senderId: proposal.job.userId,
          conversationId: conversation.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      proposal: updatedProposal,
      message: `Proposal ${action} successfully`,
    });
  } catch (error) {
    console.error("Proposal action error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update proposal",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
