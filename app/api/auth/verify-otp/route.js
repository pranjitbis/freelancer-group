import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    console.log("🔍 OTP Verification Request:", { email, otp });

    if (!email || !otp) {
      return NextResponse.json(
        {
          success: false,
          error: "Email and OTP are required",
        },
        { status: 400 }
      );
    }

    // Clean email
    const cleanEmail = email.toLowerCase().trim();

    // Find the OTP record
    const otpRecord = await prisma.oTP.findFirst({
      where: {
        email: cleanEmail,
      },
    });

    console.log("📦 OTP Record Found:", otpRecord);

    if (!otpRecord) {
      return NextResponse.json(
        {
          success: false,
          error: "OTP not found. Please request a new OTP.",
        },
        { status: 400 }
      );
    }

    // Check if OTP has expired
    if (new Date() > new Date(otpRecord.expiresAt)) {
      // Delete expired OTP
      await prisma.oTP.delete({
        where: { id: otpRecord.id },
      });

      return NextResponse.json(
        {
          success: false,
          error: "OTP has expired. Please request a new OTP.",
        },
        { status: 400 }
      );
    }

    // Verify OTP using bcrypt compare
    const isValid = await bcrypt.compare(otp, otpRecord.otp);
    console.log("🔐 OTP Comparison Result:", isValid);

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid OTP. Please check and try again.",
        },
        { status: 400 }
      );
    }

    // OTP is valid - delete the OTP record
    await prisma.oTP.delete({
      where: { id: otpRecord.id },
    });

    console.log("✅ OTP Verified Successfully");

    return NextResponse.json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("💥 Verify OTP error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to verify OTP. Please try again.",
      },
      { status: 500 }
    );
  }
}
