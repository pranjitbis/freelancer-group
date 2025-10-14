// app/api/admin/wallet/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET all wallet transactions for admin
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};
    if (status && status !== "all") where.status = status;
    if (type && type !== "all") where.type = type;

    // Get wallet transactions with user info
    const transactions = await prisma.walletTransaction.findMany({
      where,
      include: {
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
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    // Get total count for pagination
    const total = await prisma.walletTransaction.count({ where });

    return NextResponse.json({
      success: true,
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching wallet transactions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// UPDATE transaction status
export async function PUT(request) {
  try {
    const { transactionId, status, adminNotes } = await request.json();

    if (!transactionId || !status) {
      return NextResponse.json(
        { error: "Transaction ID and status are required" },
        { status: 400 }
      );
    }

    const transaction = await prisma.walletTransaction.update({
      where: { id: parseInt(transactionId) },
      data: {
        status,
        ...(adminNotes && { adminNotes }),
      },
      include: {
        wallet: {
          include: {
            user: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Transaction status updated successfully",
      transaction,
    });
  } catch (error) {
    console.error("Error updating transaction:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
