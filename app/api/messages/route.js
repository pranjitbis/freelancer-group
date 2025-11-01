// app/api/messages/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { encrypt, decrypt } from "@/lib/cryptoUtils";

const prisma = new PrismaClient();

// Get messages for a conversation
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");
    const userId = searchParams.get("userId");

    console.log("📥 Fetching messages:", {
      conversationId,
      userId,
    });

    if (!conversationId || !userId) {
      return NextResponse.json(
        { error: "conversationId and userId are required" },
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
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found or access denied" },
        { status: 404 }
      );
    }

    // Get messages
    const messages = await prisma.message.findMany({
      where: {
        conversationId: parseInt(conversationId),
      },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true },
        },
        readBy: {
          where: { id: parseInt(userId) },
          select: { id: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

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
      conversation: conversation,
    });
  } catch (error) {
    console.error("❌ Get messages error:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Send a new message
export async function POST(request) {
  try {
    const body = await request.json();
    const { conversationId, senderId, content, messageType = "TEXT" } = body;

    console.log("📨 Sending message via main route:", {
      conversationId,
      senderId,
      messageType,
      contentLength: content?.length,
    });

    if (!conversationId || !senderId || !content) {
      return NextResponse.json(
        { error: "conversationId, senderId, and content are required" },
        { status: 400 }
      );
    }

    // Verify conversation exists and user is part of it
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: parseInt(conversationId),
        OR: [
          { clientId: parseInt(senderId) },
          { freelancerId: parseInt(senderId) },
        ],
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found or access denied" },
        { status: 404 }
      );
    }

    // Encrypt the message content
    const encryptedContent = encrypt(content);
    console.log("🔐 Content encrypted successfully");

    // Create the message
    const message = await prisma.message.create({
      data: {
        content: encryptedContent,
        senderId: parseInt(senderId),
        conversationId: parseInt(conversationId),
        messageType: messageType,
        isDeleted: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        readBy: {
          select: {
            id: true,
          },
        },
      },
    });

    // Update conversation's updatedAt
    await prisma.conversation.update({
      where: { id: parseInt(conversationId) },
      data: { updatedAt: new Date() },
    });

    console.log(`✅ Message sent via main route: ${message.id}`);

    // Prepare response (decrypted for sender)
    const responseMessage = {
      ...message,
      content: content, // Send back original content for immediate display
    };

    return NextResponse.json({
      success: true,
      message: responseMessage,
    });
  } catch (error) {
    console.error("❌ Send message error:", error);
    return NextResponse.json(
      { error: "Failed to send message: " + error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
