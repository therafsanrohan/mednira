'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Shield, 
  LayoutDashboard, 
  User, 
  HeartPulse, 
  ActivitySquare, 
  QrCode, 
  Settings,
  Menu,
  X,
  Pill,
  History,
  FileText,
  TestTube,
  Activity,
  Syringe,
  Stethoscope,
  Calendar,
  Users,
  CreditCard,
  Lock,
  Bell,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronUp
} from 'lucide-react';

const navigationGroups = [
  {
    name: 'HEALTH',
    items: [
      { label: 'Medical Overview', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Medical ID', href: '/dashboard/medical-id', icon: User },
      { label: 'Medical Profile', href: '/dashboard/medical-profile', icon: HeartPulse },
      { label: 'Health Records', href: '/dashboard/records', icon: ActivitySquare },
      { label: 'Medications', href: '/dashboard/medications', icon: Pill },
      { label: 'Documents', href: '/dashboard/documents', icon: FileText },
    ]
  },
  {
    name: 'EMERGENCY',
    items: [
      { label: 'Emergency ID', href: '/dashboard/emergency-id', icon: Shield },
    ]
  },
  {
    name: 'FAMILY',
    items: [
      { label: 'Family & Dependents', href: '/dashboard/account?tab=family', icon: User },
    ]
  },
  {
    name: 'ACCOUNT',
    items: [
      { label: 'Account Center', href: '/dashboard/account', icon: Settings },
    ]
  }
];

export default function Sidebar({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
    setIsUserMenuOpen(false);
  }, [pathname]);

  const isActiveRoute = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between bg-white border-b border-slate-200 p-4 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">MedNira</span>
        </div>
        <button onClick={() => setIsOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 md:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-[100dvh] bg-white border-r border-slate-200 flex flex-col z-50 transition-all duration-300 ease-in-out
        ${isCollapsed ? 'md:w-[72px]' : 'md:w-64'}
        ${isOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && <span className="text-xl font-bold text-slate-900 tracking-tight truncate">MedNira</span>}
          </div>
          
          <button onClick={() => setIsOpen(false)} className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
          <div className="px-3 space-y-6">
            {navigationGroups.map((group, idx) => (
              <div key={idx}>
                {!isCollapsed && (
                  <h3 className="px-3 text-xs font-semibold text-slate-400 tracking-wider mb-2 uppercase">
                    {group.name}
                  </h3>
                )}
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const active = isActiveRoute(item.href);
                    return (
                      <div key={item.href} className="relative group/nav">
                        <Link
                          href={item.href}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                            active 
                              ? 'bg-slate-100 text-slate-900 font-medium' 
                              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                          } ${isCollapsed ? 'justify-center' : ''}`}
                        >
                          <item.icon className={`shrink-0 transition-colors ${
                            active ? 'text-slate-900 w-5 h-5' : 'text-slate-400 group-hover/nav:text-slate-600 w-5 h-5'
                          }`} strokeWidth={active ? 2.5 : 2} />
                          
                          {!isCollapsed && (
                            <span className="truncate">{item.label}</span>
                          )}
                        </Link>
                        
                        {/* Tooltip for collapsed state */}
                        {isCollapsed && (
                          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-medium rounded opacity-0 pointer-events-none group-hover/nav:opacity-100 transition-opacity z-50 whitespace-nowrap">
                            {item.label}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* Footer actions */}
        <div className="shrink-0 border-t border-slate-100 p-3 relative">
          
          {/* Collapse Toggle (Desktop only) */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex absolute -right-3 top-[-16px] w-6 h-6 bg-white border border-slate-200 rounded-full items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all z-10"
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>

          {/* User Menu Popover */}
          {isUserMenuOpen && !isCollapsed && (
            <div className="absolute bottom-[calc(100%+8px)] left-3 right-3 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="px-3 py-2 border-b border-slate-100 mb-2">
                <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
              <Link href="/dashboard/account" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors">
                <User className="w-4 h-4" /> Account Center
              </Link>
              <button 
                onClick={() => window.location.href = '/api/auth/signout'}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-left"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          )}

          <button 
            onClick={() => isCollapsed ? window.location.href = '/dashboard/account' : setIsUserMenuOpen(!isUserMenuOpen)}
            className={`w-full flex items-center gap-3 p-2 rounded-xl transition-colors hover:bg-slate-50 ${isUserMenuOpen ? 'bg-slate-50' : ''} ${isCollapsed ? 'justify-center' : ''}`}
          >
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0">
              <User className="w-4 h-4 text-slate-500" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0 text-left flex items-center justify-between">
                <div className="truncate pr-2">
                  <p className="text-sm font-medium text-slate-900 truncate">{user?.name || 'User'}</p>
                </div>
                <ChevronUp className={`w-4 h-4 text-slate-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
