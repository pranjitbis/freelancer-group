// app/api/freelancer/payout-requests/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    }
  );
}

// POST - Create new payout request (for freelancers)
export async function POST(request) {
  console.log("✅ POST /api/freelancer/payout-requests called");

  try {
    const body = await request.json();
    console.log("📦 Request body:", body);

    const { userId, amount, bankDetailId, description } = body;

    if (!userId) {
      console.log("❌ User ID missing");
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!amount || !bankDetailId) {
      console.log("❌ Missing required fields");
      return NextResponse.json(
        { error: "Amount and bank account are required" },
        { status: 400 }
      );
    }

    console.log("🔍 Finding wallet for user:", userId);

    // Find user's wallet with bank details
    const wallet = await prisma.freelancerWallet.findUnique({
      where: { userId: parseInt(userId) },
      include: {
        bankDetails: {
          where: { id: parseInt(bankDetailId) },
        },
      },
    });

    if (!wallet) {
      console.log("❌ Wallet not found");
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    // Check if bank account exists
    const bankDetail = wallet.bankDetails[0];
    if (!bankDetail) {
      console.log("❌ Bank account not found");
      return NextResponse.json(
        { error: "Bank account not found" },
        { status: 404 }
      );
    }

    // Check if bank account is verified
    if (!bankDetail.isVerified) {
      console.log("❌ Bank account not verified");
      return NextResponse.json(
        {
          error:
            "Bank account is not verified. Please wait for admin verification.",
        },
        { status: 400 }
      );
    }

    const payoutAmount = parseFloat(amount);
    console.log("💰 Payout amount:", payoutAmount);
    console.log("💰 Wallet balance:", wallet.balance);

    // Check sufficient balance
    if (payoutAmount > wallet.balance) {
      console.log("❌ Insufficient balance");
      return NextResponse.json(
        { error: "Insufficient balance for this payout" },
        { status: 400 }
      );
    }

    // Check minimum amount (₹1 for testing)
    const MINIMUM_PAYOUT_AMOUNT = 1;
    if (payoutAmount < MINIMUM_PAYOUT_AMOUNT) {
      console.log("❌ Amount below minimum");
      return NextResponse.json(
        { error: `Minimum payout amount is ₹${MINIMUM_PAYOUT_AMOUNT}` },
        { status: 400 }
      );
    }

    // Check for recent auto-retry payout requests (prevent loops)
    const recentAutoPayout = await prisma.payoutRequest.findFirst({
      where: {
        walletId: wallet.id,
        bankDetailId: parseInt(bankDetailId),
        amount: payoutAmount,
        description: {
          contains: "Auto-retry",
        },
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    });

    if (recentAutoPayout) {
      console.log("🔄 Recent auto-retry payout found, preventing loop");
      return NextResponse.json(
        {
          error:
            "Similar payout request was recently auto-created. Please wait or contact support if this continues.",
        },
        { status: 400 }
      );
    }

    // Start a transaction to ensure both operations succeed or fail together
    console.log("🔄 Starting database transaction...");

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create payout request
      console.log("📝 Creating payout request...");
      const payoutRequest = await tx.payoutRequest.create({
        data: {
          amount: payoutAmount,
          description: description || "Payout Request",
          status: "pending", // Start as pending, admin will approve
          walletId: wallet.id,
          bankDetailId: parseInt(bankDetailId),
        },
        include: {
          bankDetail: true,
          wallet: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      // 2. Deduct amount from wallet balance immediately
      console.log("💰 Deducting amount from wallet balance...");
      const updatedWallet = await tx.freelancerWallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            decrement: payoutAmount,
          },
        },
      });

      // 3. Create a debit transaction record
      console.log("📊 Creating debit transaction record...");
      await tx.walletTransaction.create({
        data: {
          amount: payoutAmount,
          type: "debit",
          description: `Payout request to ${
            bankDetail.bankName
          } - ****${bankDetail.accountNumber.slice(-4)} (Pending)`,
          status: "pending", // Transaction status matches payout status
          walletId: wallet.id,
        },
      });

      console.log("✅ Transaction completed successfully");
      return { payoutRequest, updatedWallet };
    });

    console.log("✅ Payout request created and balance deducted successfully");

    return NextResponse.json(
      {
        success: true,
        payoutRequest: result.payoutRequest,
        newBalance: result.updatedWallet.balance,
        message: `Payout request of ${formatCurrency(
          payoutAmount
        )} submitted successfully! Amount deducted from your balance. Waiting for admin approval.`,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      }
    );
  } catch (error) {
    console.error("❌ Error creating payout request:", error);
    return NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      }
    );
  }
}

// GET - Get payout requests for a specific user (for freelancers)
export async function GET(request) {
  console.log("✅ GET /api/freelancer/payout-requests called");

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    console.log("📋 User ID from query:", userId);

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const wallet = await prisma.freelancerWallet.findUnique({
      where: { userId: parseInt(userId) },
      include: {
        payoutRequests: {
          include: {
            bankDetail: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!wallet) {
      console.log("💰 No wallet found, returning empty array");
      return NextResponse.json({
        success: true,
        payoutRequests: [],
      });
    }

    console.log(`📊 Found ${wallet.payoutRequests.length} payout requests`);

    return NextResponse.json({
      success: true,
      payoutRequests: wallet.payoutRequests,
    });
  } catch (error) {
    console.error("Error fetching payout requests:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
}
