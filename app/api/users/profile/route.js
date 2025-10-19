import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    const profile = await prisma.userProfile.findUnique({
      where: { userId: parseInt(userId) },
    });

    return NextResponse.json({ user, profile });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { userId, name, phone, bio, skills, location, website } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Update user
    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { name },
    });

    // Update or create profile
    const profile = await prisma.userProfile.upsert({
      where: { userId: parseInt(userId) },
      update: {
        phone,
        bio,
        skills,
        location,
        website,
      },
      create: {
        phone,
        bio,
        skills,
        location,
        website,
        userId: parseInt(userId),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
