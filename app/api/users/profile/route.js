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
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const profile = await prisma.userProfile.findUnique({
      where: { userId: parseInt(userId) },
    });

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        profile: profile || null,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      userId,
      name,
      email,
      phoneNumber,
      title,
      bio,
      skills,
      experience,
      education,
      portfolio,
      location,
      website,
      github,
      linkedin,
      twitter,
      resumeUrl,
      hourlyRate,
      available,
      panNumber,
      gstNumber,
    } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user basic info if provided
    if (name || email) {
      await prisma.user.update({
        where: { id: parseInt(userId) },
        data: {
          ...(name && { name }),
          ...(email && { email }),
        },
      });
    }

    // Update or create profile
    const profileData = {
      ...(phoneNumber !== undefined && { phoneNumber }),
      ...(title !== undefined && { title }),
      ...(bio !== undefined && { bio }),
      ...(skills !== undefined && { skills }),
      ...(experience !== undefined && { experience }),
      ...(education !== undefined && { education }),
      ...(portfolio !== undefined && { portfolio }),
      ...(location !== undefined && { location }),
      ...(website !== undefined && { website }),
      ...(github !== undefined && { github }),
      ...(linkedin !== undefined && { linkedin }),
      ...(twitter !== undefined && { twitter }),
      ...(resumeUrl !== undefined && { resumeUrl }),
      ...(hourlyRate !== undefined && { hourlyRate }),
      ...(available !== undefined && { available }),
      ...(panNumber !== undefined && { panNumber }),
      ...(gstNumber !== undefined && { gstNumber }),
    };

    const profile = await prisma.userProfile.upsert({
      where: { userId: parseInt(userId) },
      update: profileData,
      create: {
        ...profileData,
        userId: parseInt(userId),
      },
    });

    // Fetch updated user with profile
    const updatedUser = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: {
        profile: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    // Handle unique constraint violation
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const {
      userId,
      name,
      email,
      phoneNumber,
      title,
      bio,
      skills,
      experience,
      education,
      portfolio,
      location,
      website,
      github,
      linkedin,
      twitter,
      resumeUrl,
      hourlyRate,
      available,
      panNumber,
      gstNumber,
    } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user basic info if provided
    const userUpdateData = {};
    if (name) userUpdateData.name = name;
    if (email) userUpdateData.email = email;

    if (Object.keys(userUpdateData).length > 0) {
      await prisma.user.update({
        where: { id: parseInt(userId) },
        data: userUpdateData,
      });
    }

    // Update or create profile
    const profileData = {
      ...(phoneNumber !== undefined && { phoneNumber }),
      ...(title !== undefined && { title }),
      ...(bio !== undefined && { bio }),
      ...(skills !== undefined && { skills }),
      ...(experience !== undefined && { experience }),
      ...(education !== undefined && { education }),
      ...(portfolio !== undefined && { portfolio }),
      ...(location !== undefined && { location }),
      ...(website !== undefined && { website }),
      ...(github !== undefined && { github }),
      ...(linkedin !== undefined && { linkedin }),
      ...(twitter !== undefined && { twitter }),
      ...(resumeUrl !== undefined && { resumeUrl }),
      ...(hourlyRate !== undefined && { hourlyRate }),
      ...(available !== undefined && { available }),
      ...(panNumber !== undefined && { panNumber }),
      ...(gstNumber !== undefined && { gstNumber }),
    };

    const profile = await prisma.userProfile.upsert({
      where: { userId: parseInt(userId) },
      update: profileData,
      create: {
        ...profileData,
        userId: parseInt(userId),
      },
    });

    // Fetch updated user with profile
    const updatedUser = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: {
        profile: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    // Handle unique constraint violation
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Check if profile exists
    const existingProfile = await prisma.userProfile.findUnique({
      where: { userId: parseInt(userId) },
    });

    if (!existingProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Delete profile
    await prisma.userProfile.delete({
      where: { userId: parseInt(userId) },
    });

    return NextResponse.json({
      success: true,
      message: "Profile deleted successfully",
    });
  } catch (error) {
    console.error("Delete profile error:", error);
    return NextResponse.json(
      { error: "Failed to delete profile" },
      { status: 500 }
    );
  }
}
