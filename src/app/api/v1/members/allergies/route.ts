import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { VerificationStatus, Visibility, AllergySeverity } from '@prisma/client';

const allergySchema = z.object({
  id: z.string().optional(),
  substance: z.string().min(1, 'Substance is required').max(200),
  category: z.string().min(1, 'Category is required'),
  reaction: z.string().optional(),
  severity: z.nativeEnum(AllergySeverity),
  criticality: z.string().optional(),
  status: z.string().default('Active'),
  onsetDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
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

    const allergies = await prisma.allergy.findMany({
      where: { profileId: profile.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ data: allergies });
  } catch (error) {
    console.error('[GET /api/v1/members/allergies]', error);
    return NextResponse.json({ error: 'Failed to fetch allergies' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const parsed = allergySchema.safeParse(body);
    
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
      const existing = await prisma.allergy.findUnique({ where: { id: data.id } });
      if (!existing || existing.profileId !== profile.id) {
        return NextResponse.json({ error: 'Not found or forbidden' }, { status: 403 });
      }
      
      const updated = await prisma.allergy.update({
        where: { id: data.id },
        data: {
          substance: data.substance,
          category: data.category,
          reaction: data.reaction,
          severity: data.severity,
          criticality: data.criticality,
          status: data.status,
          onsetDate: data.onsetDate,
          notes: data.notes,
          visibility: data.visibility
        }
      });
      return NextResponse.json({ data: updated });
    } else {
      // Create
      const created = await prisma.allergy.create({
        data: {
          profileId: profile.id,
          substance: data.substance,
          category: data.category,
          reaction: data.reaction,
          severity: data.severity,
          criticality: data.criticality,
          status: data.status,
          onsetDate: data.onsetDate,
          notes: data.notes,
          visibility: data.visibility
        }
      });
      return NextResponse.json({ data: created }, { status: 201 });
    }
  } catch (error) {
    console.error('[POST /api/v1/members/allergies]', error);
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

    const existing = await prisma.allergy.findUnique({ where: { id } });
    if (!existing || existing.profileId !== profile.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.allergy.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/v1/members/allergies]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
