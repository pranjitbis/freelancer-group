import { NextResponse } from "next/server";
import razorpay from "@/lib/razorpay";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { amount, userId, currency = "INR" } = await request.json();

    if (!amount || !userId) {
      return NextResponse.json(
        { success: false, error: "Amount and user ID are required" },
        { status: 400 }
      );
    }

    // Convert amount to paise (Razorpay expects amount in smallest currency unit)
    const amountInPaise = Math.round(amount * 100);

    const options = {
      amount: amountInPaise,
      currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: userId.toString(),
        type: "wallet_recharge"
      }
    };

    const order = await razorpay.orders.create(options);

    // Create transaction record
    await prisma.transaction.create({
      data: {
        amount: amount,
        type: "credit",
        status: "pending",
        orderId: order.id,
        description: "Wallet recharge",
        userId: parseInt(userId)
      }
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create order" },
      { status: 500 }
    );
  }
}