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
      profileImage,
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

    // Prepare update data - handle null/empty values properly
    const updateData = {
      title: title || null,
      bio: bio || null,
      skills: skills || null,
      experience: experience || null,
      education: education || null,
      location: location || null,
      website: website || null,
      github: github || null,
      linkedin: linkedin || null,
      twitter: twitter || null,
      portfolio: portfolio || null,
      available: available !== undefined ? available : true,
    };

    // Handle hourly rate conversion
    if (hourlyRate !== undefined && hourlyRate !== null && hourlyRate !== "") {
      updateData.hourlyRate = parseFloat(hourlyRate);
    } else {
      updateData.hourlyRate = null;
    }

    // Handle profile image
    if (profileImage !== undefined) {
      updateData.avatar = profileImage || null;
    }

    console.log("Updating profile with data:", updateData);

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
    if (profileImage !== undefined) {
      await prisma.user.update({
        where: { id: parseInt(userId) },
        data: { avatar: profileImage },
      });
    }

    // Fetch the complete updated profile
    const updatedProfile = await prisma.userProfile.findUnique({
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

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
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

    // Ensure all fields are properly formatted
    const formattedProfile = {
      ...profile,
      hourlyRate: profile.hourlyRate ? profile.hourlyRate.toString() : "",
      // Use profile avatar or fallback to user avatar
      avatar: profile.avatar || profile.user.avatar,
    };

    return NextResponse.json({
      success: true,
      profile: formattedProfile,
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
