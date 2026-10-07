'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Syringe, Plus, Edit2, Trash2, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const medicationSchema = z.object({
  id: z.string().optional(),
  genericName: z.string().min(1, 'Generic Name is required').max(200),
  brandName: z.string().optional(),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  status: z.string(),
  startDate: z.string().optional(),
  prescribingDoctor: z.string().optional(),
  visibility: z.enum(['PUBLIC_EMERGENCY', 'EMERGENCY_RESPONDER', 'DOCTOR_ACCESS', 'PRIVATE']),
});

type MedicationFormValues = z.infer<typeof medicationSchema>;

export default function MedicationsSection({ initialData, onUpdate }: { initialData: any[], onUpdate: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<MedicationFormValues>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      status: 'Active',
      visibility: 'PUBLIC_EMERGENCY',
    }
  });

  const openModal = (med?: any) => {
    if (med) {
      reset({
        ...med,
        startDate: med.startDate ? new Date(med.startDate).toISOString().split('T')[0] : ''
      });
    } else {
      reset({ status: 'Active', visibility: 'PUBLIC_EMERGENCY' });
    }
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    reset();
  };

  const onSubmit = async (data: MedicationFormValues) => {
    try {
      const res = await fetch('/api/v1/members/medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to save medication');
      
      toast.success('Medication saved successfully');
      closeModal();
      onUpdate();
    } catch (error) {
      toast.error('Could not save medication');
    }
  };

  const deleteMedication = async (id: string) => {
    if (!confirm('Are you sure you want to delete this medication?')) return;
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/v1/members/medications?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete medication');
      toast.success('Medication deleted');
      onUpdate();
    } catch (error) {
      toast.error('Could not delete medication');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 lg:col-span-2 relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Syringe className="w-5 h-5 text-emerald-400" /> Medications
        </h2>
        <button onClick={() => openModal()} className="text-emerald-400 hover:text-emerald-300 text-sm font-medium flex items-center gap-1">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {initialData?.length > 0 ? (
          initialData.map((m: any) => (
            <div key={m.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200/50 group relative">
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openModal(m)} className="text-slate-500 hover:text-slate-700 bg-slate-50 p-1 rounded-md">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => deleteMedication(m.id)} disabled={isDeleting === m.id} className="text-slate-500 hover:text-rose-400 bg-slate-50 p-1 rounded-md disabled:opacity-50">
                  {isDeleting === m.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-slate-800 font-semibold pr-16">{m.genericName} {m.brandName ? `(${m.brandName})` : ''}</p>
              <p className="text-slate-500 text-sm mt-1">{m.dosage || 'Dosage not set'} • {m.frequency || 'Frequency not set'}</p>
              <div className="flex items-center justify-between mt-3">
                <p className="text-slate-500 text-xs">Status: <span className={m.status === 'Active' ? 'text-emerald-400' : 'text-slate-500'}>{m.status}</span></p>
                {m.prescribingDoctor && <p className="text-slate-500 text-xs">Dr: {m.prescribingDoctor}</p>}
              </div>
            </div>
          ))
        ) : (
          <p className="text-slate-500 italic text-sm col-span-2">No active medications.</p>
        )}
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Manage Medication</h3>
              <button onClick={closeModal} className="text-slate-500 hover:text-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Generic Name</label>
                <input {...register('genericName')} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 outline-none" placeholder="e.g. Metformin" />
                {errors.genericName && <p className="text-rose-400 text-xs mt-1">{errors.genericName.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Brand Name (Optional)</label>
                <input {...register('brandName')} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 outline-none" placeholder="e.g. Glucophage" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Dosage</label>
                  <input {...register('dosage')} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 outline-none" placeholder="e.g. 500mg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Frequency</label>
                  <input {...register('frequency')} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 outline-none" placeholder="e.g. Twice daily" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select {...register('status')} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 outline-none">
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Discontinued">Discontinued</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Visibility</label>
                  <select {...register('visibility')} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 outline-none">
                    <option value="PUBLIC_EMERGENCY">Public Emergency ID</option>
                    <option value="EMERGENCY_RESPONDER">Responders Only</option>
                    <option value="DOCTOR_ACCESS">Doctors Only</option>
                    <option value="PRIVATE">Private</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-70 flex items-center gap-2">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Medication'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
