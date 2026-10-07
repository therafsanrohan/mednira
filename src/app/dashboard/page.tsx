'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Shield, AlertTriangle, QrCode, FileText, CheckCircle2, User, Activity, ArrowRight, HeartPulse, Pill, Users, Settings } from 'lucide-react';
import Link from 'next/link';

export default function DashboardHome() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/v1/dashboard/overview');
        if (res.ok) {
          const json = await res.json();
          setData(json.data);
        }
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
      <div className="space-y-8 max-w-5xl mx-auto pb-12 animate-pulse">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
          <div>
            <div className="h-8 bg-slate-200 rounded-lg w-48 mb-2"></div>
            <div className="h-4 bg-slate-200 rounded-lg w-64"></div>
          </div>
          <div className="h-10 bg-slate-200 rounded-xl w-32"></div>
        </header>
        <section className="h-24 bg-slate-100 rounded-2xl w-full"></section>
        <section className="space-y-4">
          <div className="h-6 bg-slate-200 rounded-lg w-32"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-100 rounded-2xl"></div>)}
          </div>
        </section>
        <section className="h-64 bg-slate-100 rounded-2xl w-full"></section>
      </div>
    );
  }

  const p = data?.user?.profile;
  const emergency = data?.emergency;
  
  // Calculate missing vital info for "Needs Attention"
  const missingItems = [];
  if (!p?.bloodType) missingItems.push('blood group');
  if (!p?.contacts?.length) missingItems.push('emergency contact');
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
          <Link href="/dashboard/medical-id" className="flex flex-col gap-3 p-5 bg-white border border-slate-200 rounded-2xl hover:border-indigo-300 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-indigo-100">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Medical ID</p>
              <p className="text-xs text-slate-500 mt-1 line-clamp-1">View complete identity</p>
            </div>
          </Link>
          
          <Link href="/dashboard/emergency-id" className="flex flex-col gap-3 p-5 bg-white border border-slate-200 rounded-2xl hover:border-emerald-300 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-emerald-100">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Emergency ID</p>
              <p className="text-xs text-slate-500 mt-1 line-clamp-1">Show QR to responders</p>
            </div>
          </Link>

          <Link href="/dashboard/account?tab=family" className="flex flex-col gap-3 p-5 bg-white border border-slate-200 rounded-2xl hover:border-sky-300 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-50 to-sky-100 flex items-center justify-center text-sky-600 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-sky-100">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Family</p>
              <p className="text-xs text-slate-500 mt-1 line-clamp-1">Manage dependents</p>
            </div>
          </Link>

          <Link href="/dashboard/account" className="flex flex-col gap-3 p-5 bg-white border border-slate-200 rounded-2xl hover:border-amber-300 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-amber-100">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Settings</p>
              <p className="text-xs text-slate-500 mt-1 line-clamp-1">Preferences & security</p>
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
                {p?.bloodType && (
                  <li className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Blood Group</span>
                    <span className="font-bold text-slate-900">{p.bloodType}</span>
                  </li>
                )}
                {p?.allergies?.length > 0 ? (
                  p.allergies.map((allergy: any) => (
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
                {p?.medications?.length > 0 ? (
                  p.medications.map((med: any) => (
                    <li key={med.id} className="flex flex-col text-sm">
                      <span className="font-medium text-slate-900">{med.genericName}</span>
                      <span className="text-slate-500 text-xs">{med.dosage || 'Active'}</span>
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
                {p?.contacts?.length > 0 ? (
                  p.contacts.map((contact: any) => (
                    <div key={contact.id} className="flex flex-col text-sm">
                      <span className="font-bold text-slate-900">{contact.name}</span>
                      <span className="text-slate-500">{contact.relationship}</span>
                      <span className="text-slate-600 mt-1">{contact.phone}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-slate-500">
                    No primary contact set.
                    <Link href="/dashboard/medical-id" className="block mt-2 text-indigo-600 font-medium hover:underline">Add Contact</Link>
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
