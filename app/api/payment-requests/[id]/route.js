import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getIO } from "@/lib/socket-server";

const prisma = new PrismaClient();

// Helper function to format currency
function formatCurrency(amount, currency = "USD") {
  if (!amount && amount !== 0) return "-";

  const formatter = new Intl.NumberFormat(
    currency === "INR" ? "en-IN" : "en-US",
    {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );

  return formatter.format(amount);
}

// Update payment request status
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, clientId, razorpayOrderId, razorpayPaymentId } = body;

    console.log("🔄 Updating payment request:", {
      id,
      status,
      clientId,
      razorpayOrderId,
      razorpayPaymentId,
    });

    // Verify the client owns this payment request
    const existingRequest = await prisma.paymentRequest.findFirst({
      where: {
        id: parseInt(id),
        clientId: parseInt(clientId),
      },
      include: {
        conversation: true,
        freelancer: true,
        client: true,
      },
    });

    if (!existingRequest) {
      return NextResponse.json(
        { success: false, error: "Payment request not found or access denied" },
        { status: 404 }
      );
    }

    const updateData = {
      status,
      updatedAt: new Date(),
      ...(razorpayOrderId && { razorpayOrderId }),
      ...(razorpayPaymentId && { razorpayPaymentId }),
    };

    const updatedRequest = await prisma.paymentRequest.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            wallet: true,
            currency: true,
          },
        },
        freelancer: {
          select: {
            id: true,
            name: true,
            email: true,
            wallet: true,
            currency: true,
          },
        },
        conversation: {
          include: {
            project: { select: { title: true, id: true } },
          },
        },
      },
    });

    console.log("✅ Payment request updated:", updatedRequest.id);

    // Create a system message when status changes
    let messageContent = "";
    if (status === "approved") {
      messageContent = `Payment request approved by client`;
    } else if (status === "rejected") {
      messageContent = `Payment request rejected by client`;
    } else if (status === "completed") {
      messageContent = `Payment completed successfully`;
    }

    if (messageContent) {
      await prisma.message.create({
        data: {
          content: messageContent,
          messageType: "SYSTEM",
          senderId: parseInt(clientId),
          conversationId: existingRequest.conversationId,
        },
      });
    }

    // If approved, process payment from client's wallet
    if (status === "approved") {
      await processPayment(updatedRequest);
    }

    // Socket.io broadcast
    try {
      const io = getIO();
      if (io) {
        io.to(`conversation_${existingRequest.conversationId}`).emit(
          "payment_request_updated",
          {
            paymentRequest: updatedRequest,
          }
        );
        console.log("📢 Payment request update broadcasted via Socket.io");
      }
    } catch (socketError) {
      console.error("Socket.io broadcast failed:", socketError);
    }

    return NextResponse.json({
      success: true,
      paymentRequest: updatedRequest,
      message: `Payment request ${status}`,
    });
  } catch (error) {
    console.error("❌ Error updating payment request:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update payment request",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// Get specific payment request
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const paymentRequest = await prisma.paymentRequest.findUnique({
      where: { id: parseInt(id) },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            wallet: true,
            currency: true,
            profile: { select: { avatar: true } },
          },
        },
        freelancer: {
          select: {
            id: true,
            name: true,
            email: true,
            wallet: true,
            currency: true,
            profile: { select: { avatar: true } },
          },
        },
        conversation: {
          include: {
            project: { select: { title: true, id: true, budget: true } },
            client: { select: { id: true, name: true } },
            freelancer: { select: { id: true, name: true } },
          },
        },
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            sender: { select: { id: true, name: true, avatar: true } },
          },
        },
      },
    });

    if (!paymentRequest) {
      return NextResponse.json(
        { success: false, error: "Payment request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      paymentRequest,
    });
  } catch (error) {
    console.error("❌ Error fetching payment request:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch payment request" },
      { status: 500 }
    );
  }
}

async function processPayment(paymentRequest) {
  try {
    const { clientId, freelancerId, amount, id, currency } = paymentRequest;

    console.log("💰 Processing payment:", {
      clientId,
      freelancerId,
      amount,
      currency,
    });

    // Check client wallet balance
    const client = await prisma.user.findUnique({
      where: { id: clientId },
      select: { wallet: true, name: true, currency: true },
    });

    if (!client) {
      throw new Error("Client not found");
    }

    if (client.wallet < amount) {
      throw new Error("Insufficient wallet balance");
    }

    // Start transaction
    await prisma.$transaction(async (tx) => {
      // Deduct from client's wallet
      await tx.user.update({
        where: { id: clientId },
        data: { wallet: { decrement: amount } },
      });

      // Add to freelancer's wallet
      await tx.user.update({
        where: { id: freelancerId },
        data: { wallet: { increment: amount } },
      });

      // Create transaction records
      await tx.transaction.create({
        data: {
          amount: amount,
          type: "debit",
          status: "completed",
          description: `Payment to ${paymentRequest.freelancerName} for: ${paymentRequest.description}`,
          userId: clientId,
        },
      });

      await tx.transaction.create({
        data: {
          amount: amount,
          type: "credit",
          status: "completed",
          description: `Payment from ${paymentRequest.clientName} for: ${paymentRequest.description}`,
          userId: freelancerId,
        },
      });

      // Update payment request status to completed
      await tx.paymentRequest.update({
        where: { id: id },
        data: { status: "completed" },
      });

      // Create payment completed message
      await tx.message.create({
        data: {
          content: `Payment of ${formatCurrency(
            amount,
            currency
          )} completed successfully`,
          messageType: "PAYMENT_COMPLETED",
          senderId: clientId,
          conversationId: paymentRequest.conversationId,
          amount: amount,
          currency: currency,
        },
      });
    });

    console.log("✅ Payment processed successfully");
  } catch (error) {
    console.error("❌ Error processing payment:", error);

    // Update payment request status to failed
    await prisma.paymentRequest.update({
      where: { id: paymentRequest.id },
      data: {
        status: "failed",
        updatedAt: new Date(),
      },
    });

    throw error;
  }
}
