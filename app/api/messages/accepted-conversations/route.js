import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const userType = searchParams.get("userType");

    console.log("📥 Fetching accepted conversations for:", {
      userId,
      userType,
    });

    if (!userId || !userType) {
      return NextResponse.json(
        { error: "User ID and type are required" },
        { status: 400 }
      );
    }

    let whereClause = {};

    if (userType === "client") {
      whereClause = {
        clientId: parseInt(userId),
        proposals: {
          some: {
            status: "accepted",
          },
        },
      };
    } else if (userType === "freelancer") {
      whereClause = {
        freelancerId: parseInt(userId),
        proposals: {
          some: {
            status: "accepted",
            freelancerId: parseInt(userId),
          },
        },
      };
    }

    const conversations = await prisma.conversation.findMany({
      where: whereClause,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
        freelancer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
        project: {
          select: {
            id: true,
            title: true,
            budget: true,
            status: true,
          },
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
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            sender: {
              select: { id: true, name: true },
            },
          },
        },
        paymentRequests: {
          where: {
            status: "pending",
          },
          take: 1,
          select: {
            id: true,
            amount: true,
            status: true,
          },
        },
        _count: {
          select: {
            messages: {
              where: {
                readBy: {
                  none: {
                    id: parseInt(userId),
                  },
                },
                NOT: {
                  senderId: parseInt(userId),
                },
              },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    console.log(
      `✅ Found ${conversations.length} accepted conversations for user ${userId}`
    );

    return NextResponse.json({
      success: true,
      conversations: conversations,
    });
  } catch (error) {
    console.error("❌ Get accepted conversations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}
