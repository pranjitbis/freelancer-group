import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { jobId, coverLetter, bidAmount, timeframe, freelancerId } = body;

    console.log("📥 Received proposal data:", {
      jobId,
      bidAmount,
      timeframe,
      freelancerId,
      coverLetterLength: coverLetter?.length,
    });

    // Enhanced validation with better error messages
    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }
    if (!coverLetter || coverLetter.trim().length < 10) {
      return NextResponse.json(
        { error: "Cover letter must be at least 10 characters" },
        { status: 400 }
      );
    }
    if (!bidAmount || isNaN(bidAmount) || parseFloat(bidAmount) <= 0) {
      return NextResponse.json(
        { error: "Valid bid amount is required" },
        { status: 400 }
      );
    }
    if (!timeframe || isNaN(timeframe) || parseInt(timeframe) <= 0) {
      return NextResponse.json(
        { error: "Valid timeframe is required" },
        { status: 400 }
      );
    }
    if (!freelancerId) {
      return NextResponse.json(
        { error: "Freelancer ID is required" },
        { status: 400 }
      );
    }

    const parsedFreelancerId = parseInt(freelancerId);
    const parsedJobId = parseInt(jobId);
    const parsedBidAmount = parseFloat(bidAmount);
    const parsedTimeframe = parseInt(timeframe);

    // Check if user exists first
    const user = await prisma.user.findUnique({
      where: { id: parsedFreelancerId },
    });

    if (!user) {
      console.log("❌ User not found:", parsedFreelancerId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get or create user plan
    let userPlan = await prisma.userPlan.findUnique({
      where: { userId: parsedFreelancerId },
    });

    // If no user plan exists, create one with default connects
    if (!userPlan) {
      console.log(
        "📝 Creating default user plan for user:",
        parsedFreelancerId
      );
      try {
        userPlan = await prisma.userPlan.create({
          data: {
            userId: parsedFreelancerId,
            connects: 10, // Default free connects
            usedConnects: 0,
            planType: "free",
          },
        });
        console.log("✅ User plan created:", userPlan);
      } catch (planError) {
        console.error("❌ Failed to create user plan:", planError);
        return NextResponse.json(
          { error: "Failed to initialize user account" },
          { status: 500 }
        );
      }
    }

    console.log("📊 User plan status:", {
      connects: userPlan.connects,
      usedConnects: userPlan.usedConnects,
      remaining: userPlan.connects - userPlan.usedConnects,
    });

    // Check if user has enough connects
    const connectsNeeded = 1;
    const remainingConnects = userPlan.connects - userPlan.usedConnects;

    if (remainingConnects < connectsNeeded) {
      return NextResponse.json(
        {
          error: "Insufficient connects",
          details: `You need ${connectsNeeded} connect to submit this proposal. You have ${remainingConnects} connects remaining.`,
          code: "INSUFFICIENT_CONNECTS",
        },
        { status: 400 }
      );
    }

    // Check if job exists
    const job = await prisma.jobPost.findUnique({
      where: { id: parsedJobId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!job) {
      console.log("❌ Job not found:", parsedJobId);
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Prevent user from applying to their own job
    if (job.userId === parsedFreelancerId) {
      return NextResponse.json(
        { error: "You cannot apply to your own job" },
        { status: 400 }
      );
    }

    // Check if proposal already exists for this user and job
    const existingProposal = await prisma.proposal.findFirst({
      where: {
        jobId: parsedJobId,
        freelancerId: parsedFreelancerId,
      },
    });

    if (existingProposal) {
      console.log("❌ User already applied to this job");
      return NextResponse.json(
        {
          error: "You have already submitted a proposal for this job",
          code: "DUPLICATE_PROPOSAL",
        },
        { status: 400 }
      );
    }

    // Get total proposals count for this job
    const totalProposalsForJob = await prisma.proposal.count({
      where: {
        jobId: parsedJobId,
      },
    });

    console.log(
      `📊 Job ${parsedJobId} has ${totalProposalsForJob} proposals from other freelancers`
    );

    // Start transaction to create proposal and update connects
    let result;
    try {
      result = await prisma.$transaction(async (tx) => {
        // Create proposal
        const proposal = await tx.proposal.create({
          data: {
            coverLetter: coverLetter.trim(),
            bidAmount: parsedBidAmount,
            timeframe: parsedTimeframe,
            jobId: parsedJobId,
            freelancerId: parsedFreelancerId,
            status: "pending",
          },
          include: {
            job: {
              select: {
                title: true,
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            freelancer: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        });

        // Update used connects
        await tx.userPlan.update({
          where: { userId: parsedFreelancerId },
          data: {
            usedConnects: {
              increment: connectsNeeded,
            },
          },
        });

        // Record connect usage with proposal reference - FIXED: Use DEBIT instead of "usage"
        await tx.connectTransaction.create({
          data: {
            type: "DEBIT", // Changed from "usage" to "DEBIT"
            amount: -connectsNeeded,
            description: `Submitted proposal for "${job.title}"`,
            userId: parsedFreelancerId,
            proposalId: proposal.id,
          },
        });

        return proposal;
      });
    } catch (transactionError) {
      console.error("❌ Transaction failed:", transactionError);

      // More specific error handling
      if (transactionError.code === "P2002") {
        return NextResponse.json(
          {
            error: "You have already submitted a proposal for this job",
            code: "DUPLICATE_PROPOSAL",
          },
          { status: 400 }
        );
      }

      throw new Error(
        `Database transaction failed: ${transactionError.message}`
      );
    }

    console.log("✅ Proposal created successfully:", result.id);
    console.log(`👥 Job now has ${totalProposalsForJob + 1} total proposals`);

    return NextResponse.json({
      success: true,
      message: "Proposal submitted successfully!",
      proposal: {
        id: result.id,
        coverLetter: result.coverLetter,
        bidAmount: result.bidAmount,
        timeframe: result.timeframe,
        status: result.status,
        jobTitle: result.job.title,
        clientName: result.job.user.name,
        freelancerName: result.freelancer.name,
        totalProposalsForJob: totalProposalsForJob + 1,
      },
      connectsUsed: connectsNeeded,
      remainingConnects: remainingConnects - connectsNeeded,
    });
  } catch (error) {
    console.error("🚨 Proposal submission error:", error);

    // More specific error responses
    if (error.message.includes("Unique constraint") || error.code === "P2002") {
      return NextResponse.json(
        {
          error: "You have already submitted a proposal for this job",
          code: "DUPLICATE_PROPOSAL",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const jobId = searchParams.get("jobId");
    const limit = searchParams.get("limit");

    if (userId && jobId) {
      // Check if specific user has applied to specific job
      const existingProposal = await prisma.proposal.findFirst({
        where: {
          freelancerId: parseInt(userId),
          jobId: parseInt(jobId),
        },
      });

      return NextResponse.json({
        success: true,
        hasExistingProposal: !!existingProposal,
        existingProposal: existingProposal,
      });
    }

    if (userId) {
      // Get user's proposals
      const proposals = await prisma.proposal.findMany({
        where: {
          freelancerId: parseInt(userId),
        },
        include: {
          job: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        ...(limit && { take: parseInt(limit) }),
      });

      return NextResponse.json({
        success: true,
        proposals,
      });
    }

    if (jobId) {
      // Get job's proposals
      const proposals = await prisma.proposal.findMany({
        where: {
          jobId: parseInt(jobId),
        },
        include: {
          freelancer: {
            include: {
              profile: {
                select: {
                  skills: true,
                  experience: true,
                  hourlyRate: true,
                },
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
        proposals,
      });
    }

    // Get all proposals (for admin)
    const proposals = await prisma.proposal.findMany({
      include: {
        job: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
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
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      ...(limit && { take: parseInt(limit) }),
    });

    return NextResponse.json({
      success: true,
      proposals,
    });
  } catch (error) {
    console.error("Get proposals error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch proposals",
      },
      { status: 500 }
    );
  }
}
