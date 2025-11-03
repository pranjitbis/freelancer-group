import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("resume");
    const userId = formData.get("userId");

    console.log("Resume upload request received:", {
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

    // Validate file type (PDF only)
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
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
    const uploadsDir = join(process.cwd(), "public", "uploads", "resumes");
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      console.log("Uploads directory already exists or couldn't be created");
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `resume_${userId}_${timestamp}.pdf`;
    const filePath = join(uploadsDir, fileName);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    console.log("Resume saved successfully:", filePath);

    // Generate public URL for the resume
    const resumeUrl = `/uploads/resumes/${fileName}`;

    // Update user profile with resume URL
    const profile = await prisma.userProfile.upsert({
      where: { userId: parseInt(userId) },
      update: {
        resumeUrl: resumeUrl,
      },
      create: {
        userId: parseInt(userId),
        resumeUrl: resumeUrl,
        title: "Freelancer",
        bio: "Update your bio",
        available: true,
      },
    });

    console.log("Resume URL saved to database");

    return NextResponse.json({
      success: true,
      resumeUrl: resumeUrl,
      message: "Resume uploaded successfully",
    });
  } catch (error) {
    console.error("Resume upload error:", error);
    return NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
