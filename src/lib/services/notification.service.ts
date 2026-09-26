import { prisma } from '@/lib/prisma';

export interface DispatchNotificationPayload {
  incidentId: string;
  contactId: string;
  contactName: string;
  phone: string;
  memberName: string;
  locationAddress?: string | null;
  responderNote?: string | null;
}

export class NotificationService {
  /**
   * Enqueues alert notifications asynchronously without blocking the emergency API response.
   */
  static async enqueueEmergencyAlerts(payloads: DispatchNotificationPayload[]) {
    const logs = await Promise.all(
      payloads.map((payload) =>
        prisma.notificationLog.create({
          data: {
            incidentId: payload.incidentId,
            contactId: payload.contactId,
            channel: 'SMS',
            status: 'QUEUED',
            attemptCount: 0,
          },
        })
      )
    );

    // Trigger async queue processing in background (non-blocking)
    this.processQueue(logs.map((l) => l.id), payloads).catch((err) => {
      console.error('[NotificationService] Background dispatch error:', err);
    });

    return logs;
  }

  /**
   * Background queue worker. Replace the console.log stub with Twilio/Resend integration.
   */
  private static async processQueue(
    logIds: string[],
    payloads: DispatchNotificationPayload[]
  ) {
    for (let i = 0; i < logIds.length; i++) {
      const logId = logIds[i];
      const payload = payloads[i];

      try {
        await prisma.notificationLog.update({
          where: { id: logId },
          data: { attemptCount: 1 },
        });

        const messageBody = [
          `[MEDNIRA EMERGENCY] Emergency declared for ${payload.memberName}.`,
          payload.locationAddress ? `Location: ${payload.locationAddress}.` : '',
          payload.responderNote ? `Note: ${payload.responderNote}.` : '',
          'A responder has scanned their emergency identity.',
        ]
          .filter(Boolean)
          .join(' ');

        // TODO: Replace with real Twilio/Resend calls
        console.log(`[SMS STUB] To: ${payload.phone} | Body: ${messageBody}`);

        await prisma.notificationLog.update({
          where: { id: logId },
          data: { status: 'SENT', sentAt: new Date() },
        });
      } catch (err: any) {
        await prisma.notificationLog.update({
          where: { id: logId },
          data: {
            status: 'FAILED',
            errorMsg: err?.message || 'Dispatch failed',
          },
        });
      }
    }
  }
}
