import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Visibility } from '@prisma/client';

const contactSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required').max(100),
  relationship: z.string().min(1, 'Relationship is required').max(50),
  phone: z.string().min(1, 'Phone is required').max(30),
  secondaryPhone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  priority: z.coerce.number().int().min(1).default(1),
  preferredContactMethod: z.string().optional(),
  notifyOnIncident: z.boolean().default(true),
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

    const data = await prisma.emergencyContact.findMany({
      where: { profileId: profile.id },
      orderBy: { priority: 'asc' }
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error('[GET /api/v1/members/contacts]', error);
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const parsed = contactSchema.safeParse(body);
    
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
      const existing = await prisma.emergencyContact.findUnique({ where: { id: data.id } });
      if (!existing || existing.profileId !== profile.id) {
        return NextResponse.json({ error: 'Not found or forbidden' }, { status: 403 });
      }
      
      const updated = await prisma.emergencyContact.update({
        where: { id: data.id },
        data: {
          name: data.name,
          relationship: data.relationship,
          phone: data.phone,
          secondaryPhone: data.secondaryPhone,
          email: data.email || null,
          priority: data.priority,
          preferredContactMethod: data.preferredContactMethod,
          notifyOnIncident: data.notifyOnIncident,
          visibility: data.visibility
        }
      });
      return NextResponse.json({ data: updated });
    } else {
      // Create
      const created = await prisma.emergencyContact.create({
        data: {
          profileId: profile.id,
          name: data.name,
          relationship: data.relationship,
          phone: data.phone,
          secondaryPhone: data.secondaryPhone,
          email: data.email || null,
          priority: data.priority,
          preferredContactMethod: data.preferredContactMethod,
          notifyOnIncident: data.notifyOnIncident,
          visibility: data.visibility
        }
      });
      return NextResponse.json({ data: created }, { status: 201 });
    }
  } catch (error) {
    console.error('[POST /api/v1/members/contacts]', error);
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

    const existing = await prisma.emergencyContact.findUnique({ where: { id } });
    if (!existing || existing.profileId !== profile.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.emergencyContact.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/v1/members/contacts]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
