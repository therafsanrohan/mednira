'use client';

import React from 'react';
import { Shield } from 'lucide-react';
import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <div className="policy-page">
      <div className="policy-header">
        <div className="policy-icon">
          <Shield size={32} color="#16a34a" strokeWidth={2} />
        </div>
        <h1 className="policy-title">Terms of Service</h1>
        <p className="policy-subtitle">Clear rules. Total transparency.</p>
        <p className="policy-date">Last Updated: October 2026</p>
      </div>

      <div className="policy-content">
        <section className="policy-section">
          <h2>1. Agreement to Terms</h2>
          <p>
            By accessing or using MedNira, you agree to be bound by these Terms of Service. If you do not agree, please do not use the service.
          </p>
        </section>

        <section className="policy-section">
          <h2>2. Medical Disclaimer</h2>
          <p>
            MedNira is an information delivery platform designed to assist first responders. <strong>We do not provide medical advice, diagnosis, or treatment.</strong> The accuracy of the medical information on your profile is entirely your responsibility. We strongly recommend reviewing your profile with a qualified healthcare provider.
          </p>
        </section>

        <section className="policy-section">
          <h2>3. Service Reliability</h2>
          <p>
            While our infrastructure is engineered for 99.99% uptime and high availability during emergencies, MedNira should not be your <em>only</em> method of communicating critical health information. Always wear standard medical alert jewelry if recommended by your doctor.
          </p>
        </section>

        <section className="policy-section">
          <h2>4. User Responsibilities</h2>
          <ul>
            <li>Maintain accurate and up-to-date information on your profile.</li>
            <li>Protect your account credentials.</li>
            <li>Do not upload false or misleading medical information that could impact emergency care.</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>5. Limitation of Liability</h2>
          <p>
            MedNira and its creators shall not be held liable for any damages, injuries, or loss of life resulting from inaccurate information provided by the user, or rare service interruptions.
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
          background: rgba(22, 163, 74, 0.1);
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
          color: #16a34a;
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
          color: #16a34a;
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
          background: #16a34a;
          color: white;
          font-weight: 600;
          font-size: 1.1rem;
          text-decoration: none;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(22, 163, 74, 0.2);
        }

        .apple-btn-primary:hover {
          background: #15803d;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(22, 163, 74, 0.3);
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
