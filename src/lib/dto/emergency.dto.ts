export interface EmergencyContactDTO {
  name: string;
  relationship: string;
  phone: string;
  priority: number;
}

export interface EmergencyMedicalItemDTO {
  category: string;
  name: string;
  description?: string | null;
  severity?: string | null;
}

export interface EmergencyProfileDTO {
  token: string;
  memberName: string;
  bloodType?: string | null;
  dateOfBirth?: string | null;
  organDonor: boolean;
  dnrStatus: boolean;
  emergencyNotes?: string | null;
  allergies: EmergencyMedicalItemDTO[];
  conditions: EmergencyMedicalItemDTO[];
  medications: EmergencyMedicalItemDTO[];
  emergencyContacts: EmergencyContactDTO[];
}

/**
 * Transforms database models into a sanitized, privacy-compliant Emergency Profile DTO.
 * STRICT ENFORCEMENT:
 * - Omits internal DB IDs (UUIDs).
 * - Filters out all items marked 'trusted' or 'private' (returns ONLY 'emergency' visibility).
 * - Omits sensitive user account details (email, role, credentials).
 */
export function buildEmergencyProfileDTO(
  token: string,
  user: {
    fullName: string;
    profile: {
      bloodType: string | null;
      dateOfBirth: string | null;
      organDonor: boolean;
      dnrStatus: boolean;
      emergencyNotes: string | null;
      items: Array<{
        category: string;
        name: string;
        description: string | null;
        severity: string | null;
        visibility: string;
      }>;
      contacts: Array<{
        name: string;
        relationship: string;
        phone: string;
        priority: number;
      }>;
    } | null;
  }
): EmergencyProfileDTO {
  const profile = user.profile;

  // Filter items strictly for visibility === 'EMERGENCY' (server-enforced privacy)
  const emergencyItems = profile?.items.filter(item => item.visibility === 'EMERGENCY') ?? [];


  const mapItem = (item: (typeof emergencyItems)[number]): EmergencyMedicalItemDTO => ({
    category: item.category,
    name: item.name,
    description: item.description,
    severity: item.severity,
  });

  return {
    token,
    memberName: user.fullName,
    bloodType: profile?.bloodType ?? null,
    dateOfBirth: profile?.dateOfBirth ?? null,
    organDonor: profile?.organDonor ?? false,
    dnrStatus: profile?.dnrStatus ?? false,
    emergencyNotes: profile?.emergencyNotes ?? null,
    allergies: emergencyItems.filter(i => i.category === 'ALLERGY').map(mapItem),
    conditions: emergencyItems.filter(i => i.category === 'CONDITION').map(mapItem),
    medications: emergencyItems.filter(i => i.category === 'MEDICATION').map(mapItem),
    emergencyContacts: (profile?.contacts ?? [])
      .sort((a, b) => a.priority - b.priority)
      .map(c => ({
        name: c.name,
        relationship: c.relationship,
        phone: c.phone,
        priority: c.priority,
      })),
  };
}
