// app/api/freelancer/upload-image/route.js
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("profileImage");
    const userId = formData.get("userId");

    console.log("Upload request received:", {
      hasFile: !!file,
      fileName: file?.name,
      fileType: file?.type,
      fileSize: file?.size,
      userId,
    });

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, WebP, and GIF images are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const fileExtension = path.extname(file.name);
    const fileName = `profile_${userId}_${uuidv4()}${fileExtension}`;

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), "public/uploads/profiles");
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.error("Error creating directory:", error);
      return NextResponse.json(
        { error: "Failed to create upload directory" },
        { status: 500 }
      );
    }

    // Save file
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // Generate public URL
    const imageUrl = `/uploads/profiles/${fileName}`;

    console.log("File saved successfully:", imageUrl);

    // Update user profile in database using Prisma directly
    try {
      const updateResult = await updateUserProfileImage(userId, imageUrl);

      if (!updateResult.success) {
        return NextResponse.json(
          { error: updateResult.error },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        imageUrl: imageUrl,
        message: "Profile image uploaded successfully",
      });
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Failed to update profile in database" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

async function updateUserProfileImage(userId, imageUrl) {
  try {
    console.log(`Updating user ${userId} with image: ${imageUrl}`);

    // First, check if user has a profile
    const existingProfile = await prisma.userProfile.findUnique({
      where: { userId: parseInt(userId) },
    });

    if (existingProfile) {
      // Update existing profile
      await prisma.userProfile.update({
        where: { userId: parseInt(userId) },
        data: {
          avatar: imageUrl,
        },
      });
    } else {
      // Create new profile with image
      await prisma.userProfile.create({
        data: {
          userId: parseInt(userId),
          avatar: imageUrl,
          title: "Freelancer",
          bio: "Update your bio",
          available: true,
        },
      });
    }

    // Also update the user's main avatar field
    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { avatar: imageUrl },
    });

    console.log("Database updated successfully");
    return { success: true };
  } catch (error) {
    console.error("Database update error:", error);
    return {
      success: false,
      error: "Database update failed: " + error.message,
    };
  }
}
