// app/api/socket/messages/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { encrypt } from "@/lib/cryptoUtils";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { conversationId, senderId, content, messageType, tempId } =
      await request.json();

    console.log("📨 Processing message:", {
      conversationId,
      senderId,
      messageType,
      tempId,
    });

    // Verify conversation exists and user has access
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: parseInt(conversationId),
        OR: [
          { clientId: parseInt(senderId) },
          { freelancerId: parseInt(senderId) },
        ],
      },
      include: {
        client: {
          select: { id: true, name: true, avatar: true },
        },
        freelancer: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found or access denied" },
        { status: 404 }
      );
    }

    // Encrypt message content
    const encryptedContent = encrypt(content);

    // Create message in database
    const message = await prisma.message.create({
      data: {
        content: encryptedContent,
        senderId: parseInt(senderId),
        conversationId: parseInt(conversationId),
        messageType: messageType || "TEXT",
      },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true },
        },
        readBy: {
          select: { id: true },
        },
      },
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: parseInt(conversationId) },
      data: { updatedAt: new Date() },
    });

    console.log(`✅ Message created: ${message.id}`);

    return NextResponse.json({
      success: true,
      message: {
        ...message,
        content: content, // Return decrypted content for immediate display
        tempId,
      },
    });
  } catch (error) {
    console.error("❌ Error creating message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
