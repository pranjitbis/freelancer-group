import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(request, { params }) {
  try {
    // Middleware should have already verified admin access
    const { id } = params;
    const body = await request.json();
    const { status, adminNotes } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = [
      "pending",
      "approved",
      "rejected",
      "processed",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Get current refund
    const currentRefund = await prisma.refundRequest.findUnique({
      where: { id: parseInt(id) },
      include: {
        paymentRequest: true,
        client: true,
        freelancer: true,
      },
    });

    if (!currentRefund) {
      return NextResponse.json(
        { error: "Refund request not found" },
        { status: 404 }
      );
    }

    // Update refund
    const updatedRefund = await prisma.refundRequest.update({
      where: { id: parseInt(id) },
      data: {
        status,
        adminNotes: adminNotes || null,
        processedById: 1, // You can get this from middleware user info
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        freelancer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        paymentRequest: {
          select: {
            id: true,
            amount: true,
            currency: true,
            description: true,
            projectTitle: true,
          },
        },
        processedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // If refund is processed, update balances
    if (status === "processed") {
      try {
        await processRefundPayment(currentRefund);
      } catch (paymentError) {
        console.error("Payment processing error:", paymentError);
        // Rollback refund status if payment fails
        await prisma.refundRequest.update({
          where: { id: parseInt(id) },
          data: { status: "approved" },
        });

        return NextResponse.json(
          { error: "Failed to process payment. Please try again." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Refund ${status} successfully`,
      refund: updatedRefund,
    });
  } catch (error) {
    console.error("Update refund error:", error);
    return NextResponse.json(
      { error: "Failed to update refund" },
      { status: 500 }
    );
  }
}

// Process refund payment and update balances
async function processRefundPayment(refund) {
  return await prisma.$transaction(async (tx) => {
    // 1. Deduct from freelancer's wallet
    const freelancerWallet = await tx.freelancerWallet.findUnique({
      where: { userId: refund.freelancerId },
    });

    if (!freelancerWallet) {
      throw new Error("Freelancer wallet not found");
    }

    if (freelancerWallet.balance < refund.amount) {
      throw new Error("Insufficient balance in freelancer wallet");
    }

    // Update freelancer wallet balance
    await tx.freelancerWallet.update({
      where: { userId: refund.freelancerId },
      data: {
        balance: {
          decrement: refund.amount,
        },
      },
    });

    // Record wallet transaction for freelancer
    await tx.walletTransaction.create({
      data: {
        amount: refund.amount,
        type: "debit",
        description: `Refund processed for project: ${refund.paymentRequest.projectTitle}`,
        status: "completed",
        walletId: freelancerWallet.id,
      },
    });

    // 2. Refund to client
    // Create transaction record for client
    await tx.transaction.create({
      data: {
        amount: refund.amount,
        type: "credit",
        status: "completed",
        description: `Refund for project: ${refund.paymentRequest.projectTitle}`,
        userId: refund.clientId,
      },
    });

    // Update client's wallet balance
    await tx.user.update({
      where: { id: refund.clientId },
      data: {
        wallet: {
          increment: refund.amount,
        },
      },
    });

    // 3. Update payment request status to refunded
    await tx.paymentRequest.update({
      where: { id: refund.paymentRequestId },
      data: {
        status: "refunded",
      },
    });

    console.log(
      `Refund processed: ${refund.amount} from freelancer ${refund.freelancerId} to client ${refund.clientId}`
    );
  });
}

// GET single refund details
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const refund = await prisma.refundRequest.findUnique({
      where: { id: parseInt(id) },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            wallet: true,
          },
        },
        freelancer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        paymentRequest: {
          select: {
            id: true,
            amount: true,
            currency: true,
            description: true,
            projectTitle: true,
            status: true,
            createdAt: true,
          },
        },
        processedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!refund) {
      return NextResponse.json(
        { error: "Refund request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ refund });
  } catch (error) {
    console.error("Get refund details error:", error);
    return NextResponse.json(
      { error: "Failed to fetch refund details" },
      { status: 500 }
    );
  }
}
