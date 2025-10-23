import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    console.log("💰 Fetching wallet for user:", userId);

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get user with wallet balance
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        name: true,
        wallet: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get transaction history
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: parseInt(userId),
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20, // Limit to last 20 transactions
    });

    console.log(
      "✅ Wallet balance:",
      user.wallet,
      "Transactions:",
      transactions.length
    );

    // Ensure balance is treated as a proper number
    const balance = Number(user.wallet) || 0;

    return NextResponse.json({
      success: true,
      wallet: {
        balance: balance,
        userId: user.id,
        userName: user.name,
        transactions: transactions.map((transaction) => ({
          id: transaction.id,
          amount: Number(transaction.amount) || 0, // Ensure amount is number
          type: transaction.type,
          status: transaction.status,
          description: transaction.description,
          paymentId: transaction.paymentId,
          orderId: transaction.orderId,
          createdAt: transaction.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("❌ Get wallet error:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallet" },
      { status: 500 }
    );
  }
}

// POST method to update wallet balance
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, amount, type, description, paymentId, orderId } = body;

    if (!userId || amount === undefined) {
      return NextResponse.json(
        { error: "User ID and amount are required" },
        { status: 400 }
      );
    }

    // Get current user to check existing balance
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { wallet: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentBalance = Number(user.wallet) || 0;
    const transactionAmount = Number(amount);

    let newBalance;
    if (type === "credit") {
      newBalance = currentBalance + transactionAmount;
    } else if (type === "debit") {
      newBalance = currentBalance - transactionAmount;
    } else {
      return NextResponse.json(
        { error: "Invalid transaction type" },
        { status: 400 }
      );
    }

    // Update user wallet balance
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { wallet: newBalance },
    });

    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        amount: transactionAmount,
        type: type,
        status: "completed",
        paymentId: paymentId,
        orderId: orderId,
        description: description || `${type} transaction`,
        userId: parseInt(userId),
      },
    });

    console.log(
      `✅ Wallet ${type}: ${transactionAmount}, New balance: ${newBalance}`
    );

    return NextResponse.json({
      success: true,
      wallet: {
        balance: newBalance,
        transaction: transaction,
      },
      message: `Wallet ${type} successful`,
    });
  } catch (error) {
    console.error("❌ Update wallet error:", error);
    return NextResponse.json(
      { error: "Failed to update wallet" },
      { status: 500 }
    );
  }
}
