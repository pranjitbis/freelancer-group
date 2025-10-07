import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      content,
      messageType,
      fileUrl,
      senderId,
      jobId,
      proposalId,
      parentId,
    } = body;

    if (!content || !senderId) {
      return NextResponse.json(
        { error: "Content and sender are required" },
        { status: 400 }
      );
    }

    const message = await prisma.message.create({
      data: {
        content,
        messageType: messageType || "text",
        fileUrl,
        senderId: parseInt(senderId),
        jobId: jobId ? parseInt(jobId) : null,
        proposalId: proposalId ? parseInt(proposalId) : null,
        parentId: parentId ? parseInt(parentId) : null,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            UserProfile: {
              select: {
                avatar: true,
              },
            },
          },
        },
        replies: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                UserProfile: {
                  select: {
                    avatar: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("Create message error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
