import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '../context/ThemeContext';
import { LanguageProvider } from '../context/LanguageContext';
import { AuthProvider } from '../context/AuthContext';
import { PWAProvider } from '../context/PWAContext';
import { SafetyBanner } from '../components/common/SafetyBanner';
import { QuickDemoBar } from '../components/common/QuickDemoBar';
import { Header } from '../components/common/Header';
import { OfflineStatusBanner } from '../components/common/OfflineStatusBanner';

export const metadata: Metadata = {
  title: 'TriageBridge | Multimodal Healthcare Triage Assistant',
  description:
    'Human-in-the-loop healthcare triage-support platform for government hospitals, PHCs, and health camps.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TriageBridge',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0F8B8D' },
    { media: '(prefers-color-scheme: dark)', color: '#102A43' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TriageBridge" />
      </head>
      <body className="min-h-full flex flex-col bg-[#F7FAFC] dark:bg-[#0B1220] text-[#102A43] dark:text-[#F7FAFC] antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <PWAProvider>
                <QuickDemoBar />
                <SafetyBanner />
                <OfflineStatusBanner />
                <Header />
                <main className="flex-1 flex flex-col">{children}</main>
              </PWAProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
