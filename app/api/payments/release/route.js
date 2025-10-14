import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { paymentRequestId, clientId } = body;

    if (!paymentRequestId || !clientId) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment request ID and client ID are required",
        },
        { status: 400 }
      );
    }

    // Verify payment request exists and belongs to client
    const paymentRequest = await prisma.paymentRequest.findFirst({
      where: {
        id: parseInt(paymentRequestId),
        clientId: parseInt(clientId),
      },
      include: {
        client: true,
        freelancer: true,
        conversation: true,
      },
    });

    if (!paymentRequest) {
      return NextResponse.json(
        { success: false, error: "Payment request not found or unauthorized" },
        { status: 404 }
      );
    }

    // Check client wallet balance
    if (paymentRequest.client.wallet < paymentRequest.amount) {
      return NextResponse.json(
        { success: false, error: "Insufficient wallet balance" },
        { status: 400 }
      );
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update payment request status
      const updatedRequest = await tx.paymentRequest.update({
        where: { id: parseInt(paymentRequestId) },
        data: {
          status: "completed",
          updatedAt: new Date(),
        },
      });

      // Deduct from client wallet
      await tx.user.update({
        where: { id: parseInt(clientId) },
        data: {
          wallet: {
            decrement: paymentRequest.amount,
          },
        },
      });

      // Add to freelancer wallet
      await tx.user.update({
        where: { id: paymentRequest.freelancerId },
        data: {
          wallet: {
            increment: paymentRequest.amount,
          },
        },
      });

      // Create transaction records
      await tx.transaction.create({
        data: {
          amount: paymentRequest.amount,
          type: "debit",
          status: "completed",
          description: `Payment released to ${paymentRequest.freelancer.name} for ${paymentRequest.description}`,
          userId: parseInt(clientId),
        },
      });

      await tx.transaction.create({
        data: {
          amount: paymentRequest.amount,
          type: "credit",
          status: "completed",
          description: `Payment received from ${paymentRequest.client.name} for ${paymentRequest.description}`,
          userId: paymentRequest.freelancerId,
        },
      });

      // Create completion message
      await tx.message.create({
        data: {
          content: `Payment of ${paymentRequest.amount} released for: ${paymentRequest.description}`,
          messageType: "PAYMENT_COMPLETED",
          senderId: parseInt(clientId),
          conversationId: paymentRequest.conversationId,
        },
      });

      return updatedRequest;
    });

    return NextResponse.json({
      success: true,
      message: "Payment released successfully",
      paymentRequest: result,
    });
  } catch (error) {
    console.error("Error releasing payment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to release payment" },
      { status: 500 }
    );
  }
}
