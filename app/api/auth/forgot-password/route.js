import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal whether email exists
      return NextResponse.json({
        success: true,
        message:
          "If an account with that email exists, a reset link has been sent",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token
    await prisma.passwordResetToken.create({
      data: {
        token: resetToken,
        email,
        expiresAt,
      },
    });

    // In a real application, you would send an email here
    // For now, we'll just return the token (in production, remove this)
    console.log("Password reset token:", resetToken);

    return NextResponse.json({
      success: true,
      message:
        "If an account with that email exists, a reset link has been sent",
      // Remove this in production:
      resetToken:
        process.env.NODE_ENV === "development" ? resetToken : undefined,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
