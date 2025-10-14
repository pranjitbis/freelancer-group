import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { projectId, freelancerId, forceComplete = false } = body;

    if (!projectId || !freelancerId) {
      return NextResponse.json(
        { success: false, error: "Project ID and freelancer ID are required" },
        { status: 400 }
      );
    }

    // Verify project exists and belongs to freelancer
    const project = await prisma.project.findFirst({
      where: {
        id: parseInt(projectId),
        freelancerId: parseInt(freelancerId),
      },
      include: {
        conversations: {
          include: {
            paymentRequests: {
              where: {
                status: {
                  in: ["pending", "approved"],
                },
              },
            },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found or unauthorized" },
        { status: 404 }
      );
    }

    // Check if there are pending payments (only if not forcing completion)
    const pendingPayments = project.conversations[0]?.paymentRequests || [];

    if (!forceComplete && pendingPayments.length > 0) {
      const paymentDetails = pendingPayments.map((p) => ({
        id: p.id,
        amount: p.amount,
        status: p.status,
        description: p.description,
      }));

      return NextResponse.json(
        {
          success: false,
          error: "Cannot complete project with pending or approved payments",
          pendingPayments: paymentDetails,
          canForceComplete: true,
        },
        { status: 400 }
      );
    }

    // Update project status to completed
    const updatedProject = await prisma.project.update({
      where: { id: parseInt(projectId) },
      data: {
        status: "completed",
        completedAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        client: {
          select: {
            name: true,
            email: true,
          },
        },
        freelancer: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Create completion message
    const conversations = project.conversations || [];
    for (const conversation of conversations) {
      await prisma.message.create({
        data: {
          content:
            pendingPayments.length > 0
              ? `Project "${project.title}" has been marked as completed. Note: Some payments are still pending.`
              : `Project "${project.title}" has been marked as completed by the freelancer.`,
          messageType: "PROJECT_UPDATE",
          senderId: parseInt(freelancerId),
          conversationId: conversation.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      project: updatedProject,
      hasPendingPayments: pendingPayments.length > 0,
      message:
        pendingPayments.length > 0
          ? "Project marked as completed (with pending payments)"
          : "Project marked as completed successfully",
    });
  } catch (error) {
    console.error("Complete project error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to complete project",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
