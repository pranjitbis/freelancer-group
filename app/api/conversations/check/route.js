// app/api/conversations/check/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = parseInt(searchParams.get("clientId"));
    const freelancerId = parseInt(searchParams.get("freelancerId"));

    if (!clientId || !freelancerId) {
      return NextResponse.json(
        { success: false, error: "Client ID and Freelancer ID are required" },
        { status: 400 }
      );
    }

    // Check for existing conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          {
            clientId: clientId,
            freelancerId: freelancerId,
          },
          {
            clientId: freelancerId,
            freelancerId: clientId,
          },
        ],
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        freelancer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    return NextResponse.json({
      success: true,
      conversation: conversation,
      exists: !!conversation,
    });
  } catch (error) {
    console.error("Error checking conversation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check conversation" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
