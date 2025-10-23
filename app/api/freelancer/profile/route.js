// app/api/freelancer/profile/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      userId,
      title,
      bio,
      skills,
      experience,
      education,
      hourlyRate,
      location,
      website,
      github,
      linkedin,
      twitter,
      portfolio,
      available,
      profileImage, // Handle profile image updates
    } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prepare update data
    const updateData = {
      ...(title !== undefined && { title }),
      ...(bio !== undefined && { bio }),
      ...(skills !== undefined && { skills }),
      ...(experience !== undefined && { experience }),
      ...(education !== undefined && { education }),
      ...(hourlyRate !== undefined && { hourlyRate: parseFloat(hourlyRate) }),
      ...(location !== undefined && { location }),
      ...(website !== undefined && { website }),
      ...(github !== undefined && { github }),
      ...(linkedin !== undefined && { linkedin }),
      ...(twitter !== undefined && { twitter }),
      ...(portfolio !== undefined && { portfolio }),
      ...(available !== undefined && { available }),
      ...(profileImage !== undefined && { avatar: profileImage }),
    };

    // Check if profile exists
    const existingProfile = await prisma.userProfile.findUnique({
      where: { userId: parseInt(userId) },
    });

    let profile;
    if (existingProfile) {
      // Update existing profile
      profile = await prisma.userProfile.update({
        where: { userId: parseInt(userId) },
        data: updateData,
      });
    } else {
      // Create new profile
      profile = await prisma.userProfile.create({
        data: {
          userId: parseInt(userId),
          ...updateData,
        },
      });
    }

    // If profile image is provided, also update user's main avatar
    if (profileImage) {
      await prisma.user.update({
        where: { id: parseInt(userId) },
        data: { avatar: profileImage },
      });
    }

    return NextResponse.json({
      success: true,
      profile: profile,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const profile = await prisma.userProfile.findUnique({
      where: { userId: parseInt(userId) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json(
        { success: true, profile: null },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: {
        ...profile,
        // Include user's main avatar as fallback
        avatar: profile.avatar || profile.user.avatar,
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
