import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Socket.io API endpoint",
  });
}

export async function POST() {
  return NextResponse.json({
    success: true,
    message: "Socket.io POST endpoint",
  });
}
