import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(request) {
  try {
    const body = await request.json();
    const { amount, userId, currency = "INR", displayAmount } = body;

    console.log("📦 Creating Razorpay order:", {
      amount,
      userId,
      currency,
      displayAmount,
    });

    // Validate required fields
    if (!amount || !userId) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          details: "amount and userId are required",
        },
        { status: 400 }
      );
    }

    // Validate currency
    const validCurrencies = ["INR", "USD"];
    if (!validCurrencies.includes(currency)) {
      return NextResponse.json(
        { error: "Invalid currency. Supported currencies: INR, USD" },
        { status: 400 }
      );
    }

    // The amount should already be in the smallest currency unit from frontend
    let amountInSmallestUnit = Math.round(parseFloat(amount));

    if (isNaN(amountInSmallestUnit) || amountInSmallestUnit <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create Razorpay order
    const options = {
      amount: amountInSmallestUnit,
      currency: currency,
      receipt: `receipt_${userId}_${Date.now()}`,
      notes: {
        userId: userId.toString(),
        currency: currency,
        originalAmount: displayAmount
          ? displayAmount.toString()
          : amount.toString(),
      },
    };

    const order = await razorpay.orders.create(options);

    console.log("✅ Razorpay order created:", {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      },
    });
  } catch (error) {
    console.error("🚨 Razorpay order creation error:", error);

    if (error.error?.description) {
      return NextResponse.json(
        { error: error.error.description },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create payment order" },
      { status: 500 }
    );
  }
}
