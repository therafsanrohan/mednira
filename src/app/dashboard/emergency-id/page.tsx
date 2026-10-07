'use client';

import { useState, useEffect } from 'react';
import { Shield, QrCode, Smartphone, Download, Share2, Printer, Activity, AlertTriangle, Eye, EyeOff, Lock, Users, Phone, CheckCircle2, History, X, RefreshCw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function EmergencyIDPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const fetchEmergencyData = async () => {
    try {
      const res = await fetch('/api/v1/members/emergency-id');
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      }
    } catch (err) {
      toast.error('Failed to load Emergency ID');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmergencyData();
  }, []);

  const toggleVisibility = async () => {
    setIsToggling(true);
    try {
      const res = await fetch('/api/v1/members/emergency-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_visibility', isPublic: !data.isPublic })
      });
      if (res.ok) {
        toast.success(data.isPublic ? 'Public access disabled' : 'Public access enabled');
        fetchEmergencyData();
      }
    } catch (err) {
      toast.error('Failed to update visibility');
    } finally {
      setIsToggling(false);
    }
  };

  const regenerateQR = async () => {
    if (!confirm('This will invalidate your old QR code. Are you sure?')) return;
    setIsRegenerating(true);
    try {
      const res = await fetch('/api/v1/members/emergency-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'regenerate_qr' })
      });
      if (res.ok) {
        toast.success('New secure QR code generated.');
        fetchEmergencyData();
      } else {
        toast.error('Failed to regenerate QR');
      }
    } catch (err) {
      toast.error('Failed to regenerate QR');
    } finally {
      setIsRegenerating(false);
    }
  };

  const publicUrl = data?.qrToken ? `${typeof window !== 'undefined' ? window.location.origin : ''}/emergency/${data.qrToken}` : '';
  const isReady = data?.readinessScore >= 80;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-24 space-y-10">
      {/* 1. TOP SECTION */}
      <header className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Shield className="w-8 h-8 text-emerald-600" /> Emergency ID
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Your emergency-ready medical identity, connected to your Medical ID.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200">
            <span className={`w-2.5 h-2.5 rounded-full ${data.isPublic ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
            <span className="text-sm font-semibold text-slate-700">
              {data.isPublic ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200">
            <span className="text-sm font-semibold text-slate-700">
              {data.readinessScore}% Ready
            </span>
            {!isReady && <AlertTriangle className="w-4 h-4 text-amber-500" />}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button 
            onClick={() => setQrModalOpen(true)}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <QrCode className="w-5 h-5" /> Show Emergency ID
          </button>
          {data.isPublic && (
            <a 
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <Eye className="w-5 h-5" /> Preview Public View
            </a>
          )}
        </div>
      </header>

      {/* 2. QR / NFC PRIMARY AREA */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center shadow-sm">
        <div className="flex-1 space-y-6 w-full">
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">QR Code Access</h2>
            <p className="text-sm text-slate-500">First responders can scan this to view your approved emergency information.</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setQrModalOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
              <QrCode className="w-4 h-4" /> Fullscreen
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
              <Download className="w-4 h-4" /> Download
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
              <Printer className="w-4 h-4" /> Print
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-1">
              <Smartphone className="w-5 h-5 text-slate-400" /> NFC Status
            </h2>
            <p className="text-sm text-emerald-600 font-medium bg-emerald-50 inline-block px-2 py-1 rounded">Ready to use</p>
            <p className="text-sm text-slate-500 mt-2">Your Emergency ID can be accessed through a compatible NFC device.</p>
          </div>
        </div>

        <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm shrink-0">
          {data?.qrToken ? (
            <QRCodeSVG value={publicUrl} size={180} level="H" includeMargin={false} />
          ) : (
            <div className="w-[180px] h-[180px] bg-slate-100 flex items-center justify-center rounded-lg text-slate-400">
              No QR
            </div>
          )}
        </div>
      </section>

      {/* 3. CRITICAL EMERGENCY INFO */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-6 h-6 text-slate-400" /> Critical Emergency Information
        </h2>
        
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          {data.medicalProfile ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Blood Group</p>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-bold text-slate-900">{data.medicalProfile.bloodGroup || 'Not set'}</p>
                    {data.medicalProfile.bloodGroup && (
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium border border-slate-200">Self-reported</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Critical Allergies</p>
                  <p className="text-slate-900">None reported</p>
                </div>
                <div className="md:col-span-2 border-t border-slate-100 pt-4">
                  <p className="text-sm font-medium text-slate-500 mb-1">Emergency Instructions</p>
                  <p className="text-slate-700">No specific instructions provided.</p>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Link href="/dashboard/medical-profile" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1">
                  Manage Information
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-slate-500 mb-4">No critical medical information found.</p>
              <Link href="/dashboard/medical-profile" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors inline-block text-sm">
                Add Medical Information
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* 4. EMERGENCY CONTACTS */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-6 h-6 text-slate-400" /> Emergency Contacts
        </h2>
        
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          {data.medicalProfile?.emergencyContacts && data.medicalProfile.emergencyContacts.length > 0 ? (
            <div className="space-y-4">
              {data.medicalProfile.emergencyContacts.map((contact: any, i: number) => (
                <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                  <div>
                    <span className="text-xs font-bold text-indigo-600 tracking-wider uppercase mb-1 block">
                      {contact.isPrimary ? 'PRIMARY' : 'SECONDARY'}
                    </span>
                    <p className="font-bold text-slate-900 text-lg">{contact.name}</p>
                    <p className="text-slate-500">{contact.relationship} • {contact.phone}</p>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-sm transition-colors">
                      <Phone className="w-4 h-4" /> Call
                    </button>
                    <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-sm transition-colors">
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-slate-500 mb-4">Add someone MedNira can contact if you need help.</p>
              <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors inline-block text-sm">
                Add Emergency Contact
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 5. EMERGENCY VISIBILITY */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Eye className="w-6 h-6 text-slate-400" /> Emergency Visibility
        </h2>
        
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 mb-2">Public Access</h3>
            <p className="text-sm text-slate-500 mb-4">
              When enabled, anyone who scans your QR code or reads your NFC can view your approved emergency information.
            </p>
            
            <div className="flex items-center gap-4">
              <button
                onClick={toggleVisibility}
                disabled={isToggling}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${data.isPublic ? 'bg-emerald-500' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${data.isPublic ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className="text-sm font-medium text-slate-700">
                {data.isPublic ? 'Public access is ON' : 'Public access is OFF'}
              </span>
            </div>
            
            {data.isPublic && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-3 text-amber-800 text-sm">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <p>This information will be visible to anyone who accesses your Emergency ID.</p>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-slate-100">
            <h3 className="font-bold text-slate-900 mb-4">What people can see</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">Blood Group & Allergies</span>
                <span className="text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded">ON</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">Critical Conditions</span>
                <span className="text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded">ON</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">Emergency Contacts</span>
                <span className="text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded">ON</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex flex-col">
                  <span className="font-medium text-slate-700">Private Medical Documents</span>
                  <span className="text-xs text-slate-500">Private documents are never shown.</span>
                </div>
                <span className="text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1"><Lock className="w-3 h-3"/> OFF</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. RECENT ACCESS & SETTINGS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <History className="w-6 h-6 text-slate-400" /> Recent Access
          </h2>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-full">
            {data.recentAccess && data.recentAccess.length > 0 ? (
              <ul className="space-y-4">
                {data.recentAccess.map((log: any) => (
                  <li key={log.id} className="flex justify-between items-start text-sm pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium text-slate-900">Emergency View Accessed</p>
                      <p className="text-slate-500">{new Date(log.timestamp).toLocaleString()}</p>
                    </div>
                    {log.ipAddress && <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">IP Recorded</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 text-sm">No recent access history recorded.</p>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Advanced Actions</h2>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-full flex flex-col justify-center gap-4">
            <button 
              onClick={regenerateQR}
              disabled={isRegenerating}
              className="w-full px-4 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-xl transition-colors text-sm text-left flex items-center gap-3"
            >
              <RefreshCw className={`w-5 h-5 text-slate-400 ${isRegenerating ? 'animate-spin' : ''}`} />
              <div>
                <p className="font-bold">Regenerate QR Token</p>
                <p className="text-xs text-slate-500">Invalidate old QR code and create a new one.</p>
              </div>
            </button>
          </div>
        </section>
      </div>

      {/* FULLSCREEN QR MODAL */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white md:bg-slate-900/90 md:p-6" role="dialog" aria-modal="true">
          <div className="bg-white w-full h-full md:w-auto md:h-auto md:min-w-[400px] md:rounded-3xl flex flex-col md:shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-lg flex items-center gap-2"><Shield className="w-5 h-5 text-emerald-500"/> Emergency ID</h3>
              <button 
                onClick={() => setQrModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-6 h-6 text-slate-600" />
              </button>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <div className="bg-white p-6 border-2 border-slate-100 rounded-3xl shadow-sm mb-8">
                {data?.qrToken ? (
                  <QRCodeSVG value={publicUrl} size={280} level="H" includeMargin={false} />
                ) : (
                  <div className="w-[280px] h-[280px] bg-slate-50 flex flex-col items-center justify-center text-slate-400 rounded-2xl">
                    <AlertTriangle className="w-8 h-8 mb-2" />
                    <p>No active token</p>
                  </div>
                )}
              </div>
              <p className="font-bold text-xl text-slate-900 mb-2">Scan for Emergency Info</p>
              <p className="text-slate-500 text-center max-w-xs">Ask first responders to scan this QR code with their camera.</p>
            </div>
            
            <div className="p-4 border-t border-slate-100">
              <button 
                onClick={() => setQrModalOpen(false)}
                className="w-full px-4 py-4 bg-slate-900 text-white font-bold rounded-xl text-lg hover:bg-slate-800 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
