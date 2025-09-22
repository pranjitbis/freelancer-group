import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const usersWithOrders = await prisma.user.findMany({
      include: { 
        orders: {
          orderBy: { createdAt: "desc" }
        } 
      },
      orderBy: { createdAt: "desc" },
    });

    return new Response(JSON.stringify(usersWithOrders), { status: 200 });
  } catch (err) {
    console.error("Fetch Users Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}