'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Shield, Plus, QrCode, Phone, RefreshCw, Snowflake, Ban, CheckCircle, Trash2, 
  ExternalLink, Lock, Eye, HeartPulse, Home, Activity, ChevronRight, ScanFace, Droplet,
  Settings, User
} from 'lucide-react';
import QRCode from 'react-qr-code';

type Tab = 'HOME' | 'PROFILE' | 'ITEMS' | 'DEVICES' | 'CONTACTS' | 'FAMILY' | 'STORE' | 'SETTINGS' | 'ACTIVITY';

type MedicalItem = { id?: string; category: string; name: string; description: string; severity: string; visibility: string; };
type Contact = { id?: string; name: string; relationship: string; phone: string; priority: number; notifyOnIncident: boolean; };
type Device = { id: string; token: string; label: string; status: string; deviceType: string; createdAt: string; };
type Profile = { bloodType?: string; dateOfBirth?: string; organDonor: boolean; dnrStatus: boolean; emergencyNotes?: string; readinessScore?: number; };

export default function MemberDashboard() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<Tab>('HOME');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab && ['HOME', 'PROFILE', 'ITEMS', 'DEVICES', 'CONTACTS', 'FAMILY', 'STORE', 'SETTINGS', 'ACTIVITY'].includes(tab)) {
      setActiveTab(tab as Tab);
    }
  }, []);

  const [profile, setProfile] = useState<Profile & { height?: string, weight?: string, insuranceInfo?: string }>({ bloodType: '', dateOfBirth: '', organDonor: false, dnrStatus: false, emergencyNotes: '', readinessScore: 0, height: '', weight: '', insuranceInfo: '' });
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
      <main className="dash-container">
        {/* Sleek Sidebar Navigation for Desktop */}
        <aside className="dash-sidebar">
          <div className="sidebar-header">
            <Shield size={24} color="#0071e3" />
            <span className="brand-text">MedNira</span>
          </div>
          
          <div className="nav-group-label">General</div>
          <nav className="sidebar-nav">
            {([
              { key: 'HOME', label: 'Overview', icon: Home },
              { key: 'ACTIVITY', label: 'Activity Log', icon: Activity },
              { key: 'FAMILY', label: 'Family Access', icon: User },
              { key: 'STORE', label: 'Card Store', icon: Droplet },
            ] as const).map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => { setActiveTab(key); window.history.pushState(null, '', `?tab=${key}`); }} className={`side-nav-btn ${activeTab === key ? 'active' : ''}`}>
                <Icon size={18} className="nav-icon" /> <span>{label}</span>
              </button>
            ))}
          </nav>

          <div className="nav-group-label">Medical Data</div>
          <nav className="sidebar-nav">
            {([
              { key: 'PROFILE', label: 'Clinical Vitals', icon: HeartPulse },
              { key: 'ITEMS', label: 'Medical Items', icon: Shield },
              { key: 'DEVICES', label: 'Emergency IDs', icon: QrCode },
              { key: 'CONTACTS', label: 'Contacts', icon: Phone },
            ] as const).map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => { setActiveTab(key); window.history.pushState(null, '', `?tab=${key}`); }} className={`side-nav-btn ${activeTab === key ? 'active' : ''}`}>
                <Icon size={18} className="nav-icon" /> <span>{label}</span>
                {['ITEMS', 'DEVICES', 'CONTACTS'].includes(key) && (
                  <span className="nav-count">
                    {key === 'ITEMS' ? items.length : key === 'DEVICES' ? devices.length : contacts.length}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="nav-group-label" style={{ marginTop: 'auto' }}>Account</div>
          <nav className="sidebar-nav">
             <button onClick={() => { setActiveTab('SETTINGS'); window.history.pushState(null, '', `?tab=SETTINGS`); }} className={`side-nav-btn ${activeTab === 'SETTINGS' ? 'active' : ''}`}>
                <Settings size={18} className="nav-icon" /> <span>Settings</span>
             </button>
          </nav>
        </aside>

        <section className="dash-main-content">
          <header className="mobile-header">
            <Shield size={24} color="#0071e3" />
            <span className="brand-text">MedNira</span>
            <div className="user-badge" style={{ marginLeft: 'auto' }}>{userName.charAt(0)}</div>
          </header>

          <div className="content-scroll-area">
            {/* Action Bar */}
            <div className="top-action-bar">
               <h1 className="page-heading">
                 {activeTab === 'HOME' ? `Welcome, ${userName}` :
                  activeTab === 'PROFILE' ? 'Clinical Profile' :
                  activeTab === 'ITEMS' ? 'Medical Items' :
                  activeTab === 'DEVICES' ? 'Emergency Devices' :
                  activeTab === 'CONTACTS' ? 'Emergency Contacts' :
                  activeTab === 'ACTIVITY' ? 'System Activity' :
                  activeTab === 'FAMILY' ? 'Family Access' :
                  activeTab === 'STORE' ? 'Store & Subscriptions' : 'Settings'}
               </h1>
               
               {['PROFILE', 'ITEMS', 'CONTACTS'].includes(activeTab) && (
                 <button onClick={handleSaveProfile} disabled={loading} className="btn-save-master glass-btn">
                   {loading ? <span className="apple-spinner-small" /> : 'Save Changes'}
                 </button>
               )}
            </div>

            {/* Alerts */}
            {message && (
              <div className={`dash-alert fade-in-up ${message.type}`}>
                {message.type === 'success' ? <CheckCircle size={18} /> : <Ban size={18} />} {message.text}
              </div>
            )}



        {/* ── OVERVIEW TAB (HOME) ─────────────────────────────────── */}
        {activeTab === 'HOME' && (
          <div className="fade-in-up delay-1">
            <p className="dash-subtitle">Your Emergency Health Identity is active and monitoring.</p>

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
                <div className="input-group">
                  <label>Height</label>
                  <input type="text" className="apple-input" placeholder="e.g. 5'9'' or 175cm" value={profile.height || ''} onChange={(e) => setProfile({ ...profile, height: e.target.value })} />
                </div>
                <div className="input-group">
                  <label>Weight</label>
                  <input type="text" className="apple-input" placeholder="e.g. 70kg or 154lbs" value={profile.weight || ''} onChange={(e) => setProfile({ ...profile, weight: e.target.value })} />
                </div>
              </div>

              <div className="input-group mt-4 mb-4">
                <label>Health Insurance Provider & Policy No (Optional)</label>
                <input type="text" className="apple-input" placeholder="e.g. BlueCross BlueShield - Policy #12345678" value={profile.insuranceInfo || ''} onChange={(e) => setProfile({ ...profile, insuranceInfo: e.target.value })} />
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

        {/* ── NEW TABS MOCKS ─────────────────────────────── */}
        {activeTab === 'ACTIVITY' && (
          <div className="fade-in-up delay-1">
            <div className="dash-card full-width">
              <h2 className="card-title"><Activity size={20} color="#0071e3"/> System Activity & Scan History</h2>
              <p className="card-desc">Log of all access events and emergency dispatches for your devices.</p>
              <div className="item-list">
                <div className="empty-state">No recent activity detected. Your devices are secure.</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'FAMILY' && (
          <div className="fade-in-up delay-1">
            <div className="dash-card full-width">
              <h2 className="card-title"><User size={20} color="#16a34a"/> Family Master Access</h2>
              <p className="card-desc">Manage profiles for your children or dependents under one master account.</p>
              <div className="empty-state-card" style={{ padding: '2rem' }}>
                <Shield size={40} className="empty-icon" />
                <h3 style={{ marginBottom: '0.5rem', color: '#1d1d1f' }}>Family Plan Needed</h3>
                <p>Upgrade to a Family Plan to add up to 5 dependents and manage their IDs from this dashboard.</p>
                <button className="apple-btn primary-btn mt-4" onClick={() => setActiveTab('STORE')}>View Plans</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'STORE' && (
          <div className="fade-in-up delay-1">
            <div className="dash-card full-width">
              <h2 className="card-title"><QrCode size={20} color="#8b5cf6"/> Subscription & Physical Cards</h2>
              <p className="card-desc">Order physical NFC tags, wallet cards, or upgrade your plan.</p>
              
              <div className="bento-grid mt-4">
                <div className="dash-card" style={{ border: '2px solid #0071e3' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Basic Digital (Current)</h3>
                  <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>$0 <span style={{ fontSize: '0.9rem', fontWeight: 400 }}>/ month</span></p>
                  <ul className="checklist mt-4" style={{ gridTemplateColumns: '1fr' }}>
                    <li className="check-item done"><CheckCircle size={14}/> 1 Digital QR Profile</li>
                    <li className="check-item done"><CheckCircle size={14}/> Standard Contacts</li>
                  </ul>
                </div>
                <div className="dash-card">
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Pro Premium</h3>
                  <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>$4.99 <span style={{ fontSize: '0.9rem', fontWeight: 400 }}>/ month</span></p>
                  <ul className="checklist mt-4" style={{ gridTemplateColumns: '1fr' }}>
                    <li className="check-item done"><CheckCircle size={14}/> Unlimited Devices & NFC Tags</li>
                    <li className="check-item done"><CheckCircle size={14}/> Global SMS & Phone Alerts</li>
                    <li className="check-item done"><CheckCircle size={14}/> Physical Metal Card Included</li>
                  </ul>
                  <button className="apple-btn primary-btn mt-4" style={{ width: '100%' }}>Upgrade Now</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'SETTINGS' && (
          <div className="fade-in-up delay-1">
            <div className="dash-card full-width">
              <h2 className="card-title"><Settings size={20} color="#475569"/> Account Settings</h2>
              <p className="card-desc">Manage your email, password, and security preferences.</p>
              
              <div className="form-grid">
                <div className="input-group">
                  <label>Email Address</label>
                  <input type="email" className="apple-input" value={session?.user?.email || ''} disabled />
                </div>
                <div className="input-group">
                  <label>Full Name</label>
                  <input type="text" className="apple-input" value={session?.user?.name || ''} disabled />
                </div>
              </div>
              <button className="apple-btn mt-4">Change Password</button>
            </div>
          </div>
        )}

          </div>
        </section>
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
          </div>
        </section>
      </main>

      {/* Mobile Bottom Tab Bar */}
      <nav className="mobile-bottom-nav">
        {([
          { key: 'HOME', icon: Home },
          { key: 'PROFILE', icon: HeartPulse },
          { key: 'DEVICES', icon: QrCode },
          { key: 'STORE', icon: Droplet },
          { key: 'SETTINGS', icon: Settings },
        ] as const).map(({ key, icon: Icon }) => (
          <button key={key} onClick={() => { setActiveTab(key); window.history.pushState(null, '', `?tab=${key}`); }} className={`bottom-nav-btn ${activeTab === key ? 'active' : ''}`}>
            <Icon size={22} className="nav-icon" />
          </button>
        ))}
      </nav>

      <style>{`
        /* Premium Dashboard Apple Theme */
        .apple-dashboard-layout { min-height: 100vh; background-color: #f5f5f7; font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; overflow: hidden; }
        
        .dash-container { display: flex; height: 100vh; max-width: 1400px; margin: 0 auto; background: #ffffff; }
        
        /* Sidebar Styling */
        .dash-sidebar { width: 280px; background: rgba(251, 251, 253, 0.8); backdrop-filter: blur(40px); -webkit-backdrop-filter: blur(40px); border-right: 1px solid rgba(0,0,0,0.06); display: flex; flex-direction: column; padding: 2rem 1rem; flex-shrink: 0; }
        .sidebar-header { display: flex; align-items: center; gap: 0.75rem; padding: 0 1rem 2.5rem 1rem; }
        .brand-text { font-size: 1.35rem; font-weight: 800; color: #1d1d1f; letter-spacing: -0.03em; }
        
        .nav-group-label { font-size: 0.75rem; font-weight: 700; color: #86868b; text-transform: uppercase; letter-spacing: 0.05em; padding: 0 1rem; margin-bottom: 0.5rem; margin-top: 1.5rem; }
        .sidebar-nav { display: flex; flex-direction: column; gap: 0.25rem; }
        
        .side-nav-btn { display: flex; align-items: center; gap: 0.75rem; width: 100%; padding: 0.75rem 1rem; border: none; background: transparent; border-radius: 12px; font-size: 0.95rem; font-weight: 600; color: #424245; cursor: pointer; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); text-align: left; }
        .side-nav-btn:hover { background: rgba(0,0,0,0.03); color: #1d1d1f; }
        .side-nav-btn.active { background: #1d1d1f; color: #ffffff; box-shadow: 0 4px 14px rgba(0,0,0,0.1); }
        .side-nav-btn.active .nav-icon { color: #ffffff; }
        .nav-icon { color: #86868b; transition: color 0.2s; }
        .side-nav-btn:hover .nav-icon { color: #1d1d1f; }
        
        .nav-count { margin-left: auto; background: rgba(0,0,0,0.06); padding: 0.15rem 0.5rem; border-radius: 99px; font-size: 0.75rem; font-weight: 700; }
        .side-nav-btn.active .nav-count { background: rgba(255,255,255,0.2); color: #fff; }

        /* Main Content Styling */
        .dash-main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; background: #fbfbfd; }
        .content-scroll-area { flex: 1; overflow-y: auto; padding: 3rem; }
        
        .mobile-header { display: none; align-items: center; gap: 0.5rem; padding: 1rem 1.5rem; background: rgba(255,255,255,0.9); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(0,0,0,0.05); position: sticky; top: 0; z-index: 50; }
        .user-badge { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #0071e3, #4facfe); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; }
        .mobile-bottom-nav { display: none; }

        .top-action-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; }
        .page-heading { font-size: 2.5rem; font-weight: 800; letter-spacing: -0.04em; color: #1d1d1f; }
        .dash-subtitle { font-size: 1.1rem; color: #86868b; font-weight: 500; margin-top: -2rem; margin-bottom: 2.5rem; }

        .btn-save-master.glass-btn { background: rgba(0, 113, 227, 0.1); color: #0071e3; border: 1px solid rgba(0,113,227,0.2); padding: 0.75rem 1.5rem; border-radius: 99px; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: 0 4px 15px rgba(0,113,227,0.05); }
        .btn-save-master.glass-btn:hover { background: #0071e3; color: white; transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,113,227,0.25); }
        .btn-save-master.glass-btn:active { transform: scale(0.96); }

        .dash-alert { padding: 1rem 1.25rem; border-radius: 16px; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; font-weight: 600; font-size: 0.95rem; animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        .dash-alert.success { background: rgba(22, 163, 74, 0.1); color: #166534; border: 1px solid rgba(22, 163, 74, 0.2); }
        .dash-alert.error { background: rgba(225, 29, 72, 0.1); color: #9f1239; border: 1px solid rgba(225, 29, 72, 0.2); }

        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

        .bento-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
        .dash-card { background: white; border-radius: 24px; padding: 2rem; box-shadow: 0 10px 40px rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.04); transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .dash-card:hover { box-shadow: 0 15px 50px rgba(0,0,0,0.06); }
        .full-width { grid-column: 1 / -1; }
        
        .readiness-card { grid-column: 1 / -1; display: flex; flex-direction: column; gap: 1rem; background: linear-gradient(145deg, #ffffff, #fbfbfd); }
        .card-header { display: flex; justify-content: space-between; align-items: center; }
        .card-header h3 { font-size: 1.2rem; font-weight: 800; color: #1d1d1f; letter-spacing: -0.02em; }
        .card-header .score { font-size: 2.5rem; font-weight: 900; letter-spacing: -0.03em; }
        .progress-track { width: 100%; height: 12px; background: #f0f0f5; border-radius: 99px; overflow: hidden; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); }
        .progress-fill { height: 100%; border-radius: 99px; transition: width 1s cubic-bezier(0.16, 1, 0.3, 1); background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%); }
        .checklist { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-top: 1rem; }
        .check-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; color: #86868b; font-weight: 600; }
        .check-item.done { color: #1d1d1f; }
        .check-item.done svg { color: #16a34a; filter: drop-shadow(0 2px 4px rgba(22,163,74,0.3)); }

        .status-card { display: flex; flex-direction: column; align-items: flex-start; justify-content: center; gap: 0.75rem; }
        .status-icon { width: 56px; height: 56px; background: linear-gradient(135deg, #e0f2fe, #bae6fd); color: #0071e3; border-radius: 18px; display: flex; align-items: center; justify-content: center; margin-bottom: 0.5rem; box-shadow: 0 8px 20px rgba(0,113,227,0.15); }
        .status-card h3 { font-size: 1.3rem; font-weight: 800; letter-spacing: -0.02em; }
        .status-card p { font-size: 0.95rem; color: #86868b; line-height: 1.6; margin-bottom: 0.5rem; }
        .action-link { background: none; border: none; color: #0071e3; font-weight: 700; display: inline-flex; align-items: center; gap: 0.25rem; cursor: pointer; padding: 0; font-size: 0.95rem; transition: gap 0.2s; }
        .action-link:hover { gap: 0.5rem; }

        .quick-action { cursor: pointer; text-align: left; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); border: 1px solid rgba(0,0,0,0.04); display: flex; flex-direction: column; align-items: flex-start; background: #ffffff; }
        .quick-action:hover { transform: translateY(-4px); box-shadow: 0 15px 40px rgba(0,0,0,0.06); border-color: rgba(0,0,0,0.08); }
        .qa-icon { margin-bottom: 1.25rem; background: #f5f5f7; padding: 0.75rem; border-radius: 14px; }
        .quick-action h3 { font-size: 1.2rem; font-weight: 800; color: #1d1d1f; margin-bottom: 0.4rem; letter-spacing: -0.02em; }
        .quick-action p { font-size: 0.95rem; color: #86868b; line-height: 1.5; }

        .card-title { font-size: 1.35rem; font-weight: 800; color: #1d1d1f; display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem; letter-spacing: -0.02em; }
        .card-desc { font-size: 1rem; color: #86868b; margin-bottom: 2.5rem; line-height: 1.5; }
        .highlight-green { color: #16a34a; font-weight: 700; background: rgba(22,163,74,0.1); padding: 0.2rem 0.6rem; border-radius: 6px; }

        .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.75rem; margin-bottom: 2rem; }
        .input-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .input-group label { font-size: 0.85rem; font-weight: 700; color: #424245; text-transform: uppercase; letter-spacing: 0.05em; }
        .apple-input { background: #fbfbfd; border: 1.5px solid #e5e5ea; padding: 1rem 1.25rem; border-radius: 14px; font-size: 1rem; color: #1d1d1f; outline: none; transition: all 0.2s ease; font-family: inherit; font-weight: 500; }
        .apple-input:focus { border-color: #0071e3; background: #ffffff; box-shadow: 0 0 0 4px rgba(0,113,227,0.15); }
        
        .toggles-box { background: #fbfbfd; border: 1.5px solid #e5e5ea; padding: 1.5rem; border-radius: 20px; display: flex; gap: 3rem; flex-wrap: wrap; }
        .toggle-label { display: flex; align-items: center; gap: 0.75rem; font-weight: 700; font-size: 1rem; cursor: pointer; color: #1d1d1f; }
        .toggle-label input { width: 22px; height: 22px; accent-color: #0071e3; cursor: pointer; }
        .text-danger { color: #e11d48; }

        .mt-4 { margin-top: 2rem; }
        .mb-4 { margin-bottom: 2rem; }
        
        .item-list { display: flex; flex-direction: column; gap: 1rem; }
        .data-row { background: #ffffff; border: 1.5px solid #f0f0f5; padding: 1.25rem 1.5rem; border-radius: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; transition: all 0.2s ease; }
        .data-row:hover { border-color: #d1d1d6; transform: translateX(4px); box-shadow: 0 4px 15px rgba(0,0,0,0.03); }
        .data-info { display: flex; align-items: center; gap: 1.25rem; }
        .data-info strong { font-size: 1.1rem; color: #1d1d1f; font-weight: 700; }
        .sub-text { font-size: 0.95rem; color: #86868b; font-weight: 500; }
        .data-actions { display: flex; align-items: center; gap: 1rem; }
        
        .badge { padding: 0.4rem 0.75rem; border-radius: 8px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
        .category-badge { background: #f5f5f7; color: #424245; }
        .visibility-badge.emergency { background: #fee2e2; color: #9f1239; }
        .visibility-badge.trusted { background: #e0f2fe; color: #0369a1; }
        .visibility-badge.private { background: #f3e8ff; color: #6b21a8; }
        
        .icon-btn { background: rgba(0,0,0,0.03); border: none; cursor: pointer; padding: 0.5rem; border-radius: 50%; color: #86868b; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
        .icon-btn.danger:hover { color: #ffffff; background: #e11d48; transform: scale(1.1); }

        .add-row { display: grid; grid-template-columns: 160px 1fr 160px 120px; gap: 1rem; background: #fbfbfd; padding: 1.25rem; border-radius: 20px; border: 1.5px dashed #d1d1d6; }
        .apple-btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 1rem 1.25rem; border-radius: 14px; font-weight: 800; font-size: 0.95rem; cursor: pointer; border: none; background: #e5e5ea; color: #1d1d1f; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); letter-spacing: -0.01em; }
        .apple-btn:hover { background: #d1d1d6; transform: scale(0.98); }
        .apple-btn:active { transform: scale(0.95); }
        .apple-btn.primary-btn { background: linear-gradient(135deg, #0071e3, #4facfe); color: white; box-shadow: 0 8px 20px rgba(0,113,227,0.25); }
        .apple-btn.primary-btn:hover { box-shadow: 0 10px 25px rgba(0,113,227,0.35); }
        .apple-btn.small { padding: 0.6rem 1rem; font-size: 0.85rem; border-radius: 10px; }
        .apple-btn.danger { background: #fee2e2; color: #9f1239; }
        .apple-btn.danger:hover { background: #fecdd3; }
        
        .devices-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 2rem; }
        .device-card { display: flex; flex-direction: column; gap: 1.5rem; background: #ffffff; padding: 2rem; }
        .device-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .device-header h4 { font-size: 1.2rem; font-weight: 800; color: #1d1d1f; margin-bottom: 0.35rem; letter-spacing: -0.02em; }
        .token-hash { font-family: "SF Mono", Consolas, monospace; font-size: 0.85rem; color: #86868b; background: #f5f5f7; padding: 0.3rem 0.6rem; border-radius: 6px; font-weight: 600; }
        .status-badge.active { background: #dcfce7; color: #166534; box-shadow: 0 2px 10px rgba(22,163,74,0.1); }
        .status-badge.frozen { background: #fef3c7; color: #92400e; }
        .status-badge.revoked { background: #f1f5f9; color: #475569; }
        
        .qr-container { background: #fbfbfd; padding: 2rem; border-radius: 20px; border: 1.5px solid #f0f0f5; display: flex; justify-content: center; box-shadow: inset 0 2px 10px rgba(0,0,0,0.02); }
        .test-link { display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; font-size: 0.95rem; font-weight: 700; color: #0071e3; text-decoration: none; padding: 0.75rem; background: rgba(0,113,227,0.05); border-radius: 12px; transition: all 0.2s; }
        .test-link:hover { background: rgba(0,113,227,0.1); }
        .device-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; padding-top: 1.5rem; border-top: 1.5px solid #f0f0f5; }

        .empty-state-card { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 5rem 2rem; color: #86868b; background: #fbfbfd; border: 1.5px dashed #d1d1d6; border-radius: 24px; }
        .empty-icon { opacity: 0.4; margin-bottom: 1.5rem; color: #1d1d1f; }
        .empty-state-card p { font-size: 1.05rem; line-height: 1.6; max-width: 400px; margin: 0 auto; }

        .apple-spinner { width: 40px; height: 40px; border: 3px solid #e5e5ea; border-top-color: #0071e3; border-radius: 50%; animation: spin 1s linear infinite; }
        .apple-spinner-small { display: inline-block; width: 18px; height: 18px; border: 2.5px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 1024px) {
          .dash-sidebar { width: 240px; }
          .bento-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 768px) {
          .dash-container { flex-direction: column; height: 100vh; overflow: hidden; }
          .dash-sidebar { display: none; }
          .mobile-header { display: flex; }
          .content-scroll-area { padding: 1.5rem 1rem 6rem 1rem; }
          .page-heading { font-size: 2rem; }
          .top-action-bar { flex-direction: column; align-items: flex-start; gap: 1rem; margin-bottom: 1.5rem; }
          .btn-save-master.glass-btn { width: 100%; text-align: center; }

          .add-row { display: flex; flex-direction: column; gap: 0.75rem; padding: 1rem; }
          .add-row input, .add-row select, .add-row button { width: 100%; }
          .form-grid { grid-template-columns: 1fr; gap: 1rem; }
          .toggles-box { flex-direction: column; gap: 1.25rem; padding: 1.25rem; }
          .data-row { flex-direction: column; align-items: flex-start; padding: 1rem; }
          .data-actions { width: 100%; justify-content: space-between; margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid #f0f0f5; }
          .device-header { flex-direction: column; gap: 0.75rem; }
          .device-actions { flex-direction: column; }
          .device-actions button { width: 100%; }
          .dash-card { padding: 1.25rem; border-radius: 20px; }
          .devices-grid { grid-template-columns: 1fr; }

          /* Bottom Nav */
          .mobile-bottom-nav { display: flex; position: fixed; bottom: 0; left: 0; right: 0; background: rgba(251, 251, 253, 0.9); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-top: 1px solid rgba(0,0,0,0.08); padding: 0.75rem 1rem; padding-bottom: calc(0.75rem + env(safe-area-inset-bottom)); justify-content: space-around; z-index: 100; }
          .bottom-nav-btn { background: none; border: none; padding: 0.5rem; color: #86868b; display: flex; flex-direction: column; align-items: center; gap: 0.2rem; cursor: pointer; transition: color 0.2s; }
          .bottom-nav-btn.active { color: #0071e3; }
        }
      `}</style>
    </div>
  );
}
