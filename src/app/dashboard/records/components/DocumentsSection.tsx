'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FileText, Plus, Edit2, Trash2, X, Loader2, Download, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { Input, Select, Textarea, Button, Label, FieldError } from '@/components/ui/FormSystem';

const schema = z.object({
  id: z.string().optional(),
  documentType: z.string().min(1, 'Document type is required'),
  title: z.string().min(1, 'Title is required'),
  date: z.string().optional(),
  healthcareProvider: z.string().optional(),
  hospitalClinic: z.string().optional(),
  fileUrl: z.string().min(1, 'File URL is required'),
  visibility: z.enum(['PUBLIC_EMERGENCY', 'EMERGENCY_RESPONDER', 'DOCTOR_ACCESS', 'PRIVATE']),
});

type FormValues = z.infer<typeof schema>;

export default function DocumentsSection({ initialData, onUpdate }: { initialData: any[], onUpdate: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      visibility: 'DOCTOR_ACCESS',
      documentType: 'Lab Report'
    }
  });

  const openModal = (item?: any) => {
    if (item) {
      reset({
        ...item,
        date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
      });
    } else {
      reset({ visibility: 'DOCTOR_ACCESS', documentType: 'Lab Report' });
    }
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    reset();
  };

  const onSubmit = async (data: FormValues) => {
    try {
      const res = await fetch('/api/v1/members/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to save document');
      
      toast.success('Document saved');
      closeModal();
      onUpdate();
    } catch (error) {
      toast.error('Could not save document');
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Delete this document?')) return;
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/v1/members/documents?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Document deleted');
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
          <FileText className="w-5 h-5 text-indigo-400" /> Medical Documents
        </h2>
        <button onClick={() => openModal()} className="text-emerald-500 hover:text-emerald-400 text-sm font-medium flex items-center gap-1">
          <Plus className="w-4 h-4" /> Upload
        </button>
      </div>

      <div className="space-y-4">
        {initialData?.length > 0 ? (
          initialData.map((item: any) => (
            <div key={item.id} className="flex flex-col sm:flex-row items-start justify-between border-b border-slate-200 pb-3 last:border-0 group">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <p className="text-slate-800 font-medium">{item.title}</p>
                  <p className="text-slate-500 text-sm">
                    {item.documentType} • {item.date ? new Date(item.date).toLocaleDateString() : 'Date unknown'} 
                  </p>
                  {item.healthcareProvider && <p className="text-slate-500 text-xs mt-1">Provider: {item.healthcareProvider}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2 sm:mt-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <a href={item.fileUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-indigo-500 p-1">
                  <Eye className="w-4 h-4" />
                </a>
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
          <p className="text-slate-500 italic text-sm">No documents uploaded.</p>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Upload Document</h3>
              <button onClick={closeModal} className="text-slate-500 hover:text-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Document Title</label>
                <Input {...register('title')} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 outline-none" placeholder="e.g. Blood Test Results" />
                {errors.title && <p className="text-rose-400 text-xs mt-1">{errors.title.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Document Type</label>
                  <Select {...register('documentType')} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 outline-none">
                    <option value="Lab Report">Lab Report</option>
                    <option value="Prescription">Prescription</option>
                    <option value="Imaging">Imaging / X-Ray</option>
                    <option value="Discharge Summary">Discharge Summary</option>
                    <option value="Other">Other</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <Input type="date" {...register('date')} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 outline-none [color-scheme:light]" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">File URL (Temporary)</label>
                <Input {...register('fileUrl')} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 outline-none" placeholder="https://..." />
                <p className="text-xs text-slate-500 mt-1">Direct upload via Supabase Storage is coming soon.</p>
                {errors.fileUrl && <p className="text-rose-400 text-xs mt-1">{errors.fileUrl.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Provider / Doctor</label>
                  <Input {...register('healthcareProvider')} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Visibility</label>
                  <Select {...register('visibility')} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 outline-none">
                    <option value="DOCTOR_ACCESS">Doctors Only</option>
                    <option value="PRIVATE">Private</option>
                  </Select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-70 flex items-center gap-2">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
