// app/api/freelancer/upload-image/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { uploadToS3 } from "@/lib/s3-upload";

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

    // Upload to S3
    const imageUrl = await uploadToS3(file, userId, "profiles");
    console.log("File uploaded to S3:", imageUrl);

    // Update database
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
      message: "Profile image uploaded successfully to cloud",
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
