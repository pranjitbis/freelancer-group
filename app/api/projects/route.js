// app/api/projects/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      budget,
      proposalId,
      clientId,
      freelancerId,
      status = "active",
    } = body;

    console.log("📝 Creating project with data:", {
      title,
      proposalId,
      clientId,
      freelancerId,
    });

    // Validate required fields
    if (!title || !description || !budget || !clientId) {
      return NextResponse.json(
        {
          success: false,
          error: "Title, description, budget, and clientId are required",
        },
        { status: 400 }
      );
    }

    // If proposalId is provided, check if it's already used
    if (proposalId) {
      const existingProjectWithProposal = await prisma.project.findFirst({
        where: {
          proposalId: parseInt(proposalId),
        },
      });

      if (existingProjectWithProposal) {
        return NextResponse.json(
          {
            success: false,
            error: "This proposal is already associated with another project",
          },
          { status: 400 }
        );
      }

      // Also verify the proposal exists and belongs to the correct freelancer
      const proposal = await prisma.proposal.findFirst({
        where: {
          id: parseInt(proposalId),
          freelancerId: parseInt(freelancerId),
        },
      });

      if (!proposal) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Proposal not found or doesn't belong to the specified freelancer",
          },
          { status: 404 }
        );
      }
    }

    // Create the project
    const project = await prisma.project.create({
      data: {
        title,
        description,
        budget: parseFloat(budget),
        proposalId: proposalId ? parseInt(proposalId) : null, // Handle null case
        clientId: parseInt(clientId),
        freelancerId: freelancerId ? parseInt(freelancerId) : null,
        status,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        freelancer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        proposal: {
          select: {
            id: true,
            bidAmount: true,
            timeframe: true,
          },
        },
      },
    });

    console.log("✅ Project created successfully:", project.id);

    return NextResponse.json({
      success: true,
      project,
      message: "Project created successfully",
    });
  } catch (error) {
    console.error("❌ Error creating project:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          error: "A project with this proposal already exists",
          details: "Each proposal can only be used for one project",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create project",
        details: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET handler for fetching projects
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    const freelancerId = searchParams.get("freelancerId");
    const projectId = searchParams.get("projectId");

    let where = {};

    if (projectId) {
      where.id = parseInt(projectId);
    } else if (clientId) {
      where.clientId = parseInt(clientId);
    } else if (freelancerId) {
      where.freelancerId = parseInt(freelancerId);
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        freelancer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        proposal: {
          select: {
            id: true,
            bidAmount: true,
            timeframe: true,
            coverLetter: true,
          },
        },
        reviews: {
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        conversations: {
          include: {
            messages: {
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error("❌ Error fetching projects:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch projects",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
