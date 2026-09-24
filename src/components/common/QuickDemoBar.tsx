'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dataStore } from '../../lib/store';
import { DEMO_PATIENTS, DEMO_HEALTHCARE_WORKERS } from '../../lib/mock-data';
import { UserCheck, Stethoscope, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

export function QuickDemoBar() {
  const { currentUser, loginAsDemoUser } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <aside aria-label="Demo credentials and account switcher" className="bg-slate-900 border-b border-slate-700 text-slate-200 text-xs py-1.5 px-3">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-semibold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-600/50">
            Hackathon Demo Quick Switcher
          </span>
          <span className="hidden md:inline text-slate-400">
            Active: <strong className="text-white">{currentUser?.fullName || 'Guest'}</strong> (
            <span className="text-[#35C2BD]">{currentUser?.role || 'NONE'}</span>)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="md:hidden flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white"
          >
            Accounts {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <div className={`${isExpanded ? 'flex' : 'hidden'} md:flex flex-wrap items-center gap-1.5`}>
            {/* Demo Patients */}
            {DEMO_PATIENTS.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => loginAsDemoUser(p.id)}
                className={`px-2 py-1 rounded text-xs transition-colors flex items-center gap-1 ${
                  currentUser?.id === p.id
                    ? 'bg-[#0F8B8D] text-white font-semibold shadow-xs'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
                title={`Log in as demo patient: ${p.fullName} (${p.preferredLanguage.toUpperCase()})`}
              >
                <UserCheck className="w-3 h-3 text-teal-300" />
                <span>{p.fullName.split(' ')[0]}</span>
                <span className="text-[10px] opacity-75">({p.preferredLanguage.toUpperCase()})</span>
              </button>
            ))}

            {/* Demo Healthcare Workers */}
            {DEMO_HEALTHCARE_WORKERS.map(w => (
              <button
                key={w.id}
                type="button"
                onClick={() => loginAsDemoUser(w.id)}
                className={`px-2 py-1 rounded text-xs transition-colors flex items-center gap-1 ${
                  currentUser?.id === w.id
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
                title={`Log in as clinical reviewer: ${w.fullName}`}
              >
                <Stethoscope className="w-3 h-3 text-indigo-300" />
                <span>{w.fullName.split(' ')[1] || w.fullName}</span>
                <span className="text-[10px] opacity-75">({w.role === 'DOCTOR' ? 'Doc' : 'Nurse'})</span>
              </button>
            ))}

            {/* Reset Data Button */}
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset all demo cases and records back to synthetic defaults?')) {
                  dataStore.resetToDemo();
                }
              }}
              className="px-2 py-1 rounded text-xs bg-red-950/70 hover:bg-red-900 border border-red-800/60 text-red-200 flex items-center gap-1"
              title="Reset all demo data"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden lg:inline">Reset Demo</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
