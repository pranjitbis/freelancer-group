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

    return NextResponse.json({
      success: true,
      wallet: {
        balance: user.wallet,
        userId: user.id,
        userName: user.name,
        transactions: transactions.map((transaction) => ({
          id: transaction.id,
          amount: transaction.amount,
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
