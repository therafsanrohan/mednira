import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { DeviceService, DEVICE_STATUS, DeviceStatus } from '@/lib/services/device.service';
import { z } from 'zod';

const updateDeviceSchema = z.object({
  action: z.enum(['FREEZE', 'UNFREEZE', 'REVOKE', 'REPLACE']),
  label: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    const parseResult = updateDeviceSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { action, label } = parseResult.data;
    const userId = session.user.id;

    if (action === 'REPLACE') {
      const newDevice = await DeviceService.replaceDeviceToken(id, userId, label);
      return NextResponse.json({
        message: 'Device replaced. Old token deactivated, new token issued.',
        newDevice: {
          id: newDevice.id,
          token: newDevice.token,
          label: newDevice.label,
          status: newDevice.status,
        },
      });
    }

    let targetStatus: DeviceStatus = DEVICE_STATUS.ACTIVE;
    if (action === 'FREEZE') targetStatus = DEVICE_STATUS.FROZEN;
    if (action === 'UNFREEZE') targetStatus = DEVICE_STATUS.ACTIVE;
    if (action === 'REVOKE') targetStatus = DEVICE_STATUS.REVOKED;

    const updated = await DeviceService.updateDeviceStatus(id, userId, targetStatus);

    return NextResponse.json({
      message: `Device status updated to ${updated.status}`,
      device: {
        id: updated.id,
        token: updated.token,
        status: updated.status,
      },
    });
  } catch (error: any) {
    console.error('[API PATCH /api/v1/devices/[id]/status] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update device status' },
      { status: 400 }
    );
  }
}
