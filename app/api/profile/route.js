import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Helper function to verify JWT token
async function verifyToken(token) {
  try {
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

// Helper function to get user from token
async function getUserFromToken(token) {
  try {
    const decoded = await verifyToken(token);
    if (!decoded) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
        lastLogin: true,
        currency: true,
        profile: {
          select: {
            bio: true,
            title: true,
            location: true,
            website: true,
            github: true,
            linkedin: true,
            twitter: true,
            phone: true,
            available: true,
            experience: true,
            education: true,
            portfolio: true,
            panNumber: true,
            gstNumber: true,
            resumeUrl: true,
          },
        },
      },
    });

    return user;
  } catch (error) {
    console.error("Error getting user from token:", error);
    return null;
  }
}

export async function GET(request) {
  try {
    // Get token from headers (set by middleware)
    const token = request.headers.get("x-auth-token");

    if (!token) {
      return NextResponse.json(
        { error: "No authentication token provided" },
        { status: 401 }
      );
    }

    const user = await getUserFromToken(token);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid token or user not found" },
        { status: 401 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    // Get token from headers (set by middleware)
    const token = request.headers.get("x-auth-token");

    if (!token) {
      return NextResponse.json(
        { error: "No authentication token provided" },
        { status: 401 }
      );
    }

    // Verify token and get user
    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const { name, profile } = body;

    // Get user first to ensure they exist
    const existingUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { profile: true },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user basic info
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        ...(name && { name }),
        updatedAt: new Date(),
      },
    });

    // Update or create profile
    if (profile) {
      if (existingUser.profile) {
        await prisma.userProfile.update({
          where: { userId: decoded.userId },
          data: profile,
        });
      } else {
        await prisma.userProfile.create({
          data: {
            userId: decoded.userId,
            ...profile,
          },
        });
      }
    }

    // Fetch updated user data with profile
    const finalUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
        lastLogin: true,
        currency: true,
        profile: {
          select: {
            bio: true,
            title: true,
            location: true,
            website: true,
            github: true,
            linkedin: true,
            twitter: true,
            phone: true,
            available: true,
            experience: true,
            education: true,
            portfolio: true,
            panNumber: true,
            gstNumber: true,
            resumeUrl: true,
          },
        },
      },
    });

    return NextResponse.json(finalUser);
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
