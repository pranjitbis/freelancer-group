import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const [jobs, proposals, user, paymentRequests, projects] =
      await Promise.all([
        // Get all jobs by this client
        prisma.jobPost.findMany({
          where: { userId: parseInt(userId) },
          include: {
            _count: {
              select: {
                proposals: true,
              },
            },
            proposals: {
              include: {
                freelancer: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        }),

        // Get all proposals for this client's jobs
        prisma.proposal.findMany({
          where: {
            job: {
              userId: parseInt(userId),
            },
          },
          include: {
            freelancer: {
              select: {
                name: true,
                email: true,
              },
            },
            job: {
              select: {
                title: true,
                budget: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        }),

        // Get user details including currency preference
        prisma.user.findUnique({
          where: { id: parseInt(userId) },
          select: {
            name: true,
            email: true,
            currency: true,
          },
        }),

        // Get payment requests for this client
        prisma.paymentRequest.findMany({
          where: {
            clientId: parseInt(userId),
          },
          include: {
            freelancer: {
              select: {
                name: true,
              },
            },
            conversation: {
              include: {
                project: {
                  select: {
                    title: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        }),

        // Get projects for this client
        prisma.project.findMany({
          where: {
            clientId: parseInt(userId),
          },
          include: {
            freelancer: {
              select: {
                name: true,
              },
            },
          },
        }),
      ]);

    // Calculate stats
    const activeJobs = jobs.filter((job) => job.status === "active").length;
    const completedJobs = jobs.filter(
      (job) => job.status === "completed"
    ).length;

    // Calculate total spent from completed payment requests
    const totalSpent = paymentRequests
      .filter((pr) => pr.status === "completed" || pr.status === "approved")
      .reduce((sum, pr) => sum + pr.amount, 0);

    const stats = {
      activeJobs,
      totalProposals: proposals.length,
      completedJobs,
      totalSpent,
      currency: user?.currency || "USD",
    };

    // Generate recent activity
    const recentActivity = [];

    // Add recent proposals
    proposals.slice(0, 3).forEach((proposal) => {
      recentActivity.push({
        type: "proposal",
        message: `New proposal from ${proposal.freelancer.name} for "${proposal.job.title}"`,
        time: new Date(proposal.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        color: "#8b5cf6",
      });
    });

    // Add payment activities
    paymentRequests.slice(0, 2).forEach((payment) => {
      if (payment.status === "completed") {
        recentActivity.push({
          type: "payment",
          message: `Payment completed to ${payment.freelancer.name} for ${
            payment.conversation?.project?.title || "project"
          }`,
          time: new Date(payment.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          amount: payment.amount,
          currency: payment.currency,
          color: "#10b981",
        });
      }
    });

    // Add project completion activities
    projects
      .filter((p) => p.status === "completed")
      .slice(0, 2)
      .forEach((project) => {
        recentActivity.push({
          type: "completion",
          message: `Project "${project.title}" completed with ${
            project.freelancer?.name || "freelancer"
          }`,
          time: new Date(project.completedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          color: "#3b82f6",
        });
      });

    // Sort activities by time (newest first)
    recentActivity.sort((a, b) => new Date(b.time) - new Date(a.time));

    return NextResponse.json({
      stats,
      recentActivity: recentActivity.slice(0, 5), // Limit to 5 most recent
      user,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
