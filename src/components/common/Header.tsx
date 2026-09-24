'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageSelector } from './LanguageSelector';
import { ThemeToggle } from './ThemeToggle';
import {
  Activity,
  Menu,
  X,
  User,
  LogOut,
  Sparkles,
  ClipboardList,
  FolderLock,
  Calendar,
  Layers,
  FileCheck2,
} from 'lucide-react';

export function Header() {
  const { currentUser, isPatient, isHealthcareWorker, logout } = useAuth();
  const { t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const patientNavLinks = [
    { href: '/patient/dashboard', label: t.nav.dashboard, icon: Activity },
    { href: '/patient/triage', label: t.nav.startTriage, icon: Sparkles, highlight: true },
    { href: '/patient/cases', label: t.nav.myCases, icon: ClipboardList },
    { href: '/patient/appointments', label: t.nav.appointments, icon: Calendar },
    { href: '/patient/documents', label: t.nav.healthDocs, icon: FolderLock },
    { href: '/patient/profile', label: t.nav.profile, icon: User },
  ];

  const healthcareNavLinks = [
    { href: '/healthcare/dashboard', label: t.nav.dashboard, icon: Activity },
    { href: '/healthcare/queue', label: t.nav.priorityQueue, icon: Layers, highlight: true },
    { href: '/healthcare/referrals', label: t.nav.referrals, icon: FileCheck2 },
    { href: '/healthcare/audit', label: t.nav.auditHistory, icon: ClipboardList },
  ];

  const currentNavLinks = isHealthcareWorker
    ? healthcareNavLinks
    : isPatient
    ? patientNavLinks
    : [];

  return (
    <header className="bg-[#102A43] dark:bg-[#0B1220] text-white sticky top-0 z-40 shadow-sm border-b border-[#0F8B8D]/30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (isPatient) router.push('/patient/dashboard');
                else if (isHealthcareWorker) router.push('/healthcare/dashboard');
                else router.push('/');
              }}
              className="flex items-center gap-2.5 text-left group focus:outline-hidden"
            >
              {/* Bridge-and-Pulse Visual Motif */}
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#0F8B8D] to-[#35C2BD] flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                <svg
                  className="w-6 h-6 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {/* Bridge Arch */}
                  <path d="M3 19C6 11 18 11 21 19" />
                  {/* Heartbeat pulse overlay */}
                  <path d="M4 15h4l2-5 3 10 2-6h5" stroke="#F7FAFC" strokeWidth="2" />
                </svg>
              </div>

              <div>
                <div className="flex items-center">
                  <span className="text-xl font-bold tracking-tight text-white">
                    Triage<span className="text-[#35C2BD]">Bridge</span>
                  </span>
                </div>
                <p className="text-[11px] text-teal-200/80 font-normal leading-none hidden sm:block">
                  {t.brand.tagline}
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {currentNavLinks.map(link => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <button
                  key={link.href}
                  type="button"
                  onClick={() => router.push(link.href)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#0F8B8D] text-white shadow-xs'
                      : link.highlight
                      ? 'text-[#35C2BD] hover:bg-white/10 font-semibold'
                      : 'text-slate-200 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons: Theme Toggle, Language Selector & User Profile */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSelector />

            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => router.push(isPatient ? '/patient/profile' : '/healthcare/dashboard')}
                  className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-slate-700/60 text-xs text-left"
                >
                  <div className="w-6 h-6 rounded-full bg-[#0F8B8D] flex items-center justify-center text-white font-bold text-[10px]">
                    {currentUser.fullName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-white leading-tight max-w-[120px] truncate">
                      {currentUser.fullName}
                    </div>
                    <div className="text-[10px] text-teal-200 leading-none">
                      {currentUser.role}
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={logout}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-red-950/40 border border-slate-700/60 transition-colors"
                  title={t.nav.logout}
                >
                  <LogOut className="w-4 h-4 text-red-300" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => router.push('/role-select')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0F8B8D] hover:bg-[#0c7375] text-white transition-colors shadow-xs"
                >
                  {t.nav.roleSelector}
                </button>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <div className="lg:hidden flex items-center">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-slate-300 hover:text-white hover:bg-white/10 focus:outline-hidden"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#102A43] dark:bg-[#0B1220] border-t border-slate-700/80 px-4 pt-2 pb-4 space-y-2">
          {currentNavLinks.map(link => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <button
                key={link.href}
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  router.push(link.href);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-[#0F8B8D] text-white'
                    : 'text-slate-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.label}</span>
              </button>
            );
          })}

          <div className="pt-2 border-t border-slate-700 flex items-center justify-between">
            <ThemeToggle showLabel={true} />
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                router.push('/role-select');
              }}
              className="px-3 py-1.5 rounded-lg text-xs text-teal-300 hover:bg-white/10"
            >
              {t.nav.roleSelector}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
