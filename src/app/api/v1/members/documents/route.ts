import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import * as z from 'zod';

const schema = z.object({
  id: z.string().optional(),
  documentType: z.string().min(1),
  title: z.string().min(1),
  date: z.string().optional().nullable(),
  healthcareProvider: z.string().optional().nullable(),
  hospitalClinic: z.string().optional().nullable(),
  fileUrl: z.string().min(1),
  visibility: z.enum(['PUBLIC_EMERGENCY', 'EMERGENCY_RESPONDER', 'DOCTOR_ACCESS', 'PRIVATE']).default('PRIVATE'),
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

    const document = data.id
      ? await prisma.medicalDocument.update({
          where: { id: data.id, profileId: profile.id },
          data: {
            documentType: data.documentType,
            title: data.title,
            date: data.date ? new Date(data.date) : null,
            healthcareProvider: data.healthcareProvider,
            hospitalClinic: data.hospitalClinic,
            fileUrl: data.fileUrl,
            visibility: data.visibility as any,
          }
        })
      : await prisma.medicalDocument.create({
          data: {
            profileId: profile.id,
            documentType: data.documentType,
            title: data.title,
            date: data.date ? new Date(data.date) : null,
            healthcareProvider: data.healthcareProvider,
            hospitalClinic: data.hospitalClinic,
            fileUrl: data.fileUrl,
            visibility: data.visibility as any,
          }
        });

    return NextResponse.json({ success: true, data: document });
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

    await prisma.medicalDocument.delete({
      where: { id, profileId: profile.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 400 });
  }
}
