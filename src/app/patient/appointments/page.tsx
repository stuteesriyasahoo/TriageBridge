'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { dataStore } from '../../../lib/store';
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
} from 'lucide-react';

export default function AppointmentsPage() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  // Form states
  const [hospitalName, setHospitalName] = useState('SCB Medical College & Hospital, Cuttack');
  const [department, setDepartment] = useState('Cardiology OPD');
  const [doctorName, setDoctorName] = useState('Dr. B. K. Patnaik, DM');
  const [appointmentDate, setAppointmentDate] = useState('2026-09-28');
  const [appointmentTime, setAppointmentTime] = useState('11:00 AM');
  const [locationRoom, setLocationRoom] = useState('Room 14, 2nd Floor Super-Specialty');
  const [notes, setNotes] = useState('Follow-up triage consultation.');

  useEffect(() => {
    if (currentUser) {
      setAppointments(dataStore.getAppointments(currentUser.id));
    }
  }, [currentUser]);

  const handleAddAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

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
      createdAt: new Date().toISOString(),
    };

    dataStore.addAppointment(newAppt);
    setAppointments(dataStore.getAppointments(currentUser.id));
    setShowAddModal(false);
    setSuccessToast('Demo appointment added successfully!');
    setTimeout(() => setSuccessToast(''), 3000);
  };

  const handleDownloadSlip = (appt: Appointment) => {
    // Generate text/html slip blob
    const slipText = `
TRIAGEBRIDGE - OFFICIAL APPOINTMENT SLIP (SIMULATED)
======================================================
Hospital: ${appt.hospitalName}
Department: ${appt.department}
Doctor: ${appt.doctorName}
Date: ${appt.appointmentDate} | Time: ${appt.appointmentTime}
Location: ${appt.locationRoom || 'Main OPD Desk'}
Patient: ${currentUser?.fullName}
Status: ${appt.status}
Notes: ${appt.notes || 'N/A'}
======================================================
* Notice: Appointment generated via TriageBridge Hackathon Prototype.
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
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//TriageBridge//Healthcare Triage//EN
BEGIN:VEVENT
SUMMARY:Hospital Visit: ${appt.hospitalName}
DESCRIPTION:Department: ${appt.department} with ${appt.doctorName}
LOCATION:${appt.locationRoom || appt.hospitalName}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

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
            className="py-2.5 px-4 rounded-xl bg-[#0F8B8D] hover:bg-[#0c7375] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm"
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
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Appointments List */}
        <div className="space-y-4">
          {appointments.length > 0 ? (
            appointments.map(appt => (
              <div
                key={appt.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base font-bold text-[#102A43]">
                      {appt.hospitalName}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        appt.status === 'UPCOMING'
                          ? 'bg-teal-50 text-teal-700 border border-teal-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {appt.status}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-[#0F8B8D]">
                    {appt.department} • {appt.doctorName}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span>{appt.appointmentDate} at {appt.appointmentTime}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{appt.locationRoom || 'Main OPD Desk'}</span>
                    </span>
                  </div>

                  {appt.notes && (
                    <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      Note: {appt.notes}
                    </p>
                  )}
                </div>

                <div className="flex sm:flex-col gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleDownloadSlip(appt)}
                    className="flex-1 py-2 px-3 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>{t.appointments.downloadSlip}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddToCalendar(appt)}
                    className="flex-1 py-2 px-3 rounded-lg bg-teal-50 hover:bg-teal-100 text-xs font-medium text-[#0F8B8D] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <CalendarIcon className="w-3.5 h-3.5 text-[#0F8B8D]" />
                    <span>{t.appointments.addToCal}</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-xs text-slate-500">
              No appointments found. Click &quot;Add Demo Appointment&quot; above.
            </div>
          )}
        </div>

        {/* Add Demo Appointment Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-[#102A43]">
                  {t.appointments.bookDemoAppt}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddAppointment} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#102A43] mb-1">
                    {t.appointments.hospitalName}
                  </label>
                  <input
                    type="text"
                    value={hospitalName}
                    onChange={e => setHospitalName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-[#102A43] mb-1">
                      {t.appointments.department}
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={e => setDepartment(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#102A43] mb-1">
                      {t.appointments.doctor}
                    </label>
                    <input
                      type="text"
                      value={doctorName}
                      onChange={e => setDoctorName(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-[#102A43] mb-1">
                      {t.appointments.date}
                    </label>
                    <input
                      type="date"
                      value={appointmentDate}
                      onChange={e => setAppointmentDate(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#102A43] mb-1">
                      {t.appointments.time}
                    </label>
                    <input
                      type="text"
                      value={appointmentTime}
                      onChange={e => setAppointmentTime(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
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
                    onChange={e => setLocationRoom(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#102A43] mb-1">
                    Notes
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#0F8B8D] text-white font-semibold shadow-xs"
                  >
                    Save Appointment
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
