import { NextResponse } from "next/server";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      planType,
      userId,
      currency = "INR",
      amount,
    } = body;

    console.log("🔍 Verifying payment:", {
      razorpay_payment_id,
      razorpay_order_id,
      planType,
      userId,
      currency,
      amount,
    });

    // Validate required fields
    if (
      !razorpay_payment_id ||
      !razorpay_order_id ||
      !razorpay_signature ||
      !userId ||
      !amount
    ) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          details:
            "razorpay_payment_id, razorpay_order_id, razorpay_signature, userId, and amount are required",
        },
        { status: 400 }
      );
    }

    // Verify payment signature
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      console.error("❌ Payment signature verification failed");
      return NextResponse.json(
        { error: "Payment verification failed - invalid signature" },
        { status: 400 }
      );
    }

    console.log("✅ Payment signature verified");

    // Handle different payment types
    if (planType === "wallet_recharge") {
      // Handle wallet recharge
      return await handleWalletRecharge({
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
        userId,
        currency,
        amount,
      });
    } else {
      // Handle plan subscription
      return await handlePlanSubscription({
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
        planType,
        userId,
        currency,
        amount,
      });
    }
  } catch (error) {
    console.error("🚨 Payment verification error:", error);
    return NextResponse.json(
      {
        error: "Payment verification failed",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// Handle wallet recharge
async function handleWalletRecharge(paymentData) {
  const {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    userId,
    currency,
    amount,
  } = paymentData;

  try {
    // Update user wallet balance
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        wallet: {
          increment: parseFloat(amount),
        },
      },
    });

    // Create transaction record
    await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        type: "credit",
        status: "completed",
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        description: `Wallet recharge - ${currency} ${amount}`,
        userId: parseInt(userId),
      },
    });

    console.log("✅ Wallet recharge successful for user:", userId);

    return NextResponse.json({
      success: true,
      message: "Wallet recharge successful",
      paymentId: razorpay_payment_id,
      walletBalance: updatedUser.wallet,
      amount: amount,
      currency: currency,
    });
  } catch (error) {
    console.error("❌ Wallet recharge error:", error);
    throw error;
  }
}

// Handle plan subscription
async function handlePlanSubscription(paymentData) {
  const {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    planType,
    userId,
    currency,
    amount,
  } = paymentData;

  // Plan configuration
  const planConfig = {
    free: { connects: 10, price: 0 },
    premium: { connects: 100, price: 1599 },
  };

  const config = planConfig[planType];
  if (!config) {
    return NextResponse.json({ error: "Invalid plan type" }, { status: 400 });
  }

  // Calculate expiration date (30 days from now)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  try {
    // Update user plan
    const userPlan = await prisma.userPlan.upsert({
      where: { userId: parseInt(userId) },
      update: {
        planType,
        connects: config.connects,
        usedConnects: 0,
        expiresAt,
      },
      create: {
        planType,
        connects: config.connects,
        usedConnects: 0,
        expiresAt,
        userId: parseInt(userId),
      },
    });

    // Create subscription record (without currency field if not in schema)
    const subscriptionData = {
      planType,
      amount: parseFloat(amount),
      status: "active",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      expiresAt,
      userId: parseInt(userId),
    };

    // Only add currency if the field exists in your schema
    // subscriptionData.currency = currency;

    await prisma.planSubscription.create({
      data: subscriptionData,
    });

    // Record connect transaction
    await prisma.connectTransaction.create({
      data: {
        type: "purchase",
        amount: config.connects,
        description: `Purchased ${planType} plan with ${config.connects} connects (${currency} ${amount})`,
        userId: parseInt(userId),
      },
    });

    console.log("✅ Plan activated successfully for user:", userId);

    return NextResponse.json({
      success: true,
      message: "Payment verified and plan activated successfully",
      paymentId: razorpay_payment_id,
      plan: userPlan,
      currency: currency,
      amount: amount,
    });
  } catch (error) {
    console.error("❌ Plan subscription error:", error);
    throw error;
  }
}
