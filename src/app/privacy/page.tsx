'use client';

import React from 'react';
import { Shield } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="policy-page">
      <div className="policy-header">
        <div className="policy-icon">
          <Shield size={32} color="#0071e3" strokeWidth={2} />
        </div>
        <h1 className="policy-title">Privacy Policy</h1>
        <p className="policy-subtitle">Your data. Your rules. Beautifully secured.</p>
        <p className="policy-date">Last Updated: October 2026</p>
      </div>

      <div className="policy-content">
        <section className="policy-section">
          <h2>1. Introduction</h2>
          <p>
            At MedNira, your privacy isn't an afterthought—it's the core of our engineering. 
            We designed our Emergency Health Identity platform to ensure that your critical medical data 
            is instantly available to first responders, while remaining entirely under your control.
          </p>
        </section>

        <section className="policy-section">
          <h2>2. Data Collection & Purpose</h2>
          <p>
            We collect only the information necessary to save your life and manage your account. This includes:
          </p>
          <ul>
            <li><strong>Identity & Contact:</strong> Name, email address, phone number.</li>
            <li><strong>Medical Data:</strong> Blood type, allergies, medications, and pre-existing conditions (only what you choose to provide).</li>
            <li><strong>Emergency Contacts:</strong> Names and phone numbers of individuals to alert during an emergency.</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>3. Data Sharing & First Responders</h2>
          <p>
            Your medical profile is encrypted. When your MedNira QR code or NFC tag is scanned by a paramedic or doctor, they are granted temporary read-only access to the emergency data you've explicitly marked as public for emergencies. We do not sell your data to advertisers, insurance companies, or third-party brokers.
          </p>
        </section>

        <section className="policy-section">
          <h2>4. Security Architecture</h2>
          <p>
            We employ state-of-the-art encryption protocols (AES-256) at rest and in transit. Access logs are maintained so you can see exactly when and where your emergency ID was scanned.
          </p>
        </section>

        <section className="policy-section">
          <h2>5. Your Rights</h2>
          <p>
            You retain full ownership of your data. You may export, modify, or permanently delete your MedNira profile at any time from your dashboard settings.
          </p>
        </section>
      </div>

      <div className="policy-footer">
        <Link href="/" className="apple-btn-primary">Return to Home</Link>
      </div>

      <style>{`
        .policy-page {
          min-height: 100vh;
          background-color: #fbfbfd;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          padding: 80px 20px 100px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .policy-header {
          text-align: center;
          margin-bottom: 4rem;
          max-width: 600px;
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .policy-icon {
          width: 72px;
          height: 72px;
          background: rgba(0, 113, 227, 0.1);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }

        .policy-title {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #1d1d1f;
          margin-bottom: 0.5rem;
        }

        .policy-subtitle {
          font-size: 1.25rem;
          color: #0071e3;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .policy-date {
          font-size: 0.95rem;
          color: #86868b;
          font-weight: 500;
        }

        .policy-content {
          max-width: 720px;
          width: 100%;
          background: #ffffff;
          border-radius: 32px;
          padding: 4rem;
          box-shadow: 0 20px 40px rgba(0,0,0,0.04);
          border: 1px solid rgba(0,0,0,0.05);
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.2s;
          opacity: 0;
        }

        .policy-section {
          margin-bottom: 3rem;
        }
        
        .policy-section:last-child {
          margin-bottom: 0;
        }

        .policy-section h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1d1d1f;
          margin-bottom: 1rem;
          letter-spacing: -0.02em;
        }

        .policy-section p {
          font-size: 1.1rem;
          line-height: 1.6;
          color: #424245;
          margin-bottom: 1rem;
        }

        .policy-section ul {
          list-style: none;
          padding: 0;
          margin: 1.5rem 0;
        }

        .policy-section li {
          position: relative;
          padding-left: 1.5rem;
          margin-bottom: 1rem;
          font-size: 1.05rem;
          line-height: 1.5;
          color: #424245;
        }

        .policy-section li::before {
          content: "•";
          color: #0071e3;
          font-size: 1.5rem;
          position: absolute;
          left: 0;
          top: -4px;
        }

        .policy-section li strong {
          color: #1d1d1f;
          font-weight: 600;
        }

        .policy-footer {
          margin-top: 4rem;
          opacity: 0;
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.4s;
        }

        .apple-btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 1rem 2rem;
          border-radius: 999px;
          background: #0071e3;
          color: white;
          font-weight: 600;
          font-size: 1.1rem;
          text-decoration: none;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(0,113,227,0.2);
        }

        .apple-btn-primary:hover {
          background: #0077ed;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0,113,227,0.3);
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .policy-content {
            padding: 2.5rem 1.5rem;
            border-radius: 24px;
          }
          .policy-title { font-size: 2.2rem; }
        }
      `}</style>
    </div>
  );
}
