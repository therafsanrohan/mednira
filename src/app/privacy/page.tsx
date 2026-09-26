export default function PrivacyPolicy() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1>MedNira Privacy Policy</h1>
        <p className="last-updated">Last Updated: October 2026</p>

        <section>
          <h2>1. Introduction</h2>
          <p>
            At MedNira, we believe privacy is a fundamental human right. We design our products and services with privacy-first principles. This Privacy Policy outlines how we collect, use, and protect your personal and medical information when you use the MedNira Emergency OS, our website, and associated services (collectively, the "Services").
          </p>
        </section>

        <section>
          <h2>2. Data We Collect</h2>
          <p>We only collect data that is strictly necessary to provide you with a life-saving service.</p>
          <ul>
            <li><strong>Account Information:</strong> Name, email address, and authentication credentials.</li>
            <li><strong>Medical Profile Data:</strong> Information you voluntarily provide, such as blood type, severe allergies, medications, and pre-existing conditions.</li>
            <li><strong>Emergency Contacts:</strong> Names and phone numbers of individuals you authorize us to contact in an emergency.</li>
            <li><strong>Usage Data:</strong> Non-identifiable analytics regarding how our application is accessed and used.</li>
          </ul>
        </section>

        <section>
          <h2>3. How We Use Your Data</h2>
          <p>Your data is used exclusively to facilitate your safety and the functionality of MedNira.</p>
          <ul>
            <li>To display your vital medical information to first responders when your unique QR code or NFC tag is scanned.</li>
            <li>To send automated SMS alerts and GPS location data to your designated emergency contacts upon a scan event.</li>
            <li>To maintain, secure, and improve our Services.</li>
          </ul>
          <p><strong>We do not sell, rent, or monetize your personal or medical data. Ever.</strong></p>
        </section>

        <section>
          <h2>4. Data Sharing & Disclosure</h2>
          <p>We only share your information under the following specific circumstances:</p>
          <ul>
            <li><strong>First Responders:</strong> When your MedNira ID is scanned, the medical profile you configured to be public is displayed to the scanner.</li>
            <li><strong>Service Providers:</strong> We use trusted third-party infrastructure (e.g., Supabase, Twilio) that are bound by strict data processing agreements to securely host your data and send SMS alerts.</li>
            <li><strong>Legal Requirements:</strong> If required by a valid legal subpoena or court order, though we fight to protect user privacy in all instances.</li>
          </ul>
        </section>

        <section>
          <h2>5. Your Privacy Controls</h2>
          <p>You have absolute control over your data. Through the MedNira Dashboard, you can:</p>
          <ul>
            <li>Toggle visibility of specific medical fields (e.g., hide medications while showing blood type).</li>
            <li>Update, export, or completely delete your profile at any time. A deleted profile is permanently erased from our production servers.</li>
            <li>Revoke access to specific emergency contacts.</li>
          </ul>
        </section>

        <section>
          <h2>6. Security Measures</h2>
          <p>
            We utilize industry-standard AES-256 encryption for data at rest and TLS 1.3 for data in transit. Access to production databases is strictly audited, and medical data is architected to minimize exposure. 
          </p>
        </section>

        <section>
          <h2>7. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. If we make material changes, we will notify you via email or a prominent notice within the MedNira application prior to the change becoming effective.
          </p>
        </section>

        <section>
          <h2>8. Contact Us</h2>
          <p>If you have any questions regarding this Privacy Policy or your data, please contact our Privacy Team at privacy@mednira.com.</p>
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
