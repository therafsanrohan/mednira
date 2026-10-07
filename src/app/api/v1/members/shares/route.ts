import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import * as z from 'zod';

const schema = z.object({
  id: z.string().optional(),
  sharedWithName: z.string().min(1, 'Name is required'),
  accessLevel: z.enum(['Full', 'Limited']),
  permissions: z.array(z.string()).default([]),
  purpose: z.string().optional(),
  expiresAt: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const shares = await prisma.medicalShare.findMany({
      where: { 
        profile: { userId: session.user.id },
        isRevoked: false 
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ shares });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch shares' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const data = schema.parse(body);

    const profile = await prisma.medicalProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    });

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    const share = await prisma.medicalShare.create({
      data: {
        profileId: profile.id,
        sharedWithName: data.sharedWithName,
        accessLevel: data.accessLevel,
        permissions: data.permissions,
        purpose: data.purpose,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      }
    });

    return NextResponse.json({ success: true, data: share });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create share' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const profile = await prisma.medicalProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    });

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    // Logical delete (revoke) instead of hard delete
    await prisma.medicalShare.update({
      where: { id, profileId: profile.id },
      data: { isRevoked: true }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to revoke share' }, { status: 400 });
  }
}
