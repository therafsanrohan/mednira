import { DeviceService } from '@/lib/services/device.service';
import { buildEmergencyProfileDTO } from '@/lib/dto/emergency.dto';
import { ShieldAlert, Phone, AlertTriangle, Activity, Syringe, Lock, ShieldCheck, HeartPulse } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function PublicEmergencyProfile({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  
  if (!token) return notFound();

  const result = await DeviceService.resolveEmergencyToken(token);

  if (result.status === 'FROZEN' || result.status === 'REVOKED' || result.status === 'INACTIVE' || !result.user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <ShieldAlert className="w-16 h-16 text-rose-500 mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Invalid Emergency ID</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-md">
          {result.status === 'FROZEN' ? 'This device emergency profile is currently frozen by the member.' : 
           result.status === 'REVOKED' ? 'This MedNira ID has been revoked.' :
           'This medical ID is no longer active. The information cannot be displayed.'}
        </p>
      </div>
    );
  }

  const p = buildEmergencyProfileDTO(token, result.user);

  // Compute Age
  let age = 'Unknown Age';
  if (p.dateOfBirth) {
    const dob = new Date(p.dateOfBirth);
    const diff = Date.now() - dob.getTime();
    const ageDate = new Date(diff); 
    age = `${Math.abs(ageDate.getUTCFullYear() - 1970)} Years`;
  }

  const hasCriticalData = p.allergies.some(a => a.severity === 'LIFE_THREATENING') || 
                          p.conditions.length > 0 || 
                          p.medications.length > 0;

  return (
    <div className="max-w-[420px] mx-auto min-h-screen bg-white dark:bg-slate-950 pb-12 shadow-2xl relative">
      
      {/* HEADER */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HeartPulse className="w-6 h-6 text-rose-500" />
          <span className="font-bold tracking-tight text-slate-900 dark:text-white">MEDNIRA</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-semibold">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          Active
        </div>
      </header>

      <main className="px-4 py-6 space-y-8">
        
        {/* IDENTITY */}
        <section className="text-center">
          <div className="w-24 h-24 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-4 border-4 border-white dark:border-slate-950 shadow-sm flex items-center justify-center">
            <span className="text-3xl font-bold text-slate-400">{p.memberName.charAt(0)}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">{p.memberName}</h1>
          <div className="flex items-center justify-center gap-2 mt-2 text-slate-600 dark:text-slate-400 text-sm">
            <span>{age}</span>
            <span>•</span>
            <span className="font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
              Blood: {p.bloodType ? `${p.bloodType}${p.rhFactor || ''}` : 'Unknown'}
            </span>
          </div>
          {p.bloodType && (
            <p className="text-xs text-slate-500 mt-1 flex items-center justify-center gap-1">
              Self Reported
            </p>
          )}
        </section>

        {/* CRITICAL ALERT ZONE */}
        {hasCriticalData && (
          <section className="bg-rose-50 dark:bg-rose-950/30 border-l-4 border-rose-500 p-4 rounded-r-xl">
            <h2 className="text-rose-800 dark:text-rose-400 font-bold flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5" /> CRITICAL ALERTS
            </h2>
            <div className="space-y-3">
              {p.allergies.filter(a => a.severity === 'LIFE_THREATENING').map((a, idx) => (
                <div key={idx}>
                  <p className="font-semibold text-rose-900 dark:text-rose-200">{a.substance} Allergy</p>
                  {a.reaction && <p className="text-sm text-rose-700 dark:text-rose-300">Reaction: {a.reaction}</p>}
                </div>
              ))}
              {p.conditions.map((c, idx) => (
                <div key={`c-${idx}`}>
                  <p className="font-semibold text-rose-900 dark:text-rose-200">{c.conditionName}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* EMERGENCY CONTACT */}
        <section>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Emergency Contact</h3>
          {p.emergencyContacts.length > 0 ? (
            <div className="space-y-3">
              {p.emergencyContacts.map((c, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col gap-3">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-lg">{c.name}</p>
                    <p className="text-sm text-slate-500">{c.relationship} • {idx === 0 ? 'Primary Contact' : 'Secondary Contact'}</p>
                  </div>
                  <a href={`tel:${c.phone}`} className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors">
                    <Phone className="w-5 h-5" /> Call {c.phone}
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 italic">No emergency contact provided.</p>
          )}
        </section>

        {/* ALLERGIES */}
        <section>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Allergies</h3>
          {p.allergies.length > 0 ? (
            <ul className="space-y-2">
              {p.allergies.map((a, idx) => (
                <li key={idx} className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg flex items-center justify-between">
                  <span className="font-medium text-slate-900 dark:text-slate-200">{a.substance}</span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${a.severity === 'LIFE_THREATENING' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'}`}>
                    {a.severity.replace('_', ' ')}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg text-sm">No known allergies reported.</p>
          )}
        </section>

        {/* MEDICATIONS */}
        <section>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Current Medications</h3>
          {p.medications.length > 0 ? (
            <div className="space-y-2">
              {p.medications.map((m, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border-l-2 border-emerald-500">
                  <p className="font-medium text-slate-900 dark:text-slate-200">{m.genericName} {m.brandName && `(${m.brandName})`}</p>
                  <p className="text-sm text-slate-500">{m.dosage || 'Dosage not specified'} • {m.frequency || 'Frequency not specified'}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 italic text-sm">No active emergency medications.</p>
          )}
        </section>

        {/* EMERGENCY NOTES */}
        {p.emergencyNotes && (
          <section>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Patient Emergency Note</h3>
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-4 rounded-xl text-amber-900 dark:text-amber-200 text-sm font-medium">
              "{p.emergencyNotes}"
            </div>
          </section>
        )}

        {/* AUTHORIZED ACCESS */}
        <section className="pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="bg-slate-100 dark:bg-slate-900 rounded-xl p-5 text-center">
            <Lock className="w-8 h-8 text-slate-400 mx-auto mb-3" />
            <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Need More Information?</h4>
            <p className="text-sm text-slate-500 mb-4">Additional medical records may be available through authorized access.</p>
            <button className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-lg font-medium transition-colors text-sm">
              Request Authorized Access
            </button>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="px-6 py-8 text-center text-xs text-slate-500 dark:text-slate-500">
        <ShieldCheck className="w-6 h-6 mx-auto mb-2 text-slate-400" />
        <p className="mb-2"><strong>MedNira Emergency Medical Information</strong></p>
        <p className="mb-4">This profile contains information provided by the individual. Not a substitute for professional medical judgment.</p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/privacy" className="underline">Privacy</Link>
          <Link href="/terms" className="underline">Terms</Link>
          <button className="underline">Report ID</button>
        </div>
      </footer>
    </div>
  );
}
