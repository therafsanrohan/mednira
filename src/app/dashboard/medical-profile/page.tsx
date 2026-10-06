'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { HeartPulse, Plus, Edit2, Trash2, AlertTriangle, Syringe, Activity, Phone } from 'lucide-react';

export default function MedicalProfilePage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    if (session) {
      fetch('/api/v1/members/profile')
        .then(res => res.json())
        .then(data => {
          setProfileData(data.user);
          setLoading(false);
        });
    }
  }, [session]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const p = profileData?.profile || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <HeartPulse className="w-8 h-8 text-emerald-400" />
            Medical Profile
          </h1>
          <p className="text-slate-400 mt-1">Manage your complete medical identity.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-100">Personal Information</h2>
            <button className="text-emerald-400 hover:text-emerald-300 text-sm font-medium">Edit</button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Blood Group</p>
              <p className="text-slate-200 font-medium">{p.bloodType ? `${p.bloodType}${p.rhFactor || ''}` : 'Not set'}</p>
            </div>
            <div>
              <p className="text-slate-500">Date of Birth</p>
              <p className="text-slate-200 font-medium">{p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString() : 'Not set'}</p>
            </div>
            <div>
              <p className="text-slate-500">Height</p>
              <p className="text-slate-200 font-medium">{p.height || 'Not set'}</p>
            </div>
            <div>
              <p className="text-slate-500">Weight</p>
              <p className="text-slate-200 font-medium">{p.weight || 'Not set'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-slate-500">Emergency Notes</p>
              <p className="text-slate-200">{p.emergencyNotes || 'None'}</p>
            </div>
          </div>
        </section>

        {/* Emergency Contacts */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Phone className="w-5 h-5 text-blue-400" /> Contacts
            </h2>
            <button className="text-emerald-400 hover:text-emerald-300 text-sm font-medium flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
          <ul className="space-y-4">
            {p.contacts?.length > 0 ? (
              p.contacts.map((c: any) => (
                <li key={c.id} className="flex items-start justify-between border-b border-slate-800 pb-3 last:border-0">
                  <div>
                    <p className="text-slate-200 font-medium">{c.name}</p>
                    <p className="text-slate-400 text-sm">{c.relationship} • {c.phone}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-slate-500 hover:text-slate-300"><Edit2 className="w-4 h-4" /></button>
                    <button className="text-slate-500 hover:text-rose-400"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </li>
              ))
            ) : (
              <p className="text-slate-500 italic text-sm">No contacts added.</p>
            )}
          </ul>
        </section>

        {/* Allergies */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" /> Allergies
            </h2>
            <button className="text-emerald-400 hover:text-emerald-300 text-sm font-medium flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
          <ul className="space-y-4">
            {p.allergies?.length > 0 ? (
              p.allergies.map((a: any) => (
                <li key={a.id} className="flex items-start justify-between border-b border-slate-800 pb-3 last:border-0">
                  <div>
                    <p className="text-slate-200 font-medium">{a.substance}</p>
                    <p className="text-slate-400 text-sm">Severity: <span className={a.severity === 'LIFE_THREATENING' ? 'text-rose-400' : ''}>{a.severity}</span></p>
                  </div>
                </li>
              ))
            ) : (
              <p className="text-slate-500 italic text-sm">No allergies recorded.</p>
            )}
          </ul>
        </section>

        {/* Conditions */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-400" /> Conditions
            </h2>
            <button className="text-emerald-400 hover:text-emerald-300 text-sm font-medium flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
          <ul className="space-y-4">
            {p.conditions?.length > 0 ? (
              p.conditions.map((c: any) => (
                <li key={c.id} className="flex items-start justify-between border-b border-slate-800 pb-3 last:border-0">
                  <div>
                    <p className="text-slate-200 font-medium">{c.conditionName}</p>
                    <p className="text-slate-400 text-sm">Status: {c.status}</p>
                  </div>
                </li>
              ))
            ) : (
              <p className="text-slate-500 italic text-sm">No conditions recorded.</p>
            )}
          </ul>
        </section>

        {/* Medications */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Syringe className="w-5 h-5 text-emerald-400" /> Medications
            </h2>
            <button className="text-emerald-400 hover:text-emerald-300 text-sm font-medium flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {p.medications?.length > 0 ? (
              p.medications.map((m: any) => (
                <div key={m.id} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                  <p className="text-slate-200 font-semibold">{m.genericName} {m.brandName ? `(${m.brandName})` : ''}</p>
                  <p className="text-slate-400 text-sm">{m.dosage || 'Dosage not set'} • {m.frequency || 'Frequency not set'}</p>
                  <p className="text-slate-500 text-xs mt-2">Status: {m.status}</p>
                </div>
              ))
            ) : (
              <p className="text-slate-500 italic text-sm">No active medications.</p>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
