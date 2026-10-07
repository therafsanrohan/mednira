import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const allergySchema = z.object({
  substance: z.string().min(1).max(200),
  category: z.string(),
  reaction: z.string().optional(),
  severity: z.enum(['MILD', 'MODERATE', 'SEVERE', 'LIFE_THREATENING']),
  criticality: z.string().optional(),
  status: z.string().default('Active'),
  visibility: z.enum(['PUBLIC_EMERGENCY', 'EMERGENCY_RESPONDER', 'DOCTOR_ACCESS', 'PRIVATE']).default('PUBLIC_EMERGENCY'),
});

const conditionSchema = z.object({
  conditionName: z.string().min(1),
  status: z.string().default('Active'),
});

const medicationSchema = z.object({
  genericName: z.string().min(1),
  status: z.string().default('Active'),
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
  rhFactor: z.string().max(10).optional(),
  dateOfBirth: z.string().optional(),
  organDonor: z.boolean().optional(),
  dnrStatus: z.boolean().optional(),
  emergencyNotes: z.string().max(1000).optional(),
  height: z.string().max(50).optional(),
  weight: z.string().max(50).optional(),
  allergies: z.array(allergySchema).optional(),
  conditions: z.array(conditionSchema).optional(),
  medications: z.array(medicationSchema).optional(),
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

    const { bloodType, rhFactor, dateOfBirth, organDonor, dnrStatus, emergencyNotes, height, weight, allergies, conditions, medications, contacts } =
      parseResult.data;

    const userId = session.user.id;

    // Upsert MedicalProfile
    const profile = await prisma.medicalProfile.upsert({
      where: { userId },
      create: {
        userId,
        bloodType,
        rhFactor,
        dateOfBirth,
        organDonor: organDonor ?? false,
        dnrStatus: dnrStatus ?? false,
        emergencyNotes,
        height,
        weight,
      },
      update: {
        bloodType,
        rhFactor,
        dateOfBirth,
        organDonor,
        dnrStatus,
        emergencyNotes,
        height,
        weight,
      },
    });

    if (allergies !== undefined) {
      await prisma.allergy.deleteMany({ where: { profileId: profile.id } });
      if (allergies.length > 0) {
        await prisma.allergy.createMany({
          data: allergies.map((item) => ({
            profileId: profile.id,
            ...item
          })),
        });
      }
    }

    if (conditions !== undefined) {
      await prisma.condition.deleteMany({ where: { profileId: profile.id } });
      if (conditions.length > 0) {
        await prisma.condition.createMany({
          data: conditions.map((item) => ({
            profileId: profile.id,
            ...item
          })),
        });
      }
    }

    if (medications !== undefined) {
      await prisma.medication.deleteMany({ where: { profileId: profile.id } });
      if (medications.length > 0) {
        await prisma.medication.createMany({
          data: medications.map((item) => ({
            profileId: profile.id,
            ...item
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
            ...c
          })),
        });
      }
    }

    // Recalculate readiness score
    const readinessScore = calculateReadiness({ bloodType, dateOfBirth, emergencyNotes, allergies, conditions, medications, contacts });
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
        userProfile: true,
        profile: {
          include: {
            allergies: { orderBy: { createdAt: 'asc' } },
            conditions: { orderBy: { createdAt: 'asc' } },
            medications: { orderBy: { createdAt: 'asc' } },
            contacts: { orderBy: { priority: 'asc' } },
            vitals: { orderBy: { measurementDate: 'desc' }, take: 20 },
            labReports: { orderBy: { testDate: 'desc' }, take: 20 },
            vaccinations: { orderBy: { date: 'desc' } },
            procedures: { orderBy: { date: 'desc' } },
            hospitalizations: { orderBy: { admissionDate: 'desc' } },
            documents: { orderBy: { createdAt: 'desc' } },
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
  allergies?: Array<any>;
  conditions?: Array<any>;
  medications?: Array<any>;
  contacts?: Array<any>;
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
  if (data.allergies && data.allergies.length > 0) score += weights.hasAllergy;
  if (data.conditions && data.conditions.length > 0) score += weights.hasCondition;
  if (data.medications && data.medications.length > 0) score += weights.hasMedication;
  if (data.contacts && data.contacts.length > 0) score += weights.hasContact;

  return Math.min(score, 100);
}
