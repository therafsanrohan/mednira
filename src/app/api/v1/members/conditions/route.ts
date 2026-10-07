import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { VerificationStatus, Visibility } from '@prisma/client';

const conditionSchema = z.object({
  id: z.string().optional(),
  conditionName: z.string().min(1, 'Condition Name is required').max(200),
  status: z.string().default('Active'),
  severity: z.string().optional(),
  diagnosisDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  diagnosedBy: z.string().optional(),
  healthcareProvider: z.string().optional(),
  hospitalClinic: z.string().optional(),
  notes: z.string().optional(),
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

    const data = await prisma.condition.findMany({
      where: { profileId: profile.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error('[GET /api/v1/members/conditions]', error);
    return NextResponse.json({ error: 'Failed to fetch conditions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const parsed = conditionSchema.safeParse(body);
    
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
      const existing = await prisma.condition.findUnique({ where: { id: data.id } });
      if (!existing || existing.profileId !== profile.id) {
        return NextResponse.json({ error: 'Not found or forbidden' }, { status: 403 });
      }
      
      const updated = await prisma.condition.update({
        where: { id: data.id },
        data: {
          conditionName: data.conditionName,
          status: data.status,
          severity: data.severity,
          diagnosisDate: data.diagnosisDate,
          diagnosedBy: data.diagnosedBy,
          healthcareProvider: data.healthcareProvider,
          hospitalClinic: data.hospitalClinic,
          notes: data.notes,
          visibility: data.visibility
        }
      });
      return NextResponse.json({ data: updated });
    } else {
      // Create
      const created = await prisma.condition.create({
        data: {
          profileId: profile.id,
          conditionName: data.conditionName,
          status: data.status,
          severity: data.severity,
          diagnosisDate: data.diagnosisDate,
          diagnosedBy: data.diagnosedBy,
          healthcareProvider: data.healthcareProvider,
          hospitalClinic: data.hospitalClinic,
          notes: data.notes,
          visibility: data.visibility
        }
      });
      return NextResponse.json({ data: created }, { status: 201 });
    }
  } catch (error) {
    console.error('[POST /api/v1/members/conditions]', error);
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

    const existing = await prisma.condition.findUnique({ where: { id } });
    if (!existing || existing.profileId !== profile.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.condition.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/v1/members/conditions]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
