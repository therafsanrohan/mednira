import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Emergency Medical Profile | MedNira',
  description: 'Verified Emergency Medical Information',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function EmergencyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 selection:bg-rose-500/30">
      {children}
    </div>
  );
}
