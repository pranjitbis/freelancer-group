import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    console.log("🛠️ Middleware checking: /api/proposals");

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const jobId = searchParams.get("jobId");
    const limit = searchParams.get("limit");
    const includeStats = searchParams.get("includeStats") === "true";

    console.log("🛠️ GET Proposals Request:", {
      userId,
      jobId,
      limit,
      includeStats,
    });

    let whereClause = {};

    if (userId) {
      whereClause.freelancerId = parseInt(userId);
    }

    if (jobId) {
      whereClause.jobId = parseInt(jobId);
    }

    // Get proposals with related data
    const proposals = await prisma.proposal.findMany({
      where: whereClause,
      include: {
        job: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profile: {
                  select: {
                    phoneNumber: true,
                    location: true,
                    title: true,
                  },
                },
              },
            },
          },
        },
        freelancer: {
          include: {
            profile: {
              select: {
                skills: true,
                experience: true,
                hourlyRate: true,
                bio: true,
                location: true,
                title: true,
              },
            },
          },
        },
        // Include connect transactions
        connectTransactions: {
          select: {
            id: true,
            type: true,
            amount: true,
            description: true,
            createdAt: true,
          },
        },
        // Include project if proposal was accepted
        project: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      ...(limit && { take: parseInt(limit) }),
    });

    // Get additional statistics if requested
    let stats = {};
    if (includeStats) {
      // Total projects count
      const totalProjects = await prisma.project.count();

      // Total connects used (from connect transactions)
      const totalConnectsUsed = await prisma.connectTransaction.aggregate({
        where: {
          type: "DEBIT",
        },
        _sum: {
          amount: true,
        },
      });

      // Projects by status
      const projectsByStatus = await prisma.project.groupBy({
        by: ["status"],
        _count: {
          id: true,
        },
      });

      // Proposals by status
      const proposalsByStatus = await prisma.proposal.groupBy({
        by: ["status"],
        _count: {
          id: true,
        },
      });

      stats = {
        totalProjects,
        totalConnectsUsed: totalConnectsUsed._sum.amount || 0,
        projectsByStatus,
        proposalsByStatus,
      };
    }

    // Transform the data to include client information and connect usage
    const transformedProposals = proposals.map((proposal) => ({
      ...proposal,
      // Add client information directly for easier access
      client: proposal.job?.user
        ? {
            id: proposal.job.user.id,
            name: proposal.job.user.name,
            email: proposal.job.user.email,
            phone: proposal.job.user.profile?.phoneNumber,
            location: proposal.job.user.profile?.location,
            title: proposal.job.user.profile?.title,
          }
        : null,
      // Calculate total connects used for this proposal
      totalConnectsUsed:
        proposal.connectTransactions?.reduce((sum, transaction) => {
          return transaction.type === "DEBIT" ? sum + transaction.amount : sum;
        }, 0) || 1, // Default to 1 if no transactions found
      // Add project information
      hasProject: !!proposal.project,
      projectStatus: proposal.project?.status,
    }));

    console.log(`✅ Found ${transformedProposals.length} proposals`);

    return NextResponse.json({
      success: true,
      proposals: transformedProposals,
      stats: includeStats ? stats : undefined,
      count: transformedProposals.length,
    });
  } catch (error) {
    console.error("❌ Get proposals error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch proposals",
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { jobId, freelancerId, coverLetter, bidAmount, timeframe } = body;

    console.log("🛠️ Creating new proposal:", { jobId, freelancerId });

    // Validate required fields
    if (!jobId || !freelancerId || !coverLetter || !bidAmount || !timeframe) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if proposal already exists
    const existingProposal = await prisma.proposal.findFirst({
      where: {
        jobId: parseInt(jobId),
        freelancerId: parseInt(freelancerId),
      },
    });

    if (existingProposal) {
      return NextResponse.json(
        {
          success: false,
          error: "You have already submitted a proposal for this job",
        },
        { status: 400 }
      );
    }

    // Create new proposal
    const proposal = await prisma.proposal.create({
      data: {
        jobId: parseInt(jobId),
        freelancerId: parseInt(freelancerId),
        coverLetter,
        bidAmount: parseFloat(bidAmount),
        timeframe: parseInt(timeframe),
        status: "pending",
      },
      include: {
        job: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profile: {
                  select: {
                    phoneNumber: true,
                    location: true,
                    title: true,
                  },
                },
              },
            },
          },
        },
        freelancer: {
          include: {
            profile: {
              select: {
                skills: true,
                experience: true,
                hourlyRate: true,
                bio: true,
                location: true,
                title: true,
              },
            },
          },
        },
      },
    });

    // Create connect transaction for proposal submission
    await prisma.connectTransaction.create({
      data: {
        type: "DEBIT",
        amount: 1, // 1 connect per proposal
        description: `Proposal submission for job: ${proposal.job.title}`,
        userId: parseInt(freelancerId),
        proposalId: proposal.id,
      },
    });

    console.log("✅ Proposal created successfully:", proposal.id);

    return NextResponse.json({
      success: true,
      proposal,
      message: "Proposal submitted successfully (1 connect used)",
    });
  } catch (error) {
    console.error("❌ Create proposal error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create proposal",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT and DELETE methods remain the same as previous implementation
export async function PUT(request) {
  try {
    const body = await request.json();
    const { proposalId, status } = body;

    console.log("🛠️ Updating proposal:", { proposalId, status });

    if (!proposalId || !status) {
      return NextResponse.json(
        { success: false, error: "Proposal ID and status are required" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ["pending", "accepted", "rejected", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400 }
      );
    }

    // Update proposal
    const updatedProposal = await prisma.proposal.update({
      where: {
        id: parseInt(proposalId),
      },
      data: {
        status,
      },
      include: {
        job: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profile: {
                  select: {
                    phoneNumber: true,
                    location: true,
                    title: true,
                  },
                },
              },
            },
          },
        },
        freelancer: {
          include: {
            profile: {
              select: {
                skills: true,
                experience: true,
                hourlyRate: true,
                bio: true,
                location: true,
                title: true,
              },
            },
          },
        },
      },
    });

    console.log("✅ Proposal updated successfully:", updatedProposal.id);

    // If proposal is accepted, create a project
    if (status === "accepted") {
      try {
        const project = await prisma.project.create({
          data: {
            title: updatedProposal.job.title,
            description: updatedProposal.job.description,
            budget: updatedProposal.bidAmount,
            clientId: updatedProposal.job.userId,
            freelancerId: updatedProposal.freelancerId,
            proposalId: updatedProposal.id,
            status: "active",
          },
        });
        console.log("✅ Project created from accepted proposal:", project.id);
      } catch (projectError) {
        console.error(
          "❌ Failed to create project from proposal:",
          projectError
        );
      }
    }

    return NextResponse.json({
      success: true,
      proposal: updatedProposal,
      message: `Proposal ${status} successfully`,
    });
  } catch (error) {
    console.error("❌ Update proposal error:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { success: false, error: "Proposal not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update proposal",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const proposalId = searchParams.get("id");

    console.log("🛠️ Deleting proposal:", proposalId);

    if (!proposalId) {
      return NextResponse.json(
        { success: false, error: "Proposal ID is required" },
        { status: 400 }
      );
    }

    await prisma.proposal.delete({
      where: {
        id: parseInt(proposalId),
      },
    });

    console.log("✅ Proposal deleted successfully:", proposalId);

    return NextResponse.json({
      success: true,
      message: "Proposal deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete proposal error:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { success: false, error: "Proposal not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete proposal",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
