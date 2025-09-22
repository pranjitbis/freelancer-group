// app/api/orders/[id]/route.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET(req, { params }) {
  try {
    const id = params?.id;
    if (!id) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing order ID" }),
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
    });

    if (!order) {
      return new Response(
        JSON.stringify({ success: false, error: "Order not found" }),
        { status: 404 }
      );
    }

    return new Response(JSON.stringify({ success: true, data: order }), {
      status: 200,
    });
  } catch (err) {
    console.error("GET Order Error:", err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
    });
  }
}

export async function PATCH(req, { params }) {
  try {
    const id = params?.id;
    const orderId = parseInt(id);

    if (isNaN(orderId)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid order ID" }),
        { status: 400 }
      );
    }

    const body = await req.json();
    const allowedFields = ["status", "service", "name", "email"];
    const updateData = {};

    allowedFields.forEach((key) => {
      if (body[key] !== undefined) updateData[key] = body[key];
    });

    if (Object.keys(updateData).length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "No valid fields to update" }),
        { status: 400 }
      );
    }

    // Validate status
    if (
      updateData.status &&
      !["pending", "completed", "cancelled"].includes(updateData.status)
    ) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid status value" }),
        { status: 400 }
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    return new Response(JSON.stringify({ success: true, data: updatedOrder }), {
      status: 200,
    });
  } catch (err) {
    console.error("Update Order Error:", err);

    if (err.code === "P2025") {
      return new Response(
        JSON.stringify({ success: false, error: "Order not found" }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500 }
    );
  }
}

// ✅ DELETE handler
export async function DELETE(req, { params }) {
  try {
    const id = params?.id;
    const orderId = parseInt(id);

    if (isNaN(orderId)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid order ID" }),
        { status: 400 }
      );
    }

    await prisma.order.delete({
      where: { id: orderId },
    });

    return new Response(
      JSON.stringify({ success: true, message: "Order deleted successfully" }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Delete Order Error:", err);

    if (err.code === "P2025") {
      return new Response(
        JSON.stringify({ success: false, error: "Order not found" }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500 }
    );
  }
}
