// app/api/projects/complete/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { projectId, userId, userType, forceComplete = false } = body;

    console.log("🔄 Project completion request:", {
      projectId,
      userId,
      userType,
      forceComplete,
    });

    if (!projectId || !userId || !userType) {
      console.error("❌ Missing required fields:", {
        projectId,
        userId,
        userType,
      });
      return NextResponse.json(
        {
          success: false,
          error: "Project ID, user ID, and user type are required",
        },
        { status: 400 }
      );
    }

    // Validate userType
    const validUserTypes = ["FREELANCER", "CLIENT"];
    if (!validUserTypes.includes(userType)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid user type. Must be FREELANCER or CLIENT",
        },
        { status: 400 }
      );
    }

    // Parse IDs to integers
    const parsedProjectId = parseInt(projectId);
    const parsedUserId = parseInt(userId);

    if (isNaN(parsedProjectId) || isNaN(parsedUserId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid project ID or user ID",
        },
        { status: 400 }
      );
    }

    console.log(
      `🔍 Finding project ${parsedProjectId} for user ${parsedUserId}`
    );

    // Verify project exists and user has permission
    const project = await prisma.project.findFirst({
      where: {
        id: parsedProjectId,
        OR: [{ freelancerId: parsedUserId }, { clientId: parsedUserId }],
      },
      include: {
        conversations: {
          include: {
            paymentRequests: {
              where: {
                status: {
                  in: ["pending", "approved"],
                },
              },
            },
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        freelancer: {
          include: {
            profile: {
              select: {
                title: true,
                skills: true,
                bio: true,
                experience: true,
                hourlyRate: true,
              },
            },
          },
        },
        reviews: true,
      },
    });

    if (!project) {
      console.error(
        `❌ Project ${parsedProjectId} not found or unauthorized for user ${parsedUserId}`
      );
      return NextResponse.json(
        { success: false, error: "Project not found or unauthorized" },
        { status: 404 }
      );
    }

    console.log(
      `✅ Found project: "${project.title}" with status: ${project.status}`
    );

    // Check if project is already completed
    if (project.status === "completed") {
      return NextResponse.json(
        {
          success: false,
          error: "Project is already completed",
          project: project,
        },
        { status: 400 }
      );
    }

    // Check if user has permission to complete based on userType
    if (userType === "FREELANCER" && project.freelancerId !== parsedUserId) {
      return NextResponse.json(
        {
          success: false,
          error: "Only the assigned freelancer can complete this project",
        },
        { status: 403 }
      );
    }

    if (userType === "CLIENT" && project.clientId !== parsedUserId) {
      return NextResponse.json(
        {
          success: false,
          error: "Only the project client can complete this project",
        },
        { status: 403 }
      );
    }

    // Check if there are pending payments (only if not forcing completion)
    const pendingPayments = project.conversations?.[0]?.paymentRequests || [];
    console.log(`💰 Found ${pendingPayments.length} pending payments`);

    if (!forceComplete && pendingPayments.length > 0) {
      const paymentDetails = pendingPayments.map((p) => ({
        id: p.id,
        amount: p.amount,
        status: p.status,
        description: p.description,
      }));

      console.log(
        `⏳ Project ${parsedProjectId} has ${pendingPayments.length} pending payments, blocking completion`
      );

      return NextResponse.json(
        {
          success: false,
          error: "Cannot complete project with pending or approved payments",
          pendingPayments: paymentDetails,
          canForceComplete: true,
        },
        { status: 400 }
      );
    }

    console.log(`🔄 Updating project ${parsedProjectId} status to completed`);

    // Update project status to completed
    const updatedProject = await prisma.project.update({
      where: { id: parsedProjectId },
      data: {
        status: "completed",
        completedAt: new Date(),
        updatedAt: new Date(),
        reviewStatus: "pending_reviews",
      },
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
          include: {
            profile: {
              select: {
                title: true,
                skills: true,
                bio: true,
                experience: true,
                hourlyRate: true,
              },
            },
          },
        },
        conversations: true,
        reviews: true,
      },
    });

    console.log(`✅ Project ${parsedProjectId} status updated to completed`);

    // Create completion message in all related conversations
    const conversations = project.conversations || [];
    const completedByName =
      userType === "FREELANCER" ? project.freelancer.name : project.client.name;

    console.log(
      `💬 Creating completion messages in ${conversations.length} conversations`
    );

    for (const conversation of conversations) {
      await prisma.message.create({
        data: {
          content: `🎉 Project "${project.title}" has been marked as completed by ${completedByName}. Both parties can now leave reviews for each other.`,
          messageType: "SYSTEM",
          senderId: parsedUserId,
          conversationId: conversation.id,
        },
      });
      console.log(
        `💬 Created completion message in conversation ${conversation.id}`
      );
    }

    // Log completion for analytics
    console.log(`📊 Project Completion Summary:
      Project: ${project.title} (ID: ${project.id})
      Completed By: ${userType} - ${completedByName}
      Budget: ₹${project.budget}
      Client: ${project.client.name}
      Freelancer: ${project.freelancer.name}
      Pending Payments: ${pendingPayments.length}
      Force Completed: ${forceComplete}
      Review Status: pending_reviews
    `);

    return NextResponse.json({
      success: true,
      project: updatedProject,
      hasPendingPayments: pendingPayments.length > 0,
      completedBy: userType,
      message:
        "Project marked as completed successfully. Review period started.",
      reviewInfo: {
        canReview: true,
        reviewType:
          userType === "FREELANCER"
            ? "FREELANCER_TO_CLIENT"
            : "CLIENT_TO_FREELANCER",
        targetUserId:
          userType === "FREELANCER" ? project.clientId : project.freelancerId,
        targetUserName:
          userType === "FREELANCER"
            ? project.client.name
            : project.freelancer.name,
      },
    });
  } catch (error) {
    console.error("❌ Complete project error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to complete project",
        details: error.message,
        code: error.code,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET endpoint to check project completion status and pending reviews
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const userId = searchParams.get("userId");

    if (!projectId || !userId) {
      return NextResponse.json(
        { success: false, error: "Project ID and user ID are required" },
        { status: 400 }
      );
    }

    const project = await prisma.project.findFirst({
      where: {
        id: parseInt(projectId),
        OR: [
          { freelancerId: parseInt(userId) },
          { clientId: parseInt(userId) },
        ],
      },
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
          include: {
            profile: {
              select: {
                title: true,
                skills: true,
                bio: true,
                experience: true,
                hourlyRate: true,
              },
            },
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
            paymentRequests: {
              where: {
                status: {
                  in: ["pending", "approved"],
                },
              },
            },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    // Determine user type and review status
    const isClient = project.clientId === parseInt(userId);
    const isFreelancer = project.freelancerId === parseInt(userId);
    const userType = isClient ? "CLIENT" : isFreelancer ? "FREELANCER" : null;

    // Check if user has already reviewed
    const userReview = project.reviews.find(
      (review) => review.reviewerId === parseInt(userId)
    );

    // Check if other party has reviewed
    const otherPartyId = isClient ? project.freelancerId : project.clientId;
    const otherPartyReview = project.reviews.find(
      (review) => review.reviewerId === otherPartyId
    );

    // Check pending payments
    const pendingPayments = project.conversations[0]?.paymentRequests || [];

    const responseData = {
      success: true,
      project: {
        id: project.id,
        title: project.title,
        description: project.description,
        budget: project.budget,
        status: project.status,
        reviewStatus: project.reviewStatus,
        completedAt: project.completedAt,
        client: project.client,
        freelancer: project.freelancer,
      },
      userInfo: {
        userType,
        canComplete: project.status !== "completed",
        canReview: project.status === "completed" && !userReview,
        hasReviewed: !!userReview,
        userReview: userReview || null,
      },
      reviewStatus: {
        hasClientReview: project.reviews.some(
          (r) => r.type === "CLIENT_TO_FREELANCER"
        ),
        hasFreelancerReview: project.reviews.some(
          (r) => r.type === "FREELANCER_TO_CLIENT"
        ),
        otherPartyHasReviewed: !!otherPartyReview,
        otherPartyReview: otherPartyReview || null,
        bothReviewed: project.reviews.length >= 2,
      },
      pendingPayments: {
        count: pendingPayments.length,
        payments: pendingPayments,
        canForceComplete: pendingPayments.length > 0,
      },
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("❌ Get project status error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get project status",
        details: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
