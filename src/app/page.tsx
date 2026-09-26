'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Shield, QrCode, PhoneCall, HeartPulse, Lock, ArrowRight, CheckCircle } from 'lucide-react';

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 4.5rem auto' }}>
        <div className="badge badge-critical" style={{ marginBottom: '1.5rem', padding: '0.45rem 1rem', fontSize: '0.8rem' }}>
          PRIVACY-FIRST EMERGENCY HEALTH IDENTITY PLATFORM
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.4rem, 5vw, 3.75rem)',
            fontWeight: 900,
            color: '#0f172a',
            lineHeight: 1.08,
            letterSpacing: '-0.035em',
            marginBottom: '1.375rem',
          }}
        >
          Your medical identity,
          <br />
          <span style={{ color: 'var(--brand-blue)' }}>instantly available</span> when it matters.
        </h1>

        <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', lineHeight: 1.65, marginBottom: '2.25rem', maxWidth: '600px', margin: '0 auto 2.25rem' }}>
          MedNira gives first responders immediate access to your critical health information — allergies, blood group, emergency contacts — through a single QR scan. No login required for responders.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {session ? (
            <Link href="/dashboard" className="btn btn-primary" style={{ padding: '0.9rem 2rem', fontSize: '1.05rem' }}>
              Go to Dashboard <ArrowRight size={18} />
            </Link>
          ) : (
            <>
              <Link href="/auth/register" className="btn btn-primary" style={{ padding: '0.9rem 2rem', fontSize: '1.05rem' }}>
                Get started free <ArrowRight size={18} />
              </Link>
              <Link href="/auth/login" className="btn btn-secondary" style={{ padding: '0.9rem 1.75rem', fontSize: '1.05rem' }}>
                Sign in
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Trust Strip */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', flexWrap: 'wrap', marginBottom: '4.5rem' }}>
        {[
          'No login for first responders',
          'Field-level privacy controls',
          'QR + NFC support',
          'Instant emergency alerts',
        ].map((item) => (
          <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            <CheckCircle size={16} color="var(--success-green)" />
            {item}
          </div>
        ))}
      </div>

      {/* Core Flow Cards */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0f172a', textAlign: 'center', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
          The complete emergency response loop
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '1rem' }}>
          From scan to handoff — every step covered.
        </p>

        <div className="grid-responsive">
          {[
            {
              icon: QrCode,
              color: '#e0f2fe',
              iconColor: 'var(--brand-blue)',
              step: '01',
              title: 'Scan',
              description: 'Responder scans your QR or NFC token. Emergency profile loads in milliseconds, no login, no friction.',
            },
            {
              icon: HeartPulse,
              color: '#ffe4e6',
              iconColor: 'var(--emergency-red)',
              step: '02',
              title: 'Identify',
              description: 'Blood group, severe allergies, medical conditions and critical instructions displayed immediately.',
            },
            {
              icon: PhoneCall,
              color: '#dcfce7',
              iconColor: 'var(--success-green)',
              step: '03',
              title: 'Contact',
              description: 'One-tap emergency alerts sent to your designated contacts via SMS and email with GPS location.',
            },
            {
              icon: Lock,
              color: '#fef3c7',
              iconColor: 'var(--amber-warning)',
              step: '04',
              title: 'Control',
              description: 'Your private records stay private. Field-level visibility controls. Revocable tokens. You decide what responders see.',
            },
          ].map(({ icon: Icon, color, iconColor, step, title, description }) => (
            <div key={step} className="card" style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', fontSize: '0.7rem', fontWeight: 900, color: 'var(--border-card)', letterSpacing: '0.05em' }}>
                {step}
              </div>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Icon size={26} color={iconColor} />
              </div>
              <h3 style={{ color: '#0f172a', fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>{title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      {!session && (
        <div style={{ textAlign: 'center', backgroundColor: '#0f172a', borderRadius: '1.25rem', padding: '3rem 2rem', marginTop: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', background: 'linear-gradient(135deg, var(--brand-blue) 0%, #0369a1 100%)', borderRadius: '14px', marginBottom: '1.25rem', boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)' }}>
            <Shield size={28} color="white" />
          </div>
          <h2 style={{ color: '#ffffff', fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.025em', marginBottom: '0.75rem' }}>
            Set up your Emergency ID today
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '1.75rem', maxWidth: '480px', margin: '0 auto 1.75rem' }}>
            Free to get started. Takes less than 5 minutes to complete your emergency health profile.
          </p>
          <Link href="/auth/register" className="btn btn-primary" style={{ padding: '0.9rem 2rem', fontSize: '1.05rem' }}>
            Create your Emergency ID <ArrowRight size={18} />
          </Link>
        </div>
      )}
    </div>
  );
}
