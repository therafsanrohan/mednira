import { NextRequest, NextResponse } from 'next/server';
import { DeviceService } from '@/lib/services/device.service';
import { IncidentService } from '@/lib/services/incident.service';
import { z } from 'zod';

const createIncidentSchema = z.object({
  locationLat: z.number().optional(),
  locationLng: z.number().optional(),
  locationAddress: z.string().max(300).optional(),
  responderNote: z.string().max(500).optional(),
  responderContact: z.string().max(100).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const resolution = await DeviceService.resolveEmergencyToken(token);
    if (resolution.status !== 'ACTIVE' || !resolution.user || !resolution.device) {
      return NextResponse.json(
        { error: 'Cannot trigger incident for inactive or missing device token' },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const parseResult = createIncidentSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid incident request payload', details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const payload = parseResult.data;

    const { incident, isDuplicate } = await IncidentService.startEmergency({
      deviceTokenId: resolution.device.id,
      userId: resolution.user.id,
      locationLat: payload.locationLat,
      locationLng: payload.locationLng,
      locationAddress: payload.locationAddress,
      responderNote: payload.responderNote,
      responderContact: payload.responderContact,
    });

    return NextResponse.json(
      {
        message: isDuplicate
          ? 'An active emergency incident is already in progress.'
          : 'Emergency incident initiated successfully. Emergency contacts notified.',
        incidentId: incident.id,
        status: incident.status,
        createdAt: incident.createdAt,
      },
      { status: isDuplicate ? 200 : 201 }
    );
  } catch (error: any) {
    console.error('[API POST /api/v1/emergency/[token]/incident] Error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate emergency incident' },
      { status: 500 }
    );
  }
}
