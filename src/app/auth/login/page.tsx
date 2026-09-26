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
