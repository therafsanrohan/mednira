import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
// @ts-ignore
const { authenticator } = require('otplib');

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user || !user.twoFactorSecret) {
      return NextResponse.json({ error: 'MFA setup not initiated' }, { status: 400 });
    }

    // Verify token
    const isValid = authenticator.verify({
      token,
      secret: user.twoFactorSecret
    });

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    // Generate 8 recovery codes
    const recoveryCodes = Array.from({ length: 8 }, () => 
      Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase()
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { 
        twoFactorEnabled: true,
        twoFactorRecoveryCodes: recoveryCodes
      }
    });

    return NextResponse.json({
      success: true,
      recoveryCodes
    });
  } catch (error) {
    console.error('MFA verify error:', error);
    return NextResponse.json({ error: 'Failed to verify MFA' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorRecoveryCodes: []
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to disable MFA' }, { status: 500 });
  }
}
