'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Plus,
  QrCode,
  Phone,
  RefreshCw,
  Snowflake,
  Ban,
  CheckCircle,
  Trash2,
  ExternalLink,
  Lock,
  Eye,
  HeartPulse,
  Home,
  Activity,
  ChevronRight,
  Zap,
} from 'lucide-react';
import QRCode from 'react-qr-code';

type Tab = 'HOME' | 'PROFILE' | 'ITEMS' | 'DEVICES' | 'CONTACTS';

type MedicalItem = {
  id?: string;
  category: string;
  name: string;
  description: string;
  severity: string;
  visibility: string;
};

type Contact = {
  id?: string;
  name: string;
  relationship: string;
  phone: string;
  priority: number;
  notifyOnIncident: boolean;
};

type Device = {
  id: string;
  token: string;
  label: string;
  status: string;
  deviceType: string;
  lastScannedAt?: string;
  createdAt: string;
};

type Profile = {
  bloodType?: string;
  dateOfBirth?: string;
  organDonor: boolean;
  dnrStatus: boolean;
  emergencyNotes?: string;
  readinessScore?: number;
};

export default function MemberDashboard() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('HOME');

  // Profile state
  const [profile, setProfile] = useState<Profile>({
    bloodType: '',
    dateOfBirth: '',
    organDonor: false,
    dnrStatus: false,
    emergencyNotes: '',
    readinessScore: 0,
  });

  // Medical items
  const [items, setItems] = useState<MedicalItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('ALLERGY');
  const [newItemVisibility, setNewItemVisibility] = useState('EMERGENCY');

  // Contacts
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [newContactName, setNewContactName] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');

  // Devices
  const [devices, setDevices] = useState<Device[]>([]);

  const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/members/profile');
      if (!res.ok) return;
      const data = await res.json();
      if (data.user?.profile) {
        const p = data.user.profile;
        setProfile({
          bloodType: p.bloodType || '',
          dateOfBirth: p.dateOfBirth || '',
          organDonor: p.organDonor || false,
          dnrStatus: p.dnrStatus || false,
          emergencyNotes: p.emergencyNotes || '',
          readinessScore: p.readinessScore || 0,
        });
        if (p.items) setItems(p.items);
        if (p.contacts) setContacts(p.contacts);
      }
      if (data.user?.deviceTokens) {
        setDevices(data.user.deviceTokens);
      }
    } catch (err) {
      console.error('Fetch profile error:', err);
    }
  }, []);

  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      fetchProfile();
    }
  }, [sessionStatus, fetchProfile]);

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/members/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bloodType: profile.bloodType || undefined,
          dateOfBirth: profile.dateOfBirth || undefined,
          organDonor: profile.organDonor,
          dnrStatus: profile.dnrStatus,
          emergencyNotes: profile.emergencyNotes || undefined,
          items,
          contacts,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProfile((prev) => ({ ...prev, readinessScore: data.readinessScore }));
      showMessage('Profile saved successfully!');
    } catch (err: any) {
      showMessage(err.message || 'Failed to save profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchDevices = async () => {
    try {
      const res = await fetch('/api/v1/devices');
      const data = await res.json();
      if (data.devices) setDevices(data.devices);
    } catch (err) {
      console.error('Fetch devices error:', err);
    }
  };

  const handleGenerateDevice = async () => {
    try {
      const res = await fetch('/api/v1/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: `Emergency QR Card #${devices.length + 1}`, deviceType: 'QR' }),
      });
      const data = await res.json();
      if (res.ok) {
        showMessage('New Emergency QR token generated!');
        fetchDevices();
      } else {
        showMessage(data.error || 'Failed to generate token', 'error');
      }
    } catch (err: any) {
      showMessage(err.message, 'error');
    }
  };

  const handleDeviceAction = async (deviceId: string, action: 'FREEZE' | 'UNFREEZE' | 'REVOKE' | 'REPLACE') => {
    try {
      const res = await fetch(`/api/v1/devices/${deviceId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok) {
        showMessage(data.message || 'Device updated');
        fetchDevices();
      } else {
        showMessage(data.error || 'Action failed', 'error');
      }
    } catch (err: any) {
      showMessage(err.message, 'error');
    }
  };

  const addItem = () => {
    if (!newItemName.trim()) return;
    setItems([...items, { category: newItemCategory, name: newItemName.trim(), description: '', severity: 'CRITICAL', visibility: newItemVisibility }]);
    setNewItemName('');
  };

  const addContact = () => {
    if (!newContactName.trim() || !newContactPhone.trim()) return;
    setContacts([...contacts, { name: newContactName.trim(), relationship: newContactRelation.trim() || 'Contact', phone: newContactPhone.trim(), priority: contacts.length + 1, notifyOnIncident: true }]);
    setNewContactName('');
    setNewContactRelation('');
    setNewContactPhone('');
  };

  if (sessionStatus === 'loading') {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '6rem' }}>
        <div className="spinner" style={{ border: '3px solid #e2e8f0', borderTopColor: 'var(--brand-blue)', width: '36px', height: '36px', margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading your profile...</p>
      </div>
    );
  }

  const userName = session?.user?.name?.split(' ')[0] || 'there';
  const readiness = profile.readinessScore ?? 0;
  const activeDevices = devices.filter((d) => d.status === 'ACTIVE');

  return (
    <div className="container">
      {/* Message Banner */}
      {message && (
        <div style={{
          backgroundColor: message.type === 'success' ? '#e0f2fe' : '#fff1f2',
          border: `1px solid ${message.type === 'success' ? '#0284c7' : '#f43f5e'}`,
          color: message.type === 'success' ? '#0369a1' : '#9f1239',
          padding: '0.875rem 1.25rem',
          borderRadius: '0.75rem',
          marginBottom: '1.5rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <CheckCircle size={18} /> {message.text}
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1.75rem', overflowX: 'auto', paddingBottom: '0.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
        {([
          { key: 'HOME', label: 'Home', icon: Home },
          { key: 'PROFILE', label: 'Medical Profile', icon: Shield },
          { key: 'ITEMS', label: `Items (${items.length})`, icon: Lock },
          { key: 'DEVICES', label: `QR Devices (${devices.length})`, icon: QrCode },
          { key: 'CONTACTS', label: `Contacts (${contacts.length})`, icon: Phone },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`btn ${activeTab === key ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 1rem', minHeight: '40px', fontSize: '0.85rem', flexShrink: 0 }}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
          <button onClick={handleSaveProfile} disabled={loading} className="btn btn-primary" style={{ minHeight: '40px', fontSize: '0.875rem' }}>
            {loading ? <><span className="spinner" /> Saving...</> : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* ── HOME TAB ─────────────────────────────────── */}
      {activeTab === 'HOME' && (
        <div>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.025em', marginBottom: '0.25rem' }}>
              Good evening, {userName}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Here's your Emergency Health Identity overview.
            </p>
          </div>

          {/* Emergency ID Status */}
          <div className="card card-emergency" style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #e11d48, #be123c)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Shield size={24} color="white" />
                </div>
                <div>
                  <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#0f172a' }}>Your Emergency ID</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.15rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: activeDevices.length > 0 ? 'var(--success-green)' : '#94a3b8' }} />
                    <span style={{ fontSize: '0.85rem', color: activeDevices.length > 0 ? 'var(--success-green)' : 'var(--text-muted)', fontWeight: 600 }}>
                      {activeDevices.length > 0 ? `${activeDevices.length} active device${activeDevices.length > 1 ? 's' : ''}` : 'No active devices'}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setActiveTab('DEVICES')} className="btn btn-secondary" style={{ minHeight: '40px' }}>
                Manage <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Profile Readiness */}
          <div className="card" style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>Profile Readiness</h3>
              <span style={{ fontWeight: 900, fontSize: '1.5rem', color: readiness >= 70 ? 'var(--success-green)' : readiness >= 40 ? 'var(--amber-warning)' : 'var(--emergency-red)' }}>
                {readiness}%
              </span>
            </div>
            <div style={{ height: '8px', borderRadius: '4px', backgroundColor: 'var(--border-subtle)', overflow: 'hidden', marginBottom: '1rem' }}>
              <div style={{ height: '100%', width: `${readiness}%`, borderRadius: '4px', background: readiness >= 70 ? 'var(--success-green)' : readiness >= 40 ? 'var(--amber-warning)' : 'var(--emergency-red)', transition: 'width 0.5s ease' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { label: 'Blood group', done: !!profile.bloodType },
                { label: 'Emergency contact', done: contacts.length > 0 },
                { label: 'Allergies listed', done: items.some((i) => i.category === 'ALLERGY') },
                { label: 'Medical conditions', done: items.some((i) => i.category === 'CONDITION') },
                { label: 'Active QR device', done: activeDevices.length > 0 },
              ].map(({ label, done }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.875rem', color: done ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  <span style={{ color: done ? 'var(--success-green)' : 'var(--border-card)', fontWeight: 800 }}>{done ? '✓' : '○'}</span>
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid-responsive">
            <button onClick={() => setActiveTab('PROFILE')} className="card" style={{ textAlign: 'left', cursor: 'pointer', border: 'none' }}>
              <HeartPulse size={22} color="var(--brand-blue)" style={{ marginBottom: '0.75rem' }} />
              <div style={{ fontWeight: 800, color: '#0f172a' }}>Update Medical Profile</div>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Blood group, conditions, medications</div>
            </button>
            <button onClick={() => setActiveTab('CONTACTS')} className="card" style={{ textAlign: 'left', cursor: 'pointer', border: 'none' }}>
              <Phone size={22} color="var(--success-green)" style={{ marginBottom: '0.75rem' }} />
              <div style={{ fontWeight: 800, color: '#0f172a' }}>Emergency Contacts</div>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Who should we contact first?</div>
            </button>
            <button onClick={() => setActiveTab('DEVICES')} className="card" style={{ textAlign: 'left', cursor: 'pointer', border: 'none' }}>
              <QrCode size={22} color="var(--amber-warning)" style={{ marginBottom: '0.75rem' }} />
              <div style={{ fontWeight: 800, color: '#0f172a' }}>QR Devices</div>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Generate or manage your QR cards</div>
            </button>
            <button onClick={() => setActiveTab('ITEMS')} className="card" style={{ textAlign: 'left', cursor: 'pointer', border: 'none' }}>
              <Lock size={22} color="var(--emergency-red)" style={{ marginBottom: '0.75rem' }} />
              <div style={{ fontWeight: 800, color: '#0f172a' }}>Privacy Settings</div>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>What can a responder see?</div>
            </button>
          </div>
        </div>
      )}

      {/* ── PROFILE TAB ──────────────────────────────── */}
      {activeTab === 'PROFILE' && (
        <div className="card">
          <h3 style={{ color: '#0f172a', marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={20} color="var(--brand-blue)" /> Core Medical Information
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div className="form-field">
              <label className="form-label">Blood Group</label>
              <select value={profile.bloodType} onChange={(e) => setProfile({ ...profile, bloodType: e.target.value })} style={{ marginTop: '0.35rem' }}>
                <option value="">— Select —</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bt) => <option key={bt} value={bt}>{bt}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Date of Birth</label>
              <input type="date" value={profile.dateOfBirth} onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })} style={{ marginTop: '0.35rem' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '1.5rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '0.625rem', border: '1px solid #cbd5e1' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.95rem', cursor: 'pointer', fontWeight: 600, color: '#0f172a' }}>
              <input type="checkbox" checked={profile.organDonor} onChange={(e) => setProfile({ ...profile, organDonor: e.target.checked })} style={{ width: '20px', height: '20px' }} />
              Registered Organ Donor
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.95rem', color: '#be123c', cursor: 'pointer', fontWeight: 600 }}>
              <input type="checkbox" checked={profile.dnrStatus} onChange={(e) => setProfile({ ...profile, dnrStatus: e.target.checked })} style={{ width: '20px', height: '20px' }} />
              Do Not Resuscitate (DNR)
            </label>
          </div>

          <div className="form-field">
            <label className="form-label">Critical Instructions for Responders</label>
            <textarea
              value={profile.emergencyNotes}
              onChange={(e) => setProfile({ ...profile, emergencyNotes: e.target.value })}
              rows={3}
              placeholder="e.g. Severe Penicillin allergy. Carry EpiPen in left jacket pocket."
              style={{ marginTop: '0.35rem' }}
            />
          </div>
        </div>
      )}

      {/* ── ITEMS TAB ────────────────────────────────── */}
      {activeTab === 'ITEMS' && (
        <div className="card">
          <h3 style={{ color: '#0f172a', marginBottom: '0.5rem', fontSize: '1.2rem', fontWeight: 800 }}>
            Medical Items &amp; Privacy
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Items marked <strong style={{ color: 'var(--success-green)' }}>Emergency</strong> are visible to responders when they scan your QR.
            Items marked <strong>Trusted</strong> or <strong>Private</strong> are never shared automatically.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {items.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1.5rem 0' }}>No medical items added yet.</p>
            )}
            {items.map((item, idx) => (
              <div key={idx} style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', padding: '0.875rem 1.125rem', borderRadius: '0.625rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <span className="badge badge-neutral" style={{ marginRight: '0.5rem', fontSize: '0.7rem' }}>{item.category}</span>
                  <strong style={{ color: '#0f172a' }}>{item.name}</strong>
                  {item.description && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{item.description}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className={item.visibility === 'EMERGENCY' ? 'badge badge-critical' : 'badge badge-neutral'} style={{ fontSize: '0.7rem' }}>
                    {item.visibility}
                  </span>
                  <button onClick={() => setItems(items.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 140px 80px', gap: '0.5rem' }}>
            <select value={newItemCategory} onChange={(e) => setNewItemCategory(e.target.value)}>
              <option value="ALLERGY">Allergy</option>
              <option value="CONDITION">Condition</option>
              <option value="MEDICATION">Medication</option>
              <option value="PROCEDURE">Procedure</option>
            </select>
            <input type="text" placeholder="e.g. Peanuts, Insulin..." value={newItemName} onChange={(e) => setNewItemName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addItem()} />
            <select value={newItemVisibility} onChange={(e) => setNewItemVisibility(e.target.value)}>
              <option value="EMERGENCY">Emergency</option>
              <option value="TRUSTED">Trusted</option>
              <option value="PRIVATE">Private</option>
            </select>
            <button onClick={addItem} className="btn btn-secondary"><Plus size={16} /> Add</button>
          </div>
        </div>
      )}

      {/* ── DEVICES TAB ──────────────────────────────── */}
      {activeTab === 'DEVICES' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ color: '#0f172a', fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <QrCode size={22} color="var(--success-green)" /> Emergency QR Devices
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Each token is unique and revocable. Losing one never affects others.
              </p>
            </div>
            <button onClick={handleGenerateDevice} className="btn btn-primary" style={{ minHeight: '42px' }}>
              <Plus size={18} /> Generate New QR
            </button>
          </div>

          {devices.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '3rem 0' }}>
              <QrCode size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
              <p>No QR devices yet. Generate your first Emergency QR token above.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {devices.map((device) => (
                <div key={device.id} style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', padding: '1.25rem', borderRadius: '0.875rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <strong style={{ color: '#0f172a' }}>{device.label}</strong>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '0.15rem' }}>
                        {device.token.substring(0, 22)}...
                      </div>
                    </div>
                    <span className={`badge ${device.status === 'ACTIVE' ? 'badge-success' : device.status === 'FROZEN' ? 'badge-warning' : 'badge-neutral'}`} style={{ fontSize: '0.7rem' }}>
                      {device.status}
                    </span>
                  </div>

                  {/* Real QR Code */}
                  {device.status === 'ACTIVE' && (
                    <div style={{ backgroundColor: '#ffffff', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'center' }}>
                      <QRCode
                        value={`${process.env.NEXT_PUBLIC_APP_URL || ''}/e/${device.token}`}
                        size={120}
                        level="M"
                      />
                    </div>
                  )}

                  <a
                    href={`/e/${device.token}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '0.85rem', color: 'var(--brand-blue)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}
                  >
                    <Eye size={15} /> Test Emergency View <ExternalLink size={13} />
                  </a>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0' }}>
                    {device.status === 'ACTIVE' && (
                      <button onClick={() => handleDeviceAction(device.id, 'FREEZE')} className="btn btn-secondary" style={{ minHeight: '34px', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                        <Snowflake size={14} /> Freeze
                      </button>
                    )}
                    {device.status === 'FROZEN' && (
                      <button onClick={() => handleDeviceAction(device.id, 'UNFREEZE')} className="btn btn-secondary" style={{ minHeight: '34px', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                        <CheckCircle size={14} /> Unfreeze
                      </button>
                    )}
                    {!['REVOKED', 'REPLACED'].includes(device.status) && (
                      <>
                        <button onClick={() => handleDeviceAction(device.id, 'REPLACE')} className="btn btn-secondary" style={{ minHeight: '34px', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                          <RefreshCw size={14} /> Replace
                        </button>
                        <button onClick={() => handleDeviceAction(device.id, 'REVOKE')} className="btn btn-secondary" style={{ minHeight: '34px', padding: '0.35rem 0.75rem', fontSize: '0.8rem', color: '#9f1239' }}>
                          <Ban size={14} /> Revoke
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── CONTACTS TAB ─────────────────────────────── */}
      {activeTab === 'CONTACTS' && (
        <div className="card">
          <h3 style={{ color: '#0f172a', marginBottom: '0.5rem', fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Phone size={22} color="var(--success-green)" /> Emergency Contacts
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Who should we contact first if something happens to you?
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.5rem' }}>
            {contacts.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1.5rem 0' }}>No contacts added yet.</p>
            )}
            {contacts.map((contact, idx) => (
              <div key={idx} style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', padding: '1rem', borderRadius: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 800, color: '#0f172a' }}>{contact.name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                    {contact.relationship} • {contact.phone}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>Priority #{contact.priority}</span>
                  <button onClick={() => setContacts(contacts.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 80px', gap: '0.5rem' }}>
            <input type="text" placeholder="Contact name" value={newContactName} onChange={(e) => setNewContactName(e.target.value)} />
            <input type="text" placeholder="Relationship" value={newContactRelation} onChange={(e) => setNewContactRelation(e.target.value)} />
            <input type="text" placeholder="Phone (+880...)" value={newContactPhone} onChange={(e) => setNewContactPhone(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addContact()} />
            <button onClick={addContact} className="btn btn-secondary"><Plus size={16} /> Add</button>
          </div>
        </div>
      )}
    </div>
  );
}
