'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, AlertCircle, CheckCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const passwordStrength = (() => {
    if (password.length === 0) return null;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return { label: 'Weak', color: '#e11d48', width: '25%' };
    if (score === 2) return { label: 'Fair', color: '#d97706', width: '50%' };
    if (score === 3) return { label: 'Good', color: '#16a34a', width: '75%' };
    return { label: 'Strong', color: '#0071e3', width: '100%' };
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed. Please try again.');
        setLoading(false);
        return;
      }

      // Auto sign-in after registration
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setSuccess(true);
        setTimeout(() => router.push('/auth/login'), 2000);
      } else {
        router.push('/onboarding');
        router.refresh();
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="apple-auth-container">
        <div className="apple-auth-card fade-in-up" style={{ textAlign: 'center' }}>
          <div style={{ color: '#16a34a', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
            <CheckCircle size={56} strokeWidth={1.5} />
          </div>
          <h2>Account created!</h2>
          <p>Redirecting you to sign in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="apple-auth-container">
      <div className="apple-auth-card fade-in-up">
        {/* Logo & Header */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', color: '#0071e3' }}>
          <Shield size={42} strokeWidth={1.5} />
        </div>
        <h2>Create Account</h2>
        <p>Set up your emergency identity</p>

        {/* Error Banner */}
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem', backgroundColor: '#ffe4e6', color: '#9f1239', borderRadius: '12px', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="apple-input-group">
            <label htmlFor="fullName">Full name</label>
            <input
              id="fullName"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoComplete="name"
              className="apple-input"
            />
          </div>

          <div className="apple-input-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="apple-input"
            />
          </div>

          <div className="apple-input-group">
            <label htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="apple-input"
                style={{ paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#86868b', cursor: 'pointer' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Password strength indicator */}
            {passwordStrength && (
              <div style={{ marginTop: '0.75rem' }}>
                <div style={{ width: '100%', height: '4px', backgroundColor: '#e5e5ea', borderRadius: '2px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: passwordStrength.width,
                      backgroundColor: passwordStrength.color,
                      height: '100%',
                      transition: 'width 0.3s ease, background-color 0.3s ease'
                    }}
                  />
                </div>
                <div style={{ fontSize: '0.8rem', marginTop: '0.3rem', color: passwordStrength.color, fontWeight: 500, textAlign: 'right' }}>
                  {passwordStrength.label}
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !fullName || !email || !password}
            className="apple-auth-submit"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="apple-auth-footer">
          <p style={{ marginBottom: '1rem', marginTop: '1.5rem' }}>Already have an account?</p>
          <Link href="/auth/login" className="apple-link">
            Sign in <ArrowRight size={16} />
          </Link>
          
          <p style={{ marginTop: '2rem', fontSize: '0.85rem', color: '#86868b', lineHeight: 1.5 }}>
            By creating an account, you agree to MedNira&apos;s{' '}
            <Link href="/privacy" style={{ color: '#0071e3', textDecoration: 'none' }}>Privacy Policy</Link> and{' '}
            <Link href="/terms" style={{ color: '#0071e3', textDecoration: 'none' }}>Terms of Service</Link>.
          </p>
        </div>
      </div>

      <style>{`
        .apple-auth-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f5f5f7;
          background-image: radial-gradient(circle at center, rgba(0,113,227,0.03) 0%, rgba(0,0,0,0) 100%);
          padding: 2rem;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }

        .apple-auth-card {
          width: 100%;
          max-width: 400px;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 3rem 2.5rem;
          box-shadow: 0 20px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.02);
          border: 1px solid rgba(255,255,255,0.5);
          text-align: center;
        }

        .apple-auth-card h2 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1d1d1f;
          margin-bottom: 0.5rem;
          letter-spacing: -0.02em;
        }

        .apple-auth-card p {
          color: #86868b;
          font-size: 1rem;
          margin-bottom: 2.5rem;
        }

        .apple-input-group {
          text-align: left;
          margin-bottom: 1.5rem;
        }

        .apple-input-group label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: #1d1d1f;
          margin-bottom: 0.5rem;
          margin-left: 0.25rem;
        }

        .apple-input {
          width: 100%;
          padding: 1rem 1.25rem;
          border-radius: 12px;
          border: 1px solid rgba(0,0,0,0.1);
          background: rgba(255,255,255,0.9);
          font-size: 1rem;
          color: #1d1d1f;
          transition: all 0.2s ease;
          outline: none;
        }

        .apple-input:focus {
          border-color: #0071e3;
          box-shadow: 0 0 0 4px rgba(0,113,227,0.15);
          background: #ffffff;
        }

        .apple-auth-submit {
          width: 100%;
          padding: 1rem;
          border-radius: 12px;
          background: #0071e3;
          color: white;
          font-size: 1.05rem;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 1rem;
          box-shadow: 0 4px 12px rgba(0,113,227,0.2);
        }

        .apple-auth-submit:hover:not(:disabled) {
          background: #0077ed;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(0,113,227,0.3);
        }

        .apple-auth-submit:disabled {
          background: #d2d2d7;
          color: #86868b;
          cursor: not-allowed;
          box-shadow: none;
        }

        .apple-link {
          color: #0071e3;
          text-decoration: none;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          transition: opacity 0.2s;
        }

        .apple-link:hover {
          opacity: 0.8;
        }
        
        .fade-in-up {
          animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
