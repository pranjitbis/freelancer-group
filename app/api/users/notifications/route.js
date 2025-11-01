import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(request) {
  try {
    const body = await request.json();
    const {
      userId,
      emailNotifications,
      proposalAlerts,
      messageAlerts,
      paymentAlerts,
      marketingEmails,
    } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // In a real application, you would store these in a UserPreferences table
    // For now, we'll just return success
    console.log("Notification preferences updated:", {
      userId,
      emailNotifications,
      proposalAlerts,
      messageAlerts,
      paymentAlerts,
      marketingEmails,
    });

    return NextResponse.json({
      success: true,
      message: "Notification preferences updated successfully",
    });
  } catch (error) {
    console.error("Update notifications error:", error);
    return NextResponse.json(
      { error: "Failed to update notification preferences" },
      { status: 500 }
    );
  }
}