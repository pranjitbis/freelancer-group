import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import hostingerEmailService from "@/lib/email";
import { generateOTP, storeOTP } from "@/lib/otp";

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

    console.log("🔄 Sending OTP request for:", email);

    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User already exists with this email. Please login instead.",
        },
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    console.log("📝 Generated OTP:", otp);

    // Store OTP
    const stored = await storeOTP(cleanEmail, otp);
    if (!stored) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to store OTP. Please try again.",
        },
        { status: 500 }
      );
    }

    try {
      // Send OTP email
      const emailResult = await hostingerEmailService.sendOTP(cleanEmail, otp);

      const responseData = {
        success: true,
        message: "OTP sent successfully to your email!",
        debugOtp: process.env.NODE_ENV === "development" ? otp : undefined,
      };

      if (emailResult.service === "hostinger") {
        responseData.message += " (Sent via Hostinger)";
      } else {
        responseData.message += " (Sent via Ethereal)";
        responseData.previewUrl = emailResult.previewUrl;
      }

      console.log("✅ OTP sent successfully");
      return NextResponse.json(responseData);
    } catch (emailError) {
      console.error("💥 Email sending failed:", emailError.message);

      return NextResponse.json(
        {
          success: false,
          error: `Failed to send email: ${emailError.message}`,
          debugOtp: process.env.NODE_ENV === "development" ? otp : undefined,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("💥 Send OTP error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send OTP. Please try again.",
      },
      { status: 500 }
    );
  }
}
