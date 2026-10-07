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

    // Fetch active subscription
    const subscription = await prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE' },
      include: {
        plan: true,
        payments: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!subscription) {
      // Return default free tier
      return NextResponse.json({
        subscription: null,
        plan: {
          name: 'Free Basic',
          status: 'ACTIVE',
          price: 0,
          currency: '৳',
          features: ['Basic Medical ID', '1 Emergency Contact', 'Standard QR Code']
        },
        payments: []
      });
    }

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      },
      plan: {
        name: subscription.plan.name,
        price: subscription.plan.price,
        currency: subscription.plan.currency,
        billingPeriod: subscription.plan.billingPeriod,
        features: typeof subscription.plan.features === 'string' ? JSON.parse(subscription.plan.features) : subscription.plan.features,
      },
      payments: subscription.payments
    });
  } catch (error) {
    console.error('Fetch subscription error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
