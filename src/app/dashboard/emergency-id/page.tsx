'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { QrCode, ScanFace, Lock, Eye, ActivitySquare, ShieldAlert } from 'lucide-react';
import QRCode from 'react-qr-code';

export default function EmergencyIDPage() {
  const { data: session } = useSession();
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchDevices = () => {
    if (session) {
      fetch('/api/v1/devices')
        .then(res => res.json())
        .then(data => {
          if (data.devices) setDevices(data.devices);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchDevices();
  }, [session]);

  const generateQR = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/v1/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceType: 'QR', label: 'Primary Web QR' })
      });
      if (res.ok) {
        fetchDevices();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const primaryDevice = devices.find(d => d.deviceType === 'QR' && d.status === 'ACTIVE');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3 tracking-tight">
            <ScanFace className="w-8 h-8 text-cyan-600" />
            Emergency ID
          </h1>
          <p className="text-slate-500 mt-1">Manage your emergency access tokens and QR codes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* QR Code Section */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 lg:col-span-1 flex flex-col items-center justify-center text-center">
          <div className="bg-white p-4 rounded-2xl mb-6 shadow-xl">
            {primaryDevice ? (
              <QRCode value={`${window.location.origin}/e/${primaryDevice.token}`} size={200} />
            ) : (
              <div className="w-[200px] h-[200px] bg-slate-100 flex items-center justify-center rounded-xl">
                <QrCode className="w-12 h-12 text-slate-700" />
              </div>
            )}
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Public Emergency QR</h3>
          <p className="text-sm text-slate-500 mt-2 mb-6">
            Scannable by emergency responders to access your critical medical snapshot.
          </p>
          <div className="w-full flex flex-col gap-3">
            <button 
              onClick={generateQR}
              disabled={isGenerating}
              className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isGenerating ? 'Generating...' : primaryDevice ? 'Regenerate QR Code' : 'Generate QR Code'}
            </button>
            {primaryDevice && (
              <a 
                href={`/e/${primaryDevice.token}`}
                target="_blank" 
                rel="noreferrer"
                className="w-full py-2.5 bg-slate-50 hover:bg-slate-700 text-slate-800 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" /> Preview Public Profile
              </a>
            )}
          </div>
        </section>

        {/* Status & Access Logs */}
        <section className="space-y-6 lg:col-span-2">
          
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
              <ShieldAlert className="w-5 h-5 text-emerald-400" /> Access Controls
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200/50">
                <div>
                  <p className="text-slate-800 font-medium">Public QR Access</p>
                  <p className="text-slate-500 text-sm">Allow responders to view your critical info.</p>
                </div>
                <div className="w-12 h-6 bg-emerald-500 rounded-full flex items-center p-1">
                  <div className="w-4 h-4 bg-white rounded-full translate-x-6"></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200/50">
                <div>
                  <p className="text-slate-800 font-medium">NFC Card Status</p>
                  <p className="text-slate-500 text-sm">No NFC cards are currently linked to this profile.</p>
                </div>
                <button className="text-sm font-medium text-cyan-400 hover:text-cyan-300">Order NFC Card</button>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-slate-500" /> Recent Access Logs
            </h2>
            <div className="text-center py-8">
              <ActivitySquare className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Your emergency profile hasn't been accessed recently.</p>
            </div>
          </div>

        </section>
      </div>
    </div>
  );
}
