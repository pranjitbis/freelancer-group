import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

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

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads", "profiles");
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      console.log("Uploads directory already exists or couldn't be created");
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split(".").pop();
    const fileName = `profile_${userId}_${timestamp}.${fileExtension}`;
    const filePath = join(uploadsDir, fileName);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    console.log("File saved successfully:", filePath);

    // Generate public URL for the image
    const imageUrl = `/uploads/profiles/${fileName}`;

    // Update user profile and user record in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update or create user profile
      const profile = await tx.userProfile.upsert({
        where: { userId: parseInt(userId) },
        update: {
          avatar: imageUrl,
        },
        create: {
          userId: parseInt(userId),
          avatar: imageUrl,
          title: "Freelancer",
          bio: "Update your bio",
          available: true,
        },
      });

      // Update user's main avatar field
      await tx.user.update({
        where: { id: parseInt(userId) },
        data: { avatar: imageUrl },
      });

      return { profile, imageUrl };
    });

    console.log("Database updated successfully");

    return NextResponse.json({
      success: true,
      imageUrl: result.imageUrl,
      message: "Profile image uploaded successfully",
    });
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
