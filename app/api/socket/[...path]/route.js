// app/api/socket/[...path]/route.js
import { NextResponse } from 'next/server';

// This catch-all route handles socket.io paths
export async function GET(request, { params }) {
  return NextResponse.json({ message: 'Socket.io endpoint' });
}

export async function POST(request, { params }) {
  return NextResponse.json({ message: 'Socket.io endpoint' });
}