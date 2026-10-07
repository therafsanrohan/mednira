import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
// @ts-ignore
const { authenticator } = require('otplib');
import QRCode from 'qrcode';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate a new secret
    const secret = authenticator.generateSecret();
    
    // Generate an OTPAuth URI
    const otpauth = authenticator.keyuri(user.email, 'MedNira', secret);
    
    // Create a QR Code data URL
    const qrCodeDataUrl = await QRCode.toDataURL(otpauth);

    // Save secret temporarily in DB (or in cache) until verification
    // For simplicity, we save it directly, but don't enable it yet.
    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorSecret: secret, twoFactorEnabled: false }
    });

    return NextResponse.json({
      secret,
      qrCodeDataUrl
    });
  } catch (error) {
    console.error('MFA setup error:', error);
    return NextResponse.json({ error: 'Failed to generate MFA setup' }, { status: 500 });
  }
}
