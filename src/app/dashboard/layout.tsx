import { ReactNode } from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Sidebar from './components/Sidebar';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  
  if (!session) {
    redirect('/auth/signin');
  }



  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row font-sans">
      {/* Sidebar & Mobile Navigation */}
      <Sidebar user={session.user} />

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-y-auto bg-slate-50 relative">
        <div className="p-4 md:p-8 max-w-7xl mx-auto relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
