// app/api/payments/verify/route.js
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
      displayAmount, // Add this to get the original display amount
    } = body;

    console.log("🔍 Verifying payment:", {
      razorpay_payment_id,
      razorpay_order_id,
      planType,
      userId,
      currency,
      amount,
      displayAmount,
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
        displayAmount, // Pass displayAmount
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
        displayAmount, // Pass displayAmount
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

// Handle wallet recharge - FIXED AMOUNT CONVERSION
async function handleWalletRecharge(paymentData) {
  const {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    userId,
    currency,
    amount,
    displayAmount,
  } = paymentData;

  try {
    // FIXED: Use displayAmount if available, otherwise convert from paisa
    const actualAmount = displayAmount
      ? parseFloat(displayAmount)
      : parseFloat(amount) / 100;

    console.log(`💰 Adding ${actualAmount} to wallet for user: ${userId}`);

    // Update user wallet balance
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        wallet: {
          increment: actualAmount,
        },
      },
    });

    // Create transaction record
    await prisma.transaction.create({
      data: {
        amount: actualAmount,
        type: "credit",
        status: "completed",
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        description: `Wallet recharge - ${currency} ${actualAmount}`,
        userId: parseInt(userId),
      },
    });

    console.log(
      "✅ Wallet recharge successful for user:",
      userId,
      "New balance:",
      updatedUser.wallet
    );

    return NextResponse.json({
      success: true,
      message: "Wallet recharge successful",
      paymentId: razorpay_payment_id,
      walletBalance: updatedUser.wallet,
      amount: actualAmount,
      currency: currency,
    });
  } catch (error) {
    console.error("❌ Wallet recharge error:", error);
    throw error;
  }
}

// Handle plan subscription - FIXED AMOUNT CONVERSION
async function handlePlanSubscription(paymentData) {
  const {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    planType,
    userId,
    currency,
    amount,
    displayAmount,
  } = paymentData;

  // FIXED: Correct plan configuration with proper connects
  const planConfig = {
    free: { connects: 10, price: 0 },
    premium: { connects: 15, price: 999 }, // 15 connects for ₹999
  };

  const config = planConfig[planType];
  if (!config) {
    return NextResponse.json({ error: "Invalid plan type" }, { status: 400 });
  }

  // Calculate expiration date (30 days from now)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  try {
    // FIXED: Use displayAmount if available, otherwise convert from paisa
    const actualAmount = displayAmount
      ? parseFloat(displayAmount)
      : parseFloat(amount) / 100;

    console.log(
      `🔄 Updating user plan to ${planType} with ${config.connects} connects for ${actualAmount}`
    );

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

    // Create subscription record
    const subscriptionData = {
      planType,
      amount: actualAmount, // FIXED: Use actual amount
      status: "active",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      expiresAt,
      userId: parseInt(userId),
    };

    // Add currency only if your schema supports it
    subscriptionData.currency = currency;

    await prisma.planSubscription.create({
      data: subscriptionData,
    });

    // Record connect transaction
    await prisma.connectTransaction.create({
      data: {
        type: "purchase",
        amount: config.connects,
        description: `Purchased ${planType} plan with ${config.connects} connects (${currency} ${actualAmount})`,
        userId: parseInt(userId),
      },
    });

    console.log(
      `✅ ${planType} plan activated successfully for user: ${userId} with ${config.connects} connects`
    );

    return NextResponse.json({
      success: true,
      message: "Payment verified and plan activated successfully",
      paymentId: razorpay_payment_id,
      plan: userPlan,
      currency: currency,
      amount: actualAmount,
      connects: config.connects,
    });
  } catch (error) {
    console.error("❌ Plan subscription error:", error);

    // Check if it's a schema error about currency field
    if (
      error.message.includes("currency") ||
      error.message.includes("Currency")
    ) {
      // Retry without currency field
      return await handlePlanSubscriptionWithoutCurrency(paymentData);
    }

    throw error;
  }
}

// Fallback function if currency field doesn't exist in schema
async function handlePlanSubscriptionWithoutCurrency(paymentData) {
  const {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    planType,
    userId,
    amount,
    displayAmount,
  } = paymentData;

  const planConfig = {
    free: { connects: 10, price: 0 },
    premium: { connects: 15, price: 999 },
  };

  const config = planConfig[planType];
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  // FIXED: Use displayAmount if available
  const actualAmount = displayAmount
    ? parseFloat(displayAmount)
    : parseFloat(amount) / 100;

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

    // Create subscription record without currency
    await prisma.planSubscription.create({
      data: {
        planType,
        amount: actualAmount, // FIXED: Use actual amount
        status: "active",
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        expiresAt,
        userId: parseInt(userId),
      },
    });

    // Record connect transaction
    await prisma.connectTransaction.create({
      data: {
        type: "purchase",
        amount: config.connects,
        description: `Purchased ${planType} plan with ${config.connects} connects`,
        userId: parseInt(userId),
      },
    });

    console.log(
      `✅ Plan activated successfully (without currency) for user: ${userId} with ${config.connects} connects`
    );

    return NextResponse.json({
      success: true,
      message: "Payment verified and plan activated successfully",
      paymentId: razorpay_payment_id,
      plan: userPlan,
      amount: actualAmount,
      connects: config.connects,
    });
  } catch (error) {
    console.error("❌ Plan subscription error (fallback):", error);
    throw error;
  }
}
