import assert from 'node:assert';
import { test, describe } from 'node:test';
import { buildEmergencyProfileDTO } from '../lib/dto/emergency.dto';
import { DeviceService, DEVICE_STATUS } from '../lib/services/device.service';

describe('MedNira Core Security & Privacy Verification', () => {
  test('Emergency DTO projection strips private & trusted items and internal DB IDs', () => {
    const mockUser = {
      fullName: 'Jane Doe',
      profile: {
        bloodType: 'A-',
        dateOfBirth: '1988-11-20',
        organDonor: true,
        dnrStatus: false,
        emergencyNotes: 'Severe Peanut allergy',
        items: [
          { category: 'ALLERGY', name: 'Peanuts', description: 'Anaphylaxis', severity: 'CRITICAL', visibility: 'EMERGENCY' },
          { category: 'CONDITION', name: 'Hypertension', description: 'Stage 1', severity: 'MODERATE', visibility: 'TRUSTED' },
          { category: 'MEDICATION', name: 'Private Therapy Med', description: 'Internal detail', severity: 'LOW', visibility: 'PRIVATE' },
        ],
        contacts: [
          { name: 'John Doe', relationship: 'Spouse', phone: '+1-555-9999', priority: 1 },
        ],
      },
    };

    const dto = buildEmergencyProfileDTO('mn_tok_test123', mockUser);

    // Verify sanitized DTO contents
    assert.strictEqual(dto.token, 'mn_tok_test123');
    assert.strictEqual(dto.memberName, 'Jane Doe');
    assert.strictEqual(dto.bloodType, 'A-');
    assert.strictEqual(dto.allergies.length, 1);
    assert.strictEqual(dto.allergies[0].name, 'Peanuts');

    // VERIFY PRIVACY & SECURITY RULES:
    // Trusted & Private items MUST be excluded
    assert.strictEqual(dto.conditions.length, 0, 'TRUSTED items must not leak into public DTO');
    assert.strictEqual(dto.medications.length, 0, 'PRIVATE items must not leak into public DTO');

    // Database internal IDs must not exist in DTO
    assert.strictEqual((dto as any).id, undefined);
    assert.strictEqual((dto as any).userId, undefined);
    assert.strictEqual((dto as any).profileId, undefined);

  });

  test('Device Service high-entropy token generation', () => {
    const token1 = DeviceService.generateToken();
    const token2 = DeviceService.generateToken();

    assert.ok(token1.startsWith('mn_tok_'));
    assert.ok(token2.startsWith('mn_tok_'));
    assert.notStrictEqual(token1, token2);
    assert.ok(token1.length >= 40);
  });
});
