'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  Shield, QrCode, PhoneCall, HeartPulse, ChevronRight, 
  Activity, ArrowRight, Nfc, UserPlus, Smartphone, Siren,
  Users, Building2, Stethoscope, CheckCircle2, ScanFace, Droplet, 
  RotateCcw
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Home() {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);

  return (
    <div className="apple-landing">
      {/* Dynamic Full-Screen Hero Section */}
      <section className="apple-hero-creative">
        <div className="ambient-bg">
          <div className="ambient-blob blob-1"></div>
          <div className="ambient-blob blob-2"></div>
          <div className="ambient-blob blob-3"></div>
        </div>

        <div className="hero-content">
          <h1 className="apple-title-massive fade-in-up">
            Your Medical ID<br />
            <span className="text-gradient">Always with you.</span>
          </h1>
          
          <p className="apple-subtitle-large fade-in-up delay-1">
            Life-saving data, severe allergies, and emergency contacts instantly accessible to first responders. Just a tap away. No app required.
          </p>
          
          <div className="apple-cta-group fade-in-up delay-2">
            {mounted && session ? (
               <Link href="/dashboard" className="apple-btn-large apple-btn-primary">
                Go to Dashboard <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link href="/auth/register" className="apple-btn-large apple-btn-primary">
                  Create your ID <ArrowRight size={18} />
                </Link>
                <Link href="/auth/login" className="apple-link-large">
                  Sign in <ChevronRight size={18} />
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Floating Abstract UI Elements - Enlarged and responsive */}
        <div className="floating-ui-wrapper fade-in-up delay-3">
          <div className="floating-ui-container">
            <div className="floating-card float-left touch-interactive">
               <div className="float-header"><HeartPulse size={18} color="#e11d48"/> Vitals</div>
               <div className="float-body">
                  <div className="float-line" style={{ width: '80%' }}></div>
                  <div className="float-line" style={{ width: '60%' }}></div>
                  <div className="float-line" style={{ width: '90%' }}></div>
               </div>
            </div>
            
            <div className="hero-scanner-mockup touch-interactive">
              <div className="scanner-lens"></div>
              <div className="scan-icons-container">
                <QrCode className="scan-icon qr-icon" size={80} color="#0071e3" />
                <Nfc className="scan-icon nfc-icon" size={80} color="#16a34a" />
              </div>
              <div className="scanner-line"></div>
              <div className="nfc-waves">
                 <span></span><span></span><span></span>
              </div>
            </div>
            
            <div className="floating-card float-right touch-interactive">
               <div className="float-header"><Shield size={18} color="#16a34a"/> Secured</div>
               <div className="float-body">
                  <div className="float-line" style={{ width: '70%' }}></div>
                  <div className="float-line" style={{ width: '90%' }}></div>
                  <div className="float-line" style={{ width: '50%' }}></div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* ID Card Design Showcase - Portrait Ratio (2.2:3.4) with Flip */}
      <section className="id-showcase-section">
        <div className="section-header fade-in-up">
          <h2 className="section-title">One ID. Universal Access.</h2>
          <p className="section-subtitle">A stunning, secure profile accessible instantly by paramedics. Keep it on your phone or print it.</p>
        </div>

        <div className="id-card-wrapper fade-in-up">
          <div className="id-card-glow-bg"></div>

          {/* UX Hint indicating flip capability */}
          <div className="flip-hint-badge fade-in-up delay-2">
            <RotateCcw size={16} />
            <span>Hover or Tap to flip</span>
          </div>

          {/* 3D Flip Container */}
          <div className="flip-card touch-interactive">
            <div className="flip-card-inner">
              
              {/* FRONT OF CARD */}
              <div className="flip-card-front digital-id-card">
                <div className="hologram-overlay"></div>
                <div className="id-card-header">
                   <div className="id-brand">
                     <Shield size={20} color="#ffffff" fill="rgba(255,255,255,0.2)" />
                     <span>MedNira</span>
                   </div>
                   <Nfc size={20} color="#0071e3" style={{ filter: 'drop-shadow(0 0 8px rgba(0,113,227,0.8))' }} />
                </div>
                
                <div className="id-card-body">
                  <div className="id-profile-info text-center">
                    <span className="id-label">EMERGENCY MEDICAL ID</span>
                    <h3 className="id-name">Alexander Johnson</h3>
                    <div className="id-dob">DOB: 12 Aug 1990</div>
                  </div>
                  
                  <div className="id-qr-box">
                    <QrCode size={110} color="#1d1d1f" strokeWidth={1.5} />
                  </div>

                  <div className="id-metrics-grid">
                     <div className="metric-panel blood-panel">
                       <Droplet size={16} color="#e11d48"/>
                       <div>
                         <span className="m-label">BLOOD</span>
                         <span className="m-val">O- Pos</span>
                       </div>
                     </div>
                     <div className="metric-panel alert-panel">
                       <HeartPulse size={16} color="#d97706"/>
                       <div>
                         <span className="m-label">ALLERGY</span>
                         <span className="m-val">Penicillin</span>
                       </div>
                     </div>
                  </div>
                </div>
                
                <div className="id-card-footer">
                  <div className="barcode-mock">
                    <span></span><span></span><span></span><span></span><span></span>
                    <span></span><span></span><span></span><span></span><span></span>
                  </div>
                  <div className="footer-scan-text">
                    <ScanFace size={14} /> SCAN TO RESCUE
                  </div>
                </div>
              </div>

              {/* BACK OF CARD - CLEAN & MINIMALIST */}
              <div className="flip-card-back digital-id-card">
                <div className="id-card-header" style={{ background: '#0071e3', borderBottom: 'none' }}>
                   <div className="id-brand" style={{ color: 'white' }}>
                     <Activity size={20} color="white" />
                     <span>Clinical Record</span>
                   </div>
                </div>
                
                <div className="id-card-body back-body">
                  <div className="clean-back-section">
                    <div className="clean-label">PRIMARY EMERGENCY CONTACT</div>
                    <div className="clean-value">Sarah Johnson <span style={{ opacity: 0.6, fontSize: '0.85em' }}>(Wife)</span></div>
                    <div className="clean-value-sub">+1 (555) 019-8472</div>
                  </div>
                  
                  <div className="clean-line-divider"></div>

                  <div className="clean-back-section">
                    <div className="clean-label">PRE-EXISTING CONDITIONS</div>
                    <div className="clean-value text-danger">Type 1 Diabetes</div>
                  </div>

                  <div className="clean-back-section">
                    <div className="clean-label">CURRENT MEDICATIONS</div>
                    <div className="clean-value">Insulin (Novolog)</div>
                  </div>
                </div>

                <div className="id-card-footer" style={{ background: 'rgba(255,255,255,0.05)', justifyContent: 'center' }}>
                  <div className="footer-scan-text" style={{ color: '#86868b' }}>
                    MEDNIRA.COM / VERIFY
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Ultra-Wide Bento Grid Features */}
      <section id="features" className="apple-features-wide">
        <div className="section-header fade-in-up">
          <h2 className="section-title">
            Built for emergencies.<br />Designed for privacy.
          </h2>
        </div>

        <div className="bento-grid-wide">
          <div className="bento-card-wide bento-row fade-in-up" style={{ background: '#f5f5f7' }}>
             <div className="bento-icon-large" style={{ background: 'white' }}>
                <div className="mini-scanner-mockup">
                  <div className="scan-icons-container" style={{ width: '40px', height: '40px' }}>
                    <QrCode className="scan-icon qr-icon" size={40} color="#0071e3" />
                    <Nfc className="scan-icon nfc-icon" size={40} color="#16a34a" />
                  </div>
                  <div className="scanner-line"></div>
                </div>
             </div>
             <div className="bento-content-wide">
               <h3>Scan to Save</h3>
               <p>
                 A single QR code or NFC tap is all it takes to retrieve your emergency profile instantly. First responders get exactly what they need, when they need it, with zero friction. No app downloads required for responders.
               </p>
             </div>
          </div>
          
          <div className="bento-grid-cols">
            <div className="bento-card-wide fade-in-up touch-interactive" style={{ background: '#ffffff', textAlign: 'center' }}>
               <div className="bento-icon-medium" style={{ background: '#ffe4e6', color: '#e11d48' }}>
                 <HeartPulse size={36} />
               </div>
               <h3>Instant Vitals</h3>
               <p>Blood type, severe allergies, and pre-existing conditions displayed in milliseconds.</p>
            </div>
            
            <div className="bento-card-wide fade-in-up touch-interactive" style={{ background: '#ffffff', textAlign: 'center' }}>
               <div className="bento-icon-medium" style={{ background: '#dcfce7', color: '#16a34a' }}>
                 <PhoneCall size={36} />
               </div>
               <h3>Family Alerts</h3>
               <p>Emergency contacts are instantly notified via SMS with your exact GPS location.</p>
            </div>

            <div className="bento-card-wide fade-in-up touch-interactive" style={{ background: '#1d1d1f', color: 'white', textAlign: 'center' }}>
               <div className="bento-icon-medium" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>
                 <Shield size={36} strokeWidth={1.5} />
               </div>
               <h3 style={{ color: 'white' }}>Total Control</h3>
               <p style={{ color: '#a1a1a6' }}>Field-level visibility controls. You decide what stays private and what is shared.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="apple-about-section">
        <div className="about-container">
          <div className="about-content fade-in-up">
            <h2 className="section-title">The MedNira Mission</h2>
            <p className="about-text">
              In an emergency, every second counts. Too often, first responders arrive on the scene without knowing a patient's critical health history, severe allergies, or emergency contacts. We built MedNira to bridge that gap. 
            </p>
            <p className="about-text">
              By combining secure cloud architecture with universal NFC and QR technology, we ensure that your vital medical identity is always speaking for you, even when you can't.
            </p>
          </div>
          <div className="about-visual fade-in-up delay-1">
            <div className="about-badge">
              <Shield size={48} color="#0071e3" strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </section>

      {/* Clearer UX How it Works Section */}
      <section id="how-it-works" className="clear-how-it-works">
        <div className="section-header fade-in-up">
          <h2 className="section-title">How MedNira Works</h2>
          <p className="section-subtitle">Three clear steps to secure your medical identity.</p>
        </div>

        <div className="process-grid">
          <div className="process-card fade-in-up touch-interactive">
             <div className="process-icon-wrapper blue-glow">
               <UserPlus size={36} color="#0071e3" />
               <div className="process-number">1</div>
             </div>
             <h3>Create Profile</h3>
             <p>Fill out your medical history, allergies, and emergency contacts in our highly secure vault.</p>
          </div>

          <div className="process-card fade-in-up delay-1 touch-interactive">
             <div className="process-icon-wrapper purple-glow">
               <Smartphone size={36} color="#8b5cf6" />
               <div className="process-number">2</div>
             </div>
             <h3>Get Your ID</h3>
             <p>Receive your unique QR/NFC digital card. Keep it on your phone's lock screen or in your wallet.</p>
          </div>

          <div className="process-card fade-in-up delay-2 touch-interactive">
             <div className="process-icon-wrapper red-glow">
               <Siren size={36} color="#e11d48" />
               <div className="process-number">3</div>
             </div>
             <h3>Instant Rescue</h3>
             <p>Paramedics scan your code to view vitals instantly, while your family gets a GPS-pinned SMS alert.</p>
          </div>
        </div>
      </section>

      {/* Solutions / Ecosystem Section */}
      <section id="security" className="apple-solutions">
        <div className="section-header fade-in-up">
          <h2 className="section-title">Built for Everyone.</h2>
          <p className="section-subtitle">MedNira scales from individual protection to massive organizational safety.</p>
        </div>

        <div className="solutions-grid">
          <div className="solution-card fade-in-up touch-interactive">
            <div className="solution-icon"><Users size={32} /></div>
            <h3>Family Protection</h3>
            <p>Manage profiles for your children or elderly parents from a single master account.</p>
            <Link href="/auth/register" className="solution-link">Setup Family Plan <ChevronRight size={16}/></Link>
          </div>

          <div className="solution-card fade-in-up delay-1 touch-interactive">
            <div className="solution-icon" style={{ color: '#0071e3', background: '#e0f2fe' }}><Stethoscope size={32} /></div>
            <h3>Hospitals & Doctors</h3>
            <p>First responders and ER doctors get instant access to patient medical histories.</p>
            <Link href="#" className="solution-link">View Clinical API <ChevronRight size={16}/></Link>
          </div>

          <div className="solution-card fade-in-up delay-2 touch-interactive">
            <div className="solution-icon" style={{ color: '#16a34a', background: '#dcfce7' }}><Building2 size={32} /></div>
            <h3>Enterprise & Schools</h3>
            <p>Deploy MedNira IDs across your entire workforce or student body for safety.</p>
            <Link href="#" className="solution-link">Contact Sales <ChevronRight size={16}/></Link>
          </div>
        </div>
      </section>
      
      {/* Final CTA & Footer */}
      <footer className="apple-footer">
        <div className="footer-cta fade-in-up">
          <h2>Ready to secure your health?</h2>
          <p>Setup takes less than 2 minutes. It could save your life.</p>
          <Link href="/auth/register" className="apple-btn-large apple-btn-primary touch-interactive" style={{ marginTop: '1.5rem', background: 'white', color: '#1d1d1f' }}>
            Create your Free ID
          </Link>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-logo">
            <Shield size={18} color="white"/> MedNira
          </div>
          <div className="footer-links">
            <Link href="/privacy" className="touch-interactive">Privacy Policy</Link>
            <Link href="/terms" className="touch-interactive">Terms of Service</Link>
          </div>
        </div>
      </footer>

      <style>{`
        /* Universal Touch-Interactive States for Mobile */
        .touch-interactive { transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease; }
        .touch-interactive:active, .touch-interactive:hover { transform: scale(0.98) translateY(-5px); }
        
        /* Disable scale for flip card wrapper to prevent jank */
        .flip-card.touch-interactive:active, .flip-card.touch-interactive:hover { transform: none; }

        /* Hero Section Creative */
        .apple-hero-creative { position: relative; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding-top: 80px; overflow: hidden; background-color: #fbfbfd; }
        .hero-content { position: relative; z-index: 10; text-align: center; display: flex; flex-direction: column; align-items: center; padding: 0 1.25rem; width: 100%; max-width: 1000px; margin-top: 2rem; }
        
        .apple-title-massive { font-size: clamp(2.8rem, 8vw, 6rem); font-weight: 800; letter-spacing: -0.04em; line-height: 1.05; margin-bottom: 1.25rem; color: #1d1d1f; }
        .text-gradient { background: linear-gradient(135deg, #0071e3 0%, #43b9ff 50%, #8b5cf6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; color: transparent; }
        .apple-subtitle-large { font-size: clamp(1rem, 2.5vw, 1.3rem); color: #424245; max-width: 700px; line-height: 1.5; margin-bottom: 2.5rem; font-weight: 500; }
        
        .apple-btn-large { display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 1rem 2rem; border-radius: 999px; font-size: 1.1rem; font-weight: 600; transition: all 0.3s ease; text-decoration: none; cursor: pointer; border: none; }
        .apple-btn-primary { background: #0071e3; color: white; box-shadow: 0 4px 14px rgba(0,113,227,0.3); }
        .apple-btn-primary:hover { background: #0077ed; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,113,227,0.4); }
        .apple-link-large { display: inline-flex; align-items: center; justify-content: center; gap: 0.3rem; font-size: 1.1rem; color: #0071e3; font-weight: 500; text-decoration: none; }
        .apple-cta-group { display: flex; align-items: center; justify-content: center; gap: 1.5rem; flex-wrap: wrap; width: 100%; margin-top: 1rem; }
        
        .apple-about-section { padding: 6rem 1.5rem; background: #ffffff; width: 100%; border-bottom: 1px solid #f5f5f7; display: flex; justify-content: center; }
        .about-container { max-width: 1100px; width: 100%; display: flex; align-items: center; gap: 4rem; margin: 0 auto; }
        .about-content { flex: 1; }
        .about-text { font-size: 1.15rem; color: #424245; line-height: 1.6; margin-top: 1.5rem; }
        .about-visual { flex: 0.8; display: flex; justify-content: center; align-items: center; }
        .about-badge { width: 150px; height: 150px; border-radius: 40px; background: rgba(0,113,227,0.05); display: flex; align-items: center; justify-content: center; border: 1px solid rgba(0,113,227,0.1); box-shadow: 0 20px 40px rgba(0,0,0,0.03); }
        @media (max-width: 768px) { .about-container { flex-direction: column; text-align: center; gap: 2rem; } }

        /* Ambient Background */
        .ambient-bg { position: absolute; top: 0; left: 0; right: 0; bottom: 0; overflow: hidden; z-index: 0; pointer-events: none; }
        .ambient-blob { position: absolute; filter: blur(100px); border-radius: 50%; opacity: 0.5; animation: float 20s infinite ease-in-out alternate; }
        .blob-1 { width: 50vw; height: 50vw; background: rgba(0, 113, 227, 0.15); top: -10%; left: -10%; animation-delay: 0s; }
        .blob-2 { width: 60vw; height: 60vw; background: rgba(225, 29, 72, 0.08); bottom: -20%; right: -10%; animation-delay: -5s; }
        .blob-3 { width: 45vw; height: 45vw; background: rgba(22, 163, 74, 0.08); top: 30%; left: 30%; animation-delay: -10s; }
        @keyframes float { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(50px, 50px) scale(1.1); } }

        /* Floating Mockups */
        .floating-ui-wrapper { position: relative; z-index: 10; width: 100%; margin-top: 3rem; margin-bottom: 4rem; display: flex; justify-content: center; align-items: center; overflow: visible; }
        .floating-ui-container { display: flex; align-items: center; justify-content: center; gap: 20px; perspective: 1000px; transform: scale(1.1); }
        .hero-scanner-mockup { position: relative; width: 180px; height: 180px; background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.9); border-radius: 40px; display: flex; align-items: center; justify-content: center; box-shadow: 0 30px 60px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(255,255,255,0.5); z-index: 3; flex-shrink: 0; transform-style: preserve-3d; }
        .scanner-lens { position: absolute; top: 12px; left: 50%; transform: translateX(-50%); width: 35px; height: 6px; background: rgba(0,0,0,0.1); border-radius: 10px; }
        
        .scan-icons-container { position: relative; width: 80px; height: 80px; }
        .scan-icon { position: absolute; top: 0; left: 0; animation: fadeToggle 6s infinite ease-in-out; }
        .qr-icon { animation-delay: 0s; }
        .nfc-icon { animation-delay: -3s; opacity: 0; }
        @keyframes fadeToggle { 0%, 40% { opacity: 1; transform: scale(1); } 50%, 90% { opacity: 0; transform: scale(0.8); } 100% { opacity: 1; transform: scale(1); } }
        
        .scanner-line { position: absolute; width: 85%; height: 3px; background: #0071e3; box-shadow: 0 0 15px #0071e3; top: 20%; animation: scan 3s infinite ease-in-out; }
        @keyframes scan { 0%, 40% { top: 20%; opacity: 1; } 45%, 50% { opacity: 0; } 95%, 100% { top: 80%; opacity: 1; } }
        
        .mini-scanner-mockup { position: relative; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; }

        .nfc-waves { position: absolute; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; }
        .nfc-waves span { position: absolute; border: 2px solid #16a34a; border-radius: 50%; opacity: 0; animation: wave 6s infinite cubic-bezier(0.36, 0.11, 0.89, 0.32); }
        .nfc-waves span:nth-child(1) { width: 100px; height: 100px; animation-delay: -3s; }
        .nfc-waves span:nth-child(2) { width: 150px; height: 150px; animation-delay: -2.8s; }
        .nfc-waves span:nth-child(3) { width: 200px; height: 200px; animation-delay: -2.6s; }
        @keyframes wave { 0%, 45% { opacity: 0; transform: scale(0.5); } 50% { opacity: 0.8; transform: scale(0.5); } 75% { opacity: 0; transform: scale(1.2); } 100% { opacity: 0; transform: scale(1.2); } }

        .floating-card { width: 170px; background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(15px); border-radius: 20px; padding: 1.2rem; box-shadow: 0 20px 40px rgba(0,0,0,0.08); z-index: 1; flex-shrink: 0; }
        .float-left { transform: rotate(-8deg); animation: floatCardL 6s infinite ease-in-out alternate; }
        .float-right { transform: rotate(8deg); animation: floatCardR 6s infinite ease-in-out alternate; animation-delay: -3s; }
        .float-header { display: flex; align-items: center; gap: 0.5rem; font-weight: 700; color: #1d1d1f; font-size: 0.95rem; margin-bottom: 0.75rem; }
        .float-line { height: 8px; background: #e5e5ea; border-radius: 4px; margin-bottom: 0.6rem; }
        @keyframes floatCardL { 0% { transform: translateY(0) rotate(-8deg); } 100% { transform: translateY(-15px) rotate(-8deg); } }
        @keyframes floatCardR { 0% { transform: translateY(0) rotate(8deg); } 100% { transform: translateY(-15px) rotate(8deg); } }

        /* Ultra Premium ID Showcase Section */
        .id-showcase-section { padding: 8rem 1.5rem; background: #000000; color: white; display: flex; flex-direction: column; align-items: center; overflow: hidden; position: relative; }
        .id-showcase-section .section-header { text-align: center; margin-bottom: 3rem; color: white; position: relative; z-index: 10; }
        .id-showcase-section .section-title { font-size: clamp(2.2rem, 5vw, 4rem); font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; color: white; }
        .id-showcase-section .section-subtitle { font-size: 1.2rem; color: #a1a1a6; margin-top: 1rem; max-width: 600px; margin-left: auto; margin-right: auto; line-height: 1.5; }
        
        .id-card-wrapper { position: relative; width: 100%; max-width: 320px; margin: 0 auto; perspective: 1200px; display: flex; flex-direction: column; align-items: center; gap: 1.5rem; }
        .id-card-glow-bg { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 130%; height: 130%; background: radial-gradient(circle, rgba(0,113,227,0.3) 0%, rgba(225,29,72,0.1) 40%, rgba(0,0,0,0) 70%); filter: blur(40px); z-index: 0; pointer-events: none; }
        
        /* UX Hint Badge */
        .flip-hint-badge { 
          display: inline-flex; align-items: center; gap: 0.5rem; 
          padding: 0.5rem 1rem; background: rgba(255,255,255,0.1); 
          border: 1px solid rgba(255,255,255,0.2); border-radius: 99px; 
          font-size: 0.85rem; font-weight: 600; color: white; 
          backdrop-filter: blur(10px); z-index: 10;
          animation: bounce 2s infinite;
        }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }

        /* 3D Flip Mechanics */
        .flip-card { background-color: transparent; width: 100%; aspect-ratio: 2.2 / 3.4; perspective: 1500px; z-index: 1; position: relative; }
        .flip-card-inner { position: relative; width: 100%; height: 100%; text-align: center; transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1); transform-style: preserve-3d; }
        
        .flip-card:hover .flip-card-inner, .flip-card:active .flip-card-inner { transform: rotateY(180deg); }
        
        .flip-card-front, .flip-card-back { position: absolute; width: 100%; height: 100%; -webkit-backface-visibility: hidden; backface-visibility: hidden; }
        
        .digital-id-card { 
          background: rgba(25, 25, 28, 0.95); 
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border: 1px solid rgba(255,255,255,0.15); 
          border-radius: 20px; 
          overflow: hidden; 
          box-shadow: 0 40px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 0 40px rgba(255,255,255,0.05); 
          display: flex;
          flex-direction: column;
        }
        
        .flip-card-back { transform: rotateY(180deg); }

        .hologram-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(125deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.05) 40%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 60%); background-size: 200% 200%; background-position: 200% 0; transition: background-position 0.8s ease; pointer-events: none; z-index: 10; }
        .flip-card:hover .hologram-overlay { background-position: -100% 100%; }

        .id-card-header { padding: 1.2rem 1.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08); background: rgba(0,0,0,0.3); }
        .id-brand { display: flex; align-items: center; gap: 0.5rem; font-weight: 800; font-size: 1rem; letter-spacing: 0.5px; color: white; }
        
        .id-card-body { padding: 1.5rem; display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; text-align: center; gap: 1.25rem; }
        
        /* Clean Back Body Styles */
        .back-body { align-items: flex-start; text-align: left; gap: 1.5rem; padding: 2rem 1.5rem; background: #ffffff; color: #1d1d1f; border-radius: 0 0 20px 20px; }
        .clean-back-section { display: flex; flex-direction: column; gap: 0.3rem; width: 100%; }
        .clean-label { font-size: 0.65rem; font-weight: 800; letter-spacing: 1.5px; color: #86868b; }
        .clean-value { font-size: 1.15rem; font-weight: 800; color: #1d1d1f; line-height: 1.2; }
        .clean-value-sub { font-size: 1.05rem; font-weight: 600; color: #0071e3; margin-top: 0.2rem; }
        .text-danger { color: #e11d48; }
        .clean-line-divider { width: 100%; height: 1px; background: #f5f5f7; }
        
        .text-center { text-align: center; }
        .id-label { display: block; font-size: 0.6rem; font-weight: 800; color: #a1a1a6; letter-spacing: 1.5px; margin-bottom: 0.4rem; }
        .id-name { font-size: 1.4rem; font-weight: 800; line-height: 1.1; margin-bottom: 0.4rem; color: white; }
        .id-dob { font-size: 0.75rem; color: #86868b; font-weight: 600; }
        
        .id-qr-box { background: white; padding: 0.75rem; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        
        .id-metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; width: 100%; }
        .metric-panel { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.5rem; padding: 0.75rem; border-radius: 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.05); }
        .metric-panel > div { display: flex; flex-direction: column; gap: 0.2rem; }
        .m-label { font-size: 0.55rem; font-weight: 800; letter-spacing: 1px; color: rgba(255,255,255,0.5); }
        .m-val { font-size: 0.85rem; font-weight: 700; color: white; }
        
        .id-card-footer { padding: 1rem; background: rgba(0,0,0,0.5); border-top: 1px solid rgba(255,255,255,0.08); display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
        .barcode-mock { display: flex; height: 20px; gap: 2px; align-items: center; justify-content: center; width: 100%; opacity: 0.4; }
        .barcode-mock span { background: white; height: 100%; border-radius: 1px; }
        .barcode-mock span:nth-child(1) { width: 3px; } .barcode-mock span:nth-child(2) { width: 1px; } .barcode-mock span:nth-child(3) { width: 4px; } .barcode-mock span:nth-child(4) { width: 2px; } .barcode-mock span:nth-child(5) { width: 6px; }
        .barcode-mock span:nth-child(6) { width: 2px; } .barcode-mock span:nth-child(7) { width: 1px; } .barcode-mock span:nth-child(8) { width: 4px; } .barcode-mock span:nth-child(9) { width: 3px; } .barcode-mock span:nth-child(10) { width: 2px; }
        .footer-scan-text { display: flex; align-items: center; gap: 0.4rem; font-weight: 800; font-size: 0.65rem; letter-spacing: 2px; color: #a1a1a6; }

        /* Wide Bento Grid */
        .apple-features-wide { padding: 5rem 1.5rem; background: #ffffff; width: 100%; border-bottom: 1px solid #f5f5f7; }
        .section-header { text-align: center; margin-bottom: 4rem; }
        .section-title { font-size: clamp(2.2rem, 5vw, 3.5rem); font-weight: 700; letter-spacing: -0.03em; color: #1d1d1f; line-height: 1.1; }
        .section-subtitle { font-size: 1.25rem; color: #86868b; margin-top: 1rem; max-width: 600px; margin-left: auto; margin-right: auto; }
        .bento-grid-wide { display: flex; flex-direction: column; gap: 1.5rem; width: 100%; max-width: 1100px; margin: 0 auto; }
        .bento-card-wide { border-radius: 28px; padding: 3rem; box-shadow: 0 10px 40px rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.02); }
        .bento-row { display: flex; align-items: center; gap: 3rem; }
        .bento-icon-large { width: 100px; height: 100px; border-radius: 28px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 30px rgba(0,0,0,0.05); flex-shrink: 0; }
        .bento-icon-medium { width: 70px; height: 70px; border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; }
        .bento-content-wide h3 { font-size: 2rem; font-weight: 700; margin-bottom: 1rem; letter-spacing: -0.02em; color: #1d1d1f; }
        .bento-content-wide p { font-size: 1.15rem; color: #424245; line-height: 1.6; }
        .bento-card-wide h3 { font-size: 1.6rem; font-weight: 700; margin-bottom: 0.75rem; color: inherit; }
        .bento-card-wide p { font-size: 1.05rem; color: #86868b; line-height: 1.6; }
        .bento-grid-cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }

        /* Clear UX How it Works */
        .clear-how-it-works { padding: 6rem 1.5rem; background: #fbfbfd; width: 100%; border-bottom: 1px solid #f5f5f7; }
        .process-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; max-width: 1100px; margin: 0 auto; }
        .process-card { background: white; padding: 3rem 2rem; border-radius: 24px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.03); }
        
        .process-icon-wrapper { position: relative; width: 80px; height: 80px; border-radius: 24px; display: flex; align-items: center; justify-content: center; margin: 0 auto 2rem; background: white; }
        .process-number { position: absolute; top: -10px; right: -10px; width: 32px; height: 32px; background: #1d1d1f; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.9rem; border: 3px solid white; }
        
        .blue-glow { box-shadow: 0 15px 30px rgba(0,113,227,0.15); border: 1px solid rgba(0,113,227,0.1); }
        .purple-glow { box-shadow: 0 15px 30px rgba(139,92,246,0.15); border: 1px solid rgba(139,92,246,0.1); }
        .red-glow { box-shadow: 0 15px 30px rgba(225,29,72,0.15); border: 1px solid rgba(225,29,72,0.1); }

        .process-card h3 { font-size: 1.5rem; font-weight: 700; color: #1d1d1f; margin-bottom: 1rem; }
        .process-card p { font-size: 1.05rem; color: #424245; line-height: 1.5; }

        /* Solutions Section */
        .apple-solutions { padding: 8rem 1.5rem; background: #ffffff; width: 100%; }
        .solutions-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 2rem; max-width: 1100px; margin: 0 auto; }
        .solution-card { background: #fbfbfd; border-radius: 28px; padding: 3rem 2rem; border: 1px solid #e5e5ea; display: flex; flex-direction: column; align-items: flex-start; }
        .solution-icon { width: 64px; height: 64px; border-radius: 20px; background: #f3e8ff; color: #9333ea; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; }
        .solution-card h3 { font-size: 1.6rem; font-weight: 700; color: #1d1d1f; margin-bottom: 1rem; }
        .solution-card p { font-size: 1.05rem; color: #424245; line-height: 1.6; margin-bottom: 2rem; flex: 1; }
        .solution-link { display: inline-flex; align-items: center; gap: 0.25rem; font-weight: 600; color: #0071e3; text-decoration: none; font-size: 1.05rem; transition: color 0.2s ease; }
        .solution-link:hover, .solution-link:active { color: #0077ed; }

        /* Footer */
        .apple-footer { background: #1d1d1f; color: #f5f5f7; padding: 6rem 1.5rem 2rem; width: 100%; }
        .footer-cta { text-align: center; max-width: 600px; margin: 0 auto 6rem; }
        .footer-cta h2 { font-size: clamp(2rem, 4vw, 3rem); font-weight: 700; margin-bottom: 1rem; letter-spacing: -0.02em; color: white; }
        .footer-cta p { font-size: 1.25rem; color: #a1a1a6; }
        .footer-bottom { max-width: 1100px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 2rem; }
        .footer-logo { display: flex; align-items: center; gap: 0.5rem; font-weight: 700; font-size: 1.25rem; color: white; }
        .footer-links { display: flex; gap: 2rem; }
        .footer-links a { color: #a1a1a6; text-decoration: none; font-size: 0.95rem; transition: color 0.2s ease; }
        .footer-links a:hover, .footer-links a:active { color: white; }

        /* Responsive Adjustments */
        @media (max-width: 1024px) {
          .bento-row { flex-direction: column; text-align: center; }
          .floating-ui-container { transform: scale(0.9); }
        }

        @media (max-width: 768px) {
          .apple-hero-creative { min-height: 85vh; padding-top: 40px; }
          .apple-cta-group { flex-direction: column; width: 100%; gap: 1rem; }
          .apple-btn-large { width: 100%; justify-content: center; }
          .apple-link-large { justify-content: center; }
          
          .floating-ui-wrapper { margin-top: 1rem; }
          .floating-ui-container { transform: scale(0.65); gap: 10px; }
          
          .id-showcase-section { padding: 4rem 1.5rem; }
          .id-showcase-section .section-title { font-size: 2.2rem; }
          
          .bento-card-wide { padding: 2rem; border-radius: 24px; }
          .bento-content-wide h3 { font-size: 1.75rem; }
          .bento-content-wide p { font-size: 1.05rem; }
          .bento-grid-cols { grid-template-columns: 1fr; }
          
          .footer-bottom { flex-direction: column; gap: 1.5rem; }
        }
        
        @media (max-width: 480px) {
          .floating-ui-wrapper { margin-top: 0rem; margin-bottom: -1rem; }
          .floating-ui-container { transform: scale(0.5); gap: 5px; }
          .id-card-wrapper { max-width: 280px; }
        }
      `}</style>
    </div>
  );
}
