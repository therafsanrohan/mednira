'use client';

import { useState, useEffect } from 'react';
import { Button, Input } from '@/components/ui/FormSystem';
import { Loader2, ShieldCheck, X } from 'lucide-react';
import toast from 'react-hot-toast';

export function MfaSetup() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [setupData, setSetupData] = useState<{ secret: string; qrCodeDataUrl: string } | null>(null);
  const [token, setToken] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/v1/auth/mfa/status')
      .then(res => res.json())
      .then(data => {
        setIsEnabled(data.enabled);
        setLoading(false);
      });
  }, []);

  const initiateSetup = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/mfa/setup', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setSetupData(data);
      } else {
        toast.error(data.error || 'Failed to initiate MFA');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  const verifyMfa = async () => {
    if (!token) return;
    setIsVerifying(true);
    try {
      const res = await fetch('/api/v1/auth/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      const data = await res.json();
      
      if (res.ok) {
        setIsEnabled(true);
        setSetupData(null);
        setRecoveryCodes(data.recoveryCodes);
        toast.success('Two-Factor Authentication enabled!');
      } else {
        toast.error(data.error || 'Invalid code');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setIsVerifying(false);
    }
  };

  const disableMfa = async () => {
    if (!confirm('Are you sure you want to disable Two-Factor Authentication?')) return;
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/mfa/verify', { method: 'DELETE' });
      if (res.ok) {
        setIsEnabled(false);
        toast.success('Two-Factor Authentication disabled');
      } else {
        toast.error('Failed to disable MFA');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="h-6 w-6"><Loader2 className="animate-spin text-slate-400" /></div>;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <p className="font-medium text-slate-900">Two-Factor Authentication</p>
          <p className="text-sm text-slate-500">Protect your account with an extra layer of security using an authenticator app.</p>
        </div>
        <div>
          {isEnabled ? (
            <Button variant="outline" className="text-rose-600 hover:bg-rose-50 border-rose-200 hover:text-rose-700" onClick={disableMfa}>
              Disable MFA
            </Button>
          ) : (
            <Button onClick={initiateSetup} disabled={!!setupData}>
              Enable MFA
            </Button>
          )}
        </div>
      </div>

      {setupData && (
        <div className="mt-4 p-6 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold text-slate-900">Setup Authenticator App</h3>
            <button onClick={() => setSetupData(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
          </div>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <img src={setupData.qrCodeDataUrl} alt="QR Code" className="w-40 h-40" />
            </div>
            <div className="space-y-4 flex-1">
              <p className="text-sm text-slate-600">
                1. Scan this QR code with your authenticator app (e.g. Google Authenticator, Authy).
                <br/>
                <span className="text-xs text-slate-500">Manual key: <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">{setupData.secret}</code></span>
              </p>
              <div className="space-y-2">
                <p className="text-sm text-slate-600">2. Enter the 6-digit code below to verify.</p>
                <div className="flex gap-2">
                  <Input 
                    value={token} 
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="000000"
                    className="max-w-[150px]"
                    maxLength={6}
                  />
                  <Button onClick={verifyMfa} isLoading={isVerifying}>Verify</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {recoveryCodes.length > 0 && (
        <div className="mt-4 p-6 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="flex items-center gap-2 mb-2 text-emerald-800">
            <ShieldCheck className="w-5 h-5" />
            <h3 className="font-bold">Save your recovery codes</h3>
          </div>
          <p className="text-sm text-emerald-700 mb-4">
            If you lose access to your authenticator app, you can use these codes to sign in. Save them in a secure place. They will only be shown once.
          </p>
          <div className="grid grid-cols-2 gap-2 bg-white p-4 rounded-lg border border-emerald-100">
            {recoveryCodes.map(code => (
              <code key={code} className="text-sm text-slate-700 font-mono">{code}</code>
            ))}
          </div>
          <Button variant="outline" className="mt-4 w-full" onClick={() => setRecoveryCodes([])}>
            I have saved these codes
          </Button>
        </div>
      )}
    </div>
  );
}
