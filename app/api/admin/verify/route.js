import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Simple session-based admin authentication
async function verifyAdmin(request) {
  try {
    // Check for admin session cookie
    const cookies = request.cookies;
    const adminSession = cookies.get("admin-session");

    // Development bypass - remove this in production
    if (process.env.NODE_ENV === "development") {
      console.log("Development mode: Bypassing admin auth");
      const admin = await prisma.admin.findFirst({
        where: { status: "active" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      if (admin) {
        return admin;
      }
    }

    if (adminSession) {
      // Verify session from database
      const admin = await prisma.admin.findFirst({
        where: {
          id: parseInt(adminSession.value),
          status: "active",
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      if (admin) {
        return admin;
      }
    }

    return null;
  } catch (error) {
    console.error("Admin verification error:", error);
    return null;
  }
}

// GET - Verify admin session
export async function GET(request) {
  try {
    const admin = await verifyAdmin(request);

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      admin,
    });
  } catch (error) {
    console.error("Admin verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify admin" },
      { status: 500 }
    );
  }
}

// POST - Admin login
export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find admin by email in Admin model
    const admin = await prisma.admin.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        status: "active",
      },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password with bcrypt
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create session
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

    // Set session cookie
    response.cookies.set("admin-session", admin.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "Failed to login" }, { status: 500 });
  }
}

// DELETE - Admin logout
export async function DELETE(request) {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Logout successful",
    });

    // Clear session cookie
    response.cookies.set("admin-session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("Admin logout error:", error);
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}
