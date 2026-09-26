'use client';

import { use, useEffect, useState } from 'react';
import { EmergencyProfileDTO } from '@/lib/dto/emergency.dto';
import { AlertTriangle, Phone, ShieldAlert, HeartPulse, Pill, CheckCircle2, Navigation } from 'lucide-react';

export default function EmergencyScanPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [profile, setProfile] = useState<EmergencyProfileDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Incident trigger state
  const [triggering, setTriggering] = useState(false);
  const [incidentSuccess, setIncidentSuccess] = useState<string | null>(null);
  const [responderNote, setResponderNote] = useState('');
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEmergencyProfile() {
      try {
        const res = await fetch(`/api/v1/emergency/${token}`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Unable to access emergency profile');
        }
        const data: EmergencyProfileDTO = await res.json();
        setProfile(data);
      } catch (err: any) {
        setError(err.message || 'Error loading profile');
      } finally {
        setLoading(false);
      }
    }
    fetchEmergencyProfile();
  }, [token]);

  const handleTriggerEmergency = async () => {
    setTriggering(true);
    setError(null);
    setLocationStatus('Acquiring responder GPS location...');
    
    try {
      let locationLat: number | undefined;
      let locationLng: number | undefined;

      if ('geolocation' in navigator) {
        try {
          const pos = await new Promise<GeolocationPosition>((res, rej) =>
            navigator.geolocation.getCurrentPosition(res, rej, { timeout: 4000, enableHighAccuracy: true })
          );
          locationLat = pos.coords.latitude;
          locationLng = pos.coords.longitude;
          setLocationStatus(`GPS Locked: ${locationLat.toFixed(4)}, ${locationLng.toFixed(4)}`);
        } catch (_) {
          setLocationStatus('GPS unavailable. Alert proceeding with standard scan timestamp.');
        }
      }

      const res = await fetch(`/api/v1/emergency/${token}/incident`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationLat,
          locationLng,
          responderNote: responderNote || 'Responder emergency scan dispatch',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch alert');

      setIncidentSuccess(data.message || 'Emergency contacts notified!');
    } catch (err: any) {
      setError(err.message || 'Error initiating emergency alert');
    } finally {
      setTriggering(false);
    }
  };

  if (loading) {
    return (
      <div className="container-narrow" style={{ textAlign: 'center', paddingTop: '5rem', paddingBottom: '5rem' }}>
        <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid #cbd5e1', borderTopColor: '#e11d48', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
        <div style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Retrieving Emergency Medical Identity...</div>
        <style jsx>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container-narrow" style={{ paddingTop: '3rem' }}>
        <div className="card" style={{ borderColor: 'var(--emergency-red)', textAlign: 'center' }}>
          <ShieldAlert size={56} color="var(--emergency-red)" style={{ margin: '0 auto 1rem auto' }} />
          <h2 style={{ color: '#0f172a', marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: 800 }}>Emergency Profile Inaccessible</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            {error || 'The requested emergency token is inactive, frozen, or revoked.'}
          </p>
          <a href="/" className="btn btn-secondary">
            Return to Safety Portal
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container-narrow">
      {/* Emergency Header Warning */}
      <div
        style={{
          backgroundColor: '#ffe4e6',
          border: '1px solid #f43f5e',
          padding: '0.875rem 1.25rem',
          borderRadius: '0.75rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.875rem',
          boxShadow: '0 4px 12px rgba(225, 29, 72, 0.1)',
        }}
      >
        <ShieldAlert color="var(--emergency-red)" size={28} style={{ flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: '0.9rem', color: '#9f1239', fontWeight: 800 }}>FIRST RESPONDER EMERGENCY VIEW</div>
          <div style={{ fontSize: '0.75rem', color: '#be123c' }}>Verified Public Emergency Record • Privacy Enforced</div>
        </div>
      </div>

      {/* Primary Identity & Critical Medical Metrics */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              {profile.memberName}
            </h1>
            {profile.dateOfBirth && (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem', fontWeight: 500 }}>
                DOB: <strong>{profile.dateOfBirth}</strong>
              </div>
            )}
          </div>

          {/* Blood Type Badge */}
          {profile.bloodType && (
            <div
              style={{
                background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
                color: 'white',
                padding: '0.625rem 1.125rem',
                borderRadius: '0.75rem',
                textAlign: 'center',
                boxShadow: '0 4px 14px rgba(225, 29, 72, 0.3)',
                flexShrink: 0,
              }}
            >
              <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>BLOOD TYPE</div>
              <div style={{ fontSize: '1.65rem', fontWeight: 900, lineHeight: 1.1 }}>{profile.bloodType}</div>
            </div>
          )}
        </div>

        {/* Resuscitation / Organ Donor Flags */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {profile.dnrStatus && (
            <span className="badge badge-critical" style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}>
              DNR / DO NOT RESUSCITATE
            </span>
          )}
          {profile.organDonor && (
            <span className="badge badge-success" style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}>
              ORGAN DONOR
            </span>
          )}
        </div>

        {/* Emergency Notes */}
        {profile.emergencyNotes && (
          <div
            style={{
              backgroundColor: '#fef3c7',
              border: '1px solid #f59e0b',
              borderRadius: '0.625rem',
              padding: '1rem',
              borderLeft: '5px solid #d97706',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: '#92400e', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
              CRITICAL RESPONDER INSTRUCTION
            </div>
            <div style={{ fontSize: '1rem', color: '#78350f', fontWeight: 700 }}>{profile.emergencyNotes}</div>
          </div>
        )}
      </div>

      {/* Severe Allergies */}
      {profile.allergies.length > 0 && (
        <div className="card card-emergency">
          <h3 style={{ color: '#9f1239', display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem', fontSize: '1.15rem' }}>
            <AlertTriangle color="var(--emergency-red)" size={22} /> Severe Allergies
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {profile.allergies.map((allergy, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: '#ffffff',
                  padding: '0.875rem 1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #fca5a5',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <strong style={{ color: '#0f172a', fontSize: '1rem' }}>{allergy.name}</strong>
                  {allergy.description && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{allergy.description}</div>}
                </div>
                {allergy.severity && <span className="badge badge-critical">{allergy.severity}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Critical Conditions */}
      {profile.conditions.length > 0 && (
        <div className="card">
          <h3 style={{ color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem', fontSize: '1.15rem' }}>
            <HeartPulse color="var(--amber-warning)" size={22} /> Medical Conditions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {profile.conditions.map((cond, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: '#f8fafc',
                  padding: '0.875rem 1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #cbd5e1',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <strong style={{ color: '#0f172a', fontSize: '1rem' }}>{cond.name}</strong>
                  {cond.description && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{cond.description}</div>}
                </div>
                {cond.severity && <span className="badge badge-warning">{cond.severity}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Medications */}
      {profile.medications.length > 0 && (
        <div className="card">
          <h3 style={{ color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem', fontSize: '1.15rem' }}>
            <Pill color="var(--brand-blue)" size={22} /> Critical Medications
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {profile.medications.map((med, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: '#f8fafc',
                  padding: '0.875rem 1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #cbd5e1',
                }}
              >
                <strong style={{ color: '#0f172a', fontSize: '1rem' }}>{med.name}</strong>
                {med.description && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{med.description}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Emergency Contacts with Direct 1-Tap Call */}
      <div className="card">
        <h3 style={{ color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem', fontSize: '1.15rem' }}>
          <Phone color="var(--success-green)" size={22} /> Emergency Contacts
        </h3>
        {profile.emergencyContacts.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No emergency contacts listed.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {profile.emergencyContacts.map((contact, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem',
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.05rem' }}>{contact.name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                    {contact.relationship} • Priority #{contact.priority}
                  </div>
                </div>
                <a
                  href={`tel:${contact.phone}`}
                  className="btn btn-success"
                  style={{ padding: '0.625rem 1rem', minHeight: '44px', flexShrink: 0 }}
                >
                  <Phone size={18} /> Call {contact.phone}
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trigger Incident Alert Section */}
      <div className="card" style={{ borderColor: '#f43f5e', backgroundColor: '#fff1f2' }}>
        <h3 style={{ color: '#9f1239', fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Dispatch Emergency Alert
        </h3>
        <p style={{ fontSize: '0.9rem', color: '#881337', marginBottom: '1.25rem' }}>
          Instantly dispatch emergency SMS & Email notifications to {profile.memberName}&apos;s emergency contacts with GPS location.
        </p>

        {locationStatus && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#0284c7', marginBottom: '1rem', fontWeight: 600 }}>
            <Navigation size={14} /> {locationStatus}
          </div>
        )}

        {incidentSuccess ? (
          <div
            style={{
              backgroundColor: '#dcfce7',
              border: '1px solid #22c55e',
              padding: '1rem',
              borderRadius: '0.625rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              color: '#166534',
              fontWeight: 700,
            }}
          >
            <CheckCircle2 size={24} /> {incidentSuccess}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <input
              type="text"
              placeholder="Optional note for contacts (e.g. Ambulance requested, ER location...)"
              value={responderNote}
              onChange={e => setResponderNote(e.target.value)}
            />
            <button
              onClick={handleTriggerEmergency}
              disabled={triggering}
              className="btn btn-danger btn-full"
              style={{ minHeight: '52px', fontSize: '1.05rem', letterSpacing: '0.02em' }}
            >
              <ShieldAlert size={22} /> {triggering ? 'DISPATCHING EMERGENCY ALERTS...' : 'TRIGGER EMERGENCY ALERT'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
