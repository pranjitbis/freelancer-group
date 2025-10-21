import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import hostingerEmailService from "@/lib/email";
import { generateOTP, storeOTP } from "@/lib/temp-otp";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email address is required" },
        { status: 400 }
      );
    }

    console.log("🔔 Password reset request for:", email);

    // Check if user exists
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });
    } catch (dbError) {
      console.error("❌ Database error checking user:", dbError.message);
      // For security, don't reveal database errors to user
      user = null;
    }

    // For security, don't reveal if user exists
    if (!user) {
      console.log("❌ User not found (security):", email);
      return NextResponse.json({
        success: true,
        message: "If an account with that email exists, an OTP has been sent",
      });
    }

    console.log("✅ User found:", user.email);

    // Generate OTP
    const otp = generateOTP();

    // Store OTP in memory (temporary solution)
    storeOTP(email, otp);

    console.log("📝 OTP generated and stored in memory:", otp);

    try {
      // Send email using Hostinger service
      console.log("🔄 Attempting to send email via Hostinger...");
      const emailResult = await hostingerEmailService.sendOTP(email, otp);

      console.log("🎉 Email sent successfully!");

      const responseData = {
        success: true,
        message: "OTP has been sent to your email address",
        debugOtp: otp, // Always return OTP for testing
      };

      // Add service-specific information
      if (emailResult.service === "hostinger") {
        responseData.message += " (Sent via Hostinger)";
        responseData.service = "hostinger";
      } else if (emailResult.previewUrl) {
        responseData.previewUrl = emailResult.previewUrl;
        responseData.message += " (Check Ethereal for preview)";
        responseData.service = "ethereal";
      }

      return NextResponse.json(responseData);
    } catch (emailError) {
      console.error("💥 Email sending failed:", emailError.message);

      // Return OTP for development even on failure
      return NextResponse.json(
        {
          success: false,
          error: `Email service issue: ${emailError.message}`,
          debugOtp: otp,
          message: "Use OTP below for testing",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, error: "An error occurred" },
      { status: 500 }
    );
  }
}
