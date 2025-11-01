// app/api/conversations/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Create new conversation (for direct messaging)
export async function POST(request) {
  try {
    const { clientId, freelancerId, projectId, proposalId, initialMessage } =
      await request.json();

    console.log("📥 Creating conversation:", {
      clientId,
      freelancerId,
      projectId,
      proposalId,
      hasInitialMessage: !!initialMessage,
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
            status: "accepted",
          },
        },
      },
    });

    if (existingConversation) {
      console.log(`✅ Conversation already exists: ${existingConversation.id}`);

      // If initial message is provided, send it
      if (initialMessage) {
        const message = await prisma.message.create({
          data: {
            content: initialMessage,
            senderId: parseInt(clientId),
            conversationId: existingConversation.id,
            messageType: "TEXT",
          },
          include: {
            sender: {
              select: { id: true, name: true, avatar: true },
            },
          },
        });

        // Update conversation timestamp
        await prisma.conversation.update({
          where: { id: existingConversation.id },
          data: { updatedAt: new Date() },
        });
      }

      return NextResponse.json({
        success: true,
        conversation: existingConversation,
        message: "Conversation already exists",
      });
    }

    // Create new conversation
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
          conversationId: conversation.id,
        },
      });
    }

    // Send initial message if provided
    if (initialMessage) {
      const message = await prisma.message.create({
        data: {
          content: initialMessage,
          senderId: parseInt(clientId),
          conversationId: conversation.id,
          messageType: "TEXT",
        },
        include: {
          sender: {
            select: { id: true, name: true, avatar: true },
          },
        },
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
                select: { id: true, status: true },
              },
            },
          },
        },
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
            select: { id: true, status: true },
          },
        },
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
