'use client';

import { Settings, Lock, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const handleExport = async () => {
    try {
      const res = await fetch('/api/v1/members/profile');
      const data = await res.json();
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mednira_export.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3 tracking-tight">
            <Settings className="w-8 h-8 text-slate-500" />
            Account Settings
          </h1>
          <p className="text-slate-500 mt-1">Manage your privacy and download your data.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Privacy Center */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-semibold text-slate-900">Privacy Center</h2>
          </div>
          <p className="text-slate-500 text-sm mb-4">
            Your Medical ID is governed by the visibility settings on your individual records. 
            Only records marked as "Public Emergency ID" or "Emergency Responder" are accessible via your QR code.
          </p>
        </section>

        {/* Data Export */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Download className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-semibold text-slate-900">Data Export</h2>
          </div>
          <p className="text-slate-500 text-sm mb-4">
            Download a complete copy of your medical records and profile data in a structured format (JSON).
          </p>
          <button 
            onClick={handleExport}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-medium transition-colors border border-slate-200"
          >
            <Download className="w-4 h-4" /> Export My Data
          </button>
        </section>

      </div>
    </div>
  );
}
