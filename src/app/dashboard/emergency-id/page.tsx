'use client';

import { useState, useEffect } from 'react';
import { Shield, QrCode, Smartphone, Download, CheckCircle2, History, Link as LinkIcon, RefreshCw, Eye, Share2, AlertCircle, FileText, Activity } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';

export default function EmergencyIDPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);

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

  const regenerateQR = async () => {
    if (!confirm('This will invalidate your old QR code. Emergency responders will no longer be able to scan old cards or printed materials. Are you sure?')) return;
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

  const publicUrl = data?.qrToken ? `${window.location.origin}/emergency/${data.qrToken}` : '';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse flex flex-col items-center">
          <Shield className="w-12 h-12 text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium">Loading secure identity...</p>
        </div>
      </div>
    );
  }

  const isReady = data?.readinessScore >= 80;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      
      {/* Hero Section */}
      <div className="text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight flex items-center justify-center md:justify-start gap-3">
            <Shield className="w-8 h-8 text-emerald-500" /> Emergency ID
          </h1>
          <p className="text-slate-500 mt-2 max-w-2xl text-lg">Your critical medical identity, ready when it matters most.</p>
        </div>
        <div className="flex items-center justify-center gap-3">
          {data?.isPublic ? (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-sm font-semibold rounded-full border border-emerald-100 uppercase tracking-wide">
              <CheckCircle2 className="w-4 h-4" /> Active & Public
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-sm font-semibold rounded-full border border-amber-100 uppercase tracking-wide">
              <AlertCircle className="w-4 h-4" /> Private (Inactive)
            </span>
          )}
          {isReady ? (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-sm font-semibold rounded-full border border-blue-100 uppercase tracking-wide">
              <CheckCircle2 className="w-4 h-4" /> ID Verified
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 text-sm font-semibold rounded-full border border-rose-100 uppercase tracking-wide">
              <AlertCircle className="w-4 h-4" /> Setup Required
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COL: QR & NFC Interactive Hero */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-b from-slate-900 to-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
            {/* Animated Background Effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/20 transition-all duration-1000"></div>
            
            <div className="text-center relative z-10 mb-6">
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1">Secure Access Token</p>
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-2xl shadow-lg transform transition-transform hover:scale-105 cursor-pointer" onClick={() => setQrModalOpen(true)}>
                  {data?.qrToken ? (
                    <QRCodeSVG value={publicUrl} size={160} level="H" className="mx-auto" />
                  ) : (
                    <div className="w-[160px] h-[160px] bg-slate-100 flex items-center justify-center">No Token</div>
                  )}
                </div>
              </div>
              <p className="text-white text-sm font-medium mt-4">Scan to access emergency info</p>
            </div>

            <div className="grid grid-cols-2 gap-3 relative z-10">
              <button onClick={() => setQrModalOpen(true)} className="flex flex-col items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors text-sm font-medium">
                <QrCode className="w-5 h-5" /> Show QR
              </button>
              <button onClick={() => {
                navigator.clipboard.writeText(publicUrl);
                toast.success('Link copied to clipboard');
              }} className="flex flex-col items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors text-sm font-medium">
                <Share2 className="w-5 h-5" /> Share Link
              </button>
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/10 relative z-10 flex flex-col items-center justify-center">
              <div className="relative flex items-center justify-center mb-2">
                <Smartphone className="w-8 h-8 text-emerald-400 relative z-10" />
                <div className="absolute inset-0 bg-emerald-400/20 rounded-full animate-ping"></div>
              </div>
              <p className="text-white text-sm font-medium">NFC Ready</p>
              <p className="text-slate-400 text-xs mt-1 text-center">Tap a compatible device to link</p>
            </div>
          </div>
        </div>

        {/* RIGHT COL: Status & Controls */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Readiness Score */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-lg font-bold text-slate-900 mb-2">Emergency Readiness</h2>
              <div className="w-full bg-slate-100 rounded-full h-3 mb-2 overflow-hidden">
                <div className={`h-3 rounded-full transition-all duration-1000 ${data?.readinessScore >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(data?.readinessScore || 0, 100)}%` }}></div>
              </div>
              <p className="text-sm text-slate-500">Your profile is {data?.readinessScore}% complete.</p>
            </div>
            <div className="shrink-0">
              <button 
                onClick={() => window.location.href = '/dashboard/medical-profile'}
                className="w-full md:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-colors"
              >
                Complete Profile
              </button>
            </div>
          </div>

          {/* Visibility Controls */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-indigo-500" /> Public Visibility
            </h2>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-4 border border-slate-100 bg-slate-50 rounded-2xl">
              <div>
                <p className="font-semibold text-slate-900 text-base">Public Emergency Access</p>
                <p className="text-sm text-slate-500 mt-1 max-w-md">When active, anyone who scans your QR code or taps your NFC tag can view your critical medical information.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input type="checkbox" className="sr-only peer" checked={data?.isPublic} onChange={toggleVisibility} disabled={isToggling} />
                <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
            
            <div className="mt-6 border-t border-slate-100 pt-6">
              <p className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">What responders can access:</p>
              <div className="flex flex-wrap gap-2">
                {['Identity', 'Blood Group', 'Critical Allergies', 'Emergency Contacts', 'Current Medications', 'Medical Conditions'].map((item) => (
                  <span key={item} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg">{item}</span>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-3">Full medical history, private documents, and sensitive records remain completely hidden.</p>
            </div>
          </div>

          {/* Advanced Actions & History */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <History className="w-5 h-5 text-slate-400" /> Recent Access Log
              </h3>
              {data?.accessLogs && data.accessLogs.length > 0 ? (
                <div className="space-y-4">
                  {data.accessLogs.slice(0, 3).map((log: any) => (
                    <div key={log.id} className="flex justify-between items-start text-sm">
                      <div>
                        <p className="font-medium text-slate-900">{log.accessType.replace('_', ' ')}</p>
                        <p className="text-slate-500 text-xs">{log.ip || 'Unknown IP'}</p>
                      </div>
                      <span className="text-slate-400 text-xs">{new Date(log.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500 text-sm">
                  No access logs recorded yet.
                </div>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-900 mb-2">Token Management</h3>
                <p className="text-sm text-slate-500 mb-4">If you lose your physical card, regenerate your token to invalidate the old one instantly.</p>
              </div>
              <div className="space-y-3">
                <a href={publicUrl} target="_blank" className="w-full flex items-center justify-center gap-2 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-xl transition-colors text-sm">
                  <Eye className="w-4 h-4" /> Preview Public ID
                </a>
                <button 
                  onClick={regenerateQR} 
                  disabled={isRegenerating}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium rounded-xl transition-colors text-sm"
                >
                  <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} /> Regenerate QR Token
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Fullscreen QR Modal */}
      {qrModalOpen && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-4">
          <div className="absolute top-6 right-6">
            <button onClick={() => setQrModalOpen(false)} className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors">
              X
            </button>
          </div>
          <div className="text-center mb-8">
            <Shield className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white tracking-tight">Emergency Medical ID</h2>
            <p className="text-slate-400 mt-2">Scan to view critical emergency information</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-2xl">
            <QRCodeSVG value={publicUrl} size={280} level="H" />
          </div>
          <div className="mt-8 flex items-center gap-2 text-emerald-400 font-medium">
            <CheckCircle2 className="w-5 h-5" /> Secure QR Active
          </div>
        </div>
      )}

    </div>
  );
}
