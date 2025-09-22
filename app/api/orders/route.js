import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
    });
    return new Response(JSON.stringify(orders), { status: 200 });
  } catch (err) {
    console.error("GET Orders Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}

export async function POST(req) {
  try {
    const body = await req.json(); // parse JSON
    const {
      name,
      email,
      phone,
      requirements,
      quantity,
      category,
      subcategory,
      urgency,
      duration,
      resume, // URL from file upload
      experienceLevel,
      userId,
      paymentId,
    } = body;

    const order = await prisma.order.create({
      data: {
        name,
        email,
        phone,
        requirements,
        quantity,
        category,
        subcategory,
        urgency: urgency || "standard",
        duration,
        experienceLevel,
        resume,
        userId: userId || null,
        paymentId,
      },
    });

    return new Response(JSON.stringify(order), { status: 201 });
  } catch (err) {
    console.error("Order creation error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
