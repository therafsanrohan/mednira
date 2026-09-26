import type { Metadata, Viewport } from 'next';
import { SessionProvider } from 'next-auth/react';
import { auth } from '@/auth';
import Navbar from '@/components/Navbar';
import './globals.css';

export const metadata: Metadata = {
  title: 'MedNira — Emergency Health Identity & Response Platform',
  description:
    'Privacy-first Emergency Health Identity & Response Platform. Your medical identity, instantly available when it matters most.',
  keywords: ['emergency health', 'medical identity', 'QR medical card', 'emergency contacts', 'Bangladesh health'],
  openGraph: {
    title: 'MedNira',
    description: 'Emergency Health Identity & Response Platform',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SessionProvider session={session}>
          <Navbar />
          <main>{children}</main>

        </SessionProvider>
      </body>
    </html>
  );
}
