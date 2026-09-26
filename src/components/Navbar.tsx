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
  Menu,
  X
} from 'lucide-react';

const NAV_LINKS = [
  { href: '/dashboard?tab=HOME', label: 'Home', icon: Home },
  { href: '/dashboard?tab=DEVICES', label: 'Emergency ID', icon: QrCode },
  { href: '/dashboard?tab=ACTIVITY', label: 'Activity', icon: Activity },
];

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [mobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isAuthenticated = status === 'authenticated' && session?.user;
  const isAuthPage = pathname.startsWith('/auth/');
  const user = session?.user;

  if (pathname.startsWith('/dashboard')) {
    return null;
  }
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const handleSignOut = async () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    await signOut({ redirect: false });
    router.push('/');
    router.refresh();
  };

  return (
    <>
      <header className={`apple-navbar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="apple-navbar-container">
          {/* Logo */}
          <Link href={isAuthenticated ? '/dashboard' : '/'} className="apple-logo" onClick={() => setMobileMenuOpen(false)}>
            <Shield size={22} strokeWidth={1.5} color={mobileMenuOpen ? 'white' : '#0071e3'} />
            <span style={{ color: mobileMenuOpen ? 'white' : 'inherit' }}>MedNira</span>
          </Link>

          {/* Desktop Nav Links */}
          {isAuthenticated && !isAuthPage && (
            <nav className="apple-nav-links desktop-only">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                const active = href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);
                return (
                  <Link key={href} href={href} className={`apple-nav-link ${active ? 'active' : ''}`}>
                    <Icon size={16} />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right section (Desktop User Menu & Auth / Mobile Hamburger) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Desktop Actions */}
            <div className="desktop-only">
              {status === 'loading' ? (
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e5e5ea', animation: 'pulse 1.5s ease infinite' }} />
              ) : isAuthenticated ? (
                <div className="nav-user-menu" ref={dropdownRef}>
                  <button className="apple-avatar" onClick={() => setDropdownOpen(!dropdownOpen)}>
                    {initials}
                  </button>

                  {dropdownOpen && (
                    <div className="apple-dropdown fade-in-up" style={{ animationDuration: '0.2s' }}>
                      <div className="apple-dropdown-header">
                        <strong>{user?.name || 'User'}</strong>
                        <span>{user?.email}</span>
                      </div>
                      <div className="apple-dropdown-divider" />
                      <Link href="/dashboard?tab=HOME" className="apple-dropdown-item" onClick={() => setDropdownOpen(false)}><Home size={16} /> Dashboard</Link>
                      <Link href="/dashboard?tab=DEVICES" className="apple-dropdown-item" onClick={() => setDropdownOpen(false)}><QrCode size={16} /> Emergency ID</Link>
                      <Link href="/dashboard?tab=PROFILE" className="apple-dropdown-item" onClick={() => setDropdownOpen(false)}><User size={16} /> Profile</Link>
                      <Link href="/dashboard?tab=SETTINGS" className="apple-dropdown-item" onClick={() => setDropdownOpen(false)}><Settings size={16} /> Settings</Link>
                      <div className="apple-dropdown-divider" />
                      <button className="apple-dropdown-item text-danger" onClick={handleSignOut}><LogOut size={16} /> Sign out</button>
                    </div>
                  )}
                </div>
              ) : !isAuthPage ? (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <Link href="/auth/login" className="apple-link" style={{ fontSize: '0.9rem', marginRight: '0.5rem' }}>Sign in</Link>
                  <Link href="/auth/register" className="apple-btn-small">Get started</Link>
                </div>
              ) : null}
            </div>

            {/* Mobile Hamburger */}
            <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} color="white" /> : <Menu size={24} color="#1d1d1f" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Full Screen Menu Overlay */}
      <div className={`mobile-overlay ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-overlay-content">
          {isAuthenticated ? (
            <nav className="mobile-nav-list">
              <div style={{ padding: '0 1rem', marginBottom: '2rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                Signed in as <br/><strong style={{ color: 'white', fontSize: '1.2rem' }}>{user?.name || 'User'}</strong>
              </div>
              {NAV_LINKS.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} className="mobile-nav-item" onClick={() => setMobileMenuOpen(false)}>
                  <Icon size={22} /> {label}
                </Link>
              ))}
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '1.5rem 1rem' }} />
              <Link href="/dashboard?tab=PROFILE" className="mobile-nav-item" onClick={() => setMobileMenuOpen(false)}><User size={22} /> Profile</Link>
              <Link href="/dashboard?tab=SETTINGS" className="mobile-nav-item" onClick={() => setMobileMenuOpen(false)}><Settings size={22} /> Settings</Link>
              <button className="mobile-nav-item text-danger" style={{ border: 'none', background: 'none', width: '100%' }} onClick={handleSignOut}>
                <LogOut size={22} /> Sign out
              </button>
            </nav>
          ) : (
            <nav className="mobile-nav-list">
              <Link href="/" className="mobile-nav-item" onClick={() => setMobileMenuOpen(false)}>Home</Link>
              <Link href="/privacy" className="mobile-nav-item" onClick={() => setMobileMenuOpen(false)}>Privacy Policy</Link>
              <Link href="/terms" className="mobile-nav-item" onClick={() => setMobileMenuOpen(false)}>Terms of Service</Link>
              <div style={{ marginTop: '3rem', padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Link href="/auth/register" className="apple-btn-primary" style={{ textAlign: 'center', padding: '1rem', borderRadius: '12px' }} onClick={() => setMobileMenuOpen(false)}>Get started</Link>
                <Link href="/auth/login" style={{ textAlign: 'center', color: 'white', textDecoration: 'none', padding: '1rem' }} onClick={() => setMobileMenuOpen(false)}>Sign in</Link>
              </div>
            </nav>
          )}
        </div>
      </div>

      <style>{`
        .apple-navbar {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: rgba(251, 251, 253, 0.8);
          backdrop-filter: saturate(180%) blur(20px);
          -webkit-backdrop-filter: saturate(180%) blur(20px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          height: 54px;
          display: flex;
          align-items: center;
          transition: background 0.3s ease, border-color 0.3s ease;
        }

        .apple-navbar.mobile-open {
          background: #1d1d1f;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .apple-navbar-container {
          width: 100%;
          max-width: 1024px;
          margin: 0 auto;
          padding: 0 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .apple-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          color: #1d1d1f;
          font-weight: 600;
          font-size: 1.15rem;
          letter-spacing: -0.02em;
          z-index: 1001;
        }

        .desktop-only { display: flex; }
        .mobile-menu-btn { display: none; background: none; border: none; cursor: pointer; z-index: 1001; padding: 0.2rem; }

        .apple-nav-links {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .apple-nav-link {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.85rem;
          color: #424245;
          text-decoration: none;
          transition: color 0.2s ease;
          font-weight: 500;
        }

        .apple-nav-link:hover { color: #0071e3; }
        .apple-nav-link.active { color: #1d1d1f; font-weight: 600; }

        .apple-btn-small {
          background-color: #0071e3;
          color: white;
          padding: 0.4rem 1rem;
          border-radius: 99px;
          font-size: 0.85rem;
          font-weight: 500;
          text-decoration: none;
          transition: background-color 0.2s ease;
        }
        .apple-btn-small:hover { background-color: #0077ed; }

        .apple-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #e5e5ea;
          color: #1d1d1f;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 600;
          border: none;
          cursor: pointer;
        }

        .nav-user-menu { position: relative; }
        .apple-dropdown {
          position: absolute;
          top: calc(100% + 0.5rem);
          right: 0;
          width: 240px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 12px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.1);
          border: 1px solid rgba(0,0,0,0.05);
          padding: 0.5rem 0;
          z-index: 1000;
        }

        .apple-dropdown-header { padding: 0.8rem 1rem; display: flex; flex-direction: column; gap: 0.2rem; }
        .apple-dropdown-header strong { font-size: 0.9rem; color: #1d1d1f; }
        .apple-dropdown-header span { font-size: 0.8rem; color: #86868b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .apple-dropdown-divider { height: 1px; background: #e5e5ea; margin: 0.5rem 0; }
        .apple-dropdown-item {
          display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1rem; font-size: 0.9rem;
          color: #1d1d1f; text-decoration: none; border: none; background: none; width: 100%; text-align: left; cursor: pointer;
        }
        .apple-dropdown-item:hover { background: rgba(0, 113, 227, 0.1); color: #0071e3; }
        
        .mobile-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: #1d1d1f;
          z-index: 999;
          transform: translateY(-100%);
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          overflow-y: auto;
          padding-top: 70px; /* space for navbar */
        }
        .mobile-overlay.open {
          transform: translateY(0);
        }

        .mobile-overlay-content {
          padding: 2rem 1.25rem;
          animation: fadeInUp 0.5s ease;
        }

        .mobile-nav-list {
          display: flex;
          flex-direction: column;
        }

        .mobile-nav-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          color: #f5f5f7;
          text-decoration: none;
          font-size: 1.5rem;
          font-weight: 600;
          padding: 1rem;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
          .mobile-menu-btn { display: block; }
        }
      `}</style>
    </>
  );
}
