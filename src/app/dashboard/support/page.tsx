import { HelpCircle, Mail, MessageSquare, PhoneCall, FileText, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Help & Support | MedNira',
  description: 'Get help with your MedNira account',
};

const faqs = [
  {
    question: "How do I activate my Emergency ID?",
    answer: "Go to the Emergency ID section from your dashboard, set up your PIN, and toggle your visibility status to 'Active'. This will generate your public QR code."
  },
  {
    question: "Can I add multiple family members?",
    answer: "Yes, depending on your subscription plan, you can add dependents from the 'Family' tab in your Account settings."
  },
  {
    question: "Is my medical data secure?",
    answer: "Absolutely. MedNira uses end-to-end encryption for sensitive fields, and we strictly comply with HIPAA and GDPR standards."
  },
  {
    question: "How do emergency responders access my info?",
    answer: "Responders can scan your QR code or enter your 6-digit Emergency ID on mednira.com/sos. They will only see the information you have explicitly marked as visible."
  }
];

export default function SupportPage() {
  return (
    <div className="max-w-4xl mx-auto pb-12 space-y-10">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Help & Support</h1>
        <p className="text-slate-500 mt-2">How can we assist you today?</p>
      </header>

      {/* Quick Contact Options */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-white border border-slate-200 rounded-2xl flex flex-col items-center text-center hover:border-indigo-300 hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900">Live Chat</h3>
          <p className="text-sm text-slate-500 mt-1 mb-4">Chat with our support team in real-time.</p>
          <button className="px-4 py-2 w-full bg-indigo-50 text-indigo-700 font-medium rounded-xl hover:bg-indigo-100 transition-colors text-sm">
            Start Chat
          </button>
        </div>

        <div className="p-6 bg-white border border-slate-200 rounded-2xl flex flex-col items-center text-center hover:border-emerald-300 hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900">Email Support</h3>
          <p className="text-sm text-slate-500 mt-1 mb-4">Send us an email anytime.</p>
          <a href="mailto:support@mednira.com" className="px-4 py-2 w-full bg-emerald-50 text-emerald-700 font-medium rounded-xl hover:bg-emerald-100 transition-colors text-sm block">
            support@mednira.com
          </a>
        </div>

        <div className="p-6 bg-white border border-slate-200 rounded-2xl flex flex-col items-center text-center hover:border-sky-300 hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-full bg-sky-50 flex items-center justify-center text-sky-600 mb-4">
            <PhoneCall className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900">Call Us</h3>
          <p className="text-sm text-slate-500 mt-1 mb-4">Available Mon-Fri, 9am - 5pm.</p>
          <a href="tel:+8801234567890" className="px-4 py-2 w-full bg-sky-50 text-sky-700 font-medium rounded-xl hover:bg-sky-100 transition-colors text-sm block">
            +880 1234-567890
          </a>
        </div>
      </section>

      {/* FAQs */}
      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-500" />
          Frequently Asked Questions
        </h2>
        
        <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden">
          {faqs.map((faq, idx) => (
            <details key={idx} className="group p-6 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between cursor-pointer font-bold text-slate-900 list-none">
                {faq.question}
                <span className="transition group-open:rotate-180">
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </span>
              </summary>
              <p className="text-slate-600 mt-4 leading-relaxed text-sm">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Useful Links */}
      <section className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-slate-400" />
          <div>
            <h3 className="font-bold text-slate-900">Terms & Privacy</h3>
            <p className="text-sm text-slate-500">Read our policies and terms of service</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href="/terms" className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
            Terms of Service
          </Link>
          <Link href="/privacy" className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
            Privacy Policy
          </Link>
        </div>
      </section>

    </div>
  );
}
