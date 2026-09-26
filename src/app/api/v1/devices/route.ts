import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { DeviceService } from '@/lib/services/device.service';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createDeviceSchema = z.object({
  label: z.string().min(1).max(100).optional(),
  deviceType: z.enum(['QR', 'NFC']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const parseResult = createDeviceSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { label, deviceType } = parseResult.data;
    const device = await DeviceService.createDeviceToken(
      session.user.id,
      label,
      deviceType
    );

    return NextResponse.json(
      {
        message: 'Emergency QR token created successfully',
        device: {
          id: device.id,
          token: device.token,
          label: device.label,
          deviceType: device.deviceType,
          status: device.status,
          createdAt: device.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[API POST /api/v1/devices] Error:', error);
    return NextResponse.json({ error: 'Failed to create device token' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const devices = await prisma.deviceToken.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ devices });
  } catch (error: any) {
    console.error('[API GET /api/v1/devices] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch devices' }, { status: 500 });
  }
}
