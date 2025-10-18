import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Get all refunds for admin
export async function GET(request) {
  try {
    // Middleware should have already verified admin access
    // You can access user info from request if needed
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 50;
    const skip = (page - 1) * limit;

    const whereClause = status && status !== "all" ? { status } : {};

    const [refunds, totalCount] = await Promise.all([
      prisma.refundRequest.findMany({
        where: whereClause,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          freelancer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          paymentRequest: {
            select: {
              id: true,
              amount: true,
              currency: true,
              description: true,
              projectTitle: true,
            },
          },
          processedBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.refundRequest.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      refunds,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Get admin refunds error:", error);
    return NextResponse.json(
      { error: "Failed to fetch refunds" },
      { status: 500 }
    );
  }
}
