'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Shield,
  Home,
  QrCode,
  Activity,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/dashboard/emergency-id', label: 'Emergency ID', icon: QrCode },
  { href: '/dashboard/activity', label: 'Activity', icon: Activity },
];

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isAuthenticated = status === 'authenticated' && session?.user;
  const isAuthPage = pathname.startsWith('/auth/');
  const user = session?.user;
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await signOut({ redirect: false });
    router.push('/');
    router.refresh();
  };

  if (pathname.startsWith('/dashboard')) return null;

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1120px',
          margin: '0 auto',
          padding: '0 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
        }}
      >
        {/* Logo */}
        <Link
          href={isAuthenticated ? '/dashboard' : '/'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '9px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(2,132,199,0.3)',
            }}
          >
            <Shield size={18} color="white" strokeWidth={2.5} />
          </div>
          <span
            style={{
              fontWeight: 900,
              fontSize: '1.15rem',
              color: '#0f172a',
              letterSpacing: '-0.025em',
            }}
          >
            MedNira
          </span>
        </Link>

        {/* Desktop Nav Links (only when authenticated) */}
        {isAuthenticated && !isAuthPage && (
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              flex: 1,
            }}
            aria-label="Main navigation"
          >
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const active =
                href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.45rem 0.875rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.9rem',
                    fontWeight: active ? 700 : 600,
                    color: active ? 'var(--brand-blue)' : 'var(--text-secondary)',
                    backgroundColor: active ? '#e0f2fe' : 'transparent',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                  }}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon size={16} />
                  <span className="nav-label">{label}</span>
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          {status === 'loading' ? (
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--border-subtle)',
                animation: 'pulse 1.5s ease infinite',
              }}
            />
          ) : isAuthenticated ? (
            <div className="nav-user-menu" ref={dropdownRef}>
              <button
                className="nav-avatar"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-label="Open user menu"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                {initials}
              </button>

              {dropdownOpen && (
                <div className="nav-dropdown" role="menu">
                  {/* User info */}
                  <div className="nav-user-info">
                    <div className="nav-user-name">{user?.name || 'User'}</div>
                    <div className="nav-user-email">{user?.email}</div>
                  </div>
                  <div className="nav-dropdown-separator" />

                  <Link
                    href="/dashboard"
                    className="nav-dropdown-item"
                    role="menuitem"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <Home size={16} /> Dashboard
                  </Link>
                  <Link
                    href="/dashboard/emergency-id"
                    className="nav-dropdown-item"
                    role="menuitem"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <QrCode size={16} /> Emergency ID
                  </Link>
                  <Link
                    href="/dashboard/profile"
                    className="nav-dropdown-item"
                    role="menuitem"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <User size={16} /> Profile
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className="nav-dropdown-item"
                    role="menuitem"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <Settings size={16} /> Settings
                  </Link>

                  <div className="nav-dropdown-separator" />

                  <button
                    className="nav-dropdown-item danger"
                    role="menuitem"
                    onClick={handleSignOut}
                  >
                    <LogOut size={16} /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : !isAuthPage ? (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link href="/auth/login" className="btn btn-secondary" style={{ minHeight: '38px', padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                Sign in
              </Link>
              <Link href="/auth/register" className="btn btn-primary" style={{ minHeight: '38px', padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                Get started
              </Link>
            </div>
          ) : null}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @media (max-width: 640px) {
          .nav-label { display: none; }
        }
      `}</style>
    </header>
  );
}
