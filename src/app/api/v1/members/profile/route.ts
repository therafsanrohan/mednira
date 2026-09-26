import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const itemSchema = z.object({
  category: z.enum(['ALLERGY', 'CONDITION', 'MEDICATION', 'PROCEDURE', 'OTHER']),
  name: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  severity: z.enum(['CRITICAL', 'MODERATE', 'LOW']).optional(),
  visibility: z.enum(['EMERGENCY', 'TRUSTED', 'PRIVATE']).default('EMERGENCY'),
});

const contactSchema = z.object({
  name: z.string().min(1).max(100),
  relationship: z.string().min(1).max(50),
  phone: z.string().min(1).max(30),
  priority: z.number().int().min(1).default(1),
  notifyOnIncident: z.boolean().default(true),
});

const profileSchema = z.object({
  bloodType: z.string().max(10).optional(),
  dateOfBirth: z.string().optional(),
  organDonor: z.boolean().optional(),
  dnrStatus: z.boolean().optional(),
  emergencyNotes: z.string().max(1000).optional(),
  items: z.array(itemSchema).optional(),
  contacts: z.array(contactSchema).optional(),
});

/** POST /api/v1/members/profile — upsert the authenticated user's profile */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const parseResult = profileSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid profile data', details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { bloodType, dateOfBirth, organDonor, dnrStatus, emergencyNotes, items, contacts } =
      parseResult.data;

    const userId = session.user.id;

    // Upsert MedicalProfile
    const profile = await prisma.medicalProfile.upsert({
      where: { userId },
      create: {
        userId,
        bloodType,
        dateOfBirth,
        organDonor: organDonor ?? false,
        dnrStatus: dnrStatus ?? false,
        emergencyNotes,
      },
      update: {
        bloodType,
        dateOfBirth,
        organDonor,
        dnrStatus,
        emergencyNotes,
      },
    });

    // Replace items if provided
    if (items !== undefined) {
      await prisma.medicalItem.deleteMany({ where: { profileId: profile.id } });
      if (items.length > 0) {
        await prisma.medicalItem.createMany({
          data: items.map((item) => ({
            profileId: profile.id,
            category: item.category,
            name: item.name,
            description: item.description ?? null,
            severity: item.severity ?? null,
            visibility: item.visibility,
          })),
        });
      }
    }

    // Replace contacts if provided
    if (contacts !== undefined) {
      await prisma.emergencyContact.deleteMany({ where: { profileId: profile.id } });
      if (contacts.length > 0) {
        await prisma.emergencyContact.createMany({
          data: contacts.map((c) => ({
            profileId: profile.id,
            name: c.name,
            relationship: c.relationship,
            phone: c.phone,
            priority: c.priority,
            notifyOnIncident: c.notifyOnIncident,
          })),
        });
      }
    }

    // Recalculate readiness score
    const readinessScore = calculateReadiness({ bloodType, dateOfBirth, emergencyNotes, items, contacts });
    await prisma.medicalProfile.update({
      where: { id: profile.id },
      data: { readinessScore },
    });

    return NextResponse.json({
      message: 'Medical profile saved successfully',
      readinessScore,
    });
  } catch (error: any) {
    console.error('[API POST /api/v1/members/profile] Error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

/** GET /api/v1/members/profile — fetch the authenticated user's full profile */
export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: {
          include: {
            items: { orderBy: { createdAt: 'asc' } },
            contacts: { orderBy: { priority: 'asc' } },
          },
        },
        deviceTokens: {
          where: { status: { not: 'REVOKED' } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error('[API GET /api/v1/members/profile] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

// ── Readiness score calculation ─────────────────────────────────────────────
function calculateReadiness(data: {
  bloodType?: string;
  dateOfBirth?: string;
  emergencyNotes?: string;
  items?: Array<{ category: string }>;
  contacts?: Array<{ name: string }>;
}): number {
  let score = 0;
  const weights = {
    bloodType: 20,
    dateOfBirth: 10,
    emergencyNotes: 15,
    hasAllergy: 15,
    hasCondition: 15,
    hasMedication: 10,
    hasContact: 15,
  };

  if (data.bloodType) score += weights.bloodType;
  if (data.dateOfBirth) score += weights.dateOfBirth;
  if (data.emergencyNotes) score += weights.emergencyNotes;
  if (data.items?.some((i) => i.category === 'ALLERGY')) score += weights.hasAllergy;
  if (data.items?.some((i) => i.category === 'CONDITION')) score += weights.hasCondition;
  if (data.items?.some((i) => i.category === 'MEDICATION')) score += weights.hasMedication;
  if (data.contacts && data.contacts.length > 0) score += weights.hasContact;

  return Math.min(score, 100);
}
