import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = session.user.id;

    // 1. Get Medical Profile for readiness score
    const profile = await prisma.medicalProfile.findUnique({
      where: { userId },
      include: {
        allergies: true,
        conditions: true,
        medications: true,
        contacts: true,
      }
    });

    let readinessScore = 0;
    if (profile) {
      if (profile.bloodType) readinessScore += 20;
      if (profile.contacts.length > 0) readinessScore += 20;
      if (profile.allergies.length > 0) readinessScore += 20;
      if (profile.medications.length > 0) readinessScore += 20;
      if (profile.conditions.length > 0) readinessScore += 20;
    }

    // 2. Get Account Settings for public visibility
    const settings = await prisma.accountSettings.findUnique({
      where: { userId }
    });

    // 3. Get or Create Device Token (QR)
    let token = await prisma.deviceToken.findFirst({
      where: { userId, deviceType: 'QR', status: 'ACTIVE' }
    });

    if (!token) {
      token = await prisma.deviceToken.create({
        data: {
          userId,
          token: crypto.randomBytes(16).toString('hex'),
          deviceType: 'QR',
          status: 'ACTIVE'
        }
      });
    }

    // 4. Get Access History
    const accessLogs = await prisma.accessLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    return NextResponse.json({
      success: true,
      data: {
        profileId: profile?.id,
        readinessScore,
        isPublic: settings?.publicProfileEnabled || false,
        qrToken: token.token,
        lastScannedAt: token.lastScannedAt,
        accessLogs
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch emergency ID data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { action } = await req.json();
    const userId = session.user.id;

    if (action === 'regenerate_qr') {
      // Revoke old active tokens
      await prisma.deviceToken.updateMany({
        where: { userId, deviceType: 'QR', status: 'ACTIVE' },
        data: { status: 'REVOKED' }
      });

      // Create new token
      const newToken = await prisma.deviceToken.create({
        data: {
          userId,
          token: crypto.randomBytes(16).toString('hex'),
          deviceType: 'QR',
          status: 'ACTIVE'
        }
      });

      return NextResponse.json({ success: true, token: newToken.token });
    }

    if (action === 'toggle_visibility') {
      const { isPublic } = await req.json();
      await prisma.accountSettings.upsert({
        where: { userId },
        create: { userId, publicProfileEnabled: isPublic },
        update: { publicProfileEnabled: isPublic }
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}
