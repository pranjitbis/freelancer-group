// app/api/freelancer/profile/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { unlink } from "fs/promises";
import { join } from "path";

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

    // Get user with profile
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      profile: user.profile,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
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
      phoneNumber,
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
      panNumber,
      gstNumber,
      profileImage,
      resumeUrl,
    } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    console.log("Updating profile for user:", userId, body);

    // Update user name if provided
    if (name) {
      await prisma.user.update({
        where: { id: parseInt(userId) },
        data: { name },
      });
    }

    // Prepare profile data
    const profileData = {
      ...(phoneNumber !== undefined && { phoneNumber }),
      ...(title !== undefined && { title }),
      ...(bio !== undefined && { bio }),
      ...(skills !== undefined && { skills }),
      ...(experience !== undefined && { experience }),
      ...(education !== undefined && { education }),
      ...(hourlyRate !== undefined && {
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
      }),
      ...(location !== undefined && { location }),
      ...(website !== undefined && { website }),
      ...(github !== undefined && { github }),
      ...(linkedin !== undefined && { linkedin }),
      ...(twitter !== undefined && { twitter }),
      ...(portfolio !== undefined && { portfolio }),
      ...(available !== undefined && { available }),
      ...(panNumber !== undefined && { panNumber }),
      ...(gstNumber !== undefined && { gstNumber }),
      ...(profileImage !== undefined && { avatar: profileImage }),
      ...(resumeUrl !== undefined && { resumeUrl }),
    };

    // If resumeUrl is explicitly set to null, delete the existing file
    if (resumeUrl === null) {
      const existingProfile = await prisma.userProfile.findUnique({
        where: { userId: parseInt(userId) },
      });

      if (existingProfile?.resumeUrl) {
        try {
          // Delete the physical file
          const filename = existingProfile.resumeUrl.split("/").pop();
          const filePath = join(
            process.cwd(),
            "public",
            "uploads",
            "resumes",
            filename
          );
          await unlink(filePath);
          console.log("✅ Deleted resume file:", filename);
        } catch (fileError) {
          console.error("❌ Error deleting resume file:", fileError);
          // Continue even if file deletion fails
        }
      }
    }

    // Update or create profile
    const profile = await prisma.userProfile.upsert({
      where: { userId: parseInt(userId) },
      update: profileData,
      create: {
        ...profileData,
        userId: parseInt(userId),
      },
    });

    // Also update user's avatar if profileImage is provided
    if (profileImage) {
      await prisma.user.update({
        where: { id: parseInt(userId) },
        data: { avatar: profileImage },
      });
    }

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
      profile: updatedUser.profile,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Failed to update profile: " + error.message },
      { status: 500 }
    );
  }
}
