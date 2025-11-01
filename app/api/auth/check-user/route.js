import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body;

    console.log("🔍 Checking user existence for:", email);

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: "Email is required",
        },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    console.log("📦 User check result:", { exists: !!existingUser });

    return NextResponse.json({
      success: true,
      exists: !!existingUser,
    });
  } catch (error) {
    console.error("💥 Check user error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check user existence",
      },
      { status: 500 }
    );
  }
}
