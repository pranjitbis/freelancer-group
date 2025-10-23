import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get recharge transactions (credit transactions for wallet)
    const rechargeHistory = await prisma.transaction.findMany({
      where: {
        userId: parseInt(userId),
        type: "credit",
        OR: [
          { description: { contains: "wallet recharge" } },
          { description: { contains: "Wallet Recharge" } },
          { description: { contains: "recharge" } },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // Last 50 recharge transactions
    });

    return NextResponse.json({
      success: true,
      rechargeHistory: rechargeHistory.map((transaction) => ({
        id: transaction.id,
        amount: Number(transaction.amount) || 0, // Ensure amount is number
        type: transaction.type,
        status: transaction.status,
        description: transaction.description,
        paymentId: transaction.paymentId,
        orderId: transaction.orderId,
        createdAt: transaction.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching recharge history:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch recharge history" },
      { status: 500 }
    );
  }
}
