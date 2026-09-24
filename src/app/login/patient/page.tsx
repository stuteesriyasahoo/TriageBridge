'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../../context/LanguageContext';
import { useAuth } from '../../../context/AuthContext';
import { DEMO_PATIENTS } from '../../../lib/mock-data';
import {
  UserCheck,
  ShieldAlert,
  Fingerprint,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { ThemeToggle } from '../../../components/common/ThemeToggle';
import { LanguageSelector } from '../../../components/common/LanguageSelector';

export default function PatientLoginPage() {
  const { t, locale } = useLanguage();
  const { loginPatient, loginAsDemoUser } = useAuth();
  const router = useRouter();

  const [aadhaarInput, setAadhaarInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [fullName, setFullName] = useState('');
  const [step, setStep] = useState<'DETAILS' | 'OTP'>('DETAILS');
  const [otpSentMessage, setOtpSentMessage] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (aadhaarInput.replace(/\s+/g, '').length < 12) {
      setErrorMessage('Please enter a valid 12-digit Aadhaar / Virtual ID number.');
      return;
    }
    if (phoneInput.replace(/\s+/g, '').length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    setOtpSentMessage(true);
    setStep('OTP');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!otpInput || otpInput.trim().length !== 6) {
      setErrorMessage('Please enter a valid 6-digit OTP (e.g., 123456).');
      return;
    }

    // Mask the raw Aadhaar input - NEVER store raw Aadhaar
    const cleanDigits = aadhaarInput.replace(/\s+/g, '');
    const last4 = cleanDigits.slice(-4) || '1234';
    const maskedAadhaar = `XXXX-XXXX-${last4}`;

    loginPatient({
      maskedAadhaar,
      fullName: fullName.trim() || 'Citizen Patient',
      phoneNumber: phoneInput,
      preferredLanguage: locale,
    });
  };

  const handlePasskeyLogin = () => {
    // Simulated WebAuthn / Passkey
    const demoPatient = DEMO_PATIENTS[0];
    loginAsDemoUser(demoPatient.id);
  };

  return (
    <div className="flex-1 bg-[#F7FAFC] py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-md mx-auto w-full space-y-6">
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
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0F8B8D] border border-teal-100 flex items-center justify-center mx-auto shadow-xs">
            <UserCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-[#102A43]">
            {t.login.patientTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {t.login.patientSubtitle}
          </p>
        </div>

        {/* Mandatory Hackathon Disclaimer */}
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="font-semibold">{t.brand.aadhaarNotice}</strong> No actual UIDAI credentials are sent or stored.
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
          {step === 'DETAILS' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#102A43] mb-1">
                  Full Name (Optional for anonymous ID)
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Nayak"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0F8B8D]/30 focus:border-[#0F8B8D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#102A43] mb-1">
                  {t.login.aadhaarLabel} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={aadhaarInput}
                  onChange={e => setAadhaarInput(e.target.value)}
                  placeholder={t.login.aadhaarPlaceholder}
                  maxLength={14}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0F8B8D]/30 focus:border-[#0F8B8D]"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Masked as XXXX-XXXX-1234. Never stored in raw format.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#102A43] mb-1">
                  {t.login.phoneLabel} <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={e => setPhoneInput(e.target.value)}
                  placeholder={t.login.phonePlaceholder}
                  maxLength={14}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0F8B8D]/30 focus:border-[#0F8B8D]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberDevice}
                  onChange={e => setRememberDevice(e.target.checked)}
                  className="rounded-sm border-slate-300 text-[#0F8B8D] focus:ring-[#0F8B8D]"
                />
                <label htmlFor="remember" className="text-xs text-slate-600 cursor-pointer">
                  {t.login.rememberDevice}
                </label>
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-[#0F8B8D] hover:bg-[#0c7375] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <span>{t.login.sendOtp}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3 rounded-lg bg-teal-50 border border-teal-200 text-[#0F8B8D] text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Simulated OTP sent to {phoneInput || '+91 94370 12345'}. Demo OTP is <strong>123456</strong>.</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#102A43] mb-1">
                  {t.login.otpLabel} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={otpInput}
                  onChange={e => setOtpInput(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  required
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-center tracking-widest font-mono text-lg font-bold focus:outline-hidden focus:ring-2 focus:ring-[#0F8B8D]/30 focus:border-[#0F8B8D]"
                />
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-[#0F8B8D] hover:bg-[#0c7375] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <Lock className="w-4 h-4" />
                <span>{t.login.verifyOtp}</span>
              </button>

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={() => setStep('DETAILS')}
                  className="text-slate-500 hover:text-slate-800"
                >
                  Change Mobile Number
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOtpInput('123456');
                    setErrorMessage('');
                  }}
                  className="text-[#0F8B8D] hover:underline flex items-center gap-1 font-medium"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Auto-fill 123456</span>
                </button>
              </div>
            </form>
          )}

          {/* Biometrics / Passkey Option */}
          <div className="pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handlePasskeyLogin}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Fingerprint className="w-4 h-4 text-[#0F8B8D]" />
              <span>{t.login.passkeyLogin}</span>
            </button>
          </div>
        </div>

        {/* Quick Demo Selector for Judges */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2.5">
          <div className="text-xs font-bold text-[#102A43] flex items-center justify-between">
            <span>{t.login.quickDemoUsers}</span>
            <span className="text-[10px] text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full font-mono">
              1-Click Demo
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {DEMO_PATIENTS.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => loginAsDemoUser(p.id)}
                className="w-full text-left p-2.5 rounded-xl border border-slate-100 hover:border-teal-300 hover:bg-teal-50/50 transition-colors flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-semibold text-slate-800">{p.fullName}</span>
                  <span className="text-slate-500 ml-1.5 text-[11px]">
                    ({p.age}Y, {p.location.split(',')[0]})
                  </span>
                </div>
                <span className="text-[10px] uppercase font-bold text-[#0F8B8D] bg-white px-2 py-0.5 rounded border border-teal-200">
                  {p.preferredLanguage}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
