import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { userId, action = 'login' } = await request.json();
    
    // Verify admin permissions
    const adminToken = request.headers.get('authorization')?.replace('Bearer ', '');
    // Add your admin verification logic here
    
    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: {
        profile: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (action === 'credentials') {
      // Generate temporary password
      const temporaryPassword = Math.random().toString(36).slice(-8) + 'A1!';
      
      // Create temporary access token
      const temporaryToken = jwt.sign(
        { 
          userId: user.id,
          isTemporary: true,
          expires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      return NextResponse.json({
        success: true,
        temporaryPassword,
        temporaryToken,
        message: 'Credentials generated successfully'
      });
    }

    if (action === 'login') {
      // Create user token for login
      const userToken = jwt.sign(
        { 
          userId: user.id,
          email: user.email,
          role: user.role,
          isAdminAccess: true
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' } // Short expiry for security
      );

      // Create super admin token for return access
      const superAdminToken = jwt.sign(
        {
          adminId: 'current-admin-id', // Replace with actual admin ID
          permissions: ['user_access', 'dashboard_view', 'full_control'],
          isSuperAdmin: true
        },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        profile: user.profile
      };

      return NextResponse.json({
        success: true,
        userToken,
        superAdminToken,
        userData,
        message: 'Access granted'
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Admin access error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}