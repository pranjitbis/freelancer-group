import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { decrypt } from "@/lib/cryptoUtils";

const prisma = new PrismaClient();

// Get messages for a specific conversation
export async function GET(request, { params }) {
  try {
    // Await the params object
    const { conversationId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    console.log("📥 Fetching messages for conversation:", {
      conversationId,
      userId,
    });

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Verify user has access to this conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: parseInt(conversationId),
        OR: [
          { clientId: parseInt(userId) },
          { freelancerId: parseInt(userId) },
        ],
      },
      include: {
        client: {
          select: { id: true, name: true, avatar: true },
        },
        freelancer: {
          select: { id: true, name: true, avatar: true },
        },
        project: {
          select: { id: true, title: true, budget: true },
        },
        proposals: {
          where: {
            status: "accepted",
          },
          select: {
            id: true,
            status: true,
            freelancerId: true,
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found or access denied" },
        { status: 404 }
      );
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId: parseInt(conversationId),
      },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true },
        },
        paymentRequest: {
          // Make sure this is included
          select: {
            id: true,
            status: true,
            amount: true,
            description: true,
            freelancerName: true,
            clientName: true,
          },
        },
        readBy: {
          where: { id: parseInt(userId) },
          select: { id: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Debug: Check payment request messages
    const paymentMessages = messages.filter(
      (msg) => msg.messageType === "PAYMENT_REQUEST"
    );
    console.log(
      "💰 Payment request messages in API:",
      paymentMessages.map((msg) => ({
        id: msg.id,
        amount: msg.amount,
        paymentRequest: msg.paymentRequest,
      }))
    );

    // Decrypt message contents
    const decryptedMessages = messages.map((message) => ({
      ...message,
      content: message.isDeleted
        ? "[Message deleted]"
        : decrypt(message.content),
    }));

    console.log(
      `✅ Found ${messages.length} messages for conversation ${conversationId}`
    );

    return NextResponse.json({
      success: true,
      messages: decryptedMessages,
      conversation: {
        id: conversation.id,
        client: conversation.client,
        freelancer: conversation.freelancer,
        project: conversation.project,
        proposals: conversation.proposals,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      },
    });
  } catch (error) {
    console.error("❌ Get messages error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch messages",
      },
      { status: 500 }
    );
  }
}
