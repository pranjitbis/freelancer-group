// app/api/analytics/freelancer/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const timeRange = searchParams.get("timeRange") || "month";

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    const parsedUserId = parseInt(userId);
    if (isNaN(parsedUserId)) {
      return NextResponse.json(
        { success: false, error: "Invalid user ID" },
        { status: 400 }
      );
    }

    console.log(`📊 Fetching analytics for freelancer: ${parsedUserId}`);

    // Get REAL wallet balance from freelancer wallet
    const freelancerWallet = await prisma.freelancerWallet.findUnique({
      where: { userId: parsedUserId },
      select: {
        balance: true,
      },
    });

    // Get wallet transactions for earnings calculation
    const walletTransactions = await prisma.walletTransaction.findMany({
      where: {
        wallet: {
          userId: parsedUserId,
        },
        type: "credit",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate total earnings from wallet transactions
    const totalEarningsFromTransactions = walletTransactions.reduce(
      (total, transaction) => total + transaction.amount,
      0
    );

    // Get ALL completed projects
    const allCompletedProjects = await prisma.project.findMany({
      where: {
        freelancerId: parsedUserId,
        status: "completed",
      },
      include: {
        reviews: true,
        conversations: {
          include: {
            paymentRequests: {
              where: {
                status: "completed",
              },
            },
          },
        },
      },
    });

    console.log(`✅ Found ${allCompletedProjects.length} completed projects`);

    // Calculate total earnings from completed payment requests
    const totalEarningsFromProjects = allCompletedProjects.reduce(
      (total, project) => {
        const projectEarnings = project.conversations.reduce(
          (conversationTotal, conversation) => {
            const conversationEarnings = conversation.paymentRequests.reduce(
              (paymentTotal, payment) => paymentTotal + payment.amount,
              0
            );
            return conversationTotal + conversationEarnings;
          },
          0
        );
        return total + projectEarnings;
      },
      0
    );

    // Use the highest value between wallet balance and actual project earnings
    const totalEarnings = Math.max(
      freelancerWallet?.balance || 0,
      totalEarningsFromProjects,
      totalEarningsFromTransactions
    );

    // Get ALL reviews received
    const allReviews = await prisma.review.findMany({
      where: {
        revieweeId: parsedUserId,
        type: "CLIENT_TO_FREELANCER",
      },
    });

    console.log(`✅ Found ${allReviews.length} reviews received`);

    // Calculate REAL average rating
    const averageRating =
      allReviews.length > 0
        ? allReviews.reduce((sum, review) => sum + review.rating, 0) /
          allReviews.length
        : 0;

    // Get active projects (ongoing)
    const activeProjects = await prisma.project.findMany({
      where: {
        freelancerId: parsedUserId,
        status: "active",
      },
    });

    // Get unique active clients from active projects
    const activeClients = [...new Set(activeProjects.map((p) => p.clientId))]
      .length;

    // CORRECTED: Get projects that need freelancer reviews
    const pendingReviewProjects = await prisma.project.findMany({
      where: {
        freelancerId: parsedUserId,
        status: "completed",
        // Projects where freelancer hasn't reviewed the client
        reviews: {
          none: {
            type: "FREELANCER_TO_CLIENT",
            reviewerId: parsedUserId,
          },
        },
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reviews: {
          where: {
            type: "CLIENT_TO_FREELANCER",
          },
          include: {
            reviewer: {
              select: {
                name: true,
              },
            },
          },
        },
        conversations: {
          include: {
            paymentRequests: {
              where: {
                status: "completed",
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    console.log(
      `✅ Found ${pendingReviewProjects.length} pending review projects`
    );

    // Format the pending review projects with proper data
    const formattedPendingProjects = pendingReviewProjects.map((project) => {
      // Calculate total earnings for this project
      const totalEarnings = project.conversations.reduce(
        (total, conversation) => {
          return (
            total +
            conversation.paymentRequests.reduce(
              (sum, payment) => sum + payment.amount,
              0
            )
          );
        },
        0
      );

      // Calculate project duration
      const projectDuration =
        project.createdAt && project.updatedAt
          ? Math.ceil(
              (new Date(project.updatedAt) - new Date(project.createdAt)) /
                (1000 * 60 * 60 * 24)
            ) + " days"
          : "N/A";

      return {
        id: project.id,
        title: project.title || "Untitled Project",
        description: project.description || "No description available",
        clientId: project.clientId,
        client: project.client,
        completedAt: project.updatedAt,
        totalEarnings: totalEarnings,
        hasClientReview: project.reviews.length > 0,
        clientReview: project.reviews.length > 0 ? project.reviews[0] : null,
        projectDuration: projectDuration,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      };
    });

    const analyticsData = {
      // Financial Data
      totalEarnings: totalEarnings,
      walletBalance: freelancerWallet?.balance || 0,

      // Project Data
      completedProjects: allCompletedProjects.length,
      ongoingProjects: activeProjects.length,

      // Review Data
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalReviews: allReviews.length,
      activeClients: activeClients,

      // Pending Reviews - RETURN THE ARRAY, NOT JUST THE COUNT
      pendingReviewProjects: formattedPendingProjects, // This should be the array of projects
      totalPendingReviews: pendingReviewProjects.length,
    };

    console.log(`📊 Final analytics data for freelancer ${parsedUserId}:`, {
      totalEarnings: analyticsData.totalEarnings,
      completedProjects: analyticsData.completedProjects,
      ongoingProjects: analyticsData.ongoingProjects,
      averageRating: analyticsData.averageRating,
      totalReviews: analyticsData.totalReviews,
      activeClients: analyticsData.activeClients,
      pendingReviews: analyticsData.totalPendingReviews,
      pendingReviewProjectsCount: analyticsData.pendingReviewProjects.length,
    });

    return NextResponse.json({
      success: true,
      data: analyticsData,
    });
  } catch (error) {
    console.error("❌ Error fetching real analytics data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch analytics data",
        details: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
