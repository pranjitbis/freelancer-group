import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false, // Required for FormData file uploads
  },
};

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("resume");

    if (!file || !(file instanceof File)) {
      return new Response(JSON.stringify({ error: "No file uploaded" }), {
        status: 400,
      });
    }

    const uploadDir = path.join(process.cwd(), "public", "serviceRs");

    // Ensure folder exists
    fs.mkdirSync(uploadDir, { recursive: true });

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Save file
    const filePath = path.join(uploadDir, file.name);
    fs.writeFileSync(filePath, buffer);

    const fileUrl = `/serviceRs/${file.name}`;
    return new Response(JSON.stringify({ url: fileUrl }), { status: 200 });
  } catch (err) {
    console.error("Upload error:", err);
    return new Response(JSON.stringify({ error: "File upload failed" }), {
      status: 500,
    });
  }
}
