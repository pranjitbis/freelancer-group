import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import hostingerEmailService from "@/lib/email";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: "Email is required",
        },
        { status: 400 }
      );
    }

    console.log("🔄 Resend OTP request for:", email);

    // Generate new OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Store new OTP
    await prisma.oTP.deleteMany({
      where: { email: email.toLowerCase().trim() },
    });
    await prisma.oTP.create({
      data: {
        otp: newOtp,
        email: email.toLowerCase().trim(),
        expiresAt,
        createdAt: new Date(),
      },
    });

    console.log("📝 New OTP generated:", newOtp);

    try {
      // Resend email
      const emailResult = await hostingerEmailService.sendOTP(email, newOtp);

      const responseData = {
        success: true,
        message: "New OTP sent successfully",
        debugOtp: newOtp,
      };

      if (emailResult.service === "hostinger") {
        responseData.message += " (Sent via Hostinger)";
      }

      return NextResponse.json(responseData);
    } catch (emailError) {
      console.error("💥 Resend email failed:", emailError.message);

      return NextResponse.json(
        {
          success: false,
          error: `Resend failed: ${emailError.message}`,
          debugOtp: newOtp,
          message: "Use this OTP for testing",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Resend OTP error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to resend OTP",
      },
      { status: 500 }
    );
  }
}
