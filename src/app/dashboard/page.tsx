'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Shield, AlertTriangle, QrCode, FileText, CheckCircle2, User, Activity, ArrowRight, HeartPulse, Pill, Users } from 'lucide-react';
import Link from 'next/link';

export default function DashboardHome() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, emergencyRes] = await Promise.all([
          fetch('/api/v1/members/profile'),
          fetch('/api/v1/members/emergency-id')
        ]);
        
        let profile = null;
        let emergency = null;
        
        if (profileRes.ok) {
          const pData = await profileRes.json();
          profile = pData.user;
        }
        
        if (emergencyRes.ok) {
          const eData = await emergencyRes.json();
          emergency = eData.data;
        }
        
        setData({ profile, emergency });
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (session) {
      fetchData();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-300"></div>
      </div>
    );
  }

  const p = data?.profile?.profile;
  const emergency = data?.emergency;
  
  // Calculate missing vital info for "Needs Attention"
  const missingItems = [];
  if (!p?.bloodGroup) missingItems.push('blood group');
  if (!p?.emergencyContacts?.length) missingItems.push('emergency contact');
  if (!emergency?.isPublic) missingItems.push('Emergency ID activation');

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      
      {/* 1. WELCOME & STATUS */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Hello, {session?.user?.name?.split(' ')[0] || 'there'}
          </h1>
          <p className="text-slate-500 mt-1">Here is your medical identity at a glance.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl">
            <span className={`w-2.5 h-2.5 rounded-full ${emergency?.isPublic ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 font-medium leading-tight">Emergency ID</span>
              <span className="text-sm font-bold text-slate-900 leading-tight">{emergency?.isPublic ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. NEEDS ATTENTION */}
      {missingItems.length > 0 ? (
        <section className="bg-amber-50 border border-amber-200 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-4 items-start">
            <div className="mt-1 bg-amber-100 p-2 rounded-full text-amber-600 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-amber-900 text-lg">Needs Attention</h2>
              <p className="text-amber-800 text-sm mt-1">
                Your medical identity is missing {missingItems.length} important {missingItems.length === 1 ? 'item' : 'items'}: {missingItems.join(', ')}.
              </p>
            </div>
          </div>
          <Link href="/dashboard/medical-profile" className="shrink-0 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors text-sm">
            Complete Profile
          </Link>
        </section>
      ) : (
        <section className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <p className="text-emerald-800 font-medium text-sm">You're all set. No immediate actions required.</p>
        </section>
      )}

      {/* 3. QUICK ACTIONS */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/dashboard/medical-profile" className="flex flex-col gap-3 p-5 bg-white border border-slate-200 rounded-2xl hover:border-slate-300 hover:shadow-sm transition-all group">
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-100 transition-colors">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Medical Info</p>
              <p className="text-xs text-slate-500 mt-0.5">Update conditions & allergies</p>
            </div>
          </Link>
          
          <Link href="/dashboard/emergency-id" className="flex flex-col gap-3 p-5 bg-white border border-slate-200 rounded-2xl hover:border-slate-300 hover:shadow-sm transition-all group">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-100 transition-colors">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Show QR</p>
              <p className="text-xs text-slate-500 mt-0.5">Open Emergency ID</p>
            </div>
          </Link>

          <Link href="/dashboard/medications" className="flex flex-col gap-3 p-5 bg-white border border-slate-200 rounded-2xl hover:border-slate-300 hover:shadow-sm transition-all group">
            <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center text-sky-600 group-hover:bg-sky-100 transition-colors">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Medications</p>
              <p className="text-xs text-slate-500 mt-0.5">Manage prescriptions</p>
            </div>
          </Link>

          <Link href="/dashboard/documents" className="flex flex-col gap-3 p-5 bg-white border border-slate-200 rounded-2xl hover:border-slate-300 hover:shadow-sm transition-all group">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-100 transition-colors">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Documents</p>
              <p className="text-xs text-slate-500 mt-0.5">Upload medical records</p>
            </div>
          </Link>
        </div>
      </section>

      {/* 4. MEDICAL SNAPSHOT */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Medical Snapshot</h2>
          <Link href="/dashboard/medical-id" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            View Complete Identity <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-rose-500" />
                <h3 className="font-bold text-slate-900">Critical Alerts</h3>
              </div>
              <ul className="space-y-3">
                {p?.bloodGroup && (
                  <li className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Blood Group</span>
                    <span className="font-bold text-slate-900">{p.bloodGroup}</span>
                  </li>
                )}
                {p?.allergies?.filter((a: any) => a.severity === 'LIFE_THREATENING' || a.severity === 'SEVERE').length > 0 ? (
                  p.allergies.filter((a: any) => a.severity === 'LIFE_THREATENING' || a.severity === 'SEVERE').map((allergy: any) => (
                    <li key={allergy.id} className="flex flex-col text-sm">
                      <span className="font-bold text-rose-700">{allergy.substance}</span>
                      <span className="text-slate-500 text-xs">Severe Allergy</span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-slate-500">No critical allergies.</li>
                )}
              </ul>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Pill className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-slate-900">Current Medications</h3>
              </div>
              <ul className="space-y-3">
                {p?.medications?.filter((m: any) => m.status === 'ACTIVE').length > 0 ? (
                  p.medications.filter((m: any) => m.status === 'ACTIVE').slice(0, 3).map((med: any) => (
                    <li key={med.id} className="flex flex-col text-sm">
                      <span className="font-medium text-slate-900">{med.name}</span>
                      <span className="text-slate-500 text-xs">{med.dosage}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-slate-500">No active medications recorded.</li>
                )}
              </ul>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-slate-900">Primary Contact</h3>
              </div>
              <div className="space-y-3">
                {p?.emergencyContacts?.filter((c: any) => c.isPrimary).length > 0 ? (
                  p.emergencyContacts.filter((c: any) => c.isPrimary).map((contact: any, i: number) => (
                    <div key={i} className="flex flex-col text-sm">
                      <span className="font-bold text-slate-900">{contact.name}</span>
                      <span className="text-slate-500">{contact.relationship}</span>
                      <span className="text-slate-600 mt-1">{contact.phone}</span>
                    </div>
                  ))
                ) : p?.emergencyContacts?.length > 0 ? (
                  <div className="flex flex-col text-sm">
                    <span className="font-bold text-slate-900">{p.emergencyContacts[0].name}</span>
                    <span className="text-slate-500">{p.emergencyContacts[0].relationship}</span>
                  </div>
                ) : (
                  <div className="text-sm text-slate-500">
                    No emergency contacts set.
                    <Link href="/dashboard/medical-profile" className="block mt-2 text-indigo-600 font-medium hover:underline">Add Contact</Link>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
