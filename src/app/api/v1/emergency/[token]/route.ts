import { NextRequest, NextResponse } from 'next/server';
import { DeviceService } from '@/lib/services/device.service';
import { buildEmergencyProfileDTO } from '@/lib/dto/emergency.dto';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Missing emergency token' },
        { status: 400 }
      );
    }

    const result = await DeviceService.resolveEmergencyToken(token);

    if (result.status === 'FROZEN') {
      return NextResponse.json(
        { error: 'This device emergency profile is currently frozen by the member.' },
        { status: 403 }
      );
    }

    if (result.status === 'REVOKED') {
      return NextResponse.json(
        { error: 'This emergency device token has been revoked or replaced.' },
        { status: 410 }
      );
    }

    if (result.status !== 'ACTIVE' || !result.user) {
      return NextResponse.json(
        { error: 'Emergency profile not found or inactive' },
        { status: 404 }
      );
    }

    // Build sanitized, privacy-safe DTO
    const safeProfileDTO = buildEmergencyProfileDTO(token, result.user);

    return NextResponse.json(safeProfileDTO, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    console.error('[API GET /api/v1/emergency/[token]] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error processing emergency read' },
      { status: 500 }
    );
  }
}
