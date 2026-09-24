import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '../context/ThemeContext';
import { LanguageProvider } from '../context/LanguageContext';
import { AuthProvider } from '../context/AuthContext';
import { SafetyBanner } from '../components/common/SafetyBanner';
import { QuickDemoBar } from '../components/common/QuickDemoBar';
import { Header } from '../components/common/Header';

export const metadata: Metadata = {
  title: 'TriageBridge | Multimodal Healthcare Triage Assistant',
  description:
    'Human-in-the-loop healthcare triage-support platform for government hospitals, PHCs, and health camps.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-[#F7FAFC] text-[#102A43] antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <QuickDemoBar />
              <SafetyBanner />
              <Header />
              <main className="flex-1 flex flex-col">{children}</main>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
