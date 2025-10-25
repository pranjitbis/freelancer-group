import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { writeFile } from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

export async function PUT(request) {
  try {
    const formData = await request.formData();
    const userId = formData.get("userId");
    const name = formData.get("name");
    const businessName = formData.get("businessName"); // Fixed: Get businessName from form data
    const avatarFile = formData.get("avatar");

    console.log("📝 Profile update request:", {
      userId,
      name,
      businessName,
      hasAvatar: !!avatarFile,
    });

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID required" },
        { status: 400 }
      );
    }

    let avatarUrl = null;

    // Handle avatar upload
    if (avatarFile && avatarFile.size > 0) {
      try {
        const bytes = await avatarFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create unique filename
        const timestamp = Date.now();
        const fileExtension = avatarFile.name.split(".").pop();
        const filename = `avatar_${userId}_${timestamp}.${fileExtension}`;

        // In production, you'd want to upload to cloud storage (AWS S3, Cloudinary, etc.)
        // For development, we'll save to public folder
        const publicDir = path.join(process.cwd(), "public", "avatars");

        // Create directory if it doesn't exist
        const fs = await import("fs");
        if (!fs.existsSync(publicDir)) {
          fs.mkdirSync(publicDir, { recursive: true });
        }

        const filepath = path.join(publicDir, filename);
        await writeFile(filepath, buffer);

        avatarUrl = `/avatars/${filename}`;
        console.log("✅ Avatar uploaded:", avatarUrl);
      } catch (uploadError) {
        console.error("❌ Avatar upload failed:", uploadError);
        // Continue without avatar if upload fails
      }
    }

    // Prepare update data
    const updateData = {
      name: name?.trim(),
      businessName: businessName?.trim() || null, // Fixed: Include businessName in update
    };

    // Only add avatar if we have a new one
    if (avatarUrl) {
      updateData.avatar = avatarUrl;
    }

    console.log("🔄 Updating user with data:", updateData);

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: updateData,
      select: {
        id: true,
        name: true,
        businessName: true, // Fixed: Include businessName in response
        email: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    });

    console.log("✅ User updated successfully:", {
      id: updatedUser.id,
      name: updatedUser.name,
      businessName: updatedUser.businessName,
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("❌ Profile update error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update profile. Please try again.",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// GET method to fetch user profile
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        name: true,
        businessName: true,
        email: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("❌ Profile fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch profile",
      },
      { status: 500 }
    );
  }
}
