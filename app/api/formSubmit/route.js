import { PrismaClient } from "@prisma/client";
import { encrypt, decrypt } from "@/lib/cryptoUtils";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, phone, serviceCategory, message } = body;

    if (!name || !email) {
      return new Response(
        JSON.stringify({ error: "Name and Email are required" }),
        { status: 400 }
      );
    }

    const newForm = await prisma.formData.create({
      data: {
        name,
        email: encrypt(email),
        phone: encrypt(phone),
        serviceCategory,
        message: message || "pending",
      },
    });

    return new Response(JSON.stringify(newForm), { status: 201 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}

export async function GET() {
  try {
    const forms = await prisma.formData.findMany({
      orderBy: { id: "desc" },
    });

    const decryptedForms = forms.map((f) => ({
      ...f,
      email: decrypt(f.email),
      phone: decrypt(f.phone),
    }));

    return new Response(JSON.stringify(decryptedForms), { status: 200 });
  } catch (err) {
    console.error("Error fetching form data:", err);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch form data",
        details: err.message,
      }),
      { status: 500 }
    );
  }
}
