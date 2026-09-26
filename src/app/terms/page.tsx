export default function TermsOfService() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1>Terms of Service</h1>
        <p className="last-updated">Last Updated: October 2026</p>

        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using the MedNira Emergency OS and associated services (the "Services"), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not access or use our Services.
          </p>
        </section>

        <section>
          <h2>2. Description of Service</h2>
          <p>
            MedNira provides a platform for users to store, manage, and instantly share critical emergency health information via a unique QR code or NFC tag. When scanned by a first responder or any smartphone, the configured public profile is displayed, and designated emergency contacts may receive automated SMS alerts.
          </p>
          <p>
            <strong>Disclaimer:</strong> MedNira is not a healthcare provider, and the Services do not constitute medical advice, diagnosis, or treatment. You are solely responsible for the accuracy of the medical information you input into the system.
          </p>
        </section>

        <section>
          <h2>3. User Responsibilities</h2>
          <ul>
            <li><strong>Accuracy of Information:</strong> You agree to provide accurate, current, and complete information, and to update this information as necessary. Incorrect medical data could result in adverse medical treatment during an emergency.</li>
            <li><strong>Account Security:</strong> You are responsible for safeguarding your password and authentication credentials. MedNira cannot and will not be liable for any loss or damage arising from your failure to comply with this requirement.</li>
            <li><strong>Authorized Use:</strong> You agree to use the Services only for lawful purposes and in accordance with these Terms. You will not use the Service to transmit malicious code, spam, or engage in any activity that disrupts the platform.</li>
          </ul>
        </section>

        <section>
          <h2>4. Emergency Alerts & SMS</h2>
          <p>
            By adding emergency contacts, you represent that you have obtained their consent to receive automated SMS alerts from MedNira on your behalf. MedNira relies on third-party telecommunication providers to deliver these messages and does not guarantee delivery times or successful transmission, which can be affected by network outages or carrier restrictions.
          </p>
        </section>

        <section>
          <h2>5. Limitation of Liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL MEDNIRA, ITS AFFILIATES, AGENTS, DIRECTORS, EMPLOYEES, SUPPLIERS, OR LICENSORS BE LIABLE FOR ANY DIRECT, INDIRECT, PUNITIVE, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES, INCLUDING WITHOUT LIMITATION DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA, OR OTHER INTANGIBLE LOSSES, THAT RESULT FROM THE USE OF, OR INABILITY TO USE, THIS SERVICE.
          </p>
          <p>
            MedNira assumes no liability or responsibility for any errors, mistakes, or inaccuracies of the medical profile data you provide.
          </p>
        </section>

        <section>
          <h2>6. Termination</h2>
          <p>
            We may terminate or suspend your account and bar access to the Services immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
          </p>
        </section>

        <section>
          <h2>7. Governing Law</h2>
          <p>
            These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which MedNira is headquartered, without regard to its conflict of law provisions.
          </p>
        </section>

        <section>
          <h2>8. Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
          </p>
        </section>

        <section>
          <h2>9. Contact Us</h2>
          <p>If you have any questions about these Terms, please contact us at legal@mednira.com.</p>
        </section>
      </div>

      <style>{`
        .legal-page {
          background-color: #fbfbfd;
          min-height: 100vh;
          padding: 6rem 1rem 4rem;
          color: #1d1d1f;
          font-family: var(--font-sans);
        }
        .legal-container {
          max-width: 800px;
          margin: 0 auto;
          background: #ffffff;
          padding: 4rem;
          border-radius: 24px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.04);
        }
        .legal-container h1 {
          font-size: 2.5rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin-bottom: 0.5rem;
        }
        .last-updated {
          color: #86868b;
          font-size: 0.95rem;
          margin-bottom: 3rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid #e5e5ea;
        }
        .legal-container section {
          margin-bottom: 2.5rem;
        }
        .legal-container h2 {
          font-size: 1.35rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #1d1d1f;
        }
        .legal-container p {
          font-size: 1.05rem;
          line-height: 1.6;
          color: #424245;
          margin-bottom: 1rem;
        }
        .legal-container ul {
          margin-left: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .legal-container li {
          font-size: 1.05rem;
          line-height: 1.6;
          color: #424245;
          margin-bottom: 0.5rem;
        }
        .legal-container strong {
          color: #1d1d1f;
        }
        @media (max-width: 768px) {
          .legal-page { padding: 4rem 1rem 2rem; }
          .legal-container { padding: 2rem; border-radius: 16px; }
          .legal-container h1 { font-size: 2rem; }
        }
      `}</style>
    </div>
  );
}
