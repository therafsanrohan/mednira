export interface EmergencyContactDTO {
  name: string;
  relationship: string;
  phone: string;
  priority: number;
}

export interface EmergencyAllergyDTO {
  substance: string;
  severity: string;
  reaction?: string | null;
}

export interface EmergencyConditionDTO {
  conditionName: string;
  status: string;
}

export interface EmergencyMedicationDTO {
  genericName: string;
  brandName?: string | null;
  dosage?: string | null;
  frequency?: string | null;
}

export interface EmergencyProfileDTO {
  token: string;
  memberName: string;
  bloodType?: string | null;
  rhFactor?: string | null;
  dateOfBirth?: string | null;
  organDonor: boolean;
  dnrStatus: boolean;
  emergencyNotes?: string | null;
  allergies: EmergencyAllergyDTO[];
  conditions: EmergencyConditionDTO[];
  medications: EmergencyMedicationDTO[];
  emergencyContacts: EmergencyContactDTO[];
}

/**
 * Transforms database models into a sanitized, privacy-compliant Emergency Profile DTO.
 * STRICT ENFORCEMENT:
 * - Omits internal DB IDs (UUIDs).
 * - Only PUBLIC_EMERGENCY visibility items are retrieved by the service query.
 * - Omits sensitive user account details (email, role, credentials).
 */
export function buildEmergencyProfileDTO(
  token: string,
  user: any
): EmergencyProfileDTO {
  const profile = user.profile;

  return {
    token,
    memberName: user.fullName || user.name,
    bloodType: profile?.bloodType ?? null,
    rhFactor: profile?.rhFactor ?? null,
    dateOfBirth: profile?.dateOfBirth ?? null,
    organDonor: profile?.organDonor ?? false,
    dnrStatus: profile?.dnrStatus ?? false,
    emergencyNotes: profile?.emergencyNotes ?? null,
    allergies: (profile?.allergies || []).map((a: any) => ({
      substance: a.substance,
      severity: a.severity,
      reaction: a.reaction,
    })),
    conditions: (profile?.conditions || []).map((c: any) => ({
      conditionName: c.conditionName,
      status: c.status,
    })),
    medications: (profile?.medications || []).map((m: any) => ({
      genericName: m.genericName,
      brandName: m.brandName,
      dosage: m.dosage,
      frequency: m.frequency,
    })),
    emergencyContacts: (profile?.contacts ?? [])
      .map((c: any) => ({
        name: c.name,
        relationship: c.relationship,
        phone: c.phone,
        priority: c.priority,
      })),
  };
}
