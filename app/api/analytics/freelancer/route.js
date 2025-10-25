// app\api\analytics\freelancer\route.js
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

    // Calculate date range based on timeRange
    const now = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    console.log(
      `📊 Fetching REAL analytics data for user ${parsedUserId}, time range: ${timeRange}`
    );

    // Get REAL wallet balance from user table
    const user = await prisma.user.findUnique({
      where: { id: parsedUserId },
      select: {
        wallet: true,
        freelancerWallet: {
          select: {
            balance: true,
          },
        },
      },
    });

    console.log(`💰 User wallet data:`, user);

    // Use freelancer wallet balance if available, otherwise use user wallet
    const totalEarnings = user?.freelancerWallet?.balance || user?.wallet || 0;

    // Get REAL completed projects with earnings for chart data
    const completedProjects = await prisma.project.findMany({
      where: {
        freelancerId: parsedUserId,
        status: "completed",
        completedAt: {
          gte: startDate,
        },
      },
      include: {
        reviews: true,
      },
      orderBy: {
        completedAt: "asc",
      },
    });

    console.log(`✅ Found ${completedProjects.length} completed projects`);

    // Get REAL reviews data
    const reviews = await prisma.review.findMany({
      where: {
        revieweeId: parsedUserId,
        createdAt: {
          gte: startDate,
        },
      },
    });

    console.log(`✅ Found ${reviews.length} reviews`);

    // Calculate REAL average rating
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        : 0;

    // Get REAL active clients
    const activeClientsData = await prisma.project.findMany({
      where: {
        freelancerId: parsedUserId,
        OR: [
          { status: "active" },
          {
            status: "completed",
            completedAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
        ],
      },
      select: {
        clientId: true,
      },
      distinct: ["clientId"],
    });

    const activeClients = activeClientsData.length;

    // Generate REAL earnings data from actual projects
    const earningsData = await generateRealEarningsData(
      parsedUserId,
      timeRange,
      startDate
    );

    // Generate REAL projects data from actual projects
    const projectsData = await generateRealProjectsData(
      parsedUserId,
      timeRange,
      startDate
    );

    const analyticsData = {
      totalEarnings, // REAL wallet balance
      completedProjects: completedProjects.length,
      averageRating,
      totalReviews: reviews.length,
      activeClients,
      earningsData,
      projectsData,
      walletSource: user?.freelancerWallet ? "freelancerWallet" : "userWallet",
    };

    console.log("📈 REAL analytics data:", {
      totalEarnings,
      walletSource: analyticsData.walletSource,
      completedProjects: completedProjects.length,
      averageRating,
      totalReviews: reviews.length,
      activeClients,
      earningsDataPoints: earningsData.length,
      projectsDataPoints: projectsData.length,
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
        error: "Failed to fetch analytics data: " + error.message,
      },
      { status: 500 }
    );
  }
}

// Helper function to generate REAL earnings data from database
async function generateRealEarningsData(userId, timeRange, startDate) {
  try {
    // Get payment requests or transactions for real earnings data
    const paymentRequests = await prisma.paymentRequest.findMany({
      where: {
        freelancerId: userId,
        status: "completed",
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        amount: true,
        createdAt: true,
        currency: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // If no payment requests, use completed projects as fallback
    if (paymentRequests.length === 0) {
      const projects = await prisma.project.findMany({
        where: {
          freelancerId: userId,
          status: "completed",
          completedAt: {
            gte: startDate,
          },
        },
        select: {
          budget: true,
          completedAt: true,
        },
        orderBy: {
          completedAt: "asc",
        },
      });

      if (projects.length === 0) {
        return generateEmptyData(timeRange);
      }

      const earningsByPeriod = groupDataByTimePeriod(
        projects,
        timeRange,
        "budget"
      );
      return formatChartData(earningsByPeriod, timeRange, "earnings");
    }

    // Use real payment request data
    const earningsByPeriod = groupDataByTimePeriod(
      paymentRequests,
      timeRange,
      "amount"
    );
    return formatChartData(earningsByPeriod, timeRange, "earnings");
  } catch (error) {
    console.error("Error generating real earnings data:", error);
    return generateEmptyData(timeRange);
  }
}

// Helper function to generate REAL projects data from database
async function generateRealProjectsData(userId, timeRange, startDate) {
  try {
    // Get projects grouped by time period
    const projects = await prisma.project.findMany({
      where: {
        freelancerId: userId,
        status: "completed",
        completedAt: {
          gte: startDate,
        },
      },
      select: {
        completedAt: true,
      },
      orderBy: {
        completedAt: "asc",
      },
    });

    if (projects.length === 0) {
      return generateEmptyData(timeRange);
    }

    const projectsByPeriod = groupDataByTimePeriod(
      projects,
      timeRange,
      "count"
    );
    return formatChartData(projectsByPeriod, timeRange, "projects");
  } catch (error) {
    console.error("Error generating real projects data:", error);
    return generateEmptyData(timeRange);
  }
}

// Helper function to group data by time period
function groupDataByTimePeriod(data, timeRange, type) {
  const grouped = {};

  data.forEach((item) => {
    const date = new Date(item.completedAt || item.createdAt);
    let periodKey;

    switch (timeRange) {
      case "week":
        periodKey = `Week ${getWeekNumber(date)}`;
        break;
      case "month":
        periodKey = date.toLocaleString("default", { month: "short" });
        break;
      case "year":
        periodKey = date.toLocaleString("default", { month: "short" });
        break;
      default:
        periodKey = date.toLocaleString("default", { month: "short" });
    }

    if (!grouped[periodKey]) {
      grouped[periodKey] = type === "count" ? 0 : 0;
    }

    if (type === "count") {
      grouped[periodKey]++;
    } else {
      grouped[periodKey] += item.budget || item.amount || 0;
    }
  });

  return grouped;
}

// Helper function to format chart data
function formatChartData(data, timeRange, dataType) {
  const labels = generateLabels(timeRange);
  const result = [];

  labels.forEach((label) => {
    const value = data[label] || 0;
    result.push({
      month: label,
      earnings: dataType === "earnings" ? Math.round(value) : 0,
      projects: dataType === "projects" ? value : 0,
    });
  });

  return result;
}

// Helper function to generate time period labels
function generateLabels(timeRange) {
  const now = new Date();
  const labels = [];

  switch (timeRange) {
    case "week":
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(now.getDate() - i);
        labels.push(`Week ${getWeekNumber(date)}`);
      }
      break;
    case "month":
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(now.getMonth() - i);
        labels.push(date.toLocaleString("default", { month: "short" }));
      }
      break;
    case "year":
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      labels.push(...months);
      break;
    default:
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(now.getMonth() - i);
        labels.push(date.toLocaleString("default", { month: "short" }));
      }
  }

  return labels;
}

// Helper function to get week number
function getWeekNumber(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

// Helper function to generate empty data structure
function generateEmptyData(timeRange) {
  const labels = generateLabels(timeRange);
  return labels.map((label) => ({
    month: label,
    earnings: 0,
    projects: 0,
  }));
}
