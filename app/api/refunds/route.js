import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Get refunds for user (client or freelancer)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const userType = searchParams.get("userType"); // client or freelancer

    if (!userId || !userType) {
      return NextResponse.json(
        { error: "userId and userType are required" },
        { status: 400 }
      );
    }

    const whereClause = userType === "client" 
      ? { clientId: parseInt(userId) }
      : { freelancerId: parseInt(userId) };

    const refunds = await prisma.refundRequest.findMany({
      where: whereClause,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ refunds });
  } catch (error) {
    console.error("Get refunds error:", error);
    return NextResponse.json(
      { error: "Failed to fetch refunds" },
      { status: 500 }
    );
  }
}

// POST - Create refund request
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      paymentRequestId,
      amount,
      reason,
      description,
      clientId,
      freelancerId,
    } = body;

    // Validate required fields
    if (!paymentRequestId || !amount || !reason || !clientId || !freelancerId) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if payment request exists and is completed
    const paymentRequest = await prisma.paymentRequest.findUnique({
      where: { id: parseInt(paymentRequestId) },
      include: {
        freelancer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!paymentRequest) {
      return NextResponse.json(
        { error: "Payment request not found" },
        { status: 404 }
      );
    }

    if (paymentRequest.status !== "completed") {
      return NextResponse.json(
        { error: "Can only request refunds for completed payments" },
        { status: 400 }
      );
    }

    // Check if amount is valid
    const refundAmount = parseFloat(amount);
    if (refundAmount > paymentRequest.amount) {
      return NextResponse.json(
        { error: "Refund amount cannot exceed payment amount" },
        { status: 400 }
      );
    }

    if (refundAmount <= 0) {
      return NextResponse.json(
        { error: "Refund amount must be greater than 0" },
        { status: 400 }
      );
    }

    // Check if there's already a pending refund for this payment
    const existingRefund = await prisma.refundRequest.findFirst({
      where: {
        paymentRequestId: parseInt(paymentRequestId),
        status: "pending",
      },
    });

    if (existingRefund) {
      return NextResponse.json(
        { error: "A pending refund request already exists for this payment" },
        { status: 400 }
      );
    }

    // Create refund request
    const refundRequest = await prisma.refundRequest.create({
      data: {
        amount: refundAmount,
        reason,
        description: description || "",
        status: "pending",
        paymentRequestId: parseInt(paymentRequestId),
        clientId: parseInt(clientId),
        freelancerId: parseInt(freelancerId),
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
      },
    });

    // Send notification to freelancer (you can implement email/notification service here)
    console.log(`Refund request created for freelancer: ${paymentRequest.freelancer.email}`);

    return NextResponse.json({
      success: true,
      message: "Refund request submitted successfully",
      refund: refundRequest,
    });
  } catch (error) {
    console.error("Create refund error:", error);
    return NextResponse.json(
      { error: "Failed to create refund request" },
      { status: 500 }
    );
  }
}