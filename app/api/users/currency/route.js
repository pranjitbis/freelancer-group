import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(request) {
  try {
    const body = await request.json();
    const { userId, currency } = body;

    if (!userId || !currency) {
      return NextResponse.json(
        { success: false, error: "User ID and currency are required" },
        { status: 400 }
      );
    }

    // Validate currency
    const validCurrencies = ["USD", "INR"];
    if (!validCurrencies.includes(currency)) {
      return NextResponse.json(
        { success: false, error: "Invalid currency" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { currency },
      select: {
        id: true,
        name: true,
        email: true,
        currency: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: "Currency preference updated successfully",
    });
  } catch (error) {
    console.error("Error updating currency:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update currency preference" },
      { status: 500 }
    );
  }
}
