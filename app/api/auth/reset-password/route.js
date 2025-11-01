// app\api\auth\reset-password\route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { verifyOTP } from "@/lib/otp";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, otp, newPassword } = body;

    console.log("🔔 Reset password request received:", {
      email: email ? `${email.substring(0, 3)}...` : "missing",
      otpLength: otp ? otp.length : "missing",
      hasNewPassword: !!newPassword,
    });

    // Validate all fields
    if (!email || !otp || !newPassword) {
      console.log("❌ Missing fields:", {
        email: !email ? "MISSING" : "present",
        otp: !otp ? "MISSING" : "present",
        newPassword: !newPassword ? "MISSING" : "present",
      });
      return NextResponse.json(
        {
          success: false,
          error: "All fields are required",
          details: {
            email: !email ? "Email is required" : "ok",
            otp: !otp ? "OTP is required" : "ok",
            newPassword: !newPassword ? "New password is required" : "ok",
          },
        },
        { status: 400 }
      );
    }

    // Validate OTP format
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      console.log("❌ Invalid OTP format:", otp);
      return NextResponse.json(
        {
          success: false,
          error: "OTP must be exactly 6 digits",
        },
        { status: 400 }
      );
    }

    // Validate password length
    if (newPassword.length < 6) {
      console.log("❌ Password too short:", newPassword.length);
      return NextResponse.json(
        {
          success: false,
          error: "Password must be at least 6 characters long",
        },
        { status: 400 }
      );
    }

    console.log("🔍 Verifying OTP for:", email);

    // Verify OTP
    const otpVerification = await verifyOTP(email, otp);
    console.log("📋 OTP verification result:", otpVerification);

    if (!otpVerification.isValid) {
      console.log("❌ OTP verification failed:", otpVerification.message);
      return NextResponse.json(
        {
          success: false,
          error: otpVerification.message,
        },
        { status: 400 }
      );
    }

    console.log("✅ OTP verified successfully");

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      console.log("❌ User not found:", email);
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    console.log("✅ User found:", user.email);

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password
    await prisma.user.update({
      where: { email: email.toLowerCase().trim() },
      data: { password: hashedPassword },
    });

    console.log("🎉 Password reset successful for:", email);

    return NextResponse.json({
      success: true,
      message:
        "Password reset successfully! You can now login with your new password.",
    });
  } catch (error) {
    console.error("💥 Reset password error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An error occurred while resetting password",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
