import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const accountSchema = z.object({
  name: z.string().min(1).optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  gender: z.string().optional(),
  bio: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const data = accountSchema.parse(body);
    const userId = session.user.id;

    // Update User basic info
    if (data.name !== undefined) {
      await prisma.user.update({
        where: { id: userId },
        data: { name: data.name, fullName: data.name }
      });
    }

    // Upsert UserProfile
    const profileData = {
      phoneNumber: data.phoneNumber,
      address: data.address,
      city: data.city,
      country: data.country,
      gender: data.gender,
      bio: data.bio
    };

    const userProfile = await prisma.profile.upsert({
      where: { userId },
      create: { userId, ...profileData },
      update: { ...profileData }
    });

    return NextResponse.json({ success: true, userProfile });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update account profile' }, { status: 400 });
  }
}
