import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { userId, expiresIn = "1h" } = await request.json();

    console.log("Generating access URL for user:", userId);

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    if (user.status !== "active") {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot generate access URL for inactive user",
        },
        { status: 400 }
      );
    }

    // Create access token for URL
    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        isAdminAccess: true,
        accessType: "url",
        generatedAt: Date.now(),
      },
      process.env.JWT_SECRET,
      { expiresIn }
    );

    // Use the request's origin to ensure correct URL
    const origin = request.headers.get("origin") || "http://localhost:3000";
    const accessUrl = `${origin}/admin/access/${accessToken}`;

    console.log("Generated access URL:", accessUrl);

    return NextResponse.json({
      success: true,
      accessUrl: accessUrl,
      token: accessToken,
      expiresIn,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      message: "Access URL generated successfully",
    });
  } catch (error) {
    console.error("Access URL generation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
