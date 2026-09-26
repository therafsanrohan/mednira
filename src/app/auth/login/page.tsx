'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Shield, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('Invalid email or password. Please try again.');
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  };

  return (
    <div className="apple-auth-container">
      <div className="apple-auth-card fade-in-up">
        {/* Logo & Header */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', color: '#0071e3' }}>
          <Shield size={42} strokeWidth={1.5} />
        </div>
        <h2>Sign In</h2>
        <p>Access your MedNira account</p>

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
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
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
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="apple-auth-submit"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="apple-auth-footer">
          <p style={{ marginBottom: '1rem', marginTop: '2rem' }}>New to MedNira?</p>
          <Link href="/auth/register" className="apple-link">
            Create an account <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
