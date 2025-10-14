// app/api/freelancer/wallet/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    // Get freelancer wallet with all related data
    const wallet = await prisma.freelancerWallet.findUnique({
      where: { userId: parseInt(userId) },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
        },
        bankDetails: true,
        payoutRequests: {
          orderBy: { createdAt: "desc" },
          include: {
            bankDetail: true,
          },
        },
      },
    });

    // If wallet doesn't exist, create one
    if (!wallet) {
      const newWallet = await prisma.freelancerWallet.create({
        data: {
          userId: parseInt(userId),
          balance: 0,
        },
        include: {
          transactions: {
            orderBy: { createdAt: "desc" },
          },
          bankDetails: true,
          payoutRequests: {
            orderBy: { createdAt: "desc" },
            include: {
              bankDetail: true,
            },
          },
        },
      });
      return NextResponse.json({ success: true, wallet: newWallet });
    }

    return NextResponse.json({ success: true, wallet });
  } catch (error) {
    console.error("Error fetching wallet:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
