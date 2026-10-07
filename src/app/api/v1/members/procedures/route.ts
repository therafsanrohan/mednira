import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import * as z from 'zod';

const schema = z.object({
  id: z.string().optional(),
  procedureName: z.string().min(1),
  date: z.string().optional().nullable(),
  hospital: z.string().optional().nullable(),
  doctor: z.string().optional().nullable(),
  reason: z.string().optional().nullable(),
  outcome: z.string().optional().nullable(),
  complications: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
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

    const procedure = data.id
      ? await prisma.procedure.update({
          where: { id: data.id, profileId: profile.id },
          data: {
            procedureName: data.procedureName,
            date: data.date ? new Date(data.date) : null,
            hospital: data.hospital,
            doctor: data.doctor,
            reason: data.reason,
            outcome: data.outcome,
            complications: data.complications,
            notes: data.notes,
            visibility: data.visibility as any,
          }
        })
      : await prisma.procedure.create({
          data: {
            profileId: profile.id,
            procedureName: data.procedureName,
            date: data.date ? new Date(data.date) : null,
            hospital: data.hospital,
            doctor: data.doctor,
            reason: data.reason,
            outcome: data.outcome,
            complications: data.complications,
            notes: data.notes,
            visibility: data.visibility as any,
          }
        });

    return NextResponse.json({ success: true, data: procedure });
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

    await prisma.procedure.delete({
      where: { id, profileId: profile.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 400 });
  }
}
