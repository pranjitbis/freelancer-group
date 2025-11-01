// app/api/init-socket/route.js
import { NextResponse } from 'next/server';
import { socketServer } from '@/lib/socket-server';

export async function GET() {
  // This endpoint ensures socket server is initialized
  return NextResponse.json({ 
    success: true, 
    message: 'Socket server ready' 
  });
}