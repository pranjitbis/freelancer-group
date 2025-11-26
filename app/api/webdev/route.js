import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // MUST BE DEFAULT IMPORT

export async function POST(req) {
  try {
    const { name, email, message, phone, serviceCategory } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, msg: "Missing required fields" },
        { status: 400 }
      );
    }

    const saved = await prisma.webDev.create({
      data: {
        name,
        email,
        message,
        phone,
        serviceCategory: serviceCategory || "Web Development",
      },
    });

    return NextResponse.json({
      success: true,
      msg: "Stored Successfully 🚀",
      saved,
    });
  } catch (error) {
    console.error("API ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const leads = await prisma.WebDev.findMany({
      orderBy: { createdAt: "desc" }, // newest first
    });

    return NextResponse.json({ success: true, leads });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
export async function PATCH(req) {
  try {
    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ success:false, msg:"Missing id or status" });
    }

    const updated = await prisma.WebDev.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json({ success:true, msg:"Status updated", updated });
  } catch (err) {
    return NextResponse.json({ success:false, error:err.message });
  }
}
