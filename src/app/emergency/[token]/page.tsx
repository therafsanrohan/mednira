import { prisma } from '@/lib/prisma';
import { Shield, AlertTriangle, User, Droplets, Activity, Phone, ChevronRight } from 'lucide-react';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';

// Opt out of caching for emergency route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PublicEmergencyPage({ params }: { params: { token: string } }) {
  const { token } = params;

  // 1. Validate Token
  const deviceToken = await prisma.deviceToken.findUnique({
    where: { token },
    include: { user: true }
  });

  if (!deviceToken || deviceToken.status !== 'ACTIVE' || !deviceToken.userId) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <Shield className="w-16 h-16 text-slate-300 mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Emergency ID Unavailable</h1>
        <p className="text-slate-500 max-w-md">This emergency access token is invalid, revoked, or has expired.</p>
      </div>
    );
  }

  // 2. Check Visibility Settings
  const settings = await prisma.accountSettings.findUnique({
    where: { userId: deviceToken.userId }
  });

  if (!settings?.publicProfileEnabled) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <Shield className="w-16 h-16 text-slate-300 mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Private Profile</h1>
        <p className="text-slate-500 max-w-md">Public emergency access is currently disabled for this ID.</p>
      </div>
    );
  }

  // 3. Log Access
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'Unknown IP';
  const userAgent = headersList.get('user-agent') || 'Unknown Agent';

  await prisma.accessLog.create({
    data: {
      deviceTokenId: deviceToken.id,
      userId: deviceToken.userId,
      ip,
      userAgent,
      accessType: 'QR_SCAN' // Assume QR scan for web route
    }
  });

  await prisma.deviceToken.update({
    where: { id: deviceToken.id },
    data: { lastScannedAt: new Date() }
  });

  // 4. Fetch Approved Emergency Data
  const profile = await prisma.medicalProfile.findUnique({
    where: { userId: deviceToken.userId },
    include: {
      user: { select: { name: true } },
      allergies: { where: { visibility: 'PUBLIC_EMERGENCY' } },
      conditions: { where: { visibility: 'PUBLIC_EMERGENCY' } },
      medications: { where: { visibility: 'PUBLIC_EMERGENCY', status: 'Active' } },
      contacts: { where: { visibility: 'PUBLIC_EMERGENCY' } }
    }
  });

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="w-16 h-16 text-amber-500 mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Incomplete Profile</h1>
        <p className="text-slate-500 max-w-md">Medical profile is not fully configured.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-emerald-400" />
          <span className="font-bold tracking-wider">MedNira Emergency</span>
        </div>
        <span className="px-2.5 py-1 bg-rose-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-full animate-pulse">
          Verified ID
        </span>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        
        {/* Identity & Vitals Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
              <User className="w-8 h-8 text-slate-400" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900 leading-tight">{profile.user.name}</h1>
              <p className="text-slate-500 text-sm mt-1">
                {profile.dateOfBirth ? `DOB: ${new Date(profile.dateOfBirth).toLocaleDateString()}` : 'DOB: Not provided'}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="bg-rose-50 rounded-2xl p-4 border border-rose-100">
              <div className="flex items-center gap-2 text-rose-500 mb-1">
                <Droplets className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Blood</span>
              </div>
              <p className="text-2xl font-bold text-rose-700">{profile.bloodType || 'Unknown'}{profile.rhFactor || ''}</p>
            </div>
            
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
              <div className="flex items-center gap-2 text-emerald-600 mb-1">
                <Activity className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Donor</span>
              </div>
              <p className="text-lg font-bold text-emerald-800">{profile.organDonor ? 'Organ Donor' : 'Not Registered'}</p>
            </div>
          </div>

          {profile.dnrStatus && (
            <div className="mt-3 bg-slate-900 rounded-2xl p-4 text-center">
              <p className="text-rose-400 font-bold uppercase tracking-widest">DNR / DNI</p>
              <p className="text-slate-400 text-xs mt-1">Do Not Resuscitate directive is active.</p>
            </div>
          )}
        </div>

        {/* Critical Information Warning */}
        {profile.emergencyNotes && (
          <div className="bg-amber-50 rounded-3xl p-6 border border-amber-200">
            <h3 className="flex items-center gap-2 text-amber-800 font-bold mb-2">
              <AlertTriangle className="w-5 h-5" /> Emergency Instructions
            </h3>
            <p className="text-amber-900 text-sm leading-relaxed">{profile.emergencyNotes}</p>
          </div>
        )}

        {/* Allergies */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-900 mb-4 text-lg">Critical Allergies</h3>
          {profile.allergies.length > 0 ? (
            <ul className="space-y-3">
              {profile.allergies.map(a => (
                <li key={a.id} className="flex justify-between items-center pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                  <span className="font-medium text-slate-800">{a.substance}</span>
                  <span className={`text-xs px-2 py-1 rounded-md font-semibold ${a.severity === 'SEVERE' || a.severity === 'LIFE_THREATENING' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                    {a.severity}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 text-sm">No known critical allergies reported.</p>
          )}
        </div>

        {/* Conditions */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-900 mb-4 text-lg">Medical Conditions</h3>
          {profile.conditions.length > 0 ? (
            <ul className="space-y-3">
              {profile.conditions.map(c => (
                <li key={c.id} className="pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                  <p className="font-medium text-slate-800">{c.conditionName}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 text-sm">No critical conditions reported.</p>
          )}
        </div>

        {/* Medications */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-900 mb-4 text-lg">Current Medications</h3>
          {profile.medications.length > 0 ? (
            <ul className="space-y-3">
              {profile.medications.map(m => (
                <li key={m.id} className="pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                  <p className="font-medium text-slate-800">{m.genericName}</p>
                  <p className="text-xs text-slate-500">{m.dosage || 'Dosage unknown'} • {m.frequency || 'Frequency unknown'}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 text-sm">No critical medications reported.</p>
          )}
        </div>

        {/* Emergency Contacts */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-900 mb-4 text-lg">Emergency Contacts</h3>
          {profile.contacts.length > 0 ? (
            <div className="space-y-4">
              {profile.contacts.map(c => (
                <a key={c.id} href={`tel:${c.phone}`} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{c.name}</p>
                      <p className="text-xs text-slate-500">{c.relationship} • {c.phone}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </a>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No emergency contacts provided.</p>
          )}
        </div>

      </div>

      <div className="text-center p-8 mt-4 border-t border-slate-200 bg-slate-100">
        <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Protected by</p>
        <div className="flex items-center justify-center gap-1.5 mt-2 opacity-50">
          <Shield className="w-4 h-4" />
          <span className="font-bold">MedNira</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-4 max-w-xs mx-auto">
          Access to this record has been logged. Unauthorized access to medical records is strictly prohibited.
        </p>
      </div>

    </div>
  );
}
