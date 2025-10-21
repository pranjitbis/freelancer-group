import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    // Find the OTP record
    const otpRecord = await prisma.oTP.findFirst({
      where: {
        email,
        otp,
      },
    });

    if (!otpRecord) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    // Check if OTP has expired
    if (new Date() > new Date(otpRecord.expiresAt)) {
      // Delete expired OTP
      await prisma.oTP.delete({
        where: { id: otpRecord.id },
      });

      return NextResponse.json({ error: "OTP has expired" }, { status: 400 });
    }

    // OTP is valid
    return NextResponse.json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 }
    );
  }
}
