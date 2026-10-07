'use client';

import { useState, useEffect } from 'react';
import { QrCode, Shield, Download, CheckCircle2, Lock, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MedicalIDPage() {
  const [profileId, setProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/v1/members/profile');
        if (res.ok) {
          const json = await res.json();
          setProfileId(json.profile?.id || 'PENDING-SETUP');
        }
      } catch (err) {
        toast.error('Failed to load Medical ID');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Medical ID</h1>
        <p className="text-slate-500 mt-1">Manage your emergency identification and QR code access.</p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading Medical ID...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Virtual Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>
            
            <div className="flex justify-between items-start relative z-10">
              <div className="flex items-center gap-2">
                <Shield className="w-8 h-8 text-emerald-400" />
                <span className="text-xl font-bold tracking-wider">MedNira</span>
              </div>
              <span className="px-3 py-1 bg-white/10 text-emerald-300 text-xs font-semibold rounded-full border border-white/10 uppercase tracking-wide">
                Emergency Use Only
              </span>
            </div>

            <div className="mt-12 flex justify-between items-end relative z-10">
              <div>
                <p className="text-sm text-slate-400 font-medium mb-1">Global Medical ID</p>
                <p className="font-mono text-xl tracking-widest">{profileId?.substring(0, 16) || 'XXXX-XXXX-XXXX'}</p>
              </div>
              
              <div className="bg-white p-2 rounded-xl">
                <QrCode className="w-16 h-16 text-slate-900" />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                <div>
                  <h3 className="font-semibold text-slate-900">ID Status: Active</h3>
                  <p className="text-sm text-slate-500">Your QR code is ready to be scanned by first responders.</p>
                </div>
              </div>
              <button className="w-full flex justify-center items-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-colors">
                <Download className="w-4 h-4" /> Download PDF Card
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-4">Linked Devices</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-slate-100 rounded-xl bg-slate-50">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Apple Wallet</p>
                      <p className="text-xs text-slate-500">Not added</p>
                    </div>
                  </div>
                  <button className="text-emerald-600 text-sm font-medium hover:text-emerald-700">Add</button>
                </div>
                <div className="flex items-center justify-between p-3 border border-slate-100 rounded-xl bg-slate-50">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">NFC Wristband</p>
                      <p className="text-xs text-slate-500">Unlinked</p>
                    </div>
                  </div>
                  <button className="text-emerald-600 text-sm font-medium hover:text-emerald-700">Order</button>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
