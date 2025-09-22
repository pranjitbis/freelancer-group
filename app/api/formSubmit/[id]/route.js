import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function PATCH(req, { params }) {
  const { id } = params; // the form ID

  try {
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return new Response(JSON.stringify({ error: "Status is required" }), {
        status: 400,
      });
    }

    const updatedForm = await prisma.formData.update({
      where: { id: Number(id) }, // convert string to number
      data: { status },
    });

    return new Response(JSON.stringify(updatedForm), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}

export async function GET(req, { params }) {
  const { id } = params;

  try {
    const form = await prisma.formData.findUnique({
      where: { id: Number(id) },
    });

    if (!form) {
      return new Response(JSON.stringify({ error: "Form not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(form), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}

export async function DELETE(req, { params }) {
  const { id } = params;

  try {
    await prisma.formData.delete({
      where: { id: Number(id) },
    });

    return new Response(JSON.stringify({ message: "Deleted successfully" }), {
      status: 200,
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
