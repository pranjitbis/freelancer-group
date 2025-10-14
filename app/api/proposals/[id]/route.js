// app/api/proposals/[id]/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET single proposal with detailed information
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const proposal = await prisma.proposal.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        job: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        freelancer: {
          include: {
            profile: {
              select: {
                skills: true,
                experience: true,
                hourlyRate: true,
                bio: true,
                title: true,
                location: true,
                portfolio: true,
                github: true,
                linkedin: true,
              },
            },
          },
        },
        connectTransactions: true,
      },
    });

    if (!proposal) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      proposal,
    });
  } catch (error) {
    console.error("Get proposal error:", error);
    return NextResponse.json(
      { error: "Failed to fetch proposal" },
      { status: 500 }
    );
  }
}

// UPDATE proposal status and create conversation when accepted
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { status, clientMessage, clientId } = await request.json();

    console.log("📥 Updating proposal:", { id, status, clientId });

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    const validStatuses = ["pending", "accepted", "rejected", "completed"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Get proposal with job details
    const proposal = await prisma.proposal.findUnique({
      where: { id: parseInt(id) },
      include: {
        job: {
          include: {
            user: true,
          },
        },
        freelancer: true,
      },
    });

    if (!proposal) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
      );
    }

    // Verify client owns the job
    if (clientId && proposal.job.userId !== parseInt(clientId)) {
      return NextResponse.json(
        { error: "Unauthorized to update this proposal" },
        { status: 403 }
      );
    }

    const updatedProposal = await prisma.proposal.update({
      where: {
        id: parseInt(id),
      },
      data: {
        status,
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
          },
        },
      },
    });

    let conversation = null;

    // If accepted, create a conversation and project
    if (status === "accepted") {
      try {
        // Check if conversation already exists between these users
        conversation = await prisma.conversation.findFirst({
          where: {
            clientId: proposal.job.userId,
            freelancerId: proposal.freelancerId,
          },
          include: {
            project: true,
          },
        });

        if (!conversation) {
          // Create project
          const project = await prisma.project.create({
            data: {
              title: proposal.job.title,
              description:
                proposal.job.description ||
                `Project based on proposal for: ${proposal.job.title}`,
              budget: proposal.bidAmount,
              clientId: proposal.job.userId,
              freelancerId: proposal.freelancerId,
              status: "active",
            },
          });

          // Create conversation
          conversation = await prisma.conversation.create({
            data: {
              clientId: proposal.job.userId,
              freelancerId: proposal.freelancerId,
              projectId: project.id,
            },
            include: {
              client: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                },
              },
              freelancer: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                },
              },
              project: {
                select: {
                  id: true,
                  title: true,
                  budget: true,
                },
              },
            },
          });
        }

        // Link proposal to conversation
        await prisma.proposal.update({
          where: { id: parseInt(id) },
          data: { conversationId: conversation.id },
        });

        // Create initial welcome message from client
        const welcomeMessage =
          clientMessage ||
          `Hello ${proposal.freelancer.name}! I've accepted your proposal for "${proposal.job.title}". Let's discuss the project details and get started! 🎉`;

        await prisma.message.create({
          data: {
            content: welcomeMessage,
            senderId: proposal.job.userId,
            conversationId: conversation.id,
            messageType: "TEXT",
          },
        });

        // Create a system message to notify about project start
        await prisma.message.create({
          data: {
            content: `Project "${proposal.job.title}" has started! Budget: ₹${proposal.bidAmount}. You can now communicate and collaborate through this chat.`,
            senderId: proposal.job.userId,
            conversationId: conversation.id,
            messageType: "SYSTEM",
          },
        });

        console.log(
          `✅ Conversation created: ${conversation.id} for project: ${proposal.job.title}`
        );
        console.log(
          `👥 Participants: Client ${proposal.job.user.name} ↔ Freelancer ${proposal.freelancer.name}`
        );
      } catch (conversationError) {
        console.error("❌ Error creating conversation:", conversationError);
        return NextResponse.json(
          {
            success: false,
            error: "Proposal accepted but failed to create conversation",
            details: conversationError.message,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Proposal ${status} successfully`,
      proposal: updatedProposal,
      conversation: conversation,
      redirectUrls:
        status === "accepted"
          ? {
              client: `/client-dashboard/messages?conversation=${conversation?.id}`,
              freelancer: `/freelancer-dashboard/messages?conversation=${conversation?.id}`,
            }
          : null,
    });
  } catch (error) {
    console.error("Update proposal error:", error);
    return NextResponse.json(
      { error: "Failed to update proposal" },
      { status: 500 }
    );
  }
}
