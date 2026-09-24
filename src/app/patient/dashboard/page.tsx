'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { dataStore } from '../../../lib/store';
import { TriageCase, Appointment, HealthDocument, PatientProfile } from '../../../lib/types';
import { UrgencyBadge } from '../../../components/common/UrgencyBadge';
import {
  Sparkles,
  Calendar,
  FolderLock,
  ArrowRight,
  Clock,
  PhoneCall,
  Bell,
  CheckCircle2,
  AlertCircle,
  FileText,
  Siren,
} from 'lucide-react';
import { LocationCard } from '../../../components/patient/LocationCard';
import { AmbulanceModal } from '../../../components/common/AmbulanceModal';
import { LanguageSelector } from '../../../components/common/LanguageSelector';

export default function PatientDashboard() {
  const { currentUser, isPatient } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [cases, setCases] = useState<TriageCase[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [documents, setDocuments] = useState<HealthDocument[]>([]);
  const [showAmbulanceModal, setShowAmbulanceModal] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setCases(dataStore.getCasesByPatientId(currentUser.id));
      setAppointments(dataStore.getAppointments(currentUser.id));
      setDocuments(dataStore.getDocuments(currentUser.id));
    }
  }, [currentUser]);

  const patient = currentUser as PatientProfile | null;
  const recentCase = cases[0];
  const upcomingAppointment = appointments.find(a => a.status === 'UPCOMING');

  return (
    <div className="flex-1 bg-[#F7FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Welcome Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-[#0F8B8D] text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                <span>Verified Health ID • {patient?.syntheticId || 'PAT-2026-8912'}</span>
              </div>
              <div className="bg-slate-800 text-white rounded-lg p-0.5">
                <LanguageSelector />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102A43]">
              {t.dashboard.welcome}, {patient?.fullName || 'Patient'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Location: {patient?.location || 'Angul, Odisha'} • Masked ID: {patient?.maskedAadhaar || 'XXXX-XXXX-8912'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => setShowAmbulanceModal(true)}
              className="py-3 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
            >
              <Siren className="w-4 h-4 animate-pulse" />
              <span>{t.location.requestAmbulance}</span>
            </button>
            <button
              type="button"
              onClick={() => router.push('/patient/triage')}
              className="py-3 px-5 rounded-xl bg-[#0F8B8D] hover:bg-[#0c7375] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
            >
              <Sparkles className="w-4 h-4 text-teal-200" />
              <span>{t.dashboard.startTriageBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Emergency Notice */}
        <div className="p-4 rounded-xl bg-red-50 border border-red-200/90 text-red-900 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <PhoneCall className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-red-700">Need Immediate Emergency Care?</span>
              <p className="text-xs text-red-800 leading-relaxed">
                {t.ambulance.lifeThreatNotice}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="tel:112"
              className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call 112</span>
            </a>
            <button
              type="button"
              onClick={() => setShowAmbulanceModal(true)}
              className="px-3.5 py-1.5 rounded-lg bg-white border border-red-300 hover:bg-red-50 text-red-700 font-semibold text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Siren className="w-3.5 h-3.5" />
              <span>Ambulance</span>
            </button>
          </div>
        </div>

        {/* Consent-Based GPS Location & Emergency Assistance Card */}
        <LocationCard
          patientId={patient?.id || 'pat-001'}
          patientName={patient?.fullName || 'Ramesh Nayak'}
          phoneNumber={patient?.phoneNumber || '+91 94370 12345'}
          emergencyContact={patient?.emergencyContactPhone || '+91 94370 67890'}
        />

        {/* 2-Column Grid: Active Triage Status & Upcoming Appointment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Active Triage Status Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {t.dashboard.activeTriageStatus}
                </span>
                {recentCase && <UrgencyBadge urgency={recentCase.provisionalUrgency} size="sm" />}
              </div>

              {recentCase ? (
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-bold text-[#102A43]">
                      Case #{recentCase.caseNumber}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(recentCase.submittedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 font-medium line-clamp-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    &quot;{recentCase.chiefComplaint}&quot;
                  </p>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    <span>
                      Status: <strong className="text-slate-800">{recentCase.status}</strong>
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-4">
                  No active triage case submitted. Tap &quot;Start New Triage&quot; when experiencing symptoms.
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 mt-4">
              {recentCase ? (
                <button
                  type="button"
                  onClick={() => router.push(`/patient/cases/${recentCase.id}`)}
                  className="text-xs font-semibold text-[#0F8B8D] hover:underline flex items-center gap-1"
                >
                  <span>Track Case Details &amp; Doctor Notes</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => router.push('/patient/triage')}
                  className="text-xs font-semibold text-[#0F8B8D] hover:underline flex items-center gap-1"
                >
                  <span>Begin Guided Triage</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Upcoming Appointment Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {t.dashboard.upcomingAppointment}
                </span>
                <Calendar className="w-4 h-4 text-[#0F8B8D]" />
              </div>

              {upcomingAppointment ? (
                <div className="space-y-2">
                  <div className="text-sm font-bold text-[#102A43]">
                    {upcomingAppointment.hospitalName}
                  </div>
                  <div className="text-xs text-[#0F8B8D] font-medium">
                    {upcomingAppointment.department} • {upcomingAppointment.doctorName}
                  </div>
                  <div className="p-2.5 rounded-lg bg-teal-50/50 border border-teal-100 text-xs text-slate-700 flex items-center justify-between">
                    <span>Date: <strong>{upcomingAppointment.appointmentDate}</strong></span>
                    <span>Time: <strong>{upcomingAppointment.appointmentTime}</strong></span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Location: {upcomingAppointment.locationRoom || 'OPD Room'}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-4">
                  {t.dashboard.noUpcomingAppt}.
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 mt-4">
              <button
                type="button"
                onClick={() => router.push('/patient/appointments')}
                className="text-xs font-semibold text-[#0F8B8D] hover:underline flex items-center gap-1"
              >
                <span>View All Appointments &amp; Slips</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Access Shortcuts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => router.push('/patient/cases')}
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-[#0F8B8D] shadow-xs text-left group transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-teal-50 text-[#0F8B8D] flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#102A43]">
                  {t.nav.myCases} ({cases.length})
                </div>
                <div className="text-[11px] text-slate-500">
                  Track status &amp; reviewer response
                </div>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => router.push('/patient/documents')}
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-[#0F8B8D] shadow-xs text-left group transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FolderLock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#102A43]">
                  {t.nav.healthDocs} ({documents.length})
                </div>
                <div className="text-[11px] text-slate-500">
                  Encrypted vault &amp; sharing controls
                </div>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => router.push('/patient/messages')}
            className="p-4 rounded-xl bg-white border border-slate-200 hover:border-[#0F8B8D] shadow-xs text-left group transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#102A43]">
                  {t.nav.messages}
                </div>
                <div className="text-[11px] text-slate-500">
                  Case-based communications
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Global Ambulance Modal */}
        <AmbulanceModal
          isOpen={showAmbulanceModal}
          onClose={() => setShowAmbulanceModal(false)}
          patientId={patient?.id || 'pat-001'}
          patientName={patient?.fullName || 'Ramesh Nayak'}
          phoneNumber={patient?.phoneNumber || '+91 94370 12345'}
          emergencyContact={patient?.emergencyContactPhone || '+91 94370 67890'}
          pickupAddress={patient?.location || 'Ward No 4, Hospital Road, Athamallik, Angul District, Odisha'}
          hospitalName="Athamallik Sub-Divisional Hospital (SCB Tele-Triage Network)"
          primarySymptoms="Emergency dispatch requested from patient portal"
          urgencyLevel="RED"
          initiatedBy="PATIENT"
        />
      </div>
    </div>
  );
}
