'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FileText, Plus, Trash2, X, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const labSchema = z.object({
  id: z.string().optional(),
  testName: z.string().min(1, 'Test Name is required'),
  testCategory: z.string().optional(),
  result: z.string().min(1, 'Result is required'),
  unit: z.string().optional(),
  referenceRange: z.string().optional(),
  abnormalFlag: z.boolean(),
  testDate: z.string().min(1, 'Date is required'),
  laboratory: z.string().optional(),
  visibility: z.enum(['PUBLIC_EMERGENCY', 'EMERGENCY_RESPONDER', 'DOCTOR_ACCESS', 'PRIVATE']),
});

type LabFormValues = z.infer<typeof labSchema>;

export default function LabReportsSection({ initialData, onUpdate }: { initialData: any[], onUpdate: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<LabFormValues>({
    resolver: zodResolver(labSchema),
    defaultValues: {
      abnormalFlag: false,
      visibility: 'DOCTOR_ACCESS',
      testDate: new Date().toISOString().split('T')[0]
    }
  });

  const openModal = () => {
    reset({
      abnormalFlag: false,
      visibility: 'DOCTOR_ACCESS',
      testDate: new Date().toISOString().split('T')[0]
    });
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    reset();
  };

  const onSubmit = async (data: LabFormValues) => {
    try {
      const res = await fetch('/api/v1/members/labs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to save lab report');
      
      toast.success('Lab result saved successfully');
      closeModal();
      onUpdate();
    } catch (error) {
      toast.error('Could not save lab report');
    }
  };

  const deleteLab = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lab report?')) return;
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/v1/members/labs?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete lab report');
      toast.success('Lab report deleted');
      onUpdate();
    } catch (error) {
      toast.error('Could not delete lab report');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 relative lg:col-span-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-sky-400" /> Lab Results & Reports
        </h2>
        <button onClick={() => openModal()} className="text-emerald-400 hover:text-emerald-300 text-sm font-medium flex items-center gap-1">
          <Plus className="w-4 h-4" /> Add Result
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {initialData?.length > 0 ? (
          initialData.map((lab: any) => (
            <div key={lab.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200/50 relative group">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-slate-800 font-semibold pr-6 line-clamp-2">{lab.testName}</h3>
                {lab.abnormalFlag && <div title="Abnormal Result"><AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" /></div>}
              </div>
              
              <div className="mt-2">
                <p className="text-2xl font-bold text-white">
                  {lab.result} <span className="text-sm font-medium text-slate-500">{lab.unit}</span>
                </p>
                {lab.referenceRange && (
                  <p className="text-slate-500 text-xs mt-1">Ref: {lab.referenceRange}</p>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-slate-200/50 flex justify-between items-center text-xs text-slate-500">
                <span>{new Date(lab.testDate).toLocaleDateString()}</span>
                <span>{lab.laboratory || 'Unknown Lab'}</span>
              </div>

              <button 
                onClick={() => deleteLab(lab.id)} 
                disabled={isDeleting === lab.id} 
                className="absolute top-3 right-3 text-slate-500 hover:text-rose-400 bg-slate-50 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 shadow"
              >
                {isDeleting === lab.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
              </button>
            </div>
          ))
        ) : (
          <p className="text-slate-500 italic text-sm col-span-full">No lab results found.</p>
        )}
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Add Lab Result</h3>
              <button onClick={closeModal} className="text-slate-500 hover:text-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Test Name</label>
                <input {...register('testName')} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 outline-none" placeholder="e.g. Hemoglobin A1C, Lipid Panel" />
                {errors.testName && <p className="text-rose-400 text-xs mt-1">{errors.testName.message}</p>}
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Result Value</label>
                  <input {...register('result')} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 outline-none" placeholder="e.g. 5.8" />
                  {errors.result && <p className="text-rose-400 text-xs mt-1">{errors.result.message}</p>}
                </div>
                <div className="w-24">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
                  <input {...register('unit')} className="w-full bg-slate-50 border border-slate-200/50 rounded-lg p-2.5 text-slate-500 outline-none" placeholder="%" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reference Range (Optional)</label>
                <input {...register('referenceRange')} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 outline-none" placeholder="e.g. 4.0 - 5.6" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date of Test</label>
                  <input type="date" {...register('testDate')} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 outline-none [color-scheme:dark]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Lab/Facility Name</label>
                  <input {...register('laboratory')} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 outline-none" placeholder="e.g. Labaid, Quest" />
                </div>
              </div>

              <label className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg cursor-pointer mt-2">
                <input type="checkbox" {...register('abnormalFlag')} className="w-4 h-4 rounded border-slate-200 bg-slate-50 text-rose-500 focus:ring-rose-500 focus:ring-offset-slate-900" />
                <span className="text-sm font-medium text-rose-400">Flag as Abnormal / Out of Range</span>
              </label>
              
              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-70 flex items-center gap-2">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Result'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
