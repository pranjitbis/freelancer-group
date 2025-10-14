import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { decrypt } from "@/lib/cryptoUtils";

const prisma = new PrismaClient();

// Get messages for a specific conversation
export async function GET(request, { params }) {
  try {
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

    const paymentMessages = messages.filter(
      (msg) => msg.messageType === "PAYMENT_REQUEST"
    );
    console.log(
      "💰 Payment request messages in API:",
      paymentMessages.map((msg) => ({
        id: msg.id,
        amount: msg.amount,
        paymentRequest: msg.paymentRequest
          ? {
              id: msg.paymentRequest.id,
              amount: msg.paymentRequest.amount,
              status: msg.paymentRequest.status,
            }
          : null,
      }))
    );

    const fixedMessages = messages.map((message) => {
      if (
        message.messageType === "PAYMENT_REQUEST" &&
        (message.amount === null || message.amount === undefined) &&
        message.paymentRequest?.amount
      ) {
        console.log(
          `🔄 Fixing amount for message ${message.id}: using paymentRequest amount ${message.paymentRequest.amount}`
        );
        return {
          ...message,
          amount: message.paymentRequest.amount,
        };
      }
      return message;
    });

    const decryptedMessages = fixedMessages.map((message) => ({
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
