import { promises as fs } from "fs";
import path from "path";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("resume");

    if (!file) {
      return new Response(JSON.stringify({ error: "No file uploaded" }), {
        status: 400,
      });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(process.cwd(), "public", "uploads", "resumes");

    // Ensure upload folder exists
    await fs.mkdir(uploadDir, { recursive: true });

    // Save file with original name (you can also hash filenames to avoid collisions)
    const filePath = path.join(uploadDir, file.name);
    await fs.writeFile(filePath, buffer);

    const fileUrl = `/uploads/resumes/${file.name}`;

    return new Response(JSON.stringify({ url: fileUrl }), { status: 200 });
  } catch (err) {
    console.error("Upload error:", err);
    return new Response(JSON.stringify({ error: "File upload failed" }), {
      status: 500,
    });
  }
}
