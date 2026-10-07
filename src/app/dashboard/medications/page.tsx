'use client';

import { useState, useEffect } from 'react';
import { Pill, Plus, Search, Calendar, FileText, Activity, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Input, Select, Textarea, Button, Label, FieldError } from '@/components/ui/FormSystem';

export default function MedicationsPage() {
  const [medications, setMedications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { register, handleSubmit, reset } = useForm();

  const fetchMedications = async () => {
    try {
      const res = await fetch('/api/v1/members/medications');
      if (res.ok) {
        const json = await res.json();
        setMedications(json.data || []);
      }
    } catch (err) {
      toast.error('Failed to fetch medications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedications();
  }, []);

  const onSubmit = async (data: any) => {
    try {
      const res = await fetch('/api/v1/members/medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, visibility: 'PUBLIC_EMERGENCY' })
      });
      
      if (!res.ok) throw new Error();
      
      toast.success('Medication added successfully');
      setIsModalOpen(false);
      reset();
      fetchMedications();
    } catch (err) {
      toast.error('Failed to add medication');
    }
  };

  const deleteMedication = async (id: string) => {
    if (!confirm('Are you sure you want to delete this medication?')) return;
    try {
      const res = await fetch(`/api/v1/members/medications?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Deleted successfully');
      fetchMedications();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Medications</h1>
          <p className="text-slate-500 mt-1">Manage your prescriptions and active medications.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add Medication
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              type="text" 
              placeholder="Search medications..." 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading medications...</div>
        ) : medications.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {medications.map(med => (
              <div key={med.id} className="p-5 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 mt-1">
                    <Pill className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-lg">{med.genericName}</h3>
                    <p className="text-sm text-slate-500 mb-2">
                      {med.dosage} • {med.frequency} {med.route ? `• ${med.route}` : ''}
                    </p>
                    <div className="flex items-center gap-3 text-xs font-medium">
                      <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700">
                        {med.status}
                      </span>
                      {med.prescribingDoctor && (
                        <span className="flex items-center gap-1 text-slate-500">
                          <Activity className="w-3.5 h-3.5" /> Dr. {med.prescribingDoctor}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => deleteMedication(med.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors text-sm font-medium">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Pill className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No medications</h3>
            <p className="text-slate-500 mt-1 mb-6">You haven't added any medications to your profile yet.</p>
            <button onClick={() => setIsModalOpen(true)} className="text-emerald-600 font-medium hover:text-emerald-700">
              + Add your first medication
            </button>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900">Add New Medication</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Medication Name</label>
                <Input {...register('genericName', { required: true })} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none" placeholder="e.g. Lisinopril" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Dosage</label>
                  <Input {...register('dosage')} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none" placeholder="e.g. 10mg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Frequency</label>
                  <Input {...register('frequency')} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none" placeholder="e.g. Twice daily" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Prescribing Doctor (Optional)</label>
                <Input {...register('prescribingDoctor')} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none" />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium">Cancel</button>
                <button type="submit" className="bg-emerald-600 text-white px-5 py-2 rounded-xl font-medium">Save Medication</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
