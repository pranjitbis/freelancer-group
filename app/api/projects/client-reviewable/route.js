// app/api/projects/client-reviewable/route.js
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

    // Get completed projects where client hasn't reviewed the freelancer yet
    const reviewableProjects = await prisma.project.findMany({
      where: {
        clientId: parseInt(clientId),
        status: "completed",
        completedAt: {
          not: null,
        },
        // Projects where client hasn't reviewed the freelancer
        reviews: {
          none: {
            reviewerId: parseInt(clientId),
            type: "CLIENT_TO_FREELANCER",
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
        // Include proposal to get original job data
        proposal: {
          include: {
            job: {
              select: {
                title: true,
                description: true,
              },
            },
          },
        },
        // Check if freelancer has reviewed the client
        reviews: {
          where: {
            type: "FREELANCER_TO_CLIENT",
          },
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
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

    // Format the response with enhanced project data
    const formattedProjects = reviewableProjects.map((project) => {
      // Get the best available project title
      let projectTitle = project.title;

      // If project title is missing or generic, try to get it from proposal/job
      if (
        !projectTitle ||
        projectTitle === "Unknown Project" ||
        projectTitle.includes("Project with")
      ) {
        if (project.proposal?.job?.title) {
          projectTitle = project.proposal.job.title;
        }
      }

      // Fallback to a meaningful title with freelancer name
      if (!projectTitle || projectTitle === "Unknown Project") {
        projectTitle = `Project with ${
          project.freelancer?.name || "Freelancer"
        }`;
      }

      // Get freelancer review if exists
      const freelancerReview = project.reviews.find(
        (review) => review.type === "FREELANCER_TO_CLIENT"
      );

      return {
        id: project.id,
        title: projectTitle,
        budget: project.budget,
        completedAt: project.completedAt,
        freelancer: project.freelancer,
        client: project.client,
        hasFreelancerReview: !!freelancerReview,
        freelancerReview: freelancerReview || null,
        // Include additional metadata
        _originalTitle: project.title,
        _hasProposalData: !!project.proposal,
        _proposalTitle: project.proposal?.job?.title,
      };
    });

    console.log(
      `✅ Found ${formattedProjects.length} reviewable projects for client ${clientId}`
    );

    return NextResponse.json({
      success: true,
      projects: formattedProjects,
    });
  } catch (error) {
    console.error("❌ Error fetching reviewable projects:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch reviewable projects",
        details: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
