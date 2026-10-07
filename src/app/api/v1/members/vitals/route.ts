import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Visibility } from '@prisma/client';

const vitalSchema = z.object({
  id: z.string().optional(),
  vitalType: z.string().min(1, 'Type is required').max(100),
  value: z.string().min(1, 'Value is required').max(100),
  unit: z.string().optional(),
  measurementDate: z.string().transform(val => new Date(val)),
  source: z.string().default('Manual Entry'),
  visibility: z.nativeEnum(Visibility).default(Visibility.PRIVATE),
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

    const data = await prisma.vital.findMany({
      where: { profileId: profile.id },
      orderBy: { measurementDate: 'desc' },
      take: 20 // Keep it lightweight
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error('[GET /api/v1/members/vitals]', error);
    return NextResponse.json({ error: 'Failed to fetch vitals' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const parsed = vitalSchema.safeParse(body);
    
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
      const existing = await prisma.vital.findUnique({ where: { id: data.id } });
      if (!existing || existing.profileId !== profile.id) {
        return NextResponse.json({ error: 'Not found or forbidden' }, { status: 403 });
      }
      
      const updated = await prisma.vital.update({
        where: { id: data.id },
        data: {
          vitalType: data.vitalType,
          value: data.value,
          unit: data.unit,
          measurementDate: data.measurementDate,
          source: data.source,
          visibility: data.visibility
        }
      });
      return NextResponse.json({ data: updated });
    } else {
      // Create
      const created = await prisma.vital.create({
        data: {
          profileId: profile.id,
          vitalType: data.vitalType,
          value: data.value,
          unit: data.unit,
          measurementDate: data.measurementDate,
          source: data.source,
          visibility: data.visibility
        }
      });
      return NextResponse.json({ data: created }, { status: 201 });
    }
  } catch (error) {
    console.error('[POST /api/v1/members/vitals]', error);
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

    const existing = await prisma.vital.findUnique({ where: { id } });
    if (!existing || existing.profileId !== profile.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.vital.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/v1/members/vitals]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
