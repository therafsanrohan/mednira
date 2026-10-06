'use client';

import { Settings, Lock, Share2, Bell, Download, ShieldCheck } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Settings className="w-8 h-8 text-slate-400" />
            Account Settings
          </h1>
          <p className="text-slate-400 mt-1">Manage your privacy, security, and sharing permissions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Privacy Center */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-semibold text-slate-100">Privacy Center</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-200 font-medium">Public Emergency Profile</p>
                <p className="text-slate-400 text-sm">Allow critical info to be scanned via QR.</p>
              </div>
              <div className="w-12 h-6 bg-emerald-500 rounded-full flex items-center p-1 cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full translate-x-6"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-200 font-medium">Doctor Access</p>
                <p className="text-slate-400 text-sm">Allow verified doctors to view records.</p>
              </div>
              <div className="w-12 h-6 bg-emerald-500 rounded-full flex items-center p-1 cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full translate-x-6"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Medical Sharing */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Share2 className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-slate-100">Medical Sharing</h2>
          </div>
          <div className="text-center py-6 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <ShieldCheck className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <p className="text-slate-300 font-medium">No Active Shares</p>
            <p className="text-slate-500 text-sm mt-1">You are not sharing records with any provider.</p>
            <button className="mt-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors">
              Share Records
            </button>
          </div>
        </section>

        {/* Notifications */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-semibold text-slate-100">Notifications</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-200 font-medium">Emergency Alerts (SMS)</p>
                <p className="text-slate-400 text-sm">Notify contacts during an incident.</p>
              </div>
              <div className="w-12 h-6 bg-emerald-500 rounded-full flex items-center p-1 cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full translate-x-6"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-200 font-medium">Access Alerts (Email)</p>
                <p className="text-slate-400 text-sm">Get notified when someone scans your QR.</p>
              </div>
              <div className="w-12 h-6 bg-slate-700 rounded-full flex items-center p-1 cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Data Export */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Download className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-semibold text-slate-100">Data Export</h2>
          </div>
          <p className="text-slate-400 text-sm mb-4">
            Download a complete copy of your medical records and profile data in a structured format (JSON/PDF).
          </p>
          <button className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors border border-slate-700">
            <Download className="w-4 h-4" /> Export My Data
          </button>
        </section>

      </div>
    </div>
  );
}
