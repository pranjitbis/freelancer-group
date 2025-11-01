import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request, { params }) {
  try {
    // Await the params object
    const { conversationId } = await params;
    const { userId, messageIds } = await request.json();

    console.log("📥 Marking messages as read:", {
      conversationId,
      userId,
      messageIds,
    });

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // If specific message IDs are provided, use them
    // Otherwise, get all unread messages for this user in this conversation
    let messagesToMark = [];

    if (messageIds && messageIds.length > 0) {
      // Use provided message IDs
      messagesToMark = await prisma.message.findMany({
        where: {
          id: {
            in: messageIds.map((id) => parseInt(id)),
          },
          conversationId: parseInt(conversationId),
          NOT: {
            senderId: parseInt(userId),
          },
          readBy: {
            none: {
              id: parseInt(userId),
            },
          },
        },
        select: {
          id: true,
        },
      });
    } else {
      // Get all unread messages for this conversation
      messagesToMark = await prisma.message.findMany({
        where: {
          conversationId: parseInt(conversationId),
          NOT: {
            senderId: parseInt(userId),
          },
          readBy: {
            none: {
              id: parseInt(userId),
            },
          },
        },
        select: {
          id: true,
        },
      });
    }

    if (messagesToMark.length > 0) {
      const messageIds = messagesToMark.map((msg) => msg.id);

      // Mark each message as read by connecting the user to readBy relation
      for (const messageId of messageIds) {
        await prisma.message.update({
          where: { id: messageId },
          data: {
            readBy: {
              connect: { id: parseInt(userId) },
            },
          },
        });
      }

      console.log(
        `✅ Marked ${messageIds.length} messages as read for user ${userId}`
      );
    } else {
      console.log(`ℹ️ No unread messages to mark for user ${userId}`);
    }

    return NextResponse.json({
      success: true,
      message: "Messages marked as read",
      markedCount: messagesToMark.length,
    });
  } catch (error) {
    console.error("❌ Mark messages as read error:", error);
    return NextResponse.json(
      { error: "Failed to mark messages as read" },
      { status: 500 }
    );
  }
}
