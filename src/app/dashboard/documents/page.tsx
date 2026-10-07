'use client';

import { useState, useEffect } from 'react';
import { FileText, Plus, Search, FileUp, X, Download } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { register, handleSubmit, reset } = useForm();

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/v1/members/documents');
      if (res.ok) {
        const json = await res.json();
        setDocuments(json.data || []);
      }
    } catch (err) {
      toast.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const onSubmit = async (data: any) => {
    try {
      // In a real implementation this would upload a file to S3/Supabase Storage.
      // Here we just save the metadata.
      const res = await fetch('/api/v1/members/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: data.title, 
          type: data.type, 
          fileUrl: 'https://example.com/dummy.pdf', // Fallback URL
          status: 'Active',
          visibility: 'PUBLIC_EMERGENCY'
        })
      });
      
      if (!res.ok) throw new Error();
      
      toast.success('Document saved successfully');
      setIsModalOpen(false);
      reset();
      fetchDocuments();
    } catch (err) {
      toast.error('Failed to save document');
    }
  };

  const deleteDocument = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      const res = await fetch(`/api/v1/members/documents?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Deleted successfully');
      fetchDocuments();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Documents</h1>
          <p className="text-slate-500 mt-1">Upload and manage your medical records, test results, and prescriptions.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2"
        >
          <FileUp className="w-5 h-5" /> Upload Document
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search documents..." 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading documents...</div>
        ) : documents.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {documents.map(doc => (
              <div key={doc.id} className="p-5 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 mt-1">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-lg">{doc.title}</h3>
                    <p className="text-sm text-slate-500 mb-2">
                      Type: {doc.type} • Uploaded: {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex items-center gap-3 text-xs font-medium">
                      <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-700">
                        {doc.status || 'Active'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors text-sm font-medium flex items-center gap-1">
                    <Download className="w-4 h-4" /> Download
                  </a>
                  <button onClick={() => deleteDocument(doc.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors text-sm font-medium">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No documents found</h3>
            <p className="text-slate-500 mt-1 mb-6">Upload your first medical document or test result.</p>
            <button onClick={() => setIsModalOpen(true)} className="text-emerald-600 font-medium hover:text-emerald-700">
              + Upload document
            </button>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900">Upload Document</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Document Title</label>
                <input {...register('title', { required: true })} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none" placeholder="e.g. Blood Test Results 2026" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Document Type</label>
                <select {...register('type')} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none">
                  <option value="Lab Report">Lab Report</option>
                  <option value="Prescription">Prescription</option>
                  <option value="Imaging">Imaging (X-Ray, MRI)</option>
                  <option value="Clinical Note">Clinical Note</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">File (Placeholder)</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50">
                  <FileUp className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Drag and drop file here, or click to browse</p>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium">Cancel</button>
                <button type="submit" className="bg-emerald-600 text-white px-5 py-2 rounded-xl font-medium">Save Document</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
