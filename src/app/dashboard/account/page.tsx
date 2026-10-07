'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Phone, MapPin, Mail, Loader2, ShieldCheck, CreditCard, Users, Bell, Lock, Download, Trash2, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

const accountSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  gender: z.string().optional(),
});

const familySchema = z.object({
  name: z.string().min(1, 'Name required'),
  relationship: z.string().min(1, 'Relationship required'),
  accessLevel: z.enum(['LIMITED', 'FULL']),
});

export default function AccountCenterPage() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [settingsData, setSettingsData] = useState<any>({});
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(accountSchema)
  });

  const { register: registerFamily, handleSubmit: handleFamilySubmit, reset: resetFamily, formState: { isSubmitting: isSubmittingFamily } } = useForm({
    resolver: zodResolver(familySchema),
    defaultValues: { accessLevel: 'LIMITED' }
  });

  const fetchData = async () => {
    try {
      const [profileRes, settingsRes, familyRes] = await Promise.all([
        fetch('/api/v1/members/profile'),
        fetch('/api/v1/members/account/settings'),
        fetch('/api/v1/members/account/family')
      ]);

      if (profileRes.ok) {
        const data = await profileRes.json();
        setProfileData(data.user);
        reset({
          name: data.user?.name || '',
          phoneNumber: data.user?.userProfile?.phoneNumber || '',
          address: data.user?.userProfile?.address || '',
          city: data.user?.userProfile?.city || '',
          country: data.user?.userProfile?.country || '',
          gender: data.user?.userProfile?.gender || '',
        });
      }

      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setSettingsData(data.settings || {});
      }

      if (familyRes.ok) {
        const data = await familyRes.json();
        setFamilyMembers(data.group?.members || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) fetchData();
  }, [session]);

  const onSubmitProfile = async (data: any) => {
    try {
      const res = await fetch('/api/v1/members/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to update account');
      toast.success('Account profile updated');
      await update({ name: data.name });
      fetchData();
    } catch (error) {
      toast.error('Failed to update account');
    }
  };

  const onSubmitFamily = async (data: any) => {
    try {
      const res = await fetch('/api/v1/members/account/family', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Family member added');
      setIsFamilyModalOpen(false);
      resetFamily();
      fetchData();
    } catch (error) {
      toast.error('Failed to add family member');
    }
  };

  const removeFamilyMember = async (id: string) => {
    if (!confirm('Remove this family member?')) return;
    try {
      const res = await fetch(`/api/v1/members/account/family?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      toast.success('Removed successfully');
      fetchData();
    } catch (error) {
      toast.error('Could not remove member');
    }
  };

  const toggleSetting = async (field: string, value: boolean) => {
    const updated = { ...settingsData, [field]: value };
    setSettingsData(updated);
    try {
      await fetch('/api/v1/members/account/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      toast.success('Setting saved');
    } catch (error) {
      toast.error('Failed to save setting');
      fetchData(); // revert
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Personal Info', icon: User },
    { id: 'family', label: 'Family & Dependents', icon: Users },
    { id: 'security', label: 'Security & Privacy', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Account Center</h1>
        <p className="text-slate-500 mt-1">Manage your identity, family, security, and preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 shrink-0 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'bg-slate-900 text-white' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-slate-300' : 'text-slate-400'}`} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSubmit(onSubmitProfile)} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">Personal Information</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <input {...register('name')} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email (Verified)</label>
                    <input value={profileData?.email || ''} disabled className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2.5 text-slate-500 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                    <input {...register('phoneNumber')} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 outline-none" placeholder="+1 555-0000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                    <select {...register('gender')} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 outline-none">
                      <option value="">Select...</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button type="submit" disabled={isSubmitting} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-medium disabled:opacity-70">
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {/* FAMILY TAB */}
          {activeTab === 'family' && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Family & Dependents</h2>
                <button onClick={() => setIsFamilyModalOpen(true)} className="flex items-center gap-1 text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100">
                  <Plus className="w-4 h-4" /> Add Member
                </button>
              </div>
              <div className="p-6">
                {familyMembers.length > 0 ? (
                  <div className="space-y-3">
                    {familyMembers.map((m: any) => (
                      <div key={m.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50">
                        <div>
                          <p className="font-semibold text-slate-900">{m.name}</p>
                          <p className="text-sm text-slate-500">{m.relationship} • {m.accessLevel} Access</p>
                        </div>
                        <button onClick={() => removeFamilyMember(m.id)} className="text-rose-500 hover:text-rose-600 p-2">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-700 font-medium">No family members</p>
                    <p className="text-slate-500 text-sm mt-1">Add dependents to manage their records.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Security Settings</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <p className="font-medium text-slate-900">Two-Factor Authentication</p>
                      <p className="text-sm text-slate-500">Protect your account with an extra layer of security.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={settingsData.twoFactorEnabled || false} onChange={(e) => toggleSetting('twoFactorEnabled', e.target.checked)} />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">Public Emergency Profile</p>
                      <p className="text-sm text-slate-500">Allow first responders to scan your QR code.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={settingsData.publicProfileEnabled || false} onChange={(e) => toggleSetting('publicProfileEnabled', e.target.checked)} />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-rose-200 rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-rose-600 mb-2">Danger Zone</h2>
                <p className="text-sm text-slate-600 mb-4">Permanently delete your account and all associated medical data.</p>
                <button className="px-4 py-2 bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 rounded-lg text-sm font-medium transition-colors">
                  Delete Account
                </button>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Notification Preferences</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <p className="font-medium text-slate-900">Email Notifications</p>
                    <p className="text-sm text-slate-500">Receive alerts and updates via email.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={settingsData.emailNotifications !== false} onChange={(e) => toggleSetting('emailNotifications', e.target.checked)} />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <p className="font-medium text-slate-900">SMS Notifications</p>
                    <p className="text-sm text-slate-500">Critical emergency alerts via SMS.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={settingsData.smsNotifications || false} onChange={(e) => toggleSetting('smsNotifications', e.target.checked)} />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">Marketing & News</p>
                    <p className="text-sm text-slate-500">Receive product updates and offers.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={settingsData.marketingEmails || false} onChange={(e) => toggleSetting('marketingEmails', e.target.checked)} />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* FAMILY MODAL */}
      {isFamilyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Add Family Member</h3>
              <button onClick={() => setIsFamilyModalOpen(false)} className="text-slate-500 hover:text-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleFamilySubmit(onSubmitFamily)} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input {...registerFamily('name')} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Relationship</label>
                <input {...registerFamily('relationship')} placeholder="e.g. Spouse, Child" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Access Level</label>
                <select {...registerFamily('accessLevel')} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none">
                  <option value="LIMITED">Limited (Emergency Only)</option>
                  <option value="FULL">Full (Manage Records)</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsFamilyModalOpen(false)} className="px-4 py-2 text-sm text-slate-600">Cancel</button>
                <button type="submit" disabled={isSubmittingFamily} className="bg-emerald-500 text-white px-5 py-2 rounded-lg text-sm font-medium">
                  {isSubmittingFamily ? 'Saving...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
