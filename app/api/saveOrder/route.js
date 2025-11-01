import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, service, paymentId } = body;

    const order = await prisma.order.create({
      data: {
        name,
        email,
        service,
        paymentId,
        status: "pending", // Add status
      },
    });

    return new Response(JSON.stringify(order), { status: 200 });
  } catch (err) {
    console.error("Save Order Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
