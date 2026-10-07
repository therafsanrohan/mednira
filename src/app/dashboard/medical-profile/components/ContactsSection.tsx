'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Phone, Plus, Edit2, Trash2, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const contactSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required').max(100),
  relationship: z.string().min(1, 'Relationship is required').max(50),
  phone: z.string().min(1, 'Phone is required').max(30),
  secondaryPhone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  priority: z.coerce.number().int().min(1),
  notifyOnIncident: z.boolean(),
  visibility: z.enum(['PUBLIC_EMERGENCY', 'EMERGENCY_RESPONDER', 'DOCTOR_ACCESS', 'PRIVATE']),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactsSection({ initialData, onUpdate }: { initialData: any[], onUpdate: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      priority: 1,
      notifyOnIncident: true,
      visibility: 'PUBLIC_EMERGENCY',
    }
  });

  const openModal = (contact?: any) => {
    if (contact) {
      reset({ ...contact, email: contact.email || '' });
    } else {
      reset({ priority: 1, notifyOnIncident: true, visibility: 'PUBLIC_EMERGENCY' });
    }
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    reset();
  };

  const onSubmit = async (data: ContactFormValues) => {
    try {
      const res = await fetch('/api/v1/members/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to save contact');
      
      toast.success('Contact saved successfully');
      closeModal();
      onUpdate();
    } catch (error) {
      toast.error('Could not save contact');
    }
  };

  const deleteContact = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/v1/members/contacts?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete contact');
      toast.success('Contact deleted');
      onUpdate();
    } catch (error) {
      toast.error('Could not delete contact');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <Phone className="w-5 h-5 text-blue-400" /> Contacts
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
                <div className="flex items-center gap-2">
                  <p className="text-slate-200 font-medium">{c.name}</p>
                  {c.priority === 1 && <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/20">Primary</span>}
                </div>
                <p className="text-slate-400 text-sm mt-1">{c.relationship} • {c.phone}</p>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openModal(c)} className="text-slate-500 hover:text-slate-300 p-1">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => deleteContact(c.id)} disabled={isDeleting === c.id} className="text-slate-500 hover:text-rose-400 p-1 disabled:opacity-50">
                  {isDeleting === c.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            </li>
          ))
        ) : (
          <p className="text-slate-500 italic text-sm">No contacts added.</p>
        )}
      </ul>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b border-slate-800">
              <h3 className="text-lg font-semibold text-slate-100">Manage Contact</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                <input {...register('name')} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 outline-none" placeholder="e.g. John Doe" />
                {errors.name && <p className="text-rose-400 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Relationship</label>
                  <input {...register('relationship')} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 outline-none" placeholder="e.g. Spouse, Parent" />
                  {errors.relationship && <p className="text-rose-400 text-xs mt-1">{errors.relationship.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Priority (1 = Primary)</label>
                  <input type="number" min="1" {...register('priority')} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Primary Phone</label>
                <input type="tel" {...register('phone')} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 outline-none" placeholder="+880..." />
                {errors.phone && <p className="text-rose-400 text-xs mt-1">{errors.phone.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Secondary Phone (Optional)</label>
                <input type="tel" {...register('secondaryPhone')} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 outline-none" placeholder="+880..." />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email (Optional)</label>
                <input type="email" {...register('email')} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-200 outline-none" placeholder="contact@example.com" />
                {errors.email && <p className="text-rose-400 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-slate-100 transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-70 flex items-center gap-2">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
