import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const { token } = params;

    console.log("🔐 Processing access token in API:", token);

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Access token is required" },
        { status: 400 }
      );
    }

    // Verify the JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("✅ Token decoded successfully for user:", decoded.email);
    } catch (jwtError) {
      console.error("❌ JWT Error:", jwtError.message);

      if (jwtError.name === "TokenExpiredError") {
        return NextResponse.json(
          {
            success: false,
            error: "Access token has expired. Please generate a new one.",
          },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { success: false, error: "Invalid access token" },
        { status: 401 }
      );
    }

    // Validate token structure
    if (!decoded.isAdminAccess || decoded.accessType !== "url") {
      return NextResponse.json(
        { success: false, error: "Invalid access token type" },
        { status: 401 }
      );
    }

    // Get user data from database
    const user = await prisma.user.findUnique({
      where: { id: parseInt(decoded.userId) },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user is active
    if (user.status !== "active") {
      return NextResponse.json(
        { success: false, error: "User account is inactive" },
        { status: 401 }
      );
    }

    // Create a SIMPLE session token that matches what your middleware expects
    const userToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        // Remove isAdminAccess from the token itself - we'll use cookies for that
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Determine redirect URL based on user role
    let redirectUrl;
    switch (user.role) {
      case "freelancer":
        redirectUrl = "/freelancer-dashboard";
        break;
      case "client":
        redirectUrl = "/client-dashboard";
        break;
      case "admin":
        redirectUrl = "/admin-dashboard";
        break;
      default:
        redirectUrl = "/dashboard";
    }

    console.log(`🔄 Redirecting ${user.email} to: ${redirectUrl}`);

    // Create success response
    const response = NextResponse.json({
      success: true,
      message: "Access granted successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      redirectUrl,
    });

    // Set authentication cookies - MAKE SURE THESE MATCH MIDDLEWARE EXPECTATIONS
    response.cookies.set("user_token", userToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60, // 1 hour
      path: "/",
    });

    response.cookies.set("is_admin_access", "true", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60,
      path: "/",
    });

    response.cookies.set("original_user_id", user.id.toString(), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60,
      path: "/",
    });

    // ALSO set the regular auth token for compatibility
    response.cookies.set("token", userToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("💥 Access API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
