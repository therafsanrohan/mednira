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
    </div>
  );
}
