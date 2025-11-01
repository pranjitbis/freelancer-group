import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("resume");
    const userId = formData.get("userId");

    if (!file || !userId) {
      return NextResponse.json(
        { error: "File and user ID are required" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const timestamp = Date.now();
    const filename = `resume_${userId}_${timestamp}.pdf`;
    const uploadDir = join(process.cwd(), "public", "uploads", "resumes");

    // Ensure upload directory exists
    const { mkdir } = require("fs").promises;
    await mkdir(uploadDir, { recursive: true });

    // Save file
    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);

    // Update profile with resume URL
    const resumeUrl = `/uploads/resumes/${filename}`;

    const updatedProfile = await prisma.userProfile.upsert({
      where: { userId: parseInt(userId) },
      update: { resumeUrl },
      create: {
        userId: parseInt(userId),
        resumeUrl,
      },
    });

    console.log("✅ Resume uploaded successfully:", {
      userId,
      resumeUrl,
      profileId: updatedProfile.id,
    });

    return NextResponse.json({
      success: true,
      message: "Resume uploaded successfully",
      resumeUrl,
    });
  } catch (error) {
    console.error("❌ Error uploading resume:", error);
    return NextResponse.json(
      { error: "Failed to upload resume: " + error.message },
      { status: 500 }
    );
  }
}
