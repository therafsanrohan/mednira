'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { HeartPulse } from 'lucide-react';
import AllergiesSection from './components/AllergiesSection';
import ConditionsSection from './components/ConditionsSection';
import MedicationsSection from './components/MedicationsSection';
import ContactsSection from './components/ContactsSection';
import { Toaster } from 'react-hot-toast';

export default function MedicalProfilePage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);

  const fetchProfile = () => {
    if (session) {
      fetch('/api/v1/members/profile')
        .then(res => res.json())
        .then(data => {
          setProfileData(data.user);
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    fetchProfile();
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
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#fff' } }} />

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
        <ContactsSection initialData={p.contacts || []} onUpdate={fetchProfile} />

        {/* Allergies */}
        <AllergiesSection initialData={p.allergies || []} onUpdate={fetchProfile} />

        {/* Conditions */}
        <ConditionsSection initialData={p.conditions || []} onUpdate={fetchProfile} />

        {/* Medications */}
        <MedicationsSection initialData={p.medications || []} onUpdate={fetchProfile} />

      </div>
    </div>
  );
}
