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
  X,
} from 'lucide-react';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/dashboard/emergency-id', label: 'Emergency ID', icon: QrCode },
  { href: '/dashboard/activity', label: 'Activity', icon: Activity },
];

const MARKETING_LINKS = [
  { href: '#about', label: 'About' },
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#security', label: 'Security' },
];

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    if (document.body) {
      document.body.style.overflow = 'auto';
    }
  }, [pathname]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    if (document.body) {
      document.body.style.overflow = !mobileMenuOpen ? 'hidden' : 'auto';
    }
  };

  const isAuthenticated = status === 'authenticated' && session?.user;
  const isAuthPage = pathname.startsWith('/auth/');
  const isPublicPage = pathname === '/' || pathname === '/privacy' || pathname === '/terms';
  const user = session?.user;

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

  if (pathname.startsWith('/dashboard')) return null;

  return (
    <>
      <header className={`premium-navbar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
      <div className="navbar-container">
        {/* Logo */}
        <Link href="/" className="nav-brand" onClick={() => setMobileMenuOpen(false)}>
          <Shield size={22} color="#0071e3" strokeWidth={2.5} />
          <span className="brand-text">MedNira</span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="desktop-nav desktop-only">
          {isPublicPage ? (
            MARKETING_LINKS.map(({ href, label }) => (
              <a key={href} href={href} className="nav-link">
                <span>{label}</span>
              </a>
            ))
          ) : isAuthenticated && !isAuthPage ? (
            NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const active = href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);
              return (
                <Link key={href} href={href} className={`nav-link ${active ? 'active' : ''}`}>
                  <Icon size={16} />
                  <span>{label}</span>
                </Link>
              );
            })
          ) : null}
        </nav>

        {/* Right section */}
        <div className="nav-right">
          {isPublicPage ? (
            <div className="nav-auth-buttons desktop-only">
              <Link href="/auth/login" className="btn btn-secondary premium-btn-outline">Sign in</Link>
              <Link href="/auth/register" className="btn btn-primary premium-btn">Get started</Link>
            </div>
          ) : status === 'loading' ? (
            <div className="nav-loading-pulse" />
          ) : isAuthenticated ? (
            <div className="nav-user-menu desktop-only" ref={dropdownRef}>
              <button className="nav-avatar" onClick={() => setDropdownOpen(!dropdownOpen)}>
                {initials}
              </button>

              {dropdownOpen && (
                <div className="nav-dropdown">
                  <div className="nav-user-info">
                    <div className="nav-user-name">{user?.name || 'User'}</div>
                    <div className="nav-user-email">{user?.email}</div>
                  </div>
                  <div className="nav-separator" />
                  <Link href="/dashboard" className="nav-dropdown-item" onClick={() => setDropdownOpen(false)}><Home size={16} /> Dashboard</Link>
                  <Link href="/dashboard/emergency-id" className="nav-dropdown-item" onClick={() => setDropdownOpen(false)}><QrCode size={16} /> Emergency ID</Link>
                  <Link href="/dashboard/profile" className="nav-dropdown-item" onClick={() => setDropdownOpen(false)}><User size={16} /> Profile</Link>
                  <Link href="/dashboard/settings" className="nav-dropdown-item" onClick={() => setDropdownOpen(false)}><Settings size={16} /> Settings</Link>
                  <div className="nav-separator" />
                  <button className="nav-dropdown-item danger" onClick={handleSignOut}><LogOut size={16} /> Sign out</button>
                </div>
              )}
            </div>
          ) : !isAuthPage ? (
            <div className="nav-auth-buttons desktop-only">
              <Link href="/auth/login" className="btn btn-secondary premium-btn-outline">Sign in</Link>
              <Link href="/auth/register" className="btn btn-primary premium-btn">Get started</Link>
            </div>
          ) : null}

          {/* Mobile Menu Toggle */}
          <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>
    </header>

      {/* Mobile Fullscreen Menu */}
      <div className={`mobile-menu-overlay ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-content">
          {isPublicPage ? (
            <>
              <div className="mobile-nav-links" style={{ marginBottom: '2rem' }}>
                {MARKETING_LINKS.map(({ href, label }) => (
                  <a key={href} href={href} className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                    {label}
                  </a>
                ))}
              </div>
              <div className="mobile-auth-actions" style={{ marginTop: 'auto' }}>
                <Link href="/auth/register" className="btn btn-primary premium-btn w-full text-center py-3" style={{ justifyContent: 'center' }} onClick={() => setMobileMenuOpen(false)}>
                  Create your Emergency ID
                </Link>
                <Link href="/auth/login" className="btn btn-secondary premium-btn-outline w-full text-center py-3 mt-3" style={{ justifyContent: 'center' }} onClick={() => setMobileMenuOpen(false)}>
                  Sign in to account
                </Link>
              </div>
            </>
          ) : isAuthenticated ? (
            <>
              <div className="mobile-user-profile">
                <div className="nav-avatar large">{initials}</div>
                <div>
                  <div className="mobile-user-name">{user?.name}</div>
                  <div className="mobile-user-email">{user?.email}</div>
                </div>
              </div>
              <div className="mobile-nav-links">
                {NAV_LINKS.map(({ href, label, icon: Icon }) => (
                  <Link key={href} href={href} className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                    <Icon size={20} /> {label}
                  </Link>
                ))}
                <Link href="/dashboard/profile" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                  <User size={20} /> Profile
                </Link>
                <Link href="/dashboard/settings" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                  <Settings size={20} /> Settings
                </Link>
              </div>
              <button className="mobile-nav-link danger" onClick={handleSignOut} style={{ marginTop: 'auto' }}>
                <LogOut size={20} /> Sign out
              </button>
            </>
          ) : (
            <div className="mobile-auth-actions">
              <Link href="/auth/register" className="btn btn-primary premium-btn w-full text-center py-3" style={{ justifyContent: 'center' }} onClick={() => setMobileMenuOpen(false)}>
                Create your Emergency ID
              </Link>
              <Link href="/auth/login" className="btn btn-secondary premium-btn-outline w-full text-center py-3 mt-3" style={{ justifyContent: 'center' }} onClick={() => setMobileMenuOpen(false)}>
                Sign in to account
              </Link>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .premium-navbar {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: rgba(251, 251, 253, 0.85);
          backdrop-filter: saturate(180%) blur(20px);
          -webkit-backdrop-filter: saturate(180%) blur(20px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          height: 68px;
          display: flex;
          align-items: center;
          transition: background 0.3s ease;
        }

        .premium-navbar.mobile-open {
          background: #ffffff;
        }

        .navbar-container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          text-decoration: none;
          z-index: 1001;
        }

        .brand-logo-container {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: linear-gradient(135deg, #0071e3 0%, #43b9ff 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 113, 227, 0.3);
        }

        .brand-text {
          font-weight: 800;
          font-size: 1.25rem;
          color: #1d1d1f;
          letter-spacing: -0.03em;
        }

        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
          margin-left: 2rem;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.5rem 0.875rem;
          border-radius: 99px;
          font-size: 0.9rem;
          font-weight: 600;
          color: #424245;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .nav-link:hover {
          color: #1d1d1f;
          background: rgba(0, 0, 0, 0.04);
        }

        .nav-link.active {
          color: #0071e3;
          background: rgba(0, 113, 227, 0.1);
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 1rem;
          z-index: 1001;
        }

        .nav-auth-buttons {
          display: flex;
          gap: 0.75rem;
        }

        .premium-btn {
          min-height: 40px;
          padding: 0 1.25rem;
          border-radius: 99px;
          font-size: 0.95rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0071e3;
          color: white;
          border: none;
          transition: all 0.2s ease;
        }

        .premium-btn:hover {
          background: #0077ed;
          transform: scale(1.02);
        }

        .premium-btn-outline {
          min-height: 40px;
          padding: 0 1.25rem;
          border-radius: 99px;
          font-size: 0.95rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.04);
          color: #1d1d1f;
          border: none;
          transition: all 0.2s ease;
        }

        .premium-btn-outline:hover {
          background: rgba(0,0,0,0.08);
        }

        .nav-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0071e3 0%, #43b9ff 100%);
          color: white;
          font-size: 0.9rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 113, 227, 0.2);
        }

        .nav-avatar.large {
          width: 50px;
          height: 50px;
          font-size: 1.2rem;
        }

        .nav-user-menu {
          position: relative;
        }

        .nav-dropdown {
          position: absolute;
          top: calc(100% + 0.5rem);
          right: 0;
          min-width: 240px;
          background: #ffffff;
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 16px;
          padding: 0.5rem;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          animation: dropIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-10px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .nav-user-info {
          padding: 0.75rem 1rem;
        }
        .nav-user-name { font-weight: 700; color: #1d1d1f; font-size: 0.95rem; }
        .nav-user-email { color: #86868b; font-size: 0.8rem; margin-top: 0.2rem; }

        .nav-dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          font-size: 0.9rem;
          font-weight: 600;
          color: #424245;
          text-decoration: none;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .nav-dropdown-item:hover {
          background: #f5f5f7;
          color: #1d1d1f;
        }
        .nav-dropdown-item.danger { color: #e11d48; }
        .nav-dropdown-item.danger:hover { background: #fff1f2; }

        .nav-separator { height: 1px; background: rgba(0,0,0,0.05); margin: 0.5rem 0; }

        .nav-loading-pulse {
          width: 38px; height: 38px; border-radius: 50%;
          background: rgba(0,0,0,0.05);
          animation: pulse 1.5s infinite;
        }

        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          color: #1d1d1f;
          cursor: pointer;
          padding: 0.25rem;
        }

        .mobile-menu-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: #ffffff;
          z-index: 999;
          padding-top: 80px;
          opacity: 0;
          pointer-events: none;
          transform: translateY(-10px);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .mobile-menu-overlay.open {
          opacity: 1;
          pointer-events: auto;
          transform: translateY(0);
        }

        .mobile-menu-content {
          padding: 2rem 1.5rem;
          display: flex;
          flex-direction: column;
          height: 100%;
          max-width: 600px;
          margin: 0 auto;
        }

        .mobile-user-profile {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid rgba(0,0,0,0.05);
          margin-bottom: 2rem;
        }
        .mobile-user-name { font-size: 1.25rem; font-weight: 700; color: #1d1d1f; }
        .mobile-user-email { font-size: 0.95rem; color: #86868b; }

        .mobile-nav-links {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .mobile-nav-link {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          font-size: 1.1rem;
          font-weight: 600;
          color: #1d1d1f;
          text-decoration: none;
          border-radius: 16px;
          background: rgba(0,0,0,0.02);
          border: none;
          text-align: left;
        }
        .mobile-nav-link.danger { color: #e11d48; background: #fff1f2; margin-top: auto; }

        .w-full { width: 100%; }
        .text-center { text-align: center; }
        .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
        .mt-3 { margin-top: 0.75rem; }

        @media (max-width: 1024px) {
          .desktop-only { display: none !important; }
          .mobile-menu-btn { display: flex; align-items: center; justify-content: center; }
        }
      `}</style>
    </>
  );
}
