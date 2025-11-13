import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "../../../../lib/prisma";

export async function GET(request) {
  try {
    // Get token from multiple sources (cookie or header)
    let token;

    // First try to get from cookie
    const cookieHeader = request.headers.get("cookie");
    if (cookieHeader) {
      const tokenCookie = cookieHeader
        ?.split(";")
        .find((c) => c.trim().startsWith("token="));
      token = tokenCookie?.split("=")[1];
    }

    // If not in cookie, try from header
    if (!token) {
      token = request.headers.get("x-auth-token");
    }

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "No token provided",
        },
        { status: 401 }
      );
    }

    // Verify JWT token with multiple secret options
    let decoded;
    try {
      const secret =
        process.env.JWT_SECRET ||
        process.env.NEXTAUTH_SECRET ||
        "your-fallback-secret";
      decoded = jwt.verify(token, secret);
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError);

      if (jwtError.name === "JsonWebTokenError") {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid token",
          },
          { status: 401 }
        );
      }

      if (jwtError.name === "TokenExpiredError") {
        return NextResponse.json(
          {
            success: false,
            error: "Token expired",
          },
          { status: 401 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: "Token verification failed",
        },
        { status: 401 }
      );
    }

    // Get user from database to ensure they still exist and are active
    const user = await prisma.user.findUnique({
      where: { id: parseInt(decoded.userId) },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        avatar: true,
        profile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 401 }
      );
    }

    if (user.status !== "active") {
      return NextResponse.json(
        {
          success: false,
          error: "Account is not active",
        },
        { status: 401 }
      );
    }

    console.log("✅ Token verification successful for user:", user.email);

    return NextResponse.json({
      success: true,
      user: user,
    });
  } catch (error) {
    console.error("❌ Auth verify error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Authentication failed",
      },
      { status: 500 }
    );
  }
}
