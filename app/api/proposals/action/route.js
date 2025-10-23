import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    console.log("Received proposal action:", body);

    const { proposalId, action } = body;

    if (!proposalId || !action) {
      console.error("Missing required fields:", { proposalId, action });
      return NextResponse.json(
        { success: false, error: "Proposal ID and action are required" },
        { status: 400 }
      );
    }

    // Validate action
    const validActions = ["accepted", "rejected", "completed"];
    if (!validActions.includes(action)) {
      console.error("Invalid action:", action);
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid action. Must be one of: accepted, rejected, completed",
        },
        { status: 400 }
      );
    }

    // Parse proposalId to ensure it's a number
    const parsedProposalId = parseInt(proposalId);
    if (isNaN(parsedProposalId)) {
      console.error("Invalid proposal ID:", proposalId);
      return NextResponse.json(
        { success: false, error: "Invalid proposal ID" },
        { status: 400 }
      );
    }

    // Find the proposal
    const proposal = await prisma.proposal.findUnique({
      where: { id: parsedProposalId },
      include: {
        job: true,
        freelancer: true,
      },
    });

    if (!proposal) {
      console.error("Proposal not found:", parsedProposalId);
      return NextResponse.json(
        { success: false, error: "Proposal not found" },
        { status: 404 }
      );
    }

    console.log(
      "Found proposal:",
      proposal.id,
      "with status:",
      proposal.status
    );

    // Update proposal status
    const updatedProposal = await prisma.proposal.update({
      where: { id: parsedProposalId },
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

    console.log("Proposal updated successfully:", updatedProposal.id);

    // If accepted, create a project and conversation
    if (action === "accepted") {
      console.log("Creating project and conversation for accepted proposal");

      try {
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
          console.log("Created new conversation:", conversation.id);
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
        console.log("Created project:", project.id);

        // Update conversation with project
        await prisma.conversation.update({
          where: { id: conversation.id },
          data: {
            projectId: project.id,
          },
        });

        // Update proposal with conversation
        await prisma.proposal.update({
          where: { id: parsedProposalId },
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
        console.log("Created initial message");
      } catch (projectError) {
        console.error("Error creating project/conversation:", projectError);
        // Don't fail the entire request if project creation fails
      }
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
