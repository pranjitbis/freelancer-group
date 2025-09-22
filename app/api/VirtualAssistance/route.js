import { PrismaClient } from "@prisma/client";
import { encrypt, decrypt } from "@/lib/cryptoUtils"; // ✅ correct import

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, phone, service, message } = body;

    if (!name || !email) {
      return new Response(
        JSON.stringify({ error: "Name and Email are required" }),
        { status: 400 }
      );
    }

    const newForm = await prisma.virtualAssistance.create({
      data: {
        name,
        email: encrypt(email),
        phone: encrypt(phone),
        service,
        message: message || "pending",
      },
    });

    return new Response(JSON.stringify(newForm), { status: 201 });
  } catch (err) {
    console.error("POST error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}

export async function GET() {
  try {
    const forms = await prisma.virtualAssistance.findMany();

    const decryptedForms = forms.map((f) => ({
      ...f,
      email: decrypt(f.email),
      phone: decrypt(f.phone),
    }));

    return new Response(JSON.stringify(decryptedForms), { status: 200 });
  } catch (err) {
    console.error("GET error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
