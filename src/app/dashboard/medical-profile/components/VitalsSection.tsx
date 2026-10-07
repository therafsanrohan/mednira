'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ActivitySquare, Plus, Trash2, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const vitalSchema = z.object({
  id: z.string().optional(),
  vitalType: z.string().min(1, 'Type is required'),
  value: z.string().min(1, 'Value is required'),
  unit: z.string().optional(),
  measurementDate: z.string().min(1, 'Date is required'),
  source: z.string(),
  visibility: z.enum(['PUBLIC_EMERGENCY', 'EMERGENCY_RESPONDER', 'DOCTOR_ACCESS', 'PRIVATE']),
});

type VitalFormValues = z.infer<typeof vitalSchema>;

export default function VitalsSection({ initialData, onUpdate }: { initialData: any[], onUpdate: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<VitalFormValues>({
    resolver: zodResolver(vitalSchema),
    defaultValues: {
      source: 'Manual Entry',
      visibility: 'PRIVATE',
      measurementDate: new Date().toISOString().split('T')[0]
    }
  });

  const selectedType = watch('vitalType');

  // Auto-fill units based on vital type
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setValue('vitalType', val);
    if (val === 'Blood Pressure') setValue('unit', 'mmHg');
    else if (val === 'Heart Rate') setValue('unit', 'bpm');
    else if (val === 'SpO2') setValue('unit', '%');
    else if (val === 'Temperature') setValue('unit', '°C');
    else if (val === 'Blood Glucose') setValue('unit', 'mg/dL');
    else if (val === 'Weight') setValue('unit', 'kg');
  };

  const openModal = () => {
    reset({
      source: 'Manual Entry',
      visibility: 'PRIVATE',
      measurementDate: new Date().toISOString().split('T')[0]
    });
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    reset();
  };

  const onSubmit = async (data: VitalFormValues) => {
    try {
      const res = await fetch('/api/v1/members/vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to save vital');
      
      toast.success('Vital saved successfully');
      closeModal();
      onUpdate();
    } catch (error) {
      toast.error('Could not save vital');
    }
  };

  const deleteVital = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vital record?')) return;
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/v1/members/vitals?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete vital');
      toast.success('Vital deleted');
      onUpdate();
    } catch (error) {
      toast.error('Could not delete vital');
    } finally {
      setIsDeleting(null);
    }
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'Blood Pressure': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'Heart Rate': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'SpO2': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'Blood Glucose': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'Temperature': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <ActivitySquare className="w-5 h-5 text-indigo-400" /> Vitals & Measurements
        </h2>
        <button onClick={() => openModal()} className="text-emerald-400 hover:text-emerald-300 text-sm font-medium flex items-center gap-1">
          <Plus className="w-4 h-4" /> Log
        </button>
      </div>

      <div className="space-y-3">
        {initialData?.length > 0 ? (
          initialData.map((v: any) => (
            <div key={v.id} className="flex items-center justify-between border border-slate-200 bg-slate-50 rounded-xl p-3 group">
              <div className="flex items-center gap-3">
                <div className={`px-2 py-1 rounded text-xs font-bold border ${getTypeColor(v.vitalType)}`}>
                  {v.vitalType}
                </div>
                <div>
                  <p className="text-slate-800 font-bold text-lg">
                    {v.value} <span className="text-sm font-medium text-slate-500">{v.unit}</span>
                  </p>
                  <p className="text-slate-500 text-xs">{new Date(v.measurementDate).toLocaleDateString()} • {v.source}</p>
                </div>
              </div>
              <button onClick={() => deleteVital(v.id)} disabled={isDeleting === v.id} className="text-slate-500 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50">
                {isDeleting === v.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </button>
            </div>
          ))
        ) : (
          <p className="text-slate-500 italic text-sm">No vitals logged yet.</p>
        )}
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Log Vital</h3>
              <button onClick={closeModal} className="text-slate-500 hover:text-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vital Type</label>
                <select 
                  {...register('vitalType')} 
                  onChange={handleTypeChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 outline-none"
                >
                  <option value="">Select Type...</option>
                  <option value="Blood Pressure">Blood Pressure</option>
                  <option value="Heart Rate">Heart Rate</option>
                  <option value="SpO2">SpO2 (Oxygen)</option>
                  <option value="Blood Glucose">Blood Glucose</option>
                  <option value="Temperature">Temperature</option>
                  <option value="Weight">Weight</option>
                </select>
                {errors.vitalType && <p className="text-rose-400 text-xs mt-1">{errors.vitalType.message}</p>}
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Value</label>
                  <input {...register('value')} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 outline-none" placeholder={selectedType === 'Blood Pressure' ? '120/80' : '98'} />
                  {errors.value && <p className="text-rose-400 text-xs mt-1">{errors.value.message}</p>}
                </div>
                <div className="w-24">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
                  <input {...register('unit')} className="w-full bg-slate-50 border border-slate-200/50 rounded-lg p-2.5 text-slate-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input type="date" {...register('measurementDate')} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 outline-none [color-scheme:dark]" />
              </div>

              <input type="hidden" {...register('source')} />
              <input type="hidden" {...register('visibility')} />

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-70 flex items-center gap-2">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Log Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
