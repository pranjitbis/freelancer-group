import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Create new conversation (for direct messaging)
export async function POST(request) {
  try {
    const { clientId, freelancerId, projectId, proposalId } = await request.json();

    console.log("📥 Creating conversation:", {
      clientId,
      freelancerId,
      projectId,
      proposalId,
    });

    if (!clientId || !freelancerId) {
      return NextResponse.json(
        { error: "Client ID and freelancer ID are required" },
        { status: 400 }
      );
    }

    // Check if conversation already exists
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        clientId: parseInt(clientId),
        freelancerId: parseInt(freelancerId),
        projectId: projectId ? parseInt(projectId) : null,
      },
      include: {
        proposals: {
          where: {
            status: "accepted"
          }
        }
      }
    });

    if (existingConversation) {
      console.log(`✅ Conversation already exists: ${existingConversation.id}`);
      
      // If proposalId is provided, link it to the existing conversation
      if (proposalId) {
        await prisma.proposal.update({
          where: { id: parseInt(proposalId) },
          data: {
            conversationId: existingConversation.id
          }
        });
      }
      
      return NextResponse.json({
        success: true,
        conversation: existingConversation,
        message: "Conversation already exists",
      });
    }

    const conversation = await prisma.conversation.create({
      data: {
        clientId: parseInt(clientId),
        freelancerId: parseInt(freelancerId),
        projectId: projectId ? parseInt(projectId) : null,
      },
      include: {
        client: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        freelancer: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        project: {
          select: { id: true, title: true, budget: true },
        },
      },
    });

    // Link proposal to conversation if proposalId is provided
    if (proposalId) {
      await prisma.proposal.update({
        where: { id: parseInt(proposalId) },
        data: {
          conversationId: conversation.id
        }
      });
    }

    console.log(`✅ Conversation created: ${conversation.id}`);

    return NextResponse.json({
      success: true,
      conversation,
      message: "Conversation created successfully",
    });
  } catch (error) {
    console.error("❌ Create conversation error:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}

// Get conversation by proposal ID
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const proposalId = searchParams.get("proposalId");
    const clientId = searchParams.get("clientId");
    const freelancerId = searchParams.get("freelancerId");

    if (proposalId) {
      // Find conversation by proposal ID
      const proposal = await prisma.proposal.findUnique({
        where: { id: parseInt(proposalId) },
        include: {
          conversation: {
            include: {
              client: {
                select: { id: true, name: true, email: true, avatar: true },
              },
              freelancer: {
                select: { id: true, name: true, email: true, avatar: true },
              },
              project: {
                select: { id: true, title: true, budget: true },
              },
              proposals: {
                where: { status: "accepted" },
                select: { id: true, status: true }
              }
            }
          }
        }
      });

      if (!proposal || !proposal.conversation) {
        return NextResponse.json(
          { error: "Conversation not found for this proposal" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        conversation: proposal.conversation,
      });
    }

    if (clientId && freelancerId) {
      // Find conversation by client and freelancer
      const conversation = await prisma.conversation.findFirst({
        where: {
          clientId: parseInt(clientId),
          freelancerId: parseInt(freelancerId),
        },
        include: {
          client: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          freelancer: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          project: {
            select: { id: true, title: true, budget: true },
          },
          proposals: {
            where: { status: "accepted" },
            select: { id: true, status: true }
          }
        }
      });

      return NextResponse.json({
        success: true,
        conversation: conversation,
      });
    }

    return NextResponse.json(
      { error: "proposalId or clientId and freelancerId are required" },
      { status: 400 }
    );
  } catch (error) {
    console.error("❌ Get conversation error:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversation" },
      { status: 500 }
    );
  }
}