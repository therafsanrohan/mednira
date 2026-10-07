import { prisma } from '@/lib/prisma';
import { NotificationService } from './notification.service';

export const INCIDENT_STATUS = {
  CREATED: 'CREATED',
  ACKNOWLEDGED: 'ACKNOWLEDGED',
  RESPONDING: 'RESPONDING',
  ESCALATED: 'ESCALATED',
  HANDOFF: 'HANDOFF',
  RESOLVED: 'RESOLVED',
  FALSE_ALARM: 'FALSE_ALARM',
  CANCELLED: 'CANCELLED',
} as const;

export type IncidentStatus = (typeof INCIDENT_STATUS)[keyof typeof INCIDENT_STATUS];

// Valid state machine transitions
const VALID_TRANSITIONS: Record<IncidentStatus, IncidentStatus[]> = {
  [INCIDENT_STATUS.CREATED]: [
    INCIDENT_STATUS.ACKNOWLEDGED,
    INCIDENT_STATUS.RESPONDING,
    INCIDENT_STATUS.RESOLVED,
    INCIDENT_STATUS.FALSE_ALARM,
    INCIDENT_STATUS.CANCELLED,
  ],
  [INCIDENT_STATUS.ACKNOWLEDGED]: [
    INCIDENT_STATUS.RESPONDING,
    INCIDENT_STATUS.RESOLVED,
    INCIDENT_STATUS.FALSE_ALARM,
    INCIDENT_STATUS.CANCELLED,
  ],
  [INCIDENT_STATUS.RESPONDING]: [
    INCIDENT_STATUS.ESCALATED,
    INCIDENT_STATUS.HANDOFF,
    INCIDENT_STATUS.RESOLVED,
    INCIDENT_STATUS.FALSE_ALARM,
    INCIDENT_STATUS.CANCELLED,
  ],
  [INCIDENT_STATUS.ESCALATED]: [
    INCIDENT_STATUS.HANDOFF,
    INCIDENT_STATUS.RESOLVED,
    INCIDENT_STATUS.CANCELLED,
  ],
  [INCIDENT_STATUS.HANDOFF]: [INCIDENT_STATUS.RESOLVED],
  [INCIDENT_STATUS.RESOLVED]: [],
  [INCIDENT_STATUS.FALSE_ALARM]: [],
  [INCIDENT_STATUS.CANCELLED]: [],
};

const TERMINAL_STATUSES: IncidentStatus[] = [
  INCIDENT_STATUS.RESOLVED,
  INCIDENT_STATUS.FALSE_ALARM,
  INCIDENT_STATUS.CANCELLED,
];

export class IncidentService {
  static async startEmergency(params: {
    deviceTokenId?: string;
    userId: string;
    locationLat?: number;
    locationLng?: number;
    locationAddress?: string;
    responderNote?: string;
    responderContact?: string;
  }) {
    // Idempotency: check for a recent active incident (15-min window)
    const recentActiveIncident = await prisma.incident.findFirst({
      where: {
        userId: params.userId,
        status: {
          in: [
            INCIDENT_STATUS.CREATED,
            INCIDENT_STATUS.ACKNOWLEDGED,
            INCIDENT_STATUS.RESPONDING,
          ],
        },
        createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) },
      },
      include: { notifications: true },
    });

    if (recentActiveIncident) {
      return { incident: recentActiveIncident, isDuplicate: true };
    }

    // Create new incident
    const incident = await prisma.incident.create({
      data: {
        deviceTokenId: params.deviceTokenId ?? null,
        userId: params.userId,
        status: INCIDENT_STATUS.CREATED,
        locationLat: params.locationLat ?? null,
        locationLng: params.locationLng ?? null,
        locationAddress: params.locationAddress ?? null,
        responderNote: params.responderNote ?? null,
        responderContact: params.responderContact ?? null,
      },
    });

    // Record incident creation event
    await prisma.incidentEvent.create({
      data: {
        incidentId: incident.id,
        eventType: 'CREATED',
        description: 'Emergency incident created via QR/NFC scan',
        metadata: {
          locationLat: params.locationLat,
          locationLng: params.locationLng,
        },
      },
    });

    // Fetch contacts and queue notifications
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      include: {
        profile: {
          include: {
            contacts: {
              where: { notifyOnIncident: true },
              orderBy: { priority: 'asc' },
            },
          },
        },
        userProfile: true,
        accountSettings: true,
      },
    });

    if (user?.profile?.contacts && user.profile.contacts.length > 0) {
      const payloads = user.profile.contacts.map((contact) => ({
        incidentId: incident.id,
        contactId: contact.id,
        contactName: contact.name,
        phone: contact.phone,
        email: contact.email,
        memberName: user.fullName || 'Unknown',
        locationAddress: params.locationAddress,
        responderNote: params.responderNote,
      }));

      // Add the user themselves if they have SMS notifications enabled
      if (user.accountSettings?.smsNotifications && user.userProfile?.phoneNumber) {
        payloads.push({
          incidentId: incident.id,
          contactId: user.id, // using user ID as contact ID for owner
          contactName: user.fullName || 'You',
          phone: user.userProfile?.phoneNumber || '',
          email: user.email,
          memberName: 'Your own profile',
          locationAddress: params.locationAddress,
          responderNote: params.responderNote,
        });
      }

      await NotificationService.enqueueEmergencyAlerts(payloads);
    }

    return { incident, isDuplicate: false };
  }

  static async updateIncidentStatus(incidentId: string, newStatus: IncidentStatus) {
    const incident = await prisma.incident.findUnique({
      where: { id: incidentId },
    });

    if (!incident) throw new Error(`Incident ${incidentId} not found`);

    const currentStatus = incident.status as IncidentStatus;
    if (currentStatus === newStatus) return incident;

    const allowedNextStates = VALID_TRANSITIONS[currentStatus] ?? [];
    if (!allowedNextStates.includes(newStatus)) {
      throw new Error(
        `Invalid transition: ${currentStatus} → ${newStatus}`
      );
    }

    const isTerminal = TERMINAL_STATUSES.includes(newStatus);

    const updated = await prisma.incident.update({
      where: { id: incidentId },
      data: {
        status: newStatus,
        resolvedAt: isTerminal ? new Date() : undefined,
      },
    });

    // Record status change event
    await prisma.incidentEvent.create({
      data: {
        incidentId,
        eventType: 'STATUS_CHANGED',
        description: `Status changed from ${currentStatus} to ${newStatus}`,
      },
    });

    return updated;
  }
}
