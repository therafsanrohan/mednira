'use client';

import { useState } from 'react';
import { ActivitySquare, FileText, FlaskConical, Syringe, Activity, Plus } from 'lucide-react';

export default function HealthRecordsPage() {
  const [activeTab, setActiveTab] = useState<'LABS' | 'VITALS' | 'VACCINATIONS' | 'DOCUMENTS'>('LABS');

  const tabs = [
    { id: 'LABS', label: 'Lab Reports', icon: FlaskConical },
    { id: 'VITALS', label: 'Vitals', icon: Activity },
    { id: 'VACCINATIONS', label: 'Vaccinations', icon: Syringe },
    { id: 'DOCUMENTS', label: 'Documents', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <ActivitySquare className="w-8 h-8 text-indigo-400" />
            Health Records
          </h1>
          <p className="text-slate-400 mt-1">Manage and track your detailed medical history.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors">
          <Plus className="w-5 h-5" /> Add Record
        </button>
      </div>

      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-indigo-500 text-white shadow-md'
                : 'bg-slate-800/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 min-h-[400px]">
        
        {activeTab === 'LABS' && (
          <div className="text-center py-16">
            <FlaskConical className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-200">No Lab Reports</h3>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto">Upload your blood tests, pathology reports, and other lab results to track historical trends.</p>
          </div>
        )}

        {activeTab === 'VITALS' && (
          <div className="text-center py-16">
            <Activity className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-200">No Vitals Recorded</h3>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto">Track your blood pressure, heart rate, weight, and other vital signs over time.</p>
          </div>
        )}

        {activeTab === 'VACCINATIONS' && (
          <div className="text-center py-16">
            <Syringe className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-200">No Vaccinations</h3>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto">Keep a secure digital record of your immunizations and vaccination certificates.</p>
          </div>
        )}

        {activeTab === 'DOCUMENTS' && (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-200">Medical Vault Empty</h3>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto">Securely store discharge summaries, prescriptions, and medical certificates.</p>
          </div>
        )}

      </div>
    </div>
  );
}
