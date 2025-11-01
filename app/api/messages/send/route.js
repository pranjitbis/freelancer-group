import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { encrypt } from "@/lib/cryptoUtils";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { conversationId, senderId, content, messageType = "TEXT" } = body;

    console.log("📨 Sending message:", {
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
      include: {
        client: true,
        freelancer: true,
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

    // Create the message (REMOVED isDeleted field)
    const message = await prisma.message.create({
      data: {
        content: encryptedContent,
        senderId: parseInt(senderId),
        conversationId: parseInt(conversationId),
        messageType: messageType,
        // Remove isDeleted field as it doesn't exist in schema
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

    console.log(`✅ Message sent: ${message.id}`);

    // Prepare message for response (decrypt for the sender)
    const responseMessage = {
      ...message,
      content: content, // Send decrypted content back to sender
    };

    return NextResponse.json({
      success: true,
      message: responseMessage,
    });
  } catch (error) {
    console.error("❌ Send message error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
