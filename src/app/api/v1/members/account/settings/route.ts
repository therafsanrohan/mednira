import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const settingsSchema = z.object({
  emailNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
  twoFactorEnabled: z.boolean().optional(),
  publicProfileEnabled: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const settings = await prisma.accountSettings.findUnique({
      where: { userId: session.user.id }
    });

    return NextResponse.json({ settings: settings || {} });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch account settings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const data = settingsSchema.parse(body);

    const settings = await prisma.accountSettings.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        ...data,
      },
      update: {
        ...data,
      },
    });

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 400 });
  }
}
