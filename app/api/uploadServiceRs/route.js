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

    if (!file || typeof file.arrayBuffer !== "function") {
      return new Response(
        JSON.stringify({ error: "No file uploaded or invalid file" }),
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), "public", "serviceRs");

    // Ensure folder exists
    fs.mkdirSync(uploadDir, { recursive: true });

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Generate unique filename to avoid overwriting
    const timestamp = Date.now();
    const safeName = file.name.replace(/\s+/g, "_");
    const filePath = path.join(uploadDir, `${timestamp}_${safeName}`);

    fs.writeFileSync(filePath, buffer);

    const fileUrl = `/serviceRs/${timestamp}_${safeName}`;
    return new Response(JSON.stringify({ url: fileUrl }), { status: 200 });
  } catch (err) {
    console.error("Upload error:", err);
    return new Response(JSON.stringify({ error: "File upload failed" }), {
      status: 500,
    });
  }
}
