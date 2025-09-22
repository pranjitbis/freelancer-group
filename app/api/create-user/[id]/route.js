import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
export async function DELETE(req, { params }) {
  try {
    const id = parseInt(params.id);
    await prisma.user.delete({
      where: { id },
    });
    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
