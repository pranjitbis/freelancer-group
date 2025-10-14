import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { paymentRequestId, clientId, reason } = body;

    if (!paymentRequestId || !clientId || !reason) {
      return NextResponse.json(
        { success: false, error: "Payment request ID, client ID, and reason are required" },
        { status: 400 }
      );
    }

    // Verify payment request exists and belongs to client
    const paymentRequest = await prisma.paymentRequest.findFirst({
      where: {
        id: parseInt(paymentRequestId),
        clientId: parseInt(clientId),
        status: "pending",
      },
      include: {
        conversation: true,
      },
    });

    if (!paymentRequest) {
      return NextResponse.json(
        { success: false, error: "Payment request not found or unauthorized" },
        { status: 404 }
      );
    }

    // Update payment request status to rejected
    const updatedRequest = await prisma.paymentRequest.update({
      where: { id: parseInt(paymentRequestId) },
      data: {
        status: "rejected",
        updatedAt: new Date(),
      },
    });

    // Create rejection message
    await prisma.message.create({
      data: {
        content: `Payment request rejected. Reason: ${reason}`,
        messageType: "PAYMENT_FAILED",
        senderId: parseInt(clientId),
        conversationId: paymentRequest.conversationId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment request rejected successfully",
      paymentRequest: updatedRequest,
    });
  } catch (error) {
    console.error("Error rejecting payment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reject payment" },
      { status: 500 }
    );
  }
}