import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get user's freelancer wallet
    let freelancerWallet = await prisma.freelancerWallet.findUnique({
      where: { userId: parseInt(userId) },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    // If no freelancer wallet exists, check if user has transactions
    if (!freelancerWallet) {
      // Create freelancer wallet if it doesn't exist
      freelancerWallet = await prisma.freelancerWallet.create({
        data: {
          userId: parseInt(userId),
          balance: 0,
        },
        include: {
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });
    }

    // Also get regular transactions from Transaction model
    const userTransactions = await prisma.transaction.findMany({
      where: { userId: parseInt(userId) },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Combine transactions
    const allTransactions = [
      ...freelancerWallet.transactions.map(t => ({
        id: `wallet-${t.id}`,
        type: t.type.toLowerCase(),
        amount: t.amount,
        description: t.description,
        status: t.status,
        createdAt: t.createdAt,
      })),
      ...userTransactions.map(t => ({
        id: `transaction-${t.id}`,
        type: t.type.toLowerCase(),
        amount: t.amount,
        description: t.description || 'Transaction',
        status: t.status,
        createdAt: t.createdAt,
      }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
     .slice(0, 10);

    return NextResponse.json({
      success: true,
      wallet: {
        id: freelancerWallet.id,
        balance: freelancerWallet.balance,
        userId: freelancerWallet.userId,
        transactions: allTransactions,
      },
    });
  } catch (error) {
    console.error("Get wallet error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch wallet data",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, amount, type = "deposit" } = body;

    if (!userId || !amount) {
      return NextResponse.json(
        { error: "User ID and amount are required" },
        { status: 400 }
      );
    }

    const parsedAmount = parseFloat(amount);
    const parsedUserId = parseInt(userId);

    // Get or create freelancer wallet
    let wallet = await prisma.freelancerWallet.findUnique({
      where: { userId: parsedUserId },
    });

    if (!wallet) {
      wallet = await prisma.freelancerWallet.create({
        data: {
          userId: parsedUserId,
          balance: 0,
        },
      });
    }

    // Update balance based on transaction type
    const newBalance = type === "deposit" 
      ? wallet.balance + parsedAmount
      : Math.max(0, wallet.balance - parsedAmount); // Prevent negative balance

    // Update wallet
    const updatedWallet = await prisma.freelancerWallet.update({
      where: { userId: parsedUserId },
      data: {
        balance: newBalance,
      },
    });

    // Create transaction record
    const transaction = await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: type.toUpperCase(),
        amount: parsedAmount,
        description: type === "deposit" ? "Wallet deposit" : "Withdrawal",
        status: "completed",
      },
    });

    return NextResponse.json({
      success: true,
      message: `${type === "deposit" ? "Deposit" : "Withdrawal"} successful`,
      newBalance: updatedWallet.balance,
      transaction,
    });
  } catch (error) {
    console.error("Wallet transaction error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process transaction",
      },
      { status: 500 }
    );
  }
}