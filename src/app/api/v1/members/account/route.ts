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
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const data = accountSchema.parse(body);
    const userId = session.user.id;

    if (data.name !== undefined) {
      await prisma.user.update({
        where: { id: userId },
        data: { name: data.name, fullName: data.name }
      });
    }

    const profileData = {
      phoneNumber: data.phoneNumber,
      address: data.address,
      city: data.city,
      country: data.country,
      gender: data.gender,
    };

    const userProfile = await prisma.profile.upsert({
      where: { userId },
      create: { userId, ...profileData },
      update: { ...profileData }
    });

    return NextResponse.json({ success: true, userProfile });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update account profile' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Ensure they confirm deletion
    const { searchParams } = new URL(req.url);
    if (searchParams.get('confirm') !== 'true') {
      return NextResponse.json({ error: 'Confirmation required' }, { status: 400 });
    }

    // Cascade delete handles Profile, MedicalProfile, etc based on schema onDelete: Cascade
    await prisma.user.delete({
      where: { id: session.user.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
