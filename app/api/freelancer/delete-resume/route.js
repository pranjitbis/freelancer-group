import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { unlink } from "fs/promises";
import { join } from "path";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Get current profile
    const profile = await prisma.userProfile.findUnique({
      where: { userId: parseInt(userId) },
    });

    if (!profile || !profile.resumeUrl) {
      return NextResponse.json(
        { error: "No resume found to delete" },
        { status: 404 }
      );
    }

    // Delete the physical file
    try {
      const filename = profile.resumeUrl.split('/').pop();
      const filePath = join(process.cwd(), 'public', 'uploads', 'resumes', filename);
      await unlink(filePath);
      console.log("Deleted resume file:", filename);
    } catch (fileError) {
      console.error("Error deleting resume file:", fileError);
      // Continue even if file deletion fails
    }

    // Update profile to remove resumeUrl
    const updatedProfile = await prisma.userProfile.update({
      where: { userId: parseInt(userId) },
      data: { resumeUrl: null },
    });

    return NextResponse.json({
      success: true,
      message: "Resume deleted successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Delete resume error:", error);
    return NextResponse.json(
      { error: "Failed to delete resume: " + error.message },
      { status: 500 }
    );
  }
}