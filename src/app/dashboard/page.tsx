'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Shield, Plus, QrCode, Phone, RefreshCw, Snowflake, Ban, CheckCircle, Trash2, 
  ExternalLink, Lock, Eye, HeartPulse, Home, Activity, ChevronRight, ScanFace, Droplet
} from 'lucide-react';
import QRCode from 'react-qr-code';

type Tab = 'HOME' | 'PROFILE' | 'ITEMS' | 'DEVICES' | 'CONTACTS';

type MedicalItem = { id?: string; category: string; name: string; description: string; severity: string; visibility: string; };
type Contact = { id?: string; name: string; relationship: string; phone: string; priority: number; notifyOnIncident: boolean; };
type Device = { id: string; token: string; label: string; status: string; deviceType: string; createdAt: string; };
type Profile = { bloodType?: string; dateOfBirth?: string; organDonor: boolean; dnrStatus: boolean; emergencyNotes?: string; readinessScore?: number; };

export default function MemberDashboard() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('HOME');

  const [profile, setProfile] = useState<Profile>({ bloodType: '', dateOfBirth: '', organDonor: false, dnrStatus: false, emergencyNotes: '', readinessScore: 0 });
  const [items, setItems] = useState<MedicalItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('ALLERGY');
  const [newItemVisibility, setNewItemVisibility] = useState('EMERGENCY');

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [newContactName, setNewContactName] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');

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
        setProfile({ bloodType: p.bloodType || '', dateOfBirth: p.dateOfBirth || '', organDonor: p.organDonor || false, dnrStatus: p.dnrStatus || false, emergencyNotes: p.emergencyNotes || '', readinessScore: p.readinessScore || 0 });
        if (p.items) setItems(p.items);
        if (p.contacts) setContacts(p.contacts);
      }
      if (data.user?.deviceTokens) setDevices(data.user.deviceTokens);
    } catch (err) { console.error('Fetch error:', err); }
  }, []);

  useEffect(() => {
    if (sessionStatus === 'authenticated') fetchProfile();
  }, [sessionStatus, fetchProfile]);

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/members/profile', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bloodType: profile.bloodType || undefined, dateOfBirth: profile.dateOfBirth || undefined, organDonor: profile.organDonor, dnrStatus: profile.dnrStatus, emergencyNotes: profile.emergencyNotes || undefined, items, contacts }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProfile((prev) => ({ ...prev, readinessScore: data.readinessScore }));
      showMessage('Profile saved securely.');
    } catch (err: any) { showMessage(err.message || 'Failed to save', 'error'); }
    finally { setLoading(false); }
  };

  const fetchDevices = async () => {
    try {
      const res = await fetch('/api/v1/devices');
      const data = await res.json();
      if (data.devices) setDevices(data.devices);
    } catch (err) { console.error(err); }
  };

  const handleGenerateDevice = async () => {
    try {
      const res = await fetch('/api/v1/devices', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: `Emergency QR #${devices.length + 1}`, deviceType: 'QR' }),
      });
      const data = await res.json();
      if (res.ok) { showMessage('New QR device created!'); fetchDevices(); }
      else showMessage(data.error || 'Failed', 'error');
    } catch (err: any) { showMessage(err.message, 'error'); }
  };

  const handleDeviceAction = async (deviceId: string, action: 'FREEZE' | 'UNFREEZE' | 'REVOKE' | 'REPLACE') => {
    try {
      const res = await fetch(`/api/v1/devices/${deviceId}/status`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok) { showMessage('Device status updated.'); fetchDevices(); }
      else showMessage(data.error || 'Failed', 'error');
    } catch (err: any) { showMessage(err.message, 'error'); }
  };

  const addItem = () => {
    if (!newItemName.trim()) return;
    setItems([...items, { category: newItemCategory, name: newItemName.trim(), description: '', severity: 'CRITICAL', visibility: newItemVisibility }]);
    setNewItemName('');
  };

  const addContact = () => {
    if (!newContactName.trim() || !newContactPhone.trim()) return;
    setContacts([...contacts, { name: newContactName.trim(), relationship: newContactRelation.trim() || 'Contact', phone: newContactPhone.trim(), priority: contacts.length + 1, notifyOnIncident: true }]);
    setNewContactName(''); setNewContactRelation(''); setNewContactPhone('');
  };

  if (sessionStatus === 'loading') {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fbfbfd' }}>
        <div className="apple-spinner"></div>
      </div>
    );
  }

  const userName = session?.user?.name?.split(' ')[0] || 'User';
  const readiness = profile.readinessScore ?? 0;
  const activeDevices = devices.filter((d) => d.status === 'ACTIVE');

  return (
    <div className="apple-dashboard-layout">


      <main className="dash-main">
        {/* Alerts */}
        {message && (
          <div className={`dash-alert fade-in-up ${message.type}`}>
            {message.type === 'success' ? <CheckCircle size={18} /> : <Ban size={18} />} {message.text}
          </div>
        )}

        {/* Apple-style Segmented Navigation */}
        <div className="segmented-nav fade-in-up">
          {([
            { key: 'HOME', label: 'Overview', icon: Home },
            { key: 'PROFILE', label: 'Clinical Data', icon: HeartPulse },
            { key: 'ITEMS', label: `Items (${items.length})`, icon: Shield },
            { key: 'DEVICES', label: `Devices (${devices.length})`, icon: QrCode },
            { key: 'CONTACTS', label: `Contacts (${contacts.length})`, icon: Phone },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setActiveTab(key)} className={`nav-btn ${activeTab === key ? 'active' : ''}`}>
              <Icon size={16} /> <span className="nav-label">{label}</span>
            </button>
          ))}
          <button onClick={handleSaveProfile} disabled={loading} className="btn-save-master">
            {loading ? <span className="apple-spinner-small" /> : 'Save Changes'}
          </button>
        </div>

        {/* ── OVERVIEW TAB (HOME) ─────────────────────────────────── */}
        {activeTab === 'HOME' && (
          <div className="fade-in-up delay-1">
            <h1 className="dash-title">Hello, {userName}.</h1>
            <p className="dash-subtitle">Your Emergency Health Identity is active.</p>

            <div className="bento-grid">
              {/* Readiness Score Card */}
              <div className="dash-card readiness-card">
                <div className="card-header">
                  <h3>Profile Readiness</h3>
                  <span className="score" style={{ color: readiness >= 70 ? '#16a34a' : readiness >= 40 ? '#d97706' : '#e11d48' }}>{readiness}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${readiness}%`, background: readiness >= 70 ? '#16a34a' : '#0071e3' }}></div>
                </div>
                <div className="checklist">
                  {[ { label: 'Blood group added', done: !!profile.bloodType },
                     { label: 'Emergency contact set', done: contacts.length > 0 },
                     { label: 'Allergies listed', done: items.some((i) => i.category === 'ALLERGY') },
                     { label: 'Active QR device', done: activeDevices.length > 0 }
                  ].map((task, i) => (
                    <div key={i} className={`check-item ${task.done ? 'done' : ''}`}>
                      <CheckCircle size={14} /> {task.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Card */}
              <div className="dash-card status-card">
                 <div className="status-icon"><Activity size={28} /></div>
                 <h3>System Status</h3>
                 <p>{activeDevices.length > 0 ? 'Your devices are active and ready for scanning.' : 'No active devices. Please generate a QR token.'}</p>
                 <button onClick={() => setActiveTab('DEVICES')} className="action-link">Manage Devices <ChevronRight size={14}/></button>
              </div>

              {/* Quick Actions */}
              <button onClick={() => setActiveTab('PROFILE')} className="dash-card quick-action">
                 <HeartPulse size={24} color="#0071e3" className="qa-icon" />
                 <h3>Update Vitals</h3>
                 <p>Blood type, medications & directives.</p>
              </button>
              <button onClick={() => setActiveTab('CONTACTS')} className="dash-card quick-action">
                 <Phone size={24} color="#16a34a" className="qa-icon" />
                 <h3>Emergency Contacts</h3>
                 <p>Who should we notify instantly?</p>
              </button>
            </div>
          </div>
        )}

        {/* ── PROFILE TAB ──────────────────────────────── */}
        {activeTab === 'PROFILE' && (
          <div className="fade-in-up delay-1">
            <div className="dash-card full-width">
              <h2 className="card-title"><HeartPulse size={20} color="#0071e3"/> Clinical Profile</h2>
              
              <div className="form-grid">
                <div className="input-group">
                  <label>Blood Group</label>
                  <select className="apple-input" value={profile.bloodType} onChange={(e) => setProfile({ ...profile, bloodType: e.target.value })}>
                    <option value="">— Select —</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bt) => <option key={bt} value={bt}>{bt}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label>Date of Birth</label>
                  <input type="date" className="apple-input" value={profile.dateOfBirth} onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })} />
                </div>
              </div>

              <div className="toggles-box">
                <label className="toggle-label">
                  <input type="checkbox" checked={profile.organDonor} onChange={(e) => setProfile({ ...profile, organDonor: e.target.checked })} />
                  Registered Organ Donor
                </label>
                <label className="toggle-label text-danger">
                  <input type="checkbox" checked={profile.dnrStatus} onChange={(e) => setProfile({ ...profile, dnrStatus: e.target.checked })} />
                  Do Not Resuscitate (DNR) Directive
                </label>
              </div>

              <div className="input-group mt-4">
                <label>Critical Directives for Responders</label>
                <textarea className="apple-input" rows={3} placeholder="e.g. Severe Penicillin allergy. EpiPen in left pocket." value={profile.emergencyNotes} onChange={(e) => setProfile({ ...profile, emergencyNotes: e.target.value })} />
              </div>
            </div>
          </div>
        )}

        {/* ── ITEMS TAB ────────────────────────────────── */}
        {activeTab === 'ITEMS' && (
          <div className="fade-in-up delay-1">
            <div className="dash-card full-width">
              <h2 className="card-title"><Shield size={20} color="#16a34a"/> Medical Items & Privacy</h2>
              <p className="card-desc">Items marked <span className="highlight-green">Emergency</span> are visible to first responders immediately.</p>
              
              <div className="item-list">
                {items.length === 0 && <div className="empty-state">No medical items recorded yet.</div>}
                {items.map((item, idx) => (
                  <div key={idx} className="data-row">
                    <div className="data-info">
                      <span className="badge category-badge">{item.category}</span>
                      <strong>{item.name}</strong>
                    </div>
                    <div className="data-actions">
                      <span className={`badge visibility-badge ${item.visibility.toLowerCase()}`}>{item.visibility}</span>
                      <button className="icon-btn danger" onClick={() => setItems(items.filter((_, i) => i !== idx))}><Trash2 size={16}/></button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="add-row mt-4">
                <select className="apple-input" value={newItemCategory} onChange={(e) => setNewItemCategory(e.target.value)}>
                  <option value="ALLERGY">Allergy</option>
                  <option value="CONDITION">Condition</option>
                  <option value="MEDICATION">Medication</option>
                </select>
                <input type="text" className="apple-input" placeholder="e.g. Insulin, Asthma" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} />
                <select className="apple-input" value={newItemVisibility} onChange={(e) => setNewItemVisibility(e.target.value)}>
                  <option value="EMERGENCY">Emergency</option>
                  <option value="TRUSTED">Trusted</option>
                  <option value="PRIVATE">Private</option>
                </select>
                <button className="apple-btn" onClick={addItem}><Plus size={16} /> Add</button>
              </div>
            </div>
          </div>
        )}

        {/* ── DEVICES TAB ──────────────────────────────── */}
        {activeTab === 'DEVICES' && (
          <div className="fade-in-up delay-1">
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
               <h2 className="dash-title-small">Emergency QR Devices</h2>
               <button onClick={handleGenerateDevice} className="apple-btn primary-btn"><Plus size={16}/> New Token</button>
             </div>

             {devices.length === 0 ? (
               <div className="dash-card empty-state-card">
                 <QrCode size={40} className="empty-icon" />
                 <p>You haven't generated any ID tokens yet.</p>
               </div>
             ) : (
               <div className="devices-grid">
                 {devices.map((device) => (
                   <div key={device.id} className="dash-card device-card">
                      <div className="device-header">
                        <div>
                          <h4>{device.label}</h4>
                          <span className="token-hash">{device.token.substring(0, 15)}...</span>
                        </div>
                        <span className={`badge status-badge ${device.status.toLowerCase()}`}>{device.status}</span>
                      </div>

                      {device.status === 'ACTIVE' && (
                        <div className="qr-container">
                          <QRCode value={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/e/${device.token}`} size={120} level="M" />
                        </div>
                      )}

                      <a href={`/e/${device.token}`} target="_blank" rel="noreferrer" className="test-link">
                        <ScanFace size={14}/> Test Emergency View <ExternalLink size={12}/>
                      </a>

                      <div className="device-actions">
                         {device.status === 'ACTIVE' && <button className="apple-btn small" onClick={() => handleDeviceAction(device.id, 'FREEZE')}><Snowflake size={14}/> Freeze</button>}
                         {device.status === 'FROZEN' && <button className="apple-btn small" onClick={() => handleDeviceAction(device.id, 'UNFREEZE')}><CheckCircle size={14}/> Unfreeze</button>}
                         {!['REVOKED', 'REPLACED'].includes(device.status) && (
                           <>
                             <button className="apple-btn small" onClick={() => handleDeviceAction(device.id, 'REPLACE')}><RefreshCw size={14}/> Replace</button>
                             <button className="apple-btn small danger" onClick={() => handleDeviceAction(device.id, 'REVOKE')}><Ban size={14}/> Revoke</button>
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
          <div className="fade-in-up delay-1">
            <div className="dash-card full-width">
              <h2 className="card-title"><Phone size={20} color="#8b5cf6"/> Emergency Contacts</h2>
              <p className="card-desc">Family or doctors to notify automatically when your ID is scanned.</p>
              
              <div className="item-list">
                {contacts.length === 0 && <div className="empty-state">No contacts added yet.</div>}
                {contacts.map((contact, idx) => (
                  <div key={idx} className="data-row">
                    <div className="data-info">
                      <strong>{contact.name}</strong>
                      <span className="sub-text">{contact.relationship} &bull; {contact.phone}</span>
                    </div>
                    <div className="data-actions">
                      <span className="badge category-badge">Prio #{contact.priority}</span>
                      <button className="icon-btn danger" onClick={() => setContacts(contacts.filter((_, i) => i !== idx))}><Trash2 size={16}/></button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="add-row mt-4">
                <input type="text" className="apple-input" placeholder="Name (e.g. Sarah J.)" value={newContactName} onChange={(e) => setNewContactName(e.target.value)} />
                <input type="text" className="apple-input" placeholder="Relation (Wife)" value={newContactRelation} onChange={(e) => setNewContactRelation(e.target.value)} />
                <input type="text" className="apple-input" placeholder="Phone (+1...)" value={newContactPhone} onChange={(e) => setNewContactPhone(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addContact()} />
                <button className="apple-btn" onClick={addContact}><Plus size={16} /> Add</button>
              </div>
            </div>
          </div>
        )}

      </main>

      <style>{`
        /* Premium Dashboard Apple Theme */
        .apple-dashboard-layout { min-height: 100vh; background-color: #f5f5f7; padding-bottom: 4rem; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
        
        .dash-header { background: rgba(255,255,255,0.8); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-bottom: 1px solid rgba(0,0,0,0.05); position: sticky; top: 0; z-index: 100; }
        .dash-header-inner { max-width: 1000px; margin: 0 auto; padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center; }
        .brand-badge { display: flex; align-items: center; gap: 0.5rem; font-weight: 800; font-size: 1.1rem; color: #1d1d1f; }
        .user-badge { width: 36px; height: 36px; border-radius: 50%; background: #0071e3; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1rem; }

        .dash-main { max-width: 1000px; margin: 0 auto; padding: 2rem 1.5rem; }
        
        .dash-alert { padding: 1rem 1.25rem; border-radius: 16px; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; font-weight: 600; font-size: 0.95rem; }
        .dash-alert.success { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
        .dash-alert.error { background: #ffe4e6; color: #9f1239; border: 1px solid #fecdd3; }

        .segmented-nav { display: flex; gap: 0.25rem; background: rgba(0,0,0,0.04); padding: 0.35rem; border-radius: 99px; margin-bottom: 2.5rem; overflow-x: auto; flex-wrap: nowrap; align-items: center; }
        .nav-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.4rem; padding: 0.75rem 1rem; border: none; background: transparent; border-radius: 99px; font-weight: 600; font-size: 0.85rem; color: #424245; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
        .nav-btn:hover { color: #1d1d1f; background: rgba(0,0,0,0.02); }
        .nav-btn.active { background: white; color: #1d1d1f; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
        .btn-save-master { margin-left: auto; background: #1d1d1f; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 99px; font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: transform 0.2s; white-space: nowrap; }
        .btn-save-master:active { transform: scale(0.95); }

        .dash-title { font-size: 2.2rem; font-weight: 800; letter-spacing: -0.03em; color: #1d1d1f; margin-bottom: 0.25rem; }
        .dash-subtitle { font-size: 1.1rem; color: #86868b; margin-bottom: 2.5rem; font-weight: 500; }
        .dash-title-small { font-size: 1.5rem; font-weight: 700; color: #1d1d1f; }

        .bento-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem; }
        .dash-card { background: white; border-radius: 24px; padding: 1.75rem; box-shadow: 0 4px 20px rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.02); }
        .full-width { grid-column: 1 / -1; }
        
        .readiness-card { grid-column: 1 / -1; display: flex; flex-direction: column; gap: 1rem; }
        .card-header { display: flex; justify-content: space-between; align-items: center; }
        .card-header h3 { font-size: 1.1rem; font-weight: 700; color: #1d1d1f; }
        .card-header .score { font-size: 2rem; font-weight: 800; }
        .progress-track { width: 100%; height: 10px; background: #f5f5f7; border-radius: 99px; overflow: hidden; }
        .progress-fill { height: 100%; border-radius: 99px; transition: width 0.8s ease; }
        .checklist { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; margin-top: 0.5rem; }
        .check-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: #86868b; font-weight: 600; }
        .check-item.done { color: #1d1d1f; }
        .check-item.done svg { color: #16a34a; }

        .status-card { display: flex; flex-direction: column; align-items: flex-start; justify-content: center; gap: 0.5rem; }
        .status-icon { width: 48px; height: 48px; background: #e0f2fe; color: #0071e3; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-bottom: 0.5rem; }
        .status-card h3 { font-size: 1.2rem; font-weight: 700; }
        .status-card p { font-size: 0.95rem; color: #86868b; line-height: 1.5; margin-bottom: 0.5rem; }
        .action-link { background: none; border: none; color: #0071e3; font-weight: 700; display: inline-flex; align-items: center; gap: 0.25rem; cursor: pointer; padding: 0; font-size: 0.95rem; }

        .quick-action { cursor: pointer; text-align: left; transition: transform 0.2s, box-shadow 0.2s; border: none; display: flex; flex-direction: column; align-items: flex-start; }
        .quick-action:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(0,0,0,0.06); }
        .qa-icon { margin-bottom: 1rem; }
        .quick-action h3 { font-size: 1.1rem; font-weight: 700; color: #1d1d1f; margin-bottom: 0.25rem; }
        .quick-action p { font-size: 0.9rem; color: #86868b; }

        .card-title { font-size: 1.25rem; font-weight: 800; color: #1d1d1f; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
        .card-desc { font-size: 0.95rem; color: #86868b; margin-bottom: 2rem; }
        .highlight-green { color: #16a34a; font-weight: 700; }

        .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem; }
        .input-group { display: flex; flex-direction: column; gap: 0.4rem; }
        .input-group label { font-size: 0.85rem; font-weight: 700; color: #424245; }
        .apple-input { background: #fbfbfd; border: 1px solid #e5e5ea; padding: 0.85rem 1rem; border-radius: 12px; font-size: 0.95rem; color: #1d1d1f; outline: none; transition: border-color 0.2s; font-family: inherit; }
        .apple-input:focus { border-color: #0071e3; box-shadow: 0 0 0 3px rgba(0,113,227,0.1); }
        
        .toggles-box { background: #fbfbfd; border: 1px solid #e5e5ea; padding: 1.25rem; border-radius: 16px; display: flex; gap: 2rem; flex-wrap: wrap; }
        .toggle-label { display: flex; align-items: center; gap: 0.75rem; font-weight: 600; font-size: 0.95rem; cursor: pointer; }
        .toggle-label input { width: 18px; height: 18px; accent-color: #0071e3; }
        .text-danger { color: #e11d48; }

        .mt-4 { margin-top: 1.5rem; }
        
        .item-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .data-row { background: #fbfbfd; border: 1px solid #e5e5ea; padding: 1rem 1.25rem; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
        .data-info { display: flex; align-items: center; gap: 1rem; }
        .data-info strong { font-size: 1rem; color: #1d1d1f; }
        .sub-text { font-size: 0.85rem; color: #86868b; font-weight: 500; }
        .data-actions { display: flex; align-items: center; gap: 1rem; }
        
        .badge { padding: 0.35rem 0.65rem; border-radius: 6px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
        .category-badge { background: #e5e5ea; color: #424245; }
        .visibility-badge.emergency { background: #fee2e2; color: #9f1239; }
        .visibility-badge.trusted { background: #e0f2fe; color: #0369a1; }
        .visibility-badge.private { background: #f3e8ff; color: #6b21a8; }
        
        .icon-btn { background: none; border: none; cursor: pointer; padding: 0.25rem; color: #86868b; transition: color 0.2s; }
        .icon-btn.danger:hover { color: #e11d48; }

        .add-row { display: grid; grid-template-columns: 140px 1fr 140px 100px; gap: 0.5rem; }
        .apple-btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem; padding: 0.85rem 1rem; border-radius: 12px; font-weight: 700; font-size: 0.95rem; cursor: pointer; border: none; background: #e5e5ea; color: #1d1d1f; transition: all 0.2s; }
        .apple-btn:hover { background: #d1d1d6; }
        .apple-btn.primary-btn { background: #0071e3; color: white; }
        .apple-btn.small { padding: 0.5rem 0.75rem; font-size: 0.85rem; border-radius: 8px; }
        .apple-btn.danger { background: #fee2e2; color: #9f1239; }
        
        .devices-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
        .device-card { display: flex; flex-direction: column; gap: 1.25rem; }
        .device-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .device-header h4 { font-size: 1.1rem; font-weight: 800; color: #1d1d1f; margin-bottom: 0.15rem; }
        .token-hash { font-family: monospace; font-size: 0.75rem; color: #86868b; background: #f5f5f7; padding: 0.2rem 0.4rem; border-radius: 4px; }
        .status-badge.active { background: #dcfce7; color: #166534; }
        .status-badge.frozen { background: #fef3c7; color: #92400e; }
        .status-badge.revoked { background: #f1f5f9; color: #475569; }
        
        .qr-container { background: #fbfbfd; padding: 1.5rem; border-radius: 16px; border: 1px solid #e5e5ea; display: flex; justify-content: center; }
        .test-link { display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.9rem; font-weight: 700; color: #0071e3; text-decoration: none; }
        .device-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; padding-top: 1rem; border-top: 1px solid #f5f5f7; }

        .empty-state-card { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 4rem 2rem; color: #86868b; }
        .empty-icon { opacity: 0.3; margin-bottom: 1rem; }

        .apple-spinner { width: 36px; height: 36px; border: 3px solid #e5e5ea; border-top-color: #0071e3; border-radius: 50%; animation: spin 1s linear infinite; }
        .apple-spinner-small { display: inline-block; width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .dash-main { padding: 1rem; }
          .bento-grid { grid-template-columns: 1fr; }
          .add-row { display: flex; flex-direction: column; gap: 0.75rem; }
          .add-row input, .add-row select, .add-row button { width: 100%; }
          .segmented-nav { flex-wrap: wrap; justify-content: space-between; border-radius: 16px; padding: 0.5rem; gap: 0.5rem; }
          .nav-btn { flex: 1 1 calc(50% - 0.5rem); padding: 0.6rem 0.5rem; font-size: 0.8rem; border-radius: 12px; }
          .btn-save-master { flex: 1 1 100%; margin-top: 0.5rem; padding: 1rem; font-size: 1rem; border-radius: 12px; }
          .form-grid { grid-template-columns: 1fr; }
          .toggles-box { flex-direction: column; gap: 1rem; }
          .data-row { flex-direction: column; align-items: flex-start; }
          .data-actions { width: 100%; justify-content: space-between; margin-top: 0.5rem; }
          .device-header { flex-direction: column; gap: 0.5rem; }
          .device-actions { flex-direction: column; }
          .device-actions button { width: 100%; }
        }
      `}</style>
    </div>
  );
}
