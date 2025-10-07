import { NextResponse } from "next/server";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    // Verify payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return NextResponse.json(
        { success: false, error: "Payment verification failed" },
        { status: 400 }
      );
    }

    // Get transaction details
    const transaction = await prisma.transaction.findFirst({
      where: { orderId: razorpay_order_id },
      include: { user: true }
    });

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: "Transaction not found" },
        { status: 404 }
      );
    }

    if (transaction.status === "completed") {
      return NextResponse.json({
        success: true,
        message: "Payment already processed",
        walletBalance: transaction.user.wallet
      });
    }

    // Update transaction status
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: "completed",
        paymentId: razorpay_payment_id
      }
    });

    // Update user wallet balance
    const updatedUser = await prisma.user.update({
      where: { id: transaction.userId },
      data: {
        wallet: {
          increment: transaction.amount
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        wallet: true
      }
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      paymentId: razorpay_payment_id,
      amount: transaction.amount,
      walletBalance: updatedUser.wallet
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    return NextResponse.json(
      { success: false, error: "Payment verification failed" },
      { status: 500 }
    );
  }
}