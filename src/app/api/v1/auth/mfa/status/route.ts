import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { twoFactorEnabled: true }
    });

    return NextResponse.json({
      enabled: user?.twoFactorEnabled || false
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get MFA status' }, { status: 500 });
  }
}
