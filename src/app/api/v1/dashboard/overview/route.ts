import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Run independent queries concurrently
    const [user, emergencyId] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          fullName: true,
          profile: {
            select: {
              bloodType: true,
              allergies: {
                where: { severity: { in: ['SEVERE', 'LIFE_THREATENING'] } },
                select: { id: true, substance: true, severity: true },
                take: 5
              },
              medications: {
                where: { status: 'Active' },
                select: { id: true, genericName: true, dosage: true },
                take: 3
              },
              contacts: {
                where: { priority: 1 },
                select: { id: true, name: true, relationship: true, phone: true },
                take: 1
              }
            }
          }
        }
      }),
      prisma.accountSettings.findUnique({
        where: { userId },
        select: {
          publicProfileEnabled: true,
        }
      })
    ]);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        user,
        emergency: {
          isPublic: emergencyId?.publicProfileEnabled || false
        }
      }
    });

  } catch (error) {
    console.error('[API GET /api/v1/dashboard/overview] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard overview' }, { status: 500 });
  }
}
