'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Syringe, Plus, Edit2, Trash2, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({
  id: z.string().optional(),
  vaccine: z.string().min(1, 'Vaccine name is required'),
  doseNumber: z.coerce.number().optional(),
  date: z.string().optional(),
  manufacturer: z.string().optional(),
  batchNumber: z.string().optional(),
  administeredBy: z.string().optional(),
  facility: z.string().optional(),
  nextDose: z.string().optional(),
  visibility: z.enum(['PUBLIC_EMERGENCY', 'EMERGENCY_RESPONDER', 'DOCTOR_ACCESS', 'PRIVATE']),
});

type FormValues = z.infer<typeof schema>;

export default function VaccinationsSection({ initialData, onUpdate }: { initialData: any[], onUpdate: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      visibility: 'DOCTOR_ACCESS',
    }
  });

  const openModal = (item?: any) => {
    if (item) {
      reset({
        ...item,
        date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
        nextDose: item.nextDose ? new Date(item.nextDose).toISOString().split('T')[0] : '',
      });
    } else {
      reset({ visibility: 'DOCTOR_ACCESS' });
    }
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    reset();
  };

  const onSubmit = async (data: FormValues) => {
    try {
      const res = await fetch('/api/v1/members/vaccinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to save vaccination');
      
      toast.success('Vaccination saved');
      closeModal();
      onUpdate();
    } catch (error) {
      toast.error('Could not save vaccination');
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Delete this vaccination record?')) return;
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/v1/members/vaccinations?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Vaccination deleted');
      onUpdate();
    } catch (error) {
      toast.error('Could not delete');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Syringe className="w-5 h-5 text-indigo-400" /> Vaccinations
        </h2>
        <button onClick={() => openModal()} className="text-emerald-500 hover:text-emerald-400 text-sm font-medium flex items-center gap-1">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      <div className="space-y-4">
        {initialData?.length > 0 ? (
          initialData.map((item: any) => (
            <div key={item.id} className="flex flex-col sm:flex-row items-start justify-between border-b border-slate-200 pb-3 last:border-0 group">
              <div>
                <p className="text-slate-800 font-medium">{item.vaccine} {item.doseNumber && `(Dose ${item.doseNumber})`}</p>
                <p className="text-slate-500 text-sm">
                  {item.date ? new Date(item.date).toLocaleDateString() : 'Date unknown'} 
                  {item.facility && ` • ${item.facility}`}
                </p>
                {item.nextDose && <p className="text-emerald-600 text-xs mt-1 font-medium">Next Dose: {new Date(item.nextDose).toLocaleDateString()}</p>}
              </div>
              <div className="flex gap-2 mt-2 sm:mt-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openModal(item)} className="text-slate-400 hover:text-slate-700 p-1">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => deleteItem(item.id)} disabled={isDeleting === item.id} className="text-slate-400 hover:text-rose-400 p-1 disabled:opacity-50">
                  {isDeleting === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-slate-500 italic text-sm">No vaccinations recorded.</p>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Manage Vaccination</h3>
              <button onClick={closeModal} className="text-slate-500 hover:text-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Vaccine Name</label>
                  <input {...register('vaccine')} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 outline-none" placeholder="e.g. COVID-19, Flu" />
                  {errors.vaccine && <p className="text-rose-400 text-xs mt-1">{errors.vaccine.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Dose Number</label>
                  <input type="number" {...register('doseNumber')} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 outline-none" placeholder="e.g. 1" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date Administered</label>
                  <input type="date" {...register('date')} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 outline-none [color-scheme:light]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Next Dose Due</label>
                  <input type="date" {...register('nextDose')} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 outline-none [color-scheme:light]" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Facility / Clinic</label>
                  <input {...register('facility')} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 outline-none" placeholder="e.g. City Hospital" />
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
                <button type="submit" disabled={isSubmitting} className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-70 flex items-center gap-2">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
