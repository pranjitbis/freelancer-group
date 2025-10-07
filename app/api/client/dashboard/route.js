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

    const [jobs, proposals, user] = await Promise.all([
      prisma.jobPost.findMany({
        where: { userId: parseInt(userId) },
        include: {
          _count: {
            select: {
              proposals: true
            }
          }
        }
      }),
      prisma.proposal.findMany({
        where: {
          job: {
            userId: parseInt(userId)
          }
        },
        include: {
          freelancer: {
            select: {
              name: true,
              email: true
            }
          },
          job: {
            select: {
              title: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.user.findUnique({
        where: { id: parseInt(userId) },
        select: {
          name: true,
          email: true
        }
      })
    ]);

    const activeJobs = jobs.filter(job => job.status === 'active').length;
    const completedJobs = jobs.filter(job => job.status === 'completed').length;
    const totalSpent = jobs.reduce((sum, job) => sum + job.budget, 0);

    const stats = {
      activeJobs,
      totalProposals: proposals.length,
      completedJobs,
      totalSpent
    };

    const recentActivity = proposals.map(proposal => ({
      type: 'proposal',
      message: `New proposal from ${proposal.freelancer.name} for "${proposal.job.title}"`,
      time: new Date(proposal.createdAt).toLocaleDateString()
    }));

    return NextResponse.json({
      stats,
      recentActivity,
      user
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}