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
    const avatarFile = formData.get("avatar");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    let avatarUrl = null;

    // Handle avatar upload
    if (avatarFile && avatarFile.size > 0) {
      const bytes = await avatarFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Create unique filename
      const timestamp = Date.now();
      const fileExtension = avatarFile.name.split('.').pop();
      const filename = `avatar_${userId}_${timestamp}.${fileExtension}`;
      
      // In production, you'd want to upload to cloud storage (AWS S3, Cloudinary, etc.)
      // For development, we'll save to public folder
      const publicDir = path.join(process.cwd(), 'public', 'avatars');
      
      // Create directory if it doesn't exist
      const fs = await import('fs');
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }

      const filepath = path.join(publicDir, filename);
      await writeFile(filepath, buffer);
      
      avatarUrl = `/avatars/${filename}`;
    }

    // Update user in database
    const updateData = { name };
    if (avatarUrl) {
      updateData.avatar = avatarUrl;
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      user: updatedUser 
    });

  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}