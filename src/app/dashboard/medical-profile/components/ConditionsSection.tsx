'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Activity, Plus, Edit2, Trash2, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const conditionSchema = z.object({
  id: z.string().optional(),
  conditionName: z.string().min(1, 'Condition Name is required').max(200),
  status: z.string(),
  severity: z.string().optional(),
  diagnosisDate: z.string().optional(),
  diagnosedBy: z.string().optional(),
  healthcareProvider: z.string().optional(),
  hospitalClinic: z.string().optional(),
  notes: z.string().optional(),
  visibility: z.enum(['PUBLIC_EMERGENCY', 'EMERGENCY_RESPONDER', 'DOCTOR_ACCESS', 'PRIVATE']),
});

type ConditionFormValues = z.infer<typeof conditionSchema>;

export default function ConditionsSection({ initialData, onUpdate }: { initialData: any[], onUpdate: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ConditionFormValues>({
    resolver: zodResolver(conditionSchema),
    defaultValues: {
      status: 'Active',
      visibility: 'PUBLIC_EMERGENCY',
      severity: 'MODERATE'
    }
  });

  const openModal = (condition?: any) => {
    if (condition) {
      reset({
        ...condition,
        diagnosisDate: condition.diagnosisDate ? new Date(condition.diagnosisDate).toISOString().split('T')[0] : ''
      });
    } else {
      reset({ status: 'Active', visibility: 'PUBLIC_EMERGENCY', severity: 'MODERATE' });
    }
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    reset();
  };

  const onSubmit = async (data: ConditionFormValues) => {
    try {
      const res = await fetch('/api/v1/members/conditions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to save condition');
      
      toast.success('Condition saved successfully');
      closeModal();
      onUpdate();
    } catch (error) {
      toast.error('Could not save condition');
    }
  };

  const deleteCondition = async (id: string) => {
    if (!confirm('Are you sure you want to delete this condition?')) return;
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/v1/members/conditions?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete condition');
      toast.success('Condition deleted');
      onUpdate();
    } catch (error) {
      toast.error('Could not delete condition');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <Activity className="w-5 h-5 text-amber-400" /> Conditions
        </h2>
        <button onClick={() => openModal()} className="text-emerald-400 hover:text-emerald-300 text-sm font-medium flex items-center gap-1">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      <ul className="space-y-4">
        {initialData?.length > 0 ? (
          initialData.map((c: any) => (
            <li key={c.id} className="flex items-start justify-between border-b border-slate-800 pb-3 last:border-0 group">
              <div>
                <p className="text-slate-200 font-medium">{c.conditionName}</p>
                <p className="text-slate-400 text-sm">
                  Status: {c.status} {c.severity && `• ${c.severity}`}
                </p>
                {c.diagnosedBy && <p className="text-slate-500 text-xs mt-1">Diagnosed by: {c.diagnosedBy}</p>}
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openModal(c)} className="text-slate-500 hover:text-slate-300 p-1">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => deleteCondition(c.id)} disabled={isDeleting === c.id} className="text-slate-500 hover:text-rose-400 p-1 disabled:opacity-50">
                  {isDeleting === c.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            </li>
          ))
        ) : (
          <p className="text-slate-500 italic text-sm">No conditions recorded.</p>
        )}
      </ul>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b border-slate-800">
              <h3 className="text-lg font-semibold text-slate-100">Manage Condition</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Condition Name</label>
                <input {...register('conditionName')} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 outline-none" placeholder="e.g. Type 2 Diabetes, Asthma" />
                {errors.conditionName && <p className="text-rose-400 text-xs mt-1">{errors.conditionName.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                  <select {...register('status')} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 outline-none">
                    <option value="Active">Active</option>
                    <option value="Controlled">Controlled</option>
                    <option value="Resolved">Resolved</option>
                    <option value="In Remission">In Remission</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Severity</label>
                  <select {...register('severity')} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 outline-none">
                    <option value="MILD">Mild</option>
                    <option value="MODERATE">Moderate</option>
                    <option value="SEVERE">Severe</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Diagnosis Date</label>
                  <input type="date" {...register('diagnosisDate')} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 outline-none [color-scheme:dark]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Visibility</label>
                  <select {...register('visibility')} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 outline-none">
                    <option value="PUBLIC_EMERGENCY">Public Emergency ID</option>
                    <option value="EMERGENCY_RESPONDER">Responders Only</option>
                    <option value="DOCTOR_ACCESS">Doctors Only</option>
                    <option value="PRIVATE">Private</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Diagnosed By (Doctor Name)</label>
                <input {...register('diagnosedBy')} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 outline-none" placeholder="e.g. Dr. Sarah Rahman" />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-slate-100 transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-70 flex items-center gap-2">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Condition'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
