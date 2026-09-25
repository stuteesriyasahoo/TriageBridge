'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { dataStore } from '../../../lib/store';
import { offlineSyncEngine } from '../../../lib/offline-sync';
import { Appointment, AppointmentStatus } from '../../../lib/types';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  MapPin,
  Download,
  AlertCircle,
  FileCheck2,
  X,
  CheckCircle2,
  Bell,
  BellRing,
  RotateCcw,
  Ban,
  Upload,
  CloudOff,
  FileText,
  Building,
  User,
} from 'lucide-react';

export default function AppointmentsPage() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'PREVIOUS' | 'ALL'>('UPCOMING');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('10:00 AM');
  const [successToast, setSuccessToast] = useState('');

  // Form states for Add Appointment
  const [hospitalName, setHospitalName] = useState('SCB Medical College & Hospital, Cuttack');
  const [department, setDepartment] = useState('Cardiology OPD');
  const [doctorName, setDoctorName] = useState('Dr. B. K. Patnaik, DM (Cardio)');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('11:00 AM');
  const [locationRoom, setLocationRoom] = useState('Room 14, 2nd Floor Super-Specialty');
  const [notes, setNotes] = useState('Follow-up clinical consultation.');
  const [letterFile, setLetterFile] = useState<File | null>(null);
  const [referralFile, setReferralFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadAppointments = () => {
    if (currentUser) {
      setAppointments(dataStore.getAppointments(currentUser.id));
    }
  };

  useEffect(() => {
    if (!appointmentDate) {
      setAppointmentDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    }
    loadAppointments();
    const unsubscribe = offlineSyncEngine.subscribe(() => {
      loadAppointments();
    });
    return () => unsubscribe();
  }, [currentUser]);

  // Tab Filtering
  const filteredAppointments = appointments.filter((appt) => {
    if (activeTab === 'UPCOMING') {
      return appt.status === 'UPCOMING' || appt.status === 'RESCHEDULED';
    }
    if (activeTab === 'PREVIOUS') {
      return appt.status === 'COMPLETED' || appt.status === 'CANCELLED';
    }
    return true;
  });

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSubmitting(true);

    const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;

    // Handle uploaded appointment letter data URL if present
    let letterUrl: string | undefined = undefined;
    let letterName: string | undefined = undefined;
    if (letterFile) {
      letterName = letterFile.name;
      letterUrl = URL.createObjectURL(letterFile);
    }

    let refUrl: string | undefined = undefined;
    let refName: string | undefined = undefined;
    if (referralFile) {
      refName = referralFile.name;
      refUrl = URL.createObjectURL(referralFile);
    }

    const newAppt: Appointment = {
      id: `appt-${Date.now()}`,
      patientId: currentUser.id,
      hospitalName,
      department,
      doctorName,
      appointmentDate,
      appointmentTime,
      locationRoom,
      status: 'UPCOMING',
      notes,
      appointmentLetterUrl: letterUrl,
      appointmentLetterName: letterName,
      referralLetterUrl: refUrl,
      referralLetterName: refName,
      reminderScheduled: true,
      syncStatus: isOffline ? 'SAVED_OFFLINE' : 'SUCCESSFULLY_SYNCHRONIZED',
      createdAt: new Date().toISOString(),
    };

    if (isOffline) {
      await offlineSyncEngine.saveOfflineAppointment(newAppt);
      setSuccessToast(
        `${t.appointments.savedLocally}. ${t.vault.offlineSecureNotice}`
      );
    } else {
      dataStore.addAppointment(newAppt);
      setSuccessToast(
        `Appointment saved successfully (Simulated booking) and reminder set!`
      );
    }

    loadAppointments();
    setShowAddModal(false);
    setIsSubmitting(false);
    setLetterFile(null);
    setReferralFile(null);
    setTimeout(() => setSuccessToast(''), 4500);
  };

  const handleCancelAppointment = (appt: Appointment) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel your appointment with ${appt.doctorName} at ${appt.hospitalName}? (Simulated)`
    );
    if (!confirmed) return;

    dataStore.cancelAppointment(appt.id, 'Cancelled by patient from portal');
    loadAppointments();
    setSuccessToast(`Appointment cancelled successfully (Simulated).`);
    setTimeout(() => setSuccessToast(''), 3500);
  };

  const handleOpenReschedule = (appt: Appointment) => {
    setRescheduleTarget(appt);
    setRescheduleDate(appt.appointmentDate);
    setRescheduleTime(appt.appointmentTime);
    setShowRescheduleModal(true);
  };

  const handleConfirmReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleTarget) return;

    dataStore.rescheduleAppointment(
      rescheduleTarget.id,
      rescheduleDate,
      rescheduleTime,
      'Rescheduled by patient'
    );
    loadAppointments();
    setShowRescheduleModal(false);
    setRescheduleTarget(null);
    setSuccessToast(
      `Appointment rescheduled to ${rescheduleDate} at ${rescheduleTime} (Simulated).`
    );
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const handleToggleReminder = (appt: Appointment) => {
    if (appt.reminderScheduled) {
      dataStore.updateAppointment(appt.id, { reminderScheduled: false });
      setSuccessToast(`Reminder disabled for ${appt.appointmentDate}.`);
    } else {
      dataStore.scheduleAppointmentReminder(appt.id);
      setSuccessToast(
        `Reminder activated! You will receive clinical alerts before your visit on ${appt.appointmentDate}.`
      );
    }
    loadAppointments();
    setTimeout(() => setSuccessToast(''), 3500);
  };

  const handleDownloadSlip = (appt: Appointment) => {
    // Generate official simulated clinical appointment slip
    const slipText = `
