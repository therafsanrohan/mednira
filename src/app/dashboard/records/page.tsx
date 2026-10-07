'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ActivitySquare, FileText, Syringe, Activity, BedDouble, Stethoscope } from 'lucide-react';
import VaccinationsSection from './components/VaccinationsSection';
import ProceduresSection from './components/ProceduresSection';
import HospitalizationsSection from './components/HospitalizationsSection';
import { Toaster } from 'react-hot-toast';

export default function HealthRecordsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'VACCINATIONS' | 'PROCEDURES' | 'HOSPITALIZATIONS' | 'DOCUMENTS'>('VACCINATIONS');
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);

  const tabs = [
    { id: 'VACCINATIONS', label: 'Vaccinations', icon: Syringe },
    { id: 'PROCEDURES', label: 'Procedures', icon: Stethoscope },
    { id: 'HOSPITALIZATIONS', label: 'Hospitalizations', icon: BedDouble },
    { id: 'DOCUMENTS', label: 'Documents', icon: FileText },
  ];

  const fetchProfile = () => {
    if (session) {
      fetch('/api/v1/members/profile')
        .then(res => res.json())
        .then(data => {
          setProfileData(data.user?.profile);
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const p = profileData || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3 tracking-tight">
            <ActivitySquare className="w-8 h-8 text-indigo-600" />
            Health Records
          </h1>
          <p className="text-slate-500 mt-1">Manage and track your detailed medical history.</p>
        </div>
      </div>
      
      <Toaster position="top-right" toastOptions={{ style: { background: '#fff', color: '#0f172a', border: '1px solid #e2e8f0' } }} />

      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-indigo-500 text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {activeTab === 'VACCINATIONS' && (
          <VaccinationsSection initialData={p.vaccinations || []} onUpdate={fetchProfile} />
        )}

        {activeTab === 'PROCEDURES' && (
          <ProceduresSection initialData={p.procedures || []} onUpdate={fetchProfile} />
        )}

        {activeTab === 'HOSPITALIZATIONS' && (
          <HospitalizationsSection initialData={p.hospitalizations || []} onUpdate={fetchProfile} />
        )}

        {activeTab === 'DOCUMENTS' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center py-16">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-800">Medical Vault Upcoming</h3>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto">Secure medical document storage with signed URLs and private access is coming in Phase 6.</p>
          </div>
        )}
      </div>
    </div>
  );
}
