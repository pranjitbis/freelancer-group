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
    const { amount, planType, userId, currency = "INR" } = body;

    console.log("📦 Creating Razorpay order:", {
      amount,
      planType,
      userId,
      currency,
    });

    // Validate required fields
    if (!amount || !planType || !userId) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          details: "amount, planType, and userId are required",
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

    // Convert amount to smallest currency unit
    let amountInSmallestUnit;
    if (currency === "INR") {
      amountInSmallestUnit = Math.round(parseFloat(amount) * 100); // Convert to paise
    } else {
      amountInSmallestUnit = Math.round(parseFloat(amount) * 100); // Convert to cents
    }

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
      receipt: `plan_${planType}_${Date.now()}`,
      notes: {
        planType: planType,
        userId: userId.toString(),
        currency: currency,
        originalAmount: amount.toString(),
      },
    };

    const order = await razorpay.orders.create(options);

    console.log("✅ Razorpay order created:", order.id);

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
