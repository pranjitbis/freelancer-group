import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get users with their basic info and related data that exists
    const users = await prisma.user.findMany({
      include: {
        profile: true,
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 5, // Limit to recent transactions
        },
        jobPosts: {
          orderBy: { createdAt: "desc" },
          take: 5, // Limit to recent job posts
        },
        proposals: {
          orderBy: { createdAt: "desc" },
          take: 5, // Limit to recent proposals
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // If you need orders data separately, fetch them
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Combine users with their orders based on userId
    const usersWithOrders = users.map((user) => ({
      ...user,
      orders: orders.filter((order) => order.userId === user.id),
    }));

    return new Response(JSON.stringify(usersWithOrders), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error("Fetch Users Error:", err);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch users",
        details: err.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
