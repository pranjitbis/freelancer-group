import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    // If no userId provided, return all connect history for admin
    if (!userId) {
      const allConnectHistory = await prisma.connectTransaction.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          proposal: {
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
        take: 100,
      });

      const formattedHistory = allConnectHistory.map((transaction) => {
        let description = transaction.description;
        let projectDetails = null;

        // If it's a proposal usage and we have proposal data, enhance the description
        if (transaction.type === "usage" && transaction.proposal) {
          description = `Submitted proposal for "${transaction.proposal.job.title}"`;
          projectDetails = {
            jobId: transaction.proposal.jobId,
            jobTitle: transaction.proposal.job.title,
            clientName: transaction.proposal.job.user.name,
            clientEmail: transaction.proposal.job.user.email,
            freelancerName: transaction.proposal.freelancer.name,
            bidAmount: transaction.proposal.bidAmount,
            status: transaction.proposal.status,
            coverLetter: transaction.proposal.coverLetter?.substring(0, 200) + "...",
          };
        }

        // If it's a plan change, make it more descriptive
        if (transaction.type === "plan_change") {
          if (transaction.amount > 0) {
            description = `Upgraded to plan with ${transaction.amount} connects`;
          } else {
            description = `Plan changed`;
          }
        }

        return {
          id: transaction.id,
          type: transaction.type,
          amount: transaction.amount,
          description: description,
          userName: transaction.user.name,
          userEmail: transaction.user.email,
          projectDetails: projectDetails,
          createdAt: transaction.createdAt,
        };
      });

      return NextResponse.json({ history: formattedHistory });
    }

    // If userId is provided, get specific user's history
    const connectHistory = await prisma.connectTransaction.findMany({
      where: {
        userId: parseInt(userId),
      },
      include: {
        proposal: {
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
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    const formattedHistory = connectHistory.map((transaction) => {
      let description = transaction.description;
      let projectDetails = null;

      if (transaction.type === "usage" && transaction.proposal) {
        description = `Submitted proposal for "${transaction.proposal.job.title}" - Client: ${transaction.proposal.job.user.name}`;
        projectDetails = {
          jobId: transaction.proposal.jobId,
          jobTitle: transaction.proposal.job.title,
          clientName: transaction.proposal.job.user.name,
          clientEmail: transaction.proposal.job.user.email,
          bidAmount: transaction.proposal.bidAmount,
          status: transaction.proposal.status,
        };
      }

      if (transaction.type === "plan_change") {
        if (transaction.amount > 0) {
          description = `Upgraded to plan with ${transaction.amount} connects`;
        } else {
          description = `Plan changed`;
        }
      }

      return {
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        description: description,
        createdAt: transaction.createdAt,
        projectDetails: projectDetails,
      };
    });

    return NextResponse.json({ history: formattedHistory });
  } catch (error) {
    console.error("Get connect history error:", error);
    return NextResponse.json(
      { error: "Failed to fetch connect history", details: error.message },
      { status: 500 }
    );
  }
}