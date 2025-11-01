// app/api/projects/client-return-reviewable/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: "Client ID is required" },
        { status: 400 }
      );
    }

    // Get projects where freelancer reviewed client but client hasn't returned review
    const returnReviewableProjects = await prisma.project.findMany({
      where: {
        clientId: parseInt(clientId),
        status: "completed",
        // Freelancer has reviewed client
        reviews: {
          some: {
            type: "FREELANCER_TO_CLIENT",
            revieweeId: parseInt(clientId),
          },
        },
        // But client hasn't reviewed freelancer back
        reviews: {
          none: {
            type: "CLIENT_TO_FREELANCER",
            reviewerId: parseInt(clientId),
          },
        },
      },
      include: {
        freelancer: {
          select: {
            id: true,
            name: true,
            avatar: true,
            email: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        proposal: {
          include: {
            job: {
              select: {
                title: true,
              },
            },
          },
        },
        // Get freelancer's review
        reviews: {
          where: {
            type: "FREELANCER_TO_CLIENT",
            revieweeId: parseInt(clientId),
          },
          include: {
            reviewer: {
              select: {
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: {
        completedAt: "desc",
      },
    });

    // Format projects with proper data
    const formattedProjects = returnReviewableProjects.map((project) => {
      // Get the best project title
      let projectTitle = project.title;

      if (
        !projectTitle ||
        projectTitle === "Unknown Project" ||
        projectTitle.includes("Project with")
      ) {
        if (project.proposal?.job?.title) {
          projectTitle = project.proposal.job.title;
        }
      }

      if (!projectTitle || projectTitle === "Unknown Project") {
        projectTitle = `Project with ${
          project.freelancer?.name || "Freelancer"
        }`;
      }

      const freelancerReview = project.reviews[0] || null;

      return {
        id: project.id,
        title: projectTitle,
        budget: project.budget,
        completedAt: project.completedAt,
        freelancer: project.freelancer,
        client: project.client,
        freelancerReview: freelancerReview,
        hasFreelancerReview: !!freelancerReview,
        reviewStatus: project.reviewStatus || "freelancer_reviewed",
        _originalTitle: project.title,
        _hasProposal: !!project.proposal,
      };
    });

    console.log(
      `Found ${formattedProjects.length} return reviewable projects for client ${clientId}`
    );

    return NextResponse.json({
      success: true,
      projects: formattedProjects,
    });
  } catch (error) {
    console.error("Error fetching return reviewable projects:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch return reviewable projects",
        details: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
