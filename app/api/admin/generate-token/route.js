import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    const { permissions = [], expiresIn = '30d' } = await request.json();
    
    // Verify admin permissions
    const adminToken = request.headers.get('authorization')?.replace('Bearer ', '');
    // Add your admin verification logic here

    const superAdminToken = jwt.sign(
      {
        adminId: 'super-admin-id',
        permissions: [...permissions, 'super_admin'],
        isSuperAdmin: true,
        generatedAt: Date.now()
      },
      process.env.JWT_SECRET,
      { expiresIn }
    );

    return NextResponse.json({
      success: true,
      superAdminToken,
      permissions,
      expiresIn,
      message: 'Super Admin Token generated successfully'
    });

  } catch (error) {
    console.error('Token generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}