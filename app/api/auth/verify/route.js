import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(request) {
  try {
    // Check if JWT_SECRET is set
    if (!JWT_SECRET) {
      console.error("❌ JWT_SECRET is not set in environment variables");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Get token from HTTP-only cookie
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    console.log(
      "🔐 GET - Verifying token from cookie:",
      token ? `Exists (length: ${token.length})` : "Missing"
    );

    if (!token) {
      return NextResponse.json(
        { error: "No authentication token found", code: "NO_TOKEN" },
        { status: 401 }
      );
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("✅ GET - Token decoded successfully:", decoded);

    // Return user data
    return NextResponse.json({
      success: true,
      user: {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role || "user",
        verified: true,
      },
    });
  } catch (error) {
    console.error("❌ GET - Token verification error:", error);

    if (error.name === "TokenExpiredError") {
      return NextResponse.json(
        { error: "Token expired", code: "TOKEN_EXPIRED" },
        { status: 401 }
      );
    }

    if (error.name === "JsonWebTokenError") {
      return NextResponse.json(
        { error: "Invalid token", code: "INVALID_TOKEN" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Token verification failed", code: "VERIFICATION_FAILED" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // Check if JWT_SECRET is set
    if (!JWT_SECRET) {
      console.error("❌ JWT_SECRET is not set in environment variables");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const { token } = await request.json();

    console.log(
      "🔐 POST - Verifying token from body:",
      token ? `Exists (length: ${token.length})` : "Missing"
    );

    if (!token) {
      return NextResponse.json(
        { error: "Token is required", code: "NO_TOKEN" },
        { status: 401 }
      );
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("✅ POST - Token decoded successfully:", decoded);

    // Return user data
    return NextResponse.json({
      success: true,
      user: {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role || "user",
        verified: true,
      },
    });
  } catch (error) {
    console.error("❌ POST - Token verification error:", error);

    if (error.name === "TokenExpiredError") {
      return NextResponse.json(
        { error: "Token expired", code: "TOKEN_EXPIRED" },
        { status: 401 }
      );
    }

    if (error.name === "JsonWebTokenError") {
      return NextResponse.json(
        { error: "Invalid token", code: "INVALID_TOKEN" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Token verification failed", code: "VERIFICATION_FAILED" },
      { status: 500 }
    );
  }
}