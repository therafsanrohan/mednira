import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import * as z from 'zod';

const schema = z.object({
  id: z.string().optional(),
  vaccine: z.string().min(1),
  doseNumber: z.number().int().optional().or(z.string().transform(v => parseInt(v)).optional()),
  date: z.string().optional().nullable(),
  manufacturer: z.string().optional().nullable(),
  batchNumber: z.string().optional().nullable(),
  administeredBy: z.string().optional().nullable(),
  facility: z.string().optional().nullable(),
  nextDose: z.string().optional().nullable(),
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

    const vaccination = data.id
      ? await prisma.vaccination.update({
          where: { id: data.id, profileId: profile.id },
          data: {
            vaccine: data.vaccine,
            doseNumber: data.doseNumber,
            date: data.date ? new Date(data.date) : null,
            manufacturer: data.manufacturer,
            batchNumber: data.batchNumber,
            administeredBy: data.administeredBy,
            facility: data.facility,
            nextDose: data.nextDose ? new Date(data.nextDose) : null,
            visibility: data.visibility as any,
          }
        })
      : await prisma.vaccination.create({
          data: {
            profileId: profile.id,
            vaccine: data.vaccine,
            doseNumber: data.doseNumber,
            date: data.date ? new Date(data.date) : null,
            manufacturer: data.manufacturer,
            batchNumber: data.batchNumber,
            administeredBy: data.administeredBy,
            facility: data.facility,
            nextDose: data.nextDose ? new Date(data.nextDose) : null,
            visibility: data.visibility as any,
          }
        });

    return NextResponse.json({ success: true, data: vaccination });
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

    await prisma.vaccination.delete({
      where: { id, profileId: profile.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 400 });
  }
}
