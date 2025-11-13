// app\api\payments\create-order\route.js
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
    let razorpayCurrency = currency;
    
    if (currency === "INR") {
      amountInSmallestUnit = Math.round(parseFloat(amount) * 100); // Convert to paise
    } else {
      // For USD, we need to check if international payments are enabled
      amountInSmallestUnit = Math.round(parseFloat(amount) * 100); // Convert to cents
      
      // Note: Razorpay USD support requires special activation
      // If USD is not activated, we'll convert to INR
      try {
        // Test if USD is supported by creating a small test order
        const testOptions = {
          amount: 100, // $1.00
          currency: "USD",
          receipt: `test_usd_${Date.now()}`,
        };
        
        // This will throw an error if USD is not supported
        await razorpay.orders.create(testOptions);
        console.log("✅ USD currency supported");
      } catch (usdError) {
        console.log("⚠️ USD not supported, converting to INR");
        
        // Convert USD to INR using current exchange rate
        const exchangeRate = 83; // You can fetch this dynamically
        const amountInINR = parseFloat(amount) * exchangeRate;
        amountInSmallestUnit = Math.round(amountInINR * 100); // Convert to paise
        razorpayCurrency = "INR";
      }
    }

    if (isNaN(amountInSmallestUnit) || amountInSmallestUnit <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Check minimum amount based on currency
    if (razorpayCurrency === "INR" && amountInSmallestUnit < 100) {
      return NextResponse.json(
        { error: "Minimum amount is ₹1" }, 
        { status: 400 }
      );
    }
    
    if (razorpayCurrency === "USD" && amountInSmallestUnit < 100) {
      return NextResponse.json(
        { error: "Minimum amount is $1" }, 
        { status: 400 }
      );
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
      currency: razorpayCurrency,
      receipt: `plan_${planType}_${Date.now()}`,
      payment_capture: 1,
      notes: {
        planType: planType,
        userId: userId.toString(),
        display_currency: currency,
        original_amount: amount.toString(),
        converted_currency: razorpayCurrency,
        converted_amount: (amountInSmallestUnit / 100).toString(),
      },
    };

    // Add method restrictions for international payments
    if (razorpayCurrency === "USD") {
      options.method = "card"; // Only cards for international payments
    }

    const order = await razorpay.orders.create(options);

    console.log("✅ Razorpay order created:", {
      id: order.id,
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
        display_currency: currency,
        display_amount: amount,
      },
    });
  } catch (error) {
    console.error("🚨 Razorpay order creation error:", error);

    // Handle specific Razorpay errors
    if (error.error?.description) {
      // If USD is not supported, try converting to INR
      if (error.error.description.includes('currency') && body.currency === 'USD') {
        try {
          console.log("🔄 USD not supported, converting to INR and retrying...");
          
          // Convert USD to INR
          const exchangeRate = 83; // You can fetch this dynamically
          const amountInINR = parseFloat(body.amount) * exchangeRate;
          const amountInSmallestUnit = Math.round(amountInINR * 100);
          
          const retryOptions = {
            amount: amountInSmallestUnit,
            currency: "INR",
            receipt: `plan_${body.planType}_${Date.now()}`,
            payment_capture: 1,
            notes: {
              planType: body.planType,
              userId: body.userId.toString(),
              display_currency: "USD",
              original_amount: body.amount.toString(),
              converted_currency: "INR",
              converted_amount: amountInINR.toString(),
              exchange_rate: exchangeRate.toString(),
            },
          };

          const retryOrder = await razorpay.orders.create(retryOptions);
          
          return NextResponse.json({
            success: true,
            order: {
              id: retryOrder.id,
              amount: retryOrder.amount,
              currency: retryOrder.currency,
              receipt: retryOrder.receipt,
              display_currency: "USD",
              display_amount: body.amount,
              converted_from_usd: true,
              exchange_rate: exchangeRate,
            },
            note: "Amount converted from USD to INR for processing",
          });
        } catch (retryError) {
          console.error("🚨 Retry failed:", retryError);
          return NextResponse.json(
            { error: "Payment processing failed. Please try again." },
            { status: 500 }
          );
        }
      }
      
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