TRIAGEBRIDGE - OFFICIAL APPOINTMENT SLIP (SIMULATED)
======================================================
Hospital / Health Facility: ${appt.hospitalName}
Department: ${appt.department}
Doctor / Specialist: ${appt.doctorName}
Appointment Date: ${appt.appointmentDate}
Appointment Time: ${appt.appointmentTime}
Location / Counter: ${appt.locationRoom || 'Main OPD Reception Counter'}
Patient Name: ${currentUser?.fullName}
Patient Synthetic ID: ${(currentUser as any)?.syntheticId || 'PAT-2026-8912'}
Masked Identifier: ${(currentUser as any)?.maskedAadhaar || 'XXXX-XXXX-8912'}
Status: ${appt.status}
Appointment Letter Attached: ${appt.appointmentLetterName || 'Generated Electronic Slip'}
Referral Document: ${appt.referralLetterName || 'Direct Triage Consultation'}
Clinical Notes: ${appt.notes || 'Routine follow-up consult'}
Sync Verification: ${appt.syncStatus || 'CONFIRMED'}
======================================================
* Notice: Appointment generated via TriageBridge Multimodal Clinical Platform.
* Booking, cancellation, and rescheduling are simulated for this prototype.
    `.trim();

    const blob = new Blob([slipText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Appointment_Slip_${appt.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleAddToCalendar = (appt: Appointment) => {
    const cleanDate = appt.appointmentDate.replace(/-/g, '');
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//TriageBridge//Clinical Triage//EN
BEGIN:VEVENT
UID:${appt.id}@triagebridge.in
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART;VALUE=DATE:${cleanDate}
SUMMARY:Hospital Visit: ${appt.hospitalName}
DESCRIPTION:Consultation with ${appt.doctorName} in ${appt.department}. Location: ${appt.locationRoom || 'Main OPD Counter'}.
LOCATION:${appt.locationRoom ? `${appt.locationRoom}, ${appt.hospitalName}` : appt.hospitalName}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`.trim();

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `appointment_${appt.id}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 bg-[#F7FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#102A43]">
              {t.appointments.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              {t.appointments.subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="py-2.5 px-4 rounded-xl bg-[#0F8B8D] hover:bg-[#0c7375] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t.appointments.bookDemoAppt}</span>
          </button>
        </div>

        {/* Simulated Disclaimer Banner */}
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{t.appointments.simulatedNotice}</span>
        </div>

        {successToast && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fade-in shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{successToast}</span>
          </div>
        )}

        {/* Tabs: Upcoming / Previous & Past / All */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('UPCOMING')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'UPCOMING'
                ? 'bg-[#102A43] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t.appointments.tabUpcoming} (
            {
              appointments.filter(
                (a) => a.status === 'UPCOMING' || a.status === 'RESCHEDULED'
              ).length
            }
            )
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('PREVIOUS')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'PREVIOUS'
                ? 'bg-[#102A43] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t.appointments.tabPrevious} (
            {
              appointments.filter(
                (a) => a.status === 'COMPLETED' || a.status === 'CANCELLED'
              ).length
            }
            )
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'ALL'
                ? 'bg-[#102A43] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t.appointments.tabAll} ({appointments.length})
          </button>
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((appt) => {
              const isPastOrCancelled =
                appt.status === 'COMPLETED' || appt.status === 'CANCELLED';
              const isOffline = appt.syncStatus === 'SAVED_OFFLINE';

              return (
                <div
                  key={appt.id}
                  className={`bg-white rounded-2xl border p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all ${
                    appt.status === 'CANCELLED'
                      ? 'border-slate-200 opacity-60 bg-slate-50/50'
                      : 'border-slate-200 hover:border-[#0F8B8D]'
                  }`}
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-bold text-[#102A43]">
                        {appt.hospitalName}
                      </span>

                      {/* Status Badges */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          appt.status === 'UPCOMING'
                            ? 'bg-teal-50 text-teal-700 border border-teal-200'
                            : appt.status === 'RESCHEDULED'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : appt.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {appt.status}
                      </span>

                      {isOffline && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300">
                          <CloudOff className="w-3 h-3 text-slate-500" />
                          <span>{t.appointments.savedLocally}</span>
                        </span>
                      )}

                      {appt.reminderScheduled && !isPastOrCancelled && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          <BellRing className="w-3 h-3 text-blue-600 animate-pulse" />
                          <span>{t.appointments.reminderActive}</span>
                        </span>
                      )}
                    </div>

                    <div className="text-xs font-semibold text-[#0F8B8D]">
                      {appt.department} • {appt.doctorName}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {appt.appointmentDate} at {appt.appointmentTime}
                        </span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{appt.locationRoom || 'Main OPD Desk'}</span>
                      </span>
                    </div>

                    {/* Stored Letters Info */}
                    {(appt.appointmentLetterName ||
                      appt.referralLetterName) && (
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-teal-800">
                        {appt.appointmentLetterName && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-teal-50 border border-teal-100">
                            <FileText className="w-3 h-3" />
                            <span>Slip: {appt.appointmentLetterName}</span>
                          </span>
                        )}
                        {appt.referralLetterName && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                            <FileCheck2 className="w-3 h-3" />
                            <span>Referral: {appt.referralLetterName}</span>
                          </span>
                        )}
                      </div>
                    )}

                    {appt.notes && (
                      <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        Note: {appt.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleDownloadSlip(appt)}
                      className="py-2 px-3 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                      title={t.appointments.downloadSlip}
                    >
                      <Download className="w-3.5 h-3.5 text-slate-500" />
                      <span>{t.appointments.downloadSlip}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAddToCalendar(appt)}
                      className="py-2 px-3 rounded-lg bg-teal-50 hover:bg-teal-100 text-xs font-medium text-[#0F8B8D] flex items-center justify-center gap-1.5 transition-colors"
                      title={t.appointments.addToCal}
                    >
                      <CalendarIcon className="w-3.5 h-3.5 text-[#0F8B8D]" />
                      <span>{t.appointments.addToCal}</span>
                    </button>

                    {!isPastOrCancelled && (
                      <button
                        type="button"
                        onClick={() => handleToggleReminder(appt)}
                        className={`py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                          appt.reminderScheduled
                            ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                            : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                        title={t.appointments.setReminder}
                      >
                        <Bell className="w-3.5 h-3.5" />
                        <span>
                          {appt.reminderScheduled ? 'Reminder On' : t.appointments.setReminder}
                        </span>
                      </button>
                    )}

                    {!isPastOrCancelled && (
                      <div className="flex items-center gap-1 pt-1">
                        <button
                          type="button"
                          onClick={() => handleOpenReschedule(appt)}
                          className="flex-1 py-1.5 px-2 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-[11px] font-semibold text-amber-800 flex items-center justify-center gap-1"
                          title={t.appointments.rescheduleBtn}
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>{t.appointments.rescheduleBtn}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCancelAppointment(appt)}
                          className="flex-1 py-1.5 px-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-[11px] font-semibold text-red-700 flex items-center justify-center gap-1"
                          title={t.appointments.cancelBtn}
                        >
                          <Ban className="w-3 h-3" />
                          <span>{t.appointments.cancelBtn}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500 space-y-2">
              <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto" />
              <p>No appointments found in this category.</p>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="text-xs font-semibold text-[#0F8B8D] hover:underline"
              >
                + Add an Appointment
              </button>
            </div>
          )}
        </div>

        {/* Add Appointment Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4 my-8">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-[#0F8B8D]" />
                  <h3 className="text-sm font-bold text-[#102A43]">
                    {t.appointments.bookDemoAppt}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Notice */}
              <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-900 text-[11px] flex items-center gap-2">
                <Building className="w-4 h-4 text-[#0F8B8D] shrink-0" />
                <span>
                  Record an appointment or hospital referral visit with attached documents.
                </span>
              </div>

              <form onSubmit={handleAddAppointment} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#102A43] mb-1">
                    {t.appointments.hospitalName} *
                  </label>
                  <input
                    type="text"
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    required
                    placeholder="e.g. SCB Medical College, Cuttack"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0F8B8D]/30"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#102A43] mb-1">
                      {t.appointments.department} *
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      required
                      placeholder="e.g. Cardiology OPD"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0F8B8D]/30"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#102A43] mb-1">
                      {t.appointments.doctor} *
                    </label>
                    <input
                      type="text"
                      value={doctorName}
                      onChange={(e) => setDoctorName(e.target.value)}
                      required
                      placeholder="e.g. Dr. B. K. Patnaik, DM"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0F8B8D]/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#102A43] mb-1">
                      {t.appointments.date} *
                    </label>
                    <input
                      type="date"
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0F8B8D]/30"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#102A43] mb-1">
                      {t.appointments.time} *
                    </label>
                    <input
                      type="text"
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                      required
                      placeholder="e.g. 10:30 AM"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0F8B8D]/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#102A43] mb-1">
                    {t.appointments.room}
                  </label>
                  <input
                    type="text"
                    value={locationRoom}
                    onChange={(e) => setLocationRoom(e.target.value)}
                    placeholder="e.g. Room 14, 2nd Floor Super-Specialty / OPD Counter 4"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0F8B8D]/30"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#102A43] mb-1">
                    {t.appointments.notes}
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Reason for visit, instructions, fasting requirement..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#0F8B8D]/30"
                  />
                </div>

                {/* Upload & Store Appointment Letter */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <label className="block font-semibold text-[#102A43] text-xs">
                    {t.appointments.uploadLetter} (Optional)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      id="appt-letter"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(e) => setLetterFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <label
                      htmlFor="appt-letter"
                      className="cursor-pointer px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-700 flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#0F8B8D]" />
                      <span>{letterFile ? 'Change File' : 'Choose Document (PDF/PNG/JPG)'}</span>
                    </label>
                    {letterFile && (
                      <span className="text-[11px] text-teal-700 font-mono truncate max-w-[200px]">
                        {letterFile.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Upload & Store Referral Letter */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <label className="block font-semibold text-[#102A43] text-xs">
                    {t.appointments.uploadReferral} (Optional)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      id="appt-referral"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(e) => setReferralFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <label
                      htmlFor="appt-referral"
                      className="cursor-pointer px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-700 flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{referralFile ? 'Change Referral' : 'Choose Referral Slip'}</span>
                    </label>
                    {referralFile && (
                      <span className="text-[11px] text-indigo-700 font-mono truncate max-w-[200px]">
                        {referralFile.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl bg-[#0F8B8D] text-white font-semibold shadow-xs disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Appointment & Reminders'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reschedule Modal */}
        {showRescheduleModal && rescheduleTarget && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-amber-600" />
                  <h3 className="text-sm font-bold text-[#102A43]">
                    {t.appointments.rescheduleBtn} (Simulated)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRescheduleModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs">
                <span>Rescheduling visit at </span>
                <strong>{rescheduleTarget.hospitalName}</strong>
                <span> with </span>
                <strong>{rescheduleTarget.doctorName}</strong>.
              </div>

              <form onSubmit={handleConfirmReschedule} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#102A43] mb-1">
                    New Appointment Date *
                  </label>
                  <input
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#102A43] mb-1">
                    New Appointment Time *
                  </label>
                  <input
                    type="text"
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    required
                    placeholder="e.g. 02:30 PM"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowRescheduleModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-xs"
                  >
                    Confirm Rescheduling
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
