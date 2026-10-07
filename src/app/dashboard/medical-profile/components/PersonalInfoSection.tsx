'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { HeartPulse, Edit2, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Input, Select, Textarea, Button, Label, FieldError } from '@/components/ui/FormSystem';

const profileSchema = z.object({
  bloodType: z.string().max(10).optional(),
  rhFactor: z.string().max(10).optional(),
  dateOfBirth: z.string().optional(),
  height: z.string().max(50).optional(),
  weight: z.string().max(50).optional(),
  organDonor: z.boolean().optional(),
  dnrStatus: z.boolean().optional(),
  emergencyNotes: z.string().max(1000).optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function PersonalInfoSection({ profile, user, onUpdate }: { profile: any, user: any, onUpdate: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      bloodType: profile?.bloodType || '',
      rhFactor: profile?.rhFactor || '',
      dateOfBirth: profile?.dateOfBirth || '',
      height: profile?.height || '',
      weight: profile?.weight || '',
      organDonor: profile?.organDonor || false,
      dnrStatus: profile?.dnrStatus || false,
      emergencyNotes: profile?.emergencyNotes || '',
    }
  });

  const openModal = () => {
    reset({
      bloodType: profile?.bloodType || '',
      rhFactor: profile?.rhFactor || '',
      dateOfBirth: profile?.dateOfBirth || '',
      height: profile?.height || '',
      weight: profile?.weight || '',
      organDonor: profile?.organDonor || false,
      dnrStatus: profile?.dnrStatus || false,
      emergencyNotes: profile?.emergencyNotes || '',
    });
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const res = await fetch('/api/v1/members/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to update profile');
      
      toast.success('Personal info updated successfully');
      closeModal();
      onUpdate();
    } catch (error) {
      toast.error('Could not update profile');
    }
  };

  const currentAge = profile?.dateOfBirth ? 
    Math.floor((new Date().getTime() - new Date(profile.dateOfBirth).getTime()) / 31557600000) : 
    'N/A';

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 relative group">
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={openModal} className="text-emerald-400 hover:text-emerald-300 text-sm font-medium flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <Edit2 className="w-4 h-4" /> Edit Profile
        </button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
          <span className="text-2xl font-bold text-emerald-400">
            {user?.name?.charAt(0) || 'U'}
          </span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{user?.name}</h2>
          <p className="text-slate-500">MedNira ID: <span className="text-slate-700 font-mono bg-slate-50 px-2 py-0.5 rounded text-sm ml-1">{user?.id?.substring(0,8).toUpperCase()}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/50">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Blood Type</p>
          <p className="text-slate-800 font-semibold text-lg flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-rose-400" />
            {profile?.bloodType ? `${profile.bloodType}${profile.rhFactor || ''}` : 'Not set'}
          </p>
        </div>
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/50">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Age / DOB</p>
          <p className="text-slate-800 font-semibold text-lg">
            {currentAge !== 'N/A' ? `${currentAge} yrs` : 'Not set'}
          </p>
        </div>
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/50">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Height</p>
          <p className="text-slate-800 font-semibold text-lg">
            {profile?.height || 'Not set'}
          </p>
        </div>
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/50">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Weight</p>
          <p className="text-slate-800 font-semibold text-lg">
            {profile?.weight || 'Not set'}
          </p>
        </div>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
        <p className="text-amber-500/70 text-xs font-bold uppercase tracking-wider mb-2">Emergency Notes / Directives</p>
        <p className="text-slate-700 text-sm">
          {profile?.emergencyNotes || 'No specific emergency instructions provided by the user.'}
        </p>
        <div className="flex gap-4 mt-3 pt-3 border-t border-amber-500/10">
          <p className="text-xs text-slate-500">Organ Donor: <span className={profile?.organDonor ? 'text-emerald-400 font-bold' : 'text-slate-700'}>{profile?.organDonor ? 'YES' : 'NO'}</span></p>
          <p className="text-xs text-slate-500">DNR Status: <span className={profile?.dnrStatus ? 'text-rose-400 font-bold' : 'text-slate-700'}>{profile?.dnrStatus ? 'YES (Do Not Resuscitate)' : 'NO'}</span></p>
        </div>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Edit Personal Information</h3>
              <button onClick={closeModal} className="text-slate-500 hover:text-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Blood Type</label>
                  <Select {...register('bloodType')} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 outline-none">
                    <option value="">Unknown</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="AB">AB</option>
                    <option value="O">O</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">RH Factor</label>
                  <Select {...register('rhFactor')} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 outline-none">
                    <option value="">Unknown</option>
                    <option value="+">+</option>
                    <option value="-">-</option>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                <Input type="date" {...register('dateOfBirth')} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 outline-none [color-scheme:dark]" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Height</label>
                  <Input {...register('height')} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 outline-none" placeholder="e.g. 5'8&quot; or 173cm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Weight</label>
                  <Input {...register('weight')} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 outline-none" placeholder="e.g. 70kg or 154lbs" />
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Emergency Notes & Directives</label>
                <Textarea {...register('emergencyNotes')} rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 outline-none resize-none" placeholder="Critical instructions for first responders..." />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Input type="checkbox" {...register('organDonor')} className="w-4 h-4 rounded border-slate-200 bg-slate-50 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900" />
                  <span className="text-sm font-medium text-slate-700">Registered Organ Donor</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Input type="checkbox" {...register('dnrStatus')} className="w-4 h-4 rounded border-slate-200 bg-slate-50 text-rose-500 focus:ring-rose-500 focus:ring-offset-slate-900" />
                  <span className="text-sm font-medium text-rose-400">DNR (Do Not Resuscitate)</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-70 flex items-center gap-2">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
