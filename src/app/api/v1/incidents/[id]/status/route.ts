import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { IncidentService, INCIDENT_STATUS, IncidentStatus } from '@/lib/services/incident.service';
import { z } from 'zod';

const statusSchema = z.object({
  status: z.enum([
    INCIDENT_STATUS.ACKNOWLEDGED,
    INCIDENT_STATUS.RESPONDING,
    INCIDENT_STATUS.ESCALATED,
    INCIDENT_STATUS.HANDOFF,
    INCIDENT_STATUS.RESOLVED,
    INCIDENT_STATUS.FALSE_ALARM,
    INCIDENT_STATUS.CANCELLED,
  ]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Responders and above can update incident status
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    const parseResult = statusSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid incident status', details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const updatedIncident = await IncidentService.updateIncidentStatus(
      id,
      parseResult.data.status as IncidentStatus
    );

    return NextResponse.json({
      message: `Incident status updated to ${updatedIncident.status}`,
      incident: {
        id: updatedIncident.id,
        status: updatedIncident.status,
        updatedAt: updatedIncident.updatedAt,
        resolvedAt: updatedIncident.resolvedAt,
      },
    });
  } catch (error: any) {
    console.error('[API PATCH /api/v1/incidents/[id]/status] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update incident status' },
      { status: 400 }
    );
  }
}
