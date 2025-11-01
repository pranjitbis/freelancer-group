import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../../../lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log("🔐 Login attempt for:", email);

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        status: true,
        avatar: true,
        wallet: true,
        currency: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log("👤 User found:", user ? "Yes" : "No");

    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email" },
        { status: 401 }
      );
    }

    // Check if user is active
    if (user.status !== "active") {
      return NextResponse.json(
        { error: "Account is not active. Please contact support." },
        { status: 401 }
      );
    }

    // Check if user has a password (Google users might not have passwords)
    if (!user.password) {
      return NextResponse.json(
        { error: "Please use Google login for this account" },
        { status: 401 }
      );
    }

    // Verify password
    console.log("🔑 Verifying password...");
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      console.log("❌ Invalid password");
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    console.log("✅ Password verified successfully");

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.NEXTAUTH_SECRET || "your-fallback-secret",
      { expiresIn: "30d" }
    );

    // Prepare user data for response (exclude password)
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      status: user.status,
      wallet: user.wallet,
      currency: user.currency,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    console.log("🎉 Login successful for:", user.email, "Role:", user.role);

    // Update user's updatedAt timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: {
        updatedAt: new Date(),
      },
    });

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: userData,
      token: token,
    });

    // Set HTTP-only cookie with the token
    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("💥 Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
