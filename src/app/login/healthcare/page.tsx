'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../../context/LanguageContext';
import { useAuth } from '../../../context/AuthContext';
import { DEMO_HEALTHCARE_WORKERS } from '../../../lib/mock-data';
import { UserRole } from '../../../lib/types';
import {
  Stethoscope,
  ShieldAlert,
  ArrowRight,
  BadgeCheck,
  Lock,
} from 'lucide-react';
import { ThemeToggle } from '../../../components/common/ThemeToggle';
import { LanguageSelector } from '../../../components/common/LanguageSelector';

export default function HealthcareLoginPage() {
  const { t, locale } = useLanguage();
  const { loginHealthcareWorker, loginAsDemoUser } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState('Dr. Alok Mohanty');
  const [role, setRole] = useState<UserRole>('DOCTOR');
  const [council, setCouncil] = useState('Odisha Medical Council (OMC)');
  const [regNumber, setRegNumber] = useState('SMC-ODI-48291');
  const [licenceNumber, setLicenceNumber] = useState('MED-2015-9921');
  const [password, setPassword] = useState('clinical-secure-token-2026');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!regNumber || regNumber.trim().length < 4) {
      setErrorMessage('Please provide a valid medical registration number.');
      return;
    }

    loginHealthcareWorker({
      fullName,
      role: role as 'DOCTOR' | 'NURSE' | 'MEDICAL_OFFICER' | 'HEALTH_WORKER',
      medicalCouncil: council,
      registrationNumber: regNumber,
      licenceNumber,
      facilityName: 'SCB Medical College & Hospital, Cuttack',
      department: 'Emergency & Acute Clinical Triage',
      preferredLanguage: locale,
    });
  };

  return (
    <div className="flex-1 bg-[#F7FAFC] py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-lg mx-auto w-full space-y-6">
        {/* Navigation & Theme Bar */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            ← Back to Home
          </button>
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <ThemeToggle />
          </div>
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center mx-auto shadow-xs">
            <Stethoscope className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-[#102A43]">
            {t.login.hcwTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {t.login.hcwSubtitle}
          </p>
        </div>

        {/* Mandatory Hackathon Disclaimer */}
        <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200/80 text-indigo-950 text-xs flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="font-semibold">{t.brand.doctorNotice}</strong> State council verification is mock authenticated for this demonstration.
          </p>
        </div>

        {/* Credentials Form */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#102A43] mb-1">
                {t.login.nameLabel} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#102A43] mb-1">
                  {t.login.roleLabel} <span className="text-red-500">*</span>
                </label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600"
                >
                  <option value="DOCTOR">{t.roles.doctor}</option>
                  <option value="MEDICAL_OFFICER">{t.roles.medicalOfficer}</option>
                  <option value="NURSE">{t.roles.nurse}</option>
                  <option value="HEALTH_WORKER">{t.roles.healthWorker}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#102A43] mb-1">
                  {t.login.councilLabel}
                </label>
                <input
                  type="text"
                  value={council}
                  onChange={e => setCouncil(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#102A43] mb-1">
                  {t.login.regNumLabel} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={regNumber}
                  onChange={e => setRegNumber(e.target.value)}
                  required
                  placeholder="e.g. SMC-ODI-48291"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#102A43] mb-1">
                  {t.login.licenceLabel}
                </label>
                <input
                  type="text"
                  value={licenceNumber}
                  onChange={e => setLicenceNumber(e.target.value)}
                  placeholder="e.g. MED-2015-9921"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#102A43] mb-1">
                {t.login.passwordLabel}
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
              </div>
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-colors"
            >
              <BadgeCheck className="w-4 h-4" />
              <span>{t.login.hcwLoginBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Demo Healthcare Worker Credentials for Judges */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2.5">
          <div className="text-xs font-bold text-[#102A43] flex items-center justify-between">
            <span>{t.login.quickDemoHcw}</span>
            <span className="text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full font-mono">
              1-Click Reviewer Access
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {DEMO_HEALTHCARE_WORKERS.map(w => (
              <button
                key={w.id}
                type="button"
                onClick={() => loginAsDemoUser(w.id)}
                className="text-left p-2.5 rounded-xl border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors text-xs"
              >
                <div className="font-semibold text-slate-800">{w.fullName}</div>
                <div className="text-[11px] text-indigo-700 font-medium">{w.role}</div>
                <div className="text-[10px] text-slate-400 truncate">{w.facilityName.split(',')[0]}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
