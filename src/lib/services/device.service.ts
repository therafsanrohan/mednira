import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

export const DEVICE_STATUS = {
  UNASSIGNED: 'UNASSIGNED',
  ACTIVE: 'ACTIVE',
  FROZEN: 'FROZEN',
  REVOKED: 'REVOKED',
  REPLACED: 'REPLACED',
} as const;

export type DeviceStatus = (typeof DEVICE_STATUS)[keyof typeof DEVICE_STATUS];

export class DeviceService {
  static generateToken(): string {
    const randomBuffer = crypto.randomBytes(24);
    return `mn_tok_${randomBuffer.toString('hex')}`;
  }

  static async createDeviceToken(
    userId: string,
    label: string = 'Emergency QR Card',
    deviceType: 'QR' | 'NFC' = 'QR'
  ) {
    const token = this.generateToken();

    return await prisma.deviceToken.create({
      data: {
        token,
        label,
        deviceType,
        status: 'ACTIVE',
        userId,
      },
    });
  }

  static async updateDeviceStatus(tokenId: string, userId: string, newStatus: DeviceStatus) {
    const device = await prisma.deviceToken.findFirst({
      where: { id: tokenId, userId },
    });

    if (!device) throw new Error('Device not found or does not belong to this user');

    return await prisma.deviceToken.update({
      where: { id: tokenId },
      data: { status: newStatus },
    });
  }

  static async replaceDeviceToken(oldTokenId: string, userId: string, label?: string) {
    const newToken = this.generateToken();

    return await prisma.$transaction(async (tx) => {
      // Verify ownership before replacing
      const old = await tx.deviceToken.findFirst({
        where: { id: oldTokenId, userId },
      });
      if (!old) throw new Error('Device not found or does not belong to this user');

      await tx.deviceToken.update({
        where: { id: oldTokenId },
        data: { status: 'REPLACED' },
      });

      return await tx.deviceToken.create({
        data: {
          token: newToken,
          label: label || `${old.label} (Replacement)`,
          deviceType: old.deviceType,
          status: 'ACTIVE',
          userId,
        },
      });
    });
  }

  /**
   * Resolves a public emergency token string to the owner's data.
   * Only returns data for ACTIVE tokens belonging to an active user.
   * No demo fallback — production-only path.
   */
  static async resolveEmergencyToken(tokenString: string) {
    const device = await prisma.deviceToken.findUnique({
      where: { token: tokenString },
      include: {
        user: {
          include: {
            profile: {
              include: {
                allergies: { where: { visibility: 'PUBLIC_EMERGENCY' } },
                conditions: { where: { visibility: 'PUBLIC_EMERGENCY' } },
                medications: { where: { visibility: 'PUBLIC_EMERGENCY' } },
                contacts: { where: { visibility: 'PUBLIC_EMERGENCY' }, orderBy: { priority: 'asc' } },
              },
            },
          },
        },
      },
    });

    if (!device) return { status: 'NOT_FOUND' as const, device: null, user: null };
    if (device.status === 'FROZEN') return { status: 'FROZEN' as const, device, user: null };
    if (device.status === 'REVOKED' || device.status === 'REPLACED') {
      return { status: 'REVOKED' as const, device, user: null };
    }
    if (device.status !== 'ACTIVE' || !device.user) {
      return { status: 'INACTIVE' as const, device, user: null };
    }
    if (device.user.status !== 'ACTIVE') {
      return { status: 'INACTIVE' as const, device, user: null };
    }

    // Update lastScannedAt asynchronously (don't await — don't block the response)
    prisma.deviceToken
      .update({ where: { id: device.id }, data: { lastScannedAt: new Date() } })
      .catch(() => {});

    return { status: 'ACTIVE' as const, device, user: device.user };
  }
}
