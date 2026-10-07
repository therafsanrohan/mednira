import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { VerificationStatus, Visibility } from '@prisma/client';

const medicationSchema = z.object({
  id: z.string().optional(),
  genericName: z.string().min(1, 'Generic Name is required').max(200),
  brandName: z.string().optional(),
  strength: z.string().optional(),
  dosage: z.string().optional(),
  route: z.string().optional(),
  frequency: z.string().optional(),
  timing: z.string().optional(),
  status: z.string().default('Active'),
  startDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  endDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  prescribingDoctor: z.string().optional(),
  indication: z.string().optional(),
  instructions: z.string().optional(),
  visibility: z.nativeEnum(Visibility).default(Visibility.PUBLIC_EMERGENCY),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const profile = await prisma.medicalProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    });

    if (!profile) return NextResponse.json({ data: [] });

    const data = await prisma.medication.findMany({
      where: { profileId: profile.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error('[GET /api/v1/members/medications]', error);
    return NextResponse.json({ error: 'Failed to fetch medications' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const parsed = medicationSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.format() }, { status: 400 });
    }

    const data = parsed.data;

    let profile = await prisma.medicalProfile.findUnique({ where: { userId: session.user.id } });
    if (!profile) {
      profile = await prisma.medicalProfile.create({ data: { userId: session.user.id } });
    }

    if (data.id) {
      // Update
      const existing = await prisma.medication.findUnique({ where: { id: data.id } });
      if (!existing || existing.profileId !== profile.id) {
        return NextResponse.json({ error: 'Not found or forbidden' }, { status: 403 });
      }
      
      const updated = await prisma.medication.update({
        where: { id: data.id },
        data: {
          genericName: data.genericName,
          brandName: data.brandName,
          strength: data.strength,
          dosage: data.dosage,
          route: data.route,
          frequency: data.frequency,
          timing: data.timing,
          status: data.status,
          startDate: data.startDate,
          endDate: data.endDate,
          prescribingDoctor: data.prescribingDoctor,
          indication: data.indication,
          instructions: data.instructions,
          visibility: data.visibility
        }
      });
      return NextResponse.json({ data: updated });
    } else {
      // Create
      const created = await prisma.medication.create({
        data: {
          profileId: profile.id,
          genericName: data.genericName,
          brandName: data.brandName,
          strength: data.strength,
          dosage: data.dosage,
          route: data.route,
          frequency: data.frequency,
          timing: data.timing,
          status: data.status,
          startDate: data.startDate,
          endDate: data.endDate,
          prescribingDoctor: data.prescribingDoctor,
          indication: data.indication,
          instructions: data.instructions,
          visibility: data.visibility
        }
      });
      return NextResponse.json({ data: created }, { status: 201 });
    }
  } catch (error) {
    console.error('[POST /api/v1/members/medications]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const profile = await prisma.medicalProfile.findUnique({ where: { userId: session.user.id } });
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    const existing = await prisma.medication.findUnique({ where: { id } });
    if (!existing || existing.profileId !== profile.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.medication.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/v1/members/medications]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
