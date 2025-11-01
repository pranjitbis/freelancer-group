import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get all payment requests for this client
    const paymentRequests = await prisma.paymentRequest.findMany({
      where: {
        clientId: parseInt(userId),
      },
      include: {
        freelancer: {
          select: {
            name: true,
            email: true,
          },
        },
        conversation: {
          include: {
            project: {
              select: {
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Separate pending and completed requests
    const pendingRequests = paymentRequests.filter(
      (req) => req.status === "pending" || req.status === "approved"
    );

    const completedRequests = paymentRequests.filter(
      (req) => req.status === "completed"
    );

    return NextResponse.json({
      success: true,
      pendingRequests: pendingRequests.map((req) => ({
        id: req.id,
        amount: req.amount,
        currency: req.currency,
        description: req.description,
        status: req.status,
        dueDate: req.dueDate,
        createdAt: req.createdAt,
        updatedAt: req.updatedAt,
        freelancerName: req.freelancer.name,
        projectTitle: req.conversation?.project?.title || "Project",
        conversationId: req.conversationId,
      })),
      completedRequests: completedRequests.map((req) => ({
        id: req.id,
        amount: req.amount,
        currency: req.currency,
        description: req.description,
        status: req.status,
        dueDate: req.dueDate,
        createdAt: req.createdAt,
        updatedAt: req.updatedAt,
        freelancerName: req.freelancer.name,
        projectTitle: req.conversation?.project?.title || "Project",
        conversationId: req.conversationId,
      })),
    });
  } catch (error) {
    console.error("Error fetching client payments:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch payment requests" },
      { status: 500 }
    );
  }
}
