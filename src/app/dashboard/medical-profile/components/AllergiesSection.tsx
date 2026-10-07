'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AlertTriangle, Plus, Edit2, Trash2, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const allergySchema = z.object({
  id: z.string().optional(),
  substance: z.string().min(1, 'Substance is required').max(200),
  category: z.string().min(1, 'Category is required'),
  reaction: z.string().optional(),
  severity: z.enum(['MILD', 'MODERATE', 'SEVERE', 'LIFE_THREATENING']),
  criticality: z.string().optional(),
  status: z.string(),
  onsetDate: z.string().optional(),
  notes: z.string().optional(),
  visibility: z.enum(['PUBLIC_EMERGENCY', 'EMERGENCY_RESPONDER', 'DOCTOR_ACCESS', 'PRIVATE']),
});

type AllergyFormValues = z.infer<typeof allergySchema>;

export default function AllergiesSection({ initialData, onUpdate }: { initialData: any[], onUpdate: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AllergyFormValues>({
    resolver: zodResolver(allergySchema),
    defaultValues: {
      status: 'Active',
      visibility: 'PUBLIC_EMERGENCY',
      severity: 'MILD'
    }
  });

  const openModal = (allergy?: any) => {
    if (allergy) {
      reset({
        ...allergy,
        onsetDate: allergy.onsetDate ? new Date(allergy.onsetDate).toISOString().split('T')[0] : ''
      });
    } else {
      reset({ status: 'Active', visibility: 'PUBLIC_EMERGENCY', severity: 'MILD' });
    }
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    reset();
  };

  const onSubmit = async (data: AllergyFormValues) => {
    try {
      const res = await fetch('/api/v1/members/allergies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to save allergy');
      
      toast.success('Allergy saved successfully');
      closeModal();
      onUpdate();
    } catch (error) {
      toast.error('Could not save allergy');
    }
  };

  const deleteAllergy = async (id: string) => {
    if (!confirm('Are you sure you want to delete this allergy?')) return;
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/v1/members/allergies?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete allergy');
      toast.success('Allergy deleted');
      onUpdate();
    } catch (error) {
      toast.error('Could not delete allergy');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-400" /> Allergies
        </h2>
        <button onClick={() => openModal()} className="text-emerald-400 hover:text-emerald-300 text-sm font-medium flex items-center gap-1">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      <ul className="space-y-4">
        {initialData?.length > 0 ? (
          initialData.map((a: any) => (
            <li key={a.id} className="flex items-start justify-between border-b border-slate-200 pb-3 last:border-0 group">
              <div>
                <p className="text-slate-800 font-medium">{a.substance}</p>
                <p className="text-slate-500 text-sm">
                  {a.category} • <span className={a.severity === 'LIFE_THREATENING' || a.severity === 'SEVERE' ? 'text-rose-400' : 'text-amber-400'}>{a.severity}</span>
                </p>
                {a.reaction && <p className="text-slate-500 text-xs mt-1">Reaction: {a.reaction}</p>}
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openModal(a)} className="text-slate-500 hover:text-slate-700 p-1">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => deleteAllergy(a.id)} disabled={isDeleting === a.id} className="text-slate-500 hover:text-rose-400 p-1 disabled:opacity-50">
                  {isDeleting === a.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            </li>
          ))
        ) : (
          <p className="text-slate-500 italic text-sm">No allergies recorded.</p>
        )}
      </ul>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Manage Allergy</h3>
              <button onClick={closeModal} className="text-slate-500 hover:text-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Substance</label>
                <input {...register('substance')} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. Penicillin, Peanuts" />
                {errors.substance && <p className="text-rose-400 text-xs mt-1">{errors.substance.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select {...register('category')} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 outline-none">
                    <option value="">Select...</option>
                    <option value="Medication">Medication</option>
                    <option value="Food">Food</option>
                    <option value="Environmental">Environmental</option>
                    <option value="Latex">Latex</option>
                    <option value="Insect">Insect</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.category && <p className="text-rose-400 text-xs mt-1">{errors.category.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Severity</label>
                  <select {...register('severity')} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 outline-none">
                    <option value="MILD">Mild</option>
                    <option value="MODERATE">Moderate</option>
                    <option value="SEVERE">Severe</option>
                    <option value="LIFE_THREATENING">Life Threatening</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reaction (Optional)</label>
                <input {...register('reaction')} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 outline-none" placeholder="e.g. Hives, Anaphylaxis" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Onset Date</label>
                  <input type="date" {...register('onsetDate')} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 outline-none [color-scheme:dark]" />
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
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Allergy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
