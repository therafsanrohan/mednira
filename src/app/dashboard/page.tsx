'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Shield, AlertTriangle, Syringe, HeartPulse, QrCode, Phone, Activity } from 'lucide-react';

export default function DashboardHome() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/members/profile');
      if (res.ok) {
        const data = await res.json();
        setProfileData(data.user);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) fetchProfile();
  }, [session, fetchProfile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const p = profileData?.profile;

  // Compute Age
  let age = 'N/A';
  if (p?.dateOfBirth) {
    const dob = new Date(p.dateOfBirth);
    const diff = Date.now() - dob.getTime();
    const ageDate = new Date(diff); 
    age = Math.abs(ageDate.getUTCFullYear() - 1970).toString();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Emergency Snapshot</h1>
          <p className="text-slate-500 mt-1">What responders need to know at a glance.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <Shield className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium text-emerald-400">Profile Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Basic Info */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Patient</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-500">Full Name</p>
              <p className="text-lg font-semibold text-slate-900">{session?.user?.name || 'Not Set'}</p>
            </div>
            <div className="flex gap-8">
              <div>
                <p className="text-xs text-slate-500">Age</p>
                <p className="text-md font-medium text-slate-900">{age}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Blood</p>
                <p className="text-md font-medium text-rose-600 flex items-center gap-1">
                  <DropletIcon className="w-4 h-4" /> 
                  {p?.bloodType ? `${p.bloodType}${p.rhFactor || ''}` : 'Unknown'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Critical Allergies */}
        <div className="bg-white border border-rose-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-semibold text-rose-600 uppercase tracking-wider mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Allergies
          </h3>
          <ul className="space-y-2">
            {p?.allergies?.filter((a: any) => a.severity === 'LIFE_THREATENING' || a.severity === 'SEVERE').length > 0 ? (
              p.allergies.map((allergy: any) => (
                <li key={allergy.id} className="text-sm font-medium text-slate-800">
                  {allergy.substance} <span className="text-xs font-normal text-rose-600">({allergy.severity})</span>
                </li>
              ))
            ) : (
              <p className="text-sm text-slate-500 italic">No critical allergies recorded.</p>
            )}
          </ul>
        </div>

        {/* Critical Conditions */}
        <div className="bg-white border border-amber-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4" /> Conditions
          </h3>
          <ul className="space-y-2">
            {p?.conditions?.filter((c: any) => c.status === 'Active').length > 0 ? (
              p.conditions.map((c: any) => (
                <li key={c.id} className="text-sm font-medium text-slate-800">
                  {c.conditionName}
                </li>
              ))
            ) : (
              <p className="text-sm text-slate-500 italic">No active critical conditions.</p>
            )}
          </ul>
        </div>

        {/* Emergency Contacts */}
        <div className="bg-white border border-blue-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Phone className="w-4 h-4" /> Contacts
          </h3>
          <ul className="space-y-3">
            {p?.contacts?.length > 0 ? (
              p.contacts.map((c: any) => (
                <li key={c.id}>
                  <p className="text-sm font-medium text-slate-800">{c.name}</p>
                  <p className="text-xs text-slate-500">{c.relationship} • {c.phone}</p>
                </li>
              ))
            ) : (
              <p className="text-sm text-slate-500 italic">No emergency contacts set.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

function DropletIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
    </svg>
  );
}
