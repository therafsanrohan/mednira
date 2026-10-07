'use client';

import { useState } from 'react';
import { CreditCard, Check, AlertTriangle, ShieldCheck, Download, History, Zap } from 'lucide-react';
import { Button, Label } from '@/components/ui/FormSystem';
import Link from 'next/link';

export default function SubscriptionPage() {
  const [loading, setLoading] = useState(false);
  const [currentPlan] = useState({
    name: 'Free Basic',
    status: 'ACTIVE',
    price: '0.00',
    currency: '৳',
    renewalDate: 'Never',
    features: [
      'Basic Medical ID',
      '1 Emergency Contact',
      'Standard QR Code',
    ]
  });

  const handleUpgrade = async () => {
    setLoading(true);
    // Placeholder for actual payment gateway integration (e.g. Stripe / SSLCommerz)
    setTimeout(() => {
      setLoading(false);
      alert('Payment Gateway Integration Pending (Phase 8)');
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <CreditCard className="w-8 h-8 text-indigo-600" /> Subscription & Billing
        </h1>
        <p className="text-slate-500 mt-1">Manage your plan, billing history, and payment methods.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Current Plan Overview */}
        <section className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <Label className="text-slate-500 uppercase tracking-wider mb-2">Current Plan</Label>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-slate-900">{currentPlan.name}</h2>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-md">
                    {currentPlan.status}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-extrabold text-slate-900">
                  {currentPlan.currency}{currentPlan.price}
                </p>
                <p className="text-sm text-slate-500">/ month</p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6 mt-2">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Included Features:</h3>
              <ul className="space-y-3">
                {currentPlan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm text-slate-700">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Upgrade Banner */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-600" /> Upgrade to MedNira Pro
              </h3>
              <p className="text-sm text-indigo-800 mt-1">
                Get unlimited emergency contacts, smart NFC tags, priority support, and advanced privacy controls.
              </p>
            </div>
            <Button onClick={handleUpgrade} isLoading={loading} className="shrink-0 bg-indigo-600 hover:bg-indigo-700">
              Upgrade Now
            </Button>
          </div>
        </section>

        {/* Sidebar Sections */}
        <div className="space-y-6">
          
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-slate-400" /> Payment Method
            </h3>
            <div className="flex flex-col gap-4">
              <p className="text-sm text-slate-500">No payment method added yet.</p>
              <Button variant="outline" className="w-full">Add Payment Method</Button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-slate-400" /> Billing History
            </h3>
            <div className="space-y-4">
              <div className="text-center py-6 text-sm text-slate-500 border-2 border-dashed border-slate-100 rounded-xl">
                No past invoices available.
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
