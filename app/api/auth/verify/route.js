import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { message: "Token is required" },
        { status: 400 }
      );
    }

    // Verify the token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Token is valid
    return NextResponse.json({
      valid: true,
      user: decoded,
    });
  } catch (error) {
    // Token is invalid or expired
    return NextResponse.json(
      {
        valid: false,
        message: "Invalid or expired token",
      },
      { status: 401 }
    );
  }
}
