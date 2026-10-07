import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import * as z from 'zod';

const schema = z.object({
  id: z.string().optional(),
  hospital: z.string().min(1),
  admissionDate: z.string().min(1),
  dischargeDate: z.string().optional().nullable(),
  reason: z.string().optional().nullable(),
  diagnosis: z.string().optional().nullable(),
  procedures: z.string().optional().nullable(),
  attendingDoctor: z.string().optional().nullable(),
  visibility: z.enum(['PUBLIC_EMERGENCY', 'EMERGENCY_RESPONDER', 'DOCTOR_ACCESS', 'PRIVATE']).default('DOCTOR_ACCESS'),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const data = schema.parse(body);

    const profile = await prisma.medicalProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    });

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    const hospitalization = data.id
      ? await prisma.hospitalization.update({
          where: { id: data.id, profileId: profile.id },
          data: {
            hospital: data.hospital,
            admissionDate: new Date(data.admissionDate),
            dischargeDate: data.dischargeDate ? new Date(data.dischargeDate) : null,
            reason: data.reason,
            diagnosis: data.diagnosis,
            procedures: data.procedures,
            attendingDoctor: data.attendingDoctor,
            visibility: data.visibility as any,
          }
        })
      : await prisma.hospitalization.create({
          data: {
            profileId: profile.id,
            hospital: data.hospital,
            admissionDate: new Date(data.admissionDate),
            dischargeDate: data.dischargeDate ? new Date(data.dischargeDate) : null,
            reason: data.reason,
            diagnosis: data.diagnosis,
            procedures: data.procedures,
            attendingDoctor: data.attendingDoctor,
            visibility: data.visibility as any,
          }
        });

    return NextResponse.json({ success: true, data: hospitalization });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const profile = await prisma.medicalProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    });

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    await prisma.hospitalization.delete({
      where: { id, profileId: profile.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 400 });
  }
}
