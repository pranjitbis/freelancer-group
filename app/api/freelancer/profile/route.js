import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";

const prisma = new PrismaClient();

// GET - Get freelancer profile
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
            role: true,
            createdAt: true,
          },
        },
      },
    });

    if (!profile) {
      // Return empty profile structure if not found
      const user = await prisma.user.findUnique({
        where: { id: parseInt(userId) },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      return NextResponse.json({
        success: true,
        profile: null,
        user: user,
      });
    }

    return NextResponse.json({
      success: true,
      profile: profile,
      user: profile.user,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// POST/PUT - Create or update freelancer profile
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
    } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if user exists and is a freelancer
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role !== "freelancer") {
      return NextResponse.json(
        { error: "Only freelancers can update profiles" },
        { status: 403 }
      );
    }

    // Update or create profile
    const profile = await prisma.userProfile.upsert({
      where: { userId: parseInt(userId) },
      update: {
        title: title || null,
        bio: bio || null,
        skills: skills || null,
        experience: experience || null,
        education: education || null,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
        location: location || null,
        website: website || null,
        github: github || null,
        linkedin: linkedin || null,
        twitter: twitter || null,
        portfolio: portfolio || null,
        available: available !== undefined ? available : true,
        updatedAt: new Date(),
      },
      create: {
        userId: parseInt(userId),
        title: title || null,
        bio: bio || null,
        skills: skills || null,
        experience: experience || null,
        education: education || null,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
        location: location || null,
        website: website || null,
        github: github || null,
        linkedin: linkedin || null,
        twitter: twitter || null,
        portfolio: portfolio || null,
        available: available !== undefined ? available : true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      profile: profile,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}