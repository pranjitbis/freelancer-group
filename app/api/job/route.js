import { PrismaClient } from "@prisma/client";
import { encrypt, decrypt } from "@/lib/cryptoUtils";

const prisma = new PrismaClient();

// POST API - create new job application
export async function POST(req) {
  try {
    const body = await req.json();

    const newJob = await prisma.job.create({
      data: {
        name: body.name,
        email: encrypt(body.email), // encrypt sensitive fields
        phone: encrypt(body.phone), // encrypt sensitive fields
        serviceCategory: body.jobId || null,
        experience: body.experience || null,
        resumeUrl: encrypt(body.resume) || null, // store resume URL as plaintext
        letter: body.coverLetter || "pending",
      },
    });

    return new Response(JSON.stringify(newJob), { status: 201 });
  } catch (err) {
    console.error("Error creating job:", err);
    return new Response(
      JSON.stringify({ error: "Failed to create job", details: err.message }),
      { status: 500 }
    );
  }
}

// GET API - fetch all job applications with safe decryption
export async function GET() {
  try {
    const forms = await prisma.job.findMany({
      orderBy: { id: "desc" },
    });

    const decryptedForms = forms.map((f) => {
      let email = f.email;
      let phone = f.phone;
      let resumeUrl = f.resumeUrl;

      try {
        if (f.email) email = decrypt(f.email);
      } catch (err) {
        console.warn(`Failed to decrypt email for id ${f.id}:`, err.message);
      }

      try {
        if (f.phone) phone = decrypt(f.phone);
      } catch (err) {
        console.warn(`Failed to decrypt phone for id ${f.id}:`, err.message);
      }

      try {
        if (f.resumeUrl) resumeUrl = decrypt(f.resumeUrl);
      } catch (err) {
        console.warn(`Failed to decrypt resume for id ${f.id}:`, err.message);
      }

      return {
        ...f,
        email,
        phone,
        resumeUrl,
      };
    });

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
