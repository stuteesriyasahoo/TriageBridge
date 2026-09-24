'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { ShieldX, ArrowLeft, Home, LogIn } from 'lucide-react';

export default function AccessDeniedPage() {
  const router = useRouter();
  const { currentUser, isPatient, isHealthcareWorker } = useAuth();

  return (
    <div className="flex-1 bg-[#F7FAFC] py-16 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-2xl border border-red-200 shadow-md">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto shadow-inner">
          <ShieldX className="w-10 h-10" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-[#102A43]">
            Access Restricted
          </h1>
          <p className="text-xs text-red-600 font-semibold uppercase tracking-wider mt-1">
            HTTP 403 • Role-Based Security Enforcement
          </p>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          You do not have administrative or clinical credentials to view this protected resource.
          {currentUser && (
            <span className="block mt-2 font-mono text-xs bg-slate-100 p-2 rounded text-slate-700">
              Active User: {currentUser.fullName} ({currentUser.role})
            </span>
          )}
        </p>

        <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={() => {
              if (isPatient) router.push('/patient/dashboard');
              else if (isHealthcareWorker) router.push('/healthcare/dashboard');
              else router.push('/role-select');
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#0F8B8D] hover:bg-[#0c7375] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => router.push('/role-select')}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            <span>Switch Role</span>
          </button>
        </div>
      </div>
    </div>
  );
}
