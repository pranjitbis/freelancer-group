import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { action, token } = await request.json();
    
    if (action === 'verify_super_admin') {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (decoded.isSuperAdmin && decoded.permissions?.includes('super_admin')) {
          return NextResponse.json({
            success: true,
            isSuperAdmin: true,
            permissions: decoded.permissions,
            adminId: decoded.adminId
          });
        }
      } catch (error) {
        return NextResponse.json({
          success: false,
          error: 'Invalid or expired token'
        }, { status: 401 });
      }
    }
    
    if (action === 'verify_user_access') {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (decoded.isAdminAccess) {
          // Get user data to return
          const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: { profile: true }
          });
          
          if (!user) {
            return NextResponse.json({
              success: false,
              error: 'User not found'
            }, { status: 404 });
          }
          
          return NextResponse.json({
            success: true,
            isAdminAccess: true,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              profile: user.profile
            }
          });
        }
      } catch (error) {
        return NextResponse.json({
          success: false,
          error: 'Invalid or expired access token'
        }, { status: 401 });
      }
    }
    
    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    }, { status: 400 });
    
  } catch (error) {
    console.error('Access verification error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}