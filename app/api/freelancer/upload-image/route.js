import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("profileImage"); // Changed from 'image' to 'profileImage'
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

    // Update user profile in database
    try {
      const updateResult = await updateUserProfileImage(userId, imageUrl);

      if (!updateResult.success) {
        // Still return success for upload, but log the DB error
        console.error("Database update failed:", updateResult.error);
      }

      return NextResponse.json({
        success: true,
        imageUrl: imageUrl,
        message: "Profile image uploaded successfully",
      });
    } catch (dbError) {
      console.error("Database error:", dbError);
      // Still return success since file was uploaded
      return NextResponse.json({
        success: true,
        imageUrl: imageUrl,
        message: "Image uploaded but profile update failed",
      });
    }
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}

async function updateUserProfileImage(userId, imageUrl) {
  try {
    // Update this with your actual database logic
    console.log(`Updating user ${userId} with image: ${imageUrl}`);

    // Example with your database - replace with your actual implementation
    const response = await fetch(
      `${process.env.NEXTAUTH_URL}/api/freelancer/profile`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          profileImage: imageUrl,
        }),
      }
    );

    if (response.ok) {
      return { success: true };
    } else {
      const errorData = await response.json();
      return { success: false, error: errorData.error };
    }
  } catch (error) {
    console.error("Database update error:", error);
    return { success: false, error: "Database update failed" };
  }
}
