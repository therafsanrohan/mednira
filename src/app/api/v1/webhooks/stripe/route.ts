import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2022-11-15' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe keys missing' }, { status: 400 });
  }

  const payload = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed:`, err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      const { userId, planId, interval } = session.metadata || {};

      if (userId && planId) {
        // Create or update subscription
        const currentDate = new Date();
        const endDate = new Date();
        if (interval === 'YEARLY') {
          endDate.setFullYear(currentDate.getFullYear() + 1);
        } else {
          endDate.setMonth(currentDate.getMonth() + 1);
        }

        const existing = await prisma.subscription.findFirst({
          where: { userId }
        });

        if (existing) {
          await prisma.subscription.update({
            where: { id: existing.id },
            data: {
              planId,
              status: 'ACTIVE',
              currentPeriodStart: currentDate,
              currentPeriodEnd: endDate,
            },
          });
        } else {
          await prisma.subscription.create({
            data: {
              userId,
              planId,
              status: 'ACTIVE',
              currentPeriodStart: currentDate,
              currentPeriodEnd: endDate,
            }
          });
        }
      }
    } else if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      // In a real setup, we would link the Stripe Customer ID to our user and mark it cancelled
      // For this implementation, we would need to fetch the User by customer ID if we stored it
      console.log('Subscription cancelled:', subscription.id);
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
