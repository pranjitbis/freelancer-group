import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { uploadToS3 } from "@/lib/s3-upload";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const formData = await request.formData();

    // Extract text fields
    const projectData = {
      title: formData.get("title"),
      description: formData.get("description"),
      category: formData.get("category"),
      subcategory: formData.get("subcategory"),
      skills: formData.get("skills"), // This will be a JSON string
      budgetType: formData.get("budgetType"),
      budget: parseFloat(formData.get("budget")),
      timeframe: parseInt(formData.get("timeframe")),
      experienceLevel: formData.get("experienceLevel"),
      clientName: formData.get("clientName"),
      clientEmail: formData.get("clientEmail"),
      clientPhone: formData.get("clientPhone"),
      clientCompany: formData.get("clientCompany"),
      clientLocation: formData.get("clientLocation"),
      clientWebsite: formData.get("clientWebsite"),
      specialRequirements: formData.get("specialRequirements"),
      visibility: formData.get("visibility"),
      urgent: formData.get("urgent") === "true",
      featured: formData.get("featured") === "true",
    };

    console.log("Received project data:", projectData);

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

    const missingFields = requiredFields.filter((field) => !projectData[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Missing required fields: ${missingFields.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(projectData.clientEmail)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate budget and timeframe
    if (isNaN(projectData.budget) || projectData.budget <= 0) {
      return NextResponse.json(
        { success: false, error: "Budget must be a valid positive number" },
        { status: 400 }
      );
    }

    if (isNaN(projectData.timeframe) || projectData.timeframe <= 0) {
      return NextResponse.json(
        { success: false, error: "Timeframe must be a valid positive number" },
        { status: 400 }
      );
    }

    // Parse skills from JSON string
    let skillsArray = [];
    try {
      skillsArray = projectData.skills ? JSON.parse(projectData.skills) : [];
    } catch (error) {
      console.error("Error parsing skills:", error);
      skillsArray = [];
    }

    // Create project with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the main project
      const project = await tx.manualProject.create({
        data: {
          title: projectData.title.trim(),
          description: projectData.description.trim(),
          category: projectData.category,
          subcategory: projectData.subcategory?.trim() || null,
          skills: JSON.stringify(skillsArray), // Store as JSON string
          budgetType: projectData.budgetType.toUpperCase(),
          budget: projectData.budget,
          timeframe: projectData.timeframe,
          experienceLevel: projectData.experienceLevel.toUpperCase(),
          clientName: projectData.clientName.trim(),
          clientEmail: projectData.clientEmail.trim(),
          clientPhone: projectData.clientPhone?.trim() || null,
          clientCompany: projectData.clientCompany?.trim() || null,
          clientLocation: projectData.clientLocation?.trim() || null,
          clientWebsite: projectData.clientWebsite?.trim() || null,
          specialRequirements: projectData.specialRequirements?.trim() || null,
          visibility: projectData.visibility?.toUpperCase() || "PUBLIC",
          urgent: projectData.urgent,
          featured: projectData.featured,
          status: "ACTIVE",
        },
      });

      // Handle file attachments
      const files = formData.getAll("attachments");
      const attachmentsData = [];

      for (const file of files) {
        if (file && file.size > 0) {
          try {
            const fileUrl = await uploadToS3(file);

            attachmentsData.push({
              name: file.name,
              size: file.size,
              type: file.type,
              url: fileUrl,
              projectId: project.id,
            });
          } catch (uploadError) {
            console.error("Failed to upload file:", file.name, uploadError);
            // Continue with other files even if one fails
          }
        }
      }

      // Save file metadata to database
      if (attachmentsData.length > 0) {
        await tx.manualProjectAttachment.createMany({
          data: attachmentsData,
        });
      }

      return project;
    });

    // Fetch the complete project with attachments
    const completeProject = await prisma.manualProject.findUnique({
      where: { id: result.id },
      include: {
        attachments: true,
      },
    });

    // Parse skills back to array for response
    const projectWithParsedSkills = {
      ...completeProject,
      skills: JSON.parse(completeProject.skills || "[]"),
    };

    console.log("Project created successfully:", completeProject.id);

    return NextResponse.json({
      success: true,
      project: projectWithParsedSkills,
      message: "Project created successfully",
    });
  } catch (error) {
    console.error("Error creating project:", error);

    // Handle Prisma specific errors
    if (error.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          error: "A project with similar details already exists",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    const [projects, total] = await Promise.all([
      prisma.manualProject.findMany({
        include: {
          attachments: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.manualProject.count(),
    ]);

    // Parse skills for each project
    const projectsWithParsedSkills = projects.map((project) => ({
      ...project,
      skills: JSON.parse(project.skills || "[]"),
    }));

    return NextResponse.json({
      success: true,
      projects: projectsWithParsedSkills,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching projects:", error);

    return NextResponse.json(
      { success: false, error: "Failed to fetch projects" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
