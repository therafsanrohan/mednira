'use client';

import { useState, useEffect } from 'react';
import { Settings, Lock, Download, Share2, ShieldCheck, Plus, X, Loader2, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { Input, Select, Textarea, Button, Label, FieldError } from '@/components/ui/FormSystem';

const shareSchema = z.object({
  sharedWithName: z.string().min(1, 'Name is required'),
  accessLevel: z.enum(['Full', 'Limited']),
  purpose: z.string().optional(),
  expiresAt: z.string().optional(),
});

export default function SettingsPage() {
  const [shares, setShares] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(shareSchema),
    defaultValues: { accessLevel: 'Limited' }
  });

  const fetchShares = async () => {
    try {
      const res = await fetch('/api/v1/members/shares');
      const data = await res.json();
      if (data.shares) setShares(data.shares);
    } catch (error) {
      console.error(error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchShares();
  }, []);

  const onSubmitShare = async (data: any) => {
    try {
      const res = await fetch('/api/v1/members/shares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, permissions: data.accessLevel === 'Full' ? ['all'] : ['profile', 'records'] })
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Share access granted');
      setIsModalOpen(false);
      reset();
      fetchShares();
    } catch (error) {
      toast.error('Could not create share');
    }
  };

  const revokeShare = async (id: string) => {
    if (!confirm('Revoke access for this share?')) return;
    try {
      const res = await fetch(`/api/v1/members/shares?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      toast.success('Access revoked');
      fetchShares();
    } catch (error) {
      toast.error('Could not revoke access');
    }
  };

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

        {/* Medical Sharing */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Share2 className="w-6 h-6 text-indigo-400" />
              <h2 className="text-xl font-semibold text-slate-900">Medical Sharing</h2>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1 text-sm font-medium text-emerald-500 hover:text-emerald-400">
              <Plus className="w-4 h-4" /> Share
            </button>
          </div>
          
          <div className="space-y-3">
            {isFetching ? (
              <p className="text-sm text-slate-500">Loading...</p>
            ) : shares.length > 0 ? (
              shares.map(share => (
                <div key={share.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div>
                    <p className="font-medium text-slate-900">{share.sharedWithName}</p>
                    <p className="text-xs text-slate-500">{share.accessLevel} Access {share.expiresAt ? ` • Expires: ${new Date(share.expiresAt).toLocaleDateString()}` : ''}</p>
                  </div>
                  <button onClick={() => revokeShare(share.id)} className="text-rose-500 hover:text-rose-600 text-sm font-medium px-3 py-1 bg-rose-50 rounded-lg">
                    Revoke
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-6 bg-slate-50 rounded-xl border border-slate-200/50">
                <ShieldCheck className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-700 font-medium">No Active Shares</p>
                <p className="text-slate-500 text-sm mt-1">You are not sharing records with any provider.</p>
              </div>
            )}
          </div>
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Share Medical Records</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmitShare)} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Provider / Organization Name</label>
                <Input {...register('sharedWithName')} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 outline-none" placeholder="e.g. Dr. Smith" />
                {errors.sharedWithName && <p className="text-rose-400 text-xs mt-1">{errors.sharedWithName?.message?.toString()}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Access Level</label>
                  <Select {...register('accessLevel')} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 outline-none">
                    <option value="Limited">Limited (Read-Only)</option>
                    <option value="Full">Full (Update)</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Expiration</label>
                  <Input type="date" {...register('expiresAt')} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 outline-none [color-scheme:light]" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Purpose (Optional)</label>
                <Input {...register('purpose')} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 outline-none" placeholder="e.g. Second opinion" />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-70 flex items-center gap-2">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Share'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
