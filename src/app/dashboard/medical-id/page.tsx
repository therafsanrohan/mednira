'use client';

import { useState, useEffect } from 'react';
import { Shield, User, HeartPulse, ActivitySquare, CheckCircle2, ChevronRight, FileText, Pill, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function MedicalIDOverviewPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/v1/members/emergency-id');
        if (res.ok) {
          const json = await res.json();
          setProfile(json.data);
        }
      } catch (err) {
        toast.error('Failed to load Medical ID');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return <div className="p-12 text-center text-slate-500 animate-pulse">Loading Medical Identity...</div>;
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <User className="w-8 h-8 text-indigo-500" /> Medical ID
          </h1>
          <p className="text-slate-500 mt-2 max-w-2xl text-lg">Your complete and authoritative medical identity.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 text-sm font-semibold rounded-full border border-indigo-100 uppercase tracking-wide">
            <CheckCircle2 className="w-4 h-4" /> Identity Verified
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Medical Identity Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <HeartPulse className="w-6 h-6 text-slate-400" /> Complete Medical Profile
          </h2>
          
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-slate-900">Medical Data completeness</h3>
                <p className="text-sm text-slate-500">Your health data is well maintained.</p>
              </div>
              <span className="text-emerald-500 font-bold text-xl">85%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mb-6 overflow-hidden">
              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>

            <div className="space-y-2">
              <Link href="/dashboard/medical-profile" className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-indigo-500" />
                  <span className="font-medium text-slate-700">Personal & Vitals</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
              <Link href="/dashboard/medications" className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <Pill className="w-5 h-5 text-emerald-500" />
                  <span className="font-medium text-slate-700">Medications</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
              <Link href="/dashboard/records" className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <ActivitySquare className="w-5 h-5 text-rose-500" />
                  <span className="font-medium text-slate-700">Health Records</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
              <Link href="/dashboard/documents" className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <span className="font-medium text-slate-700">Medical Documents</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>

        {/* Emergency Access Projection Layer */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-emerald-500" /> Emergency Access
          </h2>
          
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-800 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-emerald-500/20 transition-all duration-1000"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-xl mb-1">Emergency ID</h3>
                  <p className="text-slate-400 text-sm">Powered by your Medical ID</p>
                </div>
                {profile?.isPublic ? (
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider rounded-full border border-emerald-500/30">
                    Active
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider rounded-full border border-amber-500/30">
                    Inactive
                  </span>
                )}
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6 backdrop-blur-sm">
                <p className="text-sm text-slate-300 leading-relaxed">
                  Your Emergency ID is a secure projection generated from approved information in your Medical ID. Only data with explicit emergency visibility is shared.
                </p>
                
                <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Readiness</p>
                    <p className="font-bold text-lg text-emerald-400">{profile?.readinessScore}%</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Public Access</p>
                    <p className="font-bold text-lg">{profile?.isPublic ? 'Enabled' : 'Disabled'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Link href="/dashboard/emergency-id" className="w-full flex justify-between items-center bg-white text-slate-900 hover:bg-slate-100 px-5 py-3 rounded-xl font-bold transition-colors">
                  <span>Open Emergency ID</span>
                  <ChevronRight className="w-5 h-5" />
                </Link>
                <Link href="/dashboard/emergency-id" className="w-full flex justify-center items-center bg-white/10 hover:bg-white/20 text-white px-5 py-3 rounded-xl font-medium transition-colors">
                  Manage Emergency Visibility
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
