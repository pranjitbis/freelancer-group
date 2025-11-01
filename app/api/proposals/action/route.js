// app/api/proposals/action/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    console.log("Received proposal action:", body);

    const { proposalId, action, type = "received" } = body;

    if (!proposalId || !action) {
      console.error("Missing required fields:", { proposalId, action });
      return NextResponse.json(
        { success: false, error: "Proposal ID and action are required" },
        { status: 400 }
      );
    }

    // Validate action
    const validActions = ["accepted", "rejected", "completed"];
    if (!validActions.includes(action)) {
      console.error("Invalid action:", action);
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid action. Must be one of: accepted, rejected, completed",
        },
        { status: 400 }
      );
    }

    // Parse proposalId to ensure it's a number
    const parsedProposalId = parseInt(proposalId);
    if (isNaN(parsedProposalId)) {
      console.error("Invalid proposal ID:", proposalId);
      return NextResponse.json(
        { success: false, error: "Invalid proposal ID" },
        { status: 400 }
      );
    }

    // First, try to find the proposal in both tables
    let proposal = null;
    let proposalType = null;

    // Try to find in ClientToFreelancerProposal table first
    proposal = await prisma.clientToFreelancerProposal.findUnique({
      where: { id: parsedProposalId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        freelancer: {
          include: {
            profile: {
              select: {
                title: true,
                skills: true,
                experience: true,
                hourlyRate: true,
                bio: true,
              },
            },
          },
        },
        conversation: {
          include: {
            client: true,
            freelancer: true,
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
            project: true,
          },
        },
        connectTransactions: true,
      },
    });

    if (proposal) {
      proposalType = "clientToFreelancer";
      console.log("✅ Found proposal in ClientToFreelancerProposal table");
    } else {
      // If not found, try in regular Proposal table
      proposal = await prisma.proposal.findUnique({
        where: { id: parsedProposalId },
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
                  title: true,
                  skills: true,
                  experience: true,
                  hourlyRate: true,
                  bio: true,
                },
              },
            },
          },
          conversation: {
            include: {
              client: true,
              freelancer: true,
              messages: {
                orderBy: { createdAt: "desc" },
                take: 1,
              },
              project: true,
            },
          },
          connectTransactions: true,
        },
      });

      if (proposal) {
        proposalType = "regular";
        console.log("✅ Found proposal in regular Proposal table");
      }
    }

    if (!proposal) {
      console.error("❌ Proposal not found in any table:", parsedProposalId);

      // Let's check what proposals actually exist for debugging
      const allClientToFreelancerProposals =
        await prisma.clientToFreelancerProposal.findMany({
          select: { id: true, projectTitle: true, status: true },
        });
      const allRegularProposals = await prisma.proposal.findMany({
        select: { id: true, job: { select: { title: true } }, status: true },
      });

      console.log(
        "📊 Existing ClientToFreelancerProposals:",
        allClientToFreelancerProposals
      );
      console.log("📊 Existing Regular Proposals:", allRegularProposals);

      return NextResponse.json(
        {
          success: false,
          error: "Proposal not found",
          debug: {
            searchedId: parsedProposalId,
            clientToFreelancerProposals: allClientToFreelancerProposals,
            regularProposals: allRegularProposals,
          },
        },
        { status: 404 }
      );
    }

    console.log(
      "✅ Found proposal:",
      proposal.id,
      "Type:",
      proposalType,
      "Status:",
      proposal.status
    );

    // Update proposal status based on type
    let updatedProposal;
    if (proposalType === "clientToFreelancer") {
      updatedProposal = await prisma.clientToFreelancerProposal.update({
        where: { id: parsedProposalId },
        data: {
          status: action,
          updatedAt: new Date(),
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
            include: {
              profile: {
                select: {
                  title: true,
                  skills: true,
                  experience: true,
                  hourlyRate: true,
                  bio: true,
                },
              },
            },
          },
          conversation: {
            include: {
              client: true,
              freelancer: true,
              project: true,
            },
          },
          connectTransactions: true,
        },
      });
    } else {
      updatedProposal = await prisma.proposal.update({
        where: { id: parsedProposalId },
        data: {
          status: action,
          updatedAt: new Date(),
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
          freelancer: {
            include: {
              profile: {
                select: {
                  title: true,
                  skills: true,
                  experience: true,
                  hourlyRate: true,
                  bio: true,
                },
              },
            },
          },
          conversation: {
            include: {
              client: true,
              freelancer: true,
              project: true,
            },
          },
          connectTransactions: true,
        },
      });
    }

    console.log("✅ Proposal updated successfully:", updatedProposal.id);

    // If accepted, create a project and conversation
    if (action === "accepted") {
      console.log("🔄 Creating project and conversation for accepted proposal");

      try {
        let conversation = proposal.conversation;
        let clientId, freelancerId, projectTitle, projectDescription, budget;

        if (proposalType === "clientToFreelancer") {
          // Client-to-freelancer proposal
          clientId = proposal.clientId;
          freelancerId = proposal.freelancerId;
          projectTitle = proposal.projectTitle;
          projectDescription = proposal.projectDescription;
          budget = proposal.bidAmount;
        } else {
          // Regular job proposal
          clientId = proposal.job.userId;
          freelancerId = proposal.freelancerId;
          projectTitle = proposal.job.title;
          projectDescription = proposal.job.description;
          budget = proposal.bidAmount;
        }

        console.log("📋 Project details:", {
          clientId,
          freelancerId,
          projectTitle,
          budget,
        });

        if (!conversation) {
          // Create new conversation
          conversation = await prisma.conversation.create({
            data: {
              clientId: clientId,
              freelancerId: freelancerId,
            },
          });
          console.log("✅ Created new conversation:", conversation.id);

          // Update proposal with conversation ID
          if (proposalType === "clientToFreelancer") {
            await prisma.clientToFreelancerProposal.update({
              where: { id: parsedProposalId },
              data: {
                conversationId: conversation.id,
              },
            });
          } else {
            await prisma.proposal.update({
              where: { id: parsedProposalId },
              data: {
                conversationId: conversation.id,
              },
            });
          }
        } else {
          console.log("✅ Using existing conversation:", conversation.id);
        }

        // Check if project already exists for this conversation
        if (conversation.project) {
          console.log(
            "⚠️ Project already exists for this conversation:",
            conversation.project.id
          );
          return NextResponse.json(
            {
              success: false,
              error: "Project already exists for this proposal",
              projectId: conversation.project.id,
            },
            { status: 400 }
          );
        }

        // Create project data
        const projectData = {
          title: projectTitle,
          description: projectDescription,
          budget: budget,
          status: "active",
          clientId: clientId,
          freelancerId: freelancerId,
        };

        console.log("📦 Creating project with data:", projectData);

        const project = await prisma.project.create({
          data: projectData,
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
            conversations: true,
          },
        });

        console.log(
          "✅ Created project:",
          project.id,
          "with title:",
          project.title
        );

        // Update conversation with project reference
        await prisma.conversation.update({
          where: { id: conversation.id },
          data: {
            projectId: project.id,
          },
        });

        // Create initial system message
        await prisma.message.create({
          data: {
            content: `Congratulations! The proposal for "${
              project.title
            }" has been accepted. The project budget is ${formatCurrency(
              budget
            )}. You can now start working on the project.`,
            messageType: "SYSTEM",
            senderId: clientId,
            conversationId: conversation.id,
          },
        });

        console.log("✅ Project setup completed successfully");

        return NextResponse.json({
          success: true,
          proposal: updatedProposal,
          project: project,
          conversation: conversation,
          message: "Proposal accepted and project created successfully",
        });
      } catch (projectError) {
        console.error("❌ Error creating project/conversation:", projectError);

        // Revert proposal status if project creation fails
        if (proposalType === "clientToFreelancer") {
          await prisma.clientToFreelancerProposal.update({
            where: { id: parsedProposalId },
            data: {
              status: "pending",
            },
          });
        } else {
          await prisma.proposal.update({
            where: { id: parsedProposalId },
            data: {
              status: "pending",
            },
          });
        }

        return NextResponse.json(
          {
            success: false,
            error: "Project creation failed",
            details: projectError.message,
            code: projectError.code,
          },
          { status: 500 }
        );
      }
    }

    // If completed, mark project as completed
    if (action === "completed") {
      console.log("🔄 Marking project as completed");

      try {
        // Find the conversation for this proposal
        const conversation = await prisma.conversation.findFirst({
          where: {
            OR: [
              { id: proposal.conversationId },
              {
                clientId:
                  proposalType === "clientToFreelancer"
                    ? proposal.clientId
                    : proposal.job.userId,
                freelancerId: proposal.freelancerId,
              },
            ],
          },
          include: {
            project: {
              include: {
                client: true,
                freelancer: true,
              },
            },
          },
        });

        if (!conversation || !conversation.project) {
          console.error("❌ No project found for proposal:", parsedProposalId);
          return NextResponse.json(
            {
              success: false,
              error: "No project found for this proposal",
            },
            { status: 404 }
          );
        }

        // Update project status to completed
        const updatedProject = await prisma.project.update({
          where: { id: conversation.project.id },
          data: {
            status: "completed",
            completedAt: new Date(),
            updatedAt: new Date(),
          },
        });

        console.log("✅ Project marked as completed:", updatedProject.id);

        // Create completion message
        if (conversation) {
          await prisma.message.create({
            data: {
              content: `Project "${updatedProject.title}" has been marked as completed. Both parties can now leave reviews for each other.`,
              messageType: "SYSTEM",
              senderId: proposal.freelancerId,
              conversationId: conversation.id,
            },
          });
          console.log("✅ Created completion message");
        }

        return NextResponse.json({
          success: true,
          proposal: updatedProposal,
          project: updatedProject,
          message: "Project marked as completed successfully",
        });
      } catch (completionError) {
        console.error("❌ Error completing project:", completionError);

        // Revert proposal status if completion fails
        if (proposalType === "clientToFreelancer") {
          await prisma.clientToFreelancerProposal.update({
            where: { id: parsedProposalId },
            data: {
              status: "accepted",
            },
          });
        } else {
          await prisma.proposal.update({
            where: { id: parsedProposalId },
            data: {
              status: "accepted",
            },
          });
        }

        return NextResponse.json(
          {
            success: false,
            error: "Failed to complete project",
            details: completionError.message,
          },
          { status: 500 }
        );
      }
    }

    // For rejected action, just return success
    console.log("✅ Proposal action completed successfully");
    return NextResponse.json({
      success: true,
      proposal: updatedProposal,
      message: `Proposal ${action} successfully`,
    });
  } catch (error) {
    console.error("❌ Proposal action error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update proposal",
        details: error.message,
        code: error.code,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
