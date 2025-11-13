import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const project = await prisma.manualProject.findUnique({
      where: { id: parseInt(id) },
      include: {
        attachments: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    // Parse skills back to array for response
    const projectWithParsedSkills = {
      ...project,
      skills: JSON.parse(project.skills || "[]"),
    };

    return NextResponse.json({
      success: true,
      project: projectWithParsedSkills,
    });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch project" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const {
      title,
      description,
      category,
      subcategory,
      skills,
      budgetType,
      budget,
      timeframe,
      experienceLevel,
      clientName,
      clientEmail,
      clientPhone,
      clientCompany,
      clientLocation,
      clientWebsite,
      specialRequirements,
      visibility,
      urgent,
      featured,
      status,
    } = body;

    // Validate required fields
    const requiredFields = [
      "title",
      "description",
      "category",
      "budgetType",
      "budget",
      "timeframe",
      "experienceLevel",
      "clientName",
      "clientEmail",
    ];

    const missingFields = requiredFields.filter((field) => !body[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Missing required fields: ${missingFields.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Check if project exists
    const existingProject = await prisma.manualProject.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingProject) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    // Update project
    const updatedProject = await prisma.manualProject.update({
      where: { id: parseInt(id) },
      data: {
        title: title.trim(),
        description: description.trim(),
        category,
        subcategory: subcategory?.trim() || null,
        skills: JSON.stringify(skills || []),
        budgetType: budgetType.toUpperCase(),
        budget: parseFloat(budget),
        timeframe: parseInt(timeframe),
        experienceLevel: experienceLevel.toUpperCase(),
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim(),
        clientPhone: clientPhone?.trim() || null,
        clientCompany: clientCompany?.trim() || null,
        clientLocation: clientLocation?.trim() || null,
        clientWebsite: clientWebsite?.trim() || null,
        specialRequirements: specialRequirements?.trim() || null,
        visibility: visibility?.toUpperCase() || "PUBLIC",
        urgent: Boolean(urgent),
        featured: Boolean(featured),
        status: status?.toUpperCase() || "ACTIVE",
      },
      include: {
        attachments: true,
      },
    });

    // Parse skills back to array for response
    const projectWithParsedSkills = {
      ...updatedProject,
      skills: JSON.parse(updatedProject.skills || "[]"),
    };

    return NextResponse.json({
      success: true,
      project: projectWithParsedSkills,
      message: "Project updated successfully",
    });
  } catch (error) {
    console.error("Error updating project:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update project",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // Check if project exists
    const existingProject = await prisma.manualProject.findUnique({
      where: { id: parseInt(id) },
      include: {
        attachments: true,
      },
    });

    if (!existingProject) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    // Delete project with transaction
    await prisma.$transaction(async (tx) => {
      // Delete attachments first
      if (existingProject.attachments.length > 0) {
        await tx.manualProjectAttachment.deleteMany({
          where: { projectId: parseInt(id) },
        });
      }

      // Delete the project
      await tx.manualProject.delete({
        where: { id: parseInt(id) },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting project:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete project",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}