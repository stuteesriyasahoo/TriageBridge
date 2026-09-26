'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { dataStore } from '../../lib/store';
import {
  UrgencyCategory,
  AmbulanceRequest,
  AmbulanceRequestStatus,
} from '../../lib/types';
import { UrgencyBadge } from './UrgencyBadge';
import {
  Siren,
  PhoneCall,
  Clock,
  MapPin,
  CheckCircle2,
  X,
  AlertTriangle,
  ChevronRight,
  ShieldAlert,
  Car,
  User,
  Phone,
  Hospital,
  Edit2,
  Check,
  RefreshCw,
  XCircle,
} from 'lucide-react';

interface AmbulanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
  phoneNumber: string;
  emergencyContact: string;
  pickupAddress: string;
  pickupCoordinates?: { lat: number; lng: number };
  hospitalName?: string;
  primarySymptoms?: string;
  urgencyLevel?: UrgencyCategory;
  caseId?: string;
  caseNumber?: string;
  initiatedBy?: 'PATIENT' | 'DOCTOR';
  initialRequestId?: string;
}

const STAGES: AmbulanceRequestStatus[] = [
  'REQUEST_SUBMITTED',
  'AWAITING_CONFIRMATION',
  'AMBULANCE_ASSIGNED',
  'EN_ROUTE',
  'PATIENT_PICKED_UP',
  'REACHED_HOSPITAL',
];

export function AmbulanceModal({
  isOpen,
  onClose,
  patientId,
  patientName,
  phoneNumber,
  emergencyContact,
  pickupAddress,
  pickupCoordinates,
  hospitalName = 'SCB Medical College & Hospital / Nearest District HQ',
  primarySymptoms = 'Acute symptoms requiring medical transport',
  urgencyLevel = 'RED',
  caseId,
  caseNumber,
  initiatedBy = 'PATIENT',
  initialRequestId,
}: AmbulanceModalProps) {
  const { t } = useLanguage();

  const [mode, setMode] = useState<'CONFIRM' | 'TRACKING'>('CONFIRM');
  const [editableAddress, setEditableAddress] = useState(pickupAddress);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [activeRequest, setActiveRequest] = useState<AmbulanceRequest | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [simulatedCallModal, setSimulatedCallModal] = useState(false);

  useEffect(() => {
    setEditableAddress(pickupAddress);
  }, [pickupAddress]);

  useEffect(() => {
    if (!isOpen) return;

    // Check if there is an existing ambulance request for this patient or specific ID
    const existing = initialRequestId
      ? dataStore.getAmbulanceById(initialRequestId)
      : dataStore.getAmbulanceRequests(patientId).find(r => r.status !== 'CANCELLED' && r.status !== 'REACHED_HOSPITAL') ||
        dataStore.getAmbulanceRequests(patientId)[0];

    if (existing) {
      setActiveRequest(existing);
      setMode('TRACKING');
    } else {
      setActiveRequest(null);
      setMode('CONFIRM');
    }
  }, [isOpen, patientId, initialRequestId]);

  if (!isOpen) return null;

  const handleConfirmRequest = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const newId = `AMB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const nowIso = new Date().toISOString();
      const newReq: AmbulanceRequest = {
        id: newId,
        caseId,
        caseNumber,
        patientId,
        patientName,
        phoneNumber,
        emergencyContact,
        pickupAddress: editableAddress || pickupAddress || 'Athamallik, Angul District, Odisha',
        pickupCoordinates,
        hospitalName,
        primarySymptoms,
        urgencyLevel,
        status: 'REQUEST_SUBMITTED',
        etaMinutes: 12,
        vehicleDetails: 'ALS Unit #OD-19-B-1082 (Advanced Life Support)',
        driverDetails: 'Santosh Kumar Behera (Ph: +91 94371 99882) • EMT: Sister Pratima Das',
        requestedAt: nowIso,
        timeline: [
          {
            status: 'REQUEST_SUBMITTED',
            timestamp: nowIso,
            note: `${initiatedBy === 'DOCTOR' ? 'Doctor initiated' : 'Patient requested'} emergency ambulance assistance.`,
          },
        ],
        initiatedBy,
      };

      dataStore.createAmbulanceRequest(newReq);
      setActiveRequest(newReq);
      setMode('TRACKING');
      setIsSubmitting(false);
    }, 600);
  };

  const handleAdvanceStatus = () => {
    if (!activeRequest) return;
    const currentIndex = STAGES.indexOf(activeRequest.status);
    if (currentIndex < STAGES.length - 1) {
      const nextStatus = STAGES[currentIndex + 1];
      const notes: Record<AmbulanceRequestStatus, string> = {
        REQUEST_SUBMITTED: 'Emergency request registered.',
        AWAITING_CONFIRMATION: 'Dispatched to 108 Emergency Control Cell.',
        AMBULANCE_ASSIGNED: 'ALS Unit #OD-19-B-1082 assigned from nearest base.',
        EN_ROUTE: 'Ambulance en route to patient location. ETA 8 mins.',
        PATIENT_PICKED_UP: 'Patient safely boarded. Vitals stabilised on-board.',
        REACHED_HOSPITAL: 'Patient admitted to emergency department triage bay.',
        CANCELLED: 'Request cancelled.',
      };
      dataStore.updateAmbulanceStatus(activeRequest.id, nextStatus, notes[nextStatus]);
      const updated = dataStore.getAmbulanceById(activeRequest.id);
      if (updated) setActiveRequest(updated);
    }
  };

  const handleCancelRequest = () => {
    if (!activeRequest) return;
    if (confirm('Are you sure you want to cancel this ambulance request?')) {
      dataStore.cancelAmbulanceRequest(activeRequest.id, 'Cancelled by requester');
      const updated = dataStore.getAmbulanceById(activeRequest.id);
      if (updated) setActiveRequest(updated);
    }
  };

  const getStatusLabel = (status: AmbulanceRequestStatus) => {
    return t.ambulance.status[status] || status.replace(/_/g, ' ');
  };

  const currentStageIndex = activeRequest ? STAGES.indexOf(activeRequest.status) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#2A3548] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto flex flex-col text-slate-800 dark:text-[#F8FAFC]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-[#2A3548] flex items-center justify-between bg-slate-50/80 dark:bg-[#111827]/80 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 flex items-center justify-center">
              <Siren className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#102A43] dark:text-white flex items-center gap-2">
                <span>{t.ambulance.modalTitle}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 font-mono uppercase tracking-wider font-semibold">
                  108 / ALS
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#CBD5E1]">
                {t.ambulance.simulatedNotice}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prominent Emergency 112 Banner */}
        <div className="p-4 bg-red-500 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <ShieldAlert className="w-6 h-6 shrink-0 text-red-200" />
            <div>
              <div className="font-bold text-sm tracking-wide">
                {t.ambulance.lifeThreatNotice}
              </div>
              <div className="text-xs text-red-100">
                National Emergency Response Support System (ERSS) • 24x7 Free
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSimulatedCallModal(true)}
            className="px-4 py-2 rounded-xl bg-white text-red-700 hover:bg-red-50 font-bold text-xs flex items-center gap-2 shadow-sm transition-transform active:scale-95 shrink-0"
          >
            <PhoneCall className="w-4 h-4 fill-current" />
            <span>{t.ambulance.call112Btn}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 flex-1">
          {mode === 'CONFIRM' ? (
            /* ========================================================== */
            /* VIEW 1: REQUEST CONFIRMATION WINDOW                        */
            /* ========================================================== */
            <div className="space-y-5">
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Human-in-the-Loop Confirmation:</strong> TriageBridge AI never dispatches emergency transport autonomously. You or treating clinical staff must review the pickup parameters and confirm below.
                </div>
              </div>

              {/* Patient & Incident Review Table */}
              <div className="rounded-xl border border-slate-200 dark:border-[#2A3548] overflow-hidden text-xs">
                <div className="p-3 bg-slate-50 dark:bg-[#111827] font-semibold text-[#102A43] dark:text-white border-b border-slate-200 dark:border-[#2A3548]">
                  Dispatch Review Parameters
                </div>
                <div className="p-4 space-y-3.5 divide-y divide-slate-100 dark:divide-[#2A3548]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Patient Name</span>
                      <span className="font-bold text-sm text-[#102A43] dark:text-white flex items-center gap-1.5 mt-0.5">
                        <User className="w-3.5 h-3.5 text-teal-600" />
                        {patientName}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">Urgency Status</span>
                      <div className="mt-1">
                        <UrgencyBadge urgency={urgencyLevel} size="sm" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Primary Contact Phone</span>
                      <span className="font-mono font-medium text-slate-700 dark:text-slate-200 flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {phoneNumber || '+91 94370 12345'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">Emergency Contact</span>
                      <span className="font-mono font-medium text-slate-700 dark:text-slate-200 flex items-center gap-1.5 mt-0.5">
                        <PhoneCall className="w-3.5 h-3.5 text-teal-600" />
                        {emergencyContact || '+91 94370 67890'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3">
                    <span className="text-[11px] text-slate-400 block">Assigned Receiving Hospital</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-0.5">
                      <Hospital className="w-3.5 h-3.5 text-indigo-500" />
                      {hospitalName}
                    </span>
                  </div>

                  <div className="pt-3">
                    <span className="text-[11px] text-slate-400 block">Primary Symptoms / Triage Flag</span>
                    <div className="mt-1 p-2 rounded-lg bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#2A3548] font-medium text-slate-700 dark:text-slate-300">
                      {primarySymptoms}
                    </div>
                  </div>

                  {/* Pickup Address (Editable) */}
                  <div className="pt-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] text-slate-400 block">
                        {t.ambulance.pickupAddress} (Verify Pickup Spot)
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsEditingAddress(!isEditingAddress)}
                        className="text-[11px] text-teal-600 hover:text-teal-700 dark:text-teal-400 font-semibold flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>{isEditingAddress ? 'Done Editing' : 'Edit Pickup Address'}</span>
                      </button>
                    </div>

                    {isEditingAddress ? (
                      <div className="space-y-2">
                        <textarea
                          rows={2}
                          value={editableAddress}
                          onChange={e => setEditableAddress(e.target.value)}
                          placeholder="Enter complete pickup address with landmarks..."
                          className="w-full p-2.5 rounded-xl border border-teal-500 bg-white dark:bg-[#0B1220] text-xs focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                        />
                        <button
                          type="button"
                          onClick={() => setIsEditingAddress(false)}
                          className="px-3 py-1 bg-teal-600 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Update Address</span>
                        </button>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900 flex items-start gap-2 text-slate-800 dark:text-teal-100">
                        <MapPin className="w-4 h-4 text-[#0F8B8D] shrink-0 mt-0.5" />
                        <span className="font-medium">{editableAddress || 'Location detected via GPS / Default District Centre'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Confirm / Cancel Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 dark:border-[#2A3548] text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {t.ambulance.cancelBtn}
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmRequest}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Transmitting Dispatch Request...</span>
                    </>
                  ) : (
                    <>
                      <Siren className="w-4 h-4" />
                      <span>{t.ambulance.confirmRequestBtn}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* ========================================================== */
            /* VIEW 2: LIVE TRACKING & DISPATCH STATUS TIMELINE           */
            /* ========================================================== */
            <div className="space-y-6">
              {/* Status Header Badge */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#2A3548] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-mono">Request ID:</span>
                    <span className="text-sm font-mono font-bold text-[#102A43] dark:text-white">
                      {activeRequest?.id}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/50 text-[#0F8B8D] dark:text-teal-300 font-semibold uppercase">
                      Live Tracking
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Hospital: <strong className="text-slate-700 dark:text-slate-200">{activeRequest?.hospitalName}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Estimated Arrival</span>
                    <span className="text-lg font-extrabold text-[#0F8B8D] font-mono">
                      {activeRequest?.status === 'REACHED_HOSPITAL'
                        ? 'Arrived'
                        : activeRequest?.status === 'PATIENT_PICKED_UP'
                        ? 'En Route to Hospital'
                        : activeRequest?.status === 'CANCELLED'
                        ? 'Cancelled'
                        : `~${activeRequest?.etaMinutes || 8} Mins`}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-[#0F8B8D] flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Vehicle & Crew Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-[#2A3548] bg-white dark:bg-[#172033] flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center shrink-0">
                    <Car className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <span className="text-[10px] text-slate-400 block">{t.ambulance.vehicleDetails}</span>
                    <span className="font-bold text-slate-800 dark:text-white">
                      {activeRequest?.vehicleDetails || 'ALS Ambulance #OD-19-B-1082'}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-[#2A3548] bg-white dark:bg-[#172033] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-[#0F8B8D] flex items-center justify-center shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="text-xs">
                      <span className="text-[10px] text-slate-400 block">{t.ambulance.driverDetails}</span>
                      <span className="font-semibold text-slate-800 dark:text-white">
                        Santosh K. Behera (EMT Onboard)
                      </span>
                    </div>
                  </div>
                  <a
                    href="tel:+919437199882"
                    className="p-2 rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-teal-900/40 dark:hover:bg-teal-900/60 text-[#0F8B8D] transition-colors"
                    title="Call Ambulance Driver"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* 7-Stage Live Status Timeline */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#0F8B8D]" />
                    <span>{t.ambulance.liveTimeline}</span>
                  </span>
                  <span className="text-xs font-mono font-semibold text-teal-600 dark:text-teal-400">
                    {getStatusLabel(activeRequest?.status || 'REQUEST_SUBMITTED')}
                  </span>
                </div>

                {/* Stepper Display */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#2A3548] space-y-4">
                  {STAGES.map((stage, idx) => {
                    const isDone = activeRequest?.status === 'CANCELLED' ? false : idx <= currentStageIndex;
                    const isCurrent = activeRequest?.status === stage;
                    const isCancelled = activeRequest?.status === 'CANCELLED';

                    return (
                      <div key={stage} className="flex items-start gap-3 relative">
                        {/* Connecting Line */}
                        {idx < STAGES.length - 1 && (
                          <div
                            className={`absolute left-[13px] top-6 bottom-[-16px] w-0.5 ${
                              isDone && idx < currentStageIndex
                                ? 'bg-teal-500'
                                : 'bg-slate-200 dark:bg-[#2A3548]'
                            }`}
                          />
                        )}

                        {/* Dot / Icon */}
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors ${
                            isCurrent
                              ? 'bg-red-600 text-white ring-4 ring-red-100 dark:ring-red-950/60 animate-pulse'
                              : isDone
                              ? 'bg-teal-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                          }`}
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <span className="text-[11px] font-bold font-mono">{idx + 1}</span>
                          )}
                        </div>

                        {/* Text */}
                        <div className="text-xs flex-1 pt-0.5">
                          <div className="flex items-center justify-between">
                            <span
                              className={`font-semibold ${
                                isCurrent
                                  ? 'text-red-600 dark:text-red-400 font-bold'
                                  : isDone
                                  ? 'text-[#102A43] dark:text-white'
                                  : 'text-slate-400 dark:text-slate-500'
                              }`}
                            >
                              {getStatusLabel(stage)}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] text-teal-600 font-medium font-mono">
                                Active Stage
                              </span>
                            )}
                          </div>
                          {isCurrent && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {stage === 'REQUEST_SUBMITTED' && 'Emergency transport logged. Control room notified.'}
                              {stage === 'AWAITING_CONFIRMATION' && 'Assigned to nearest district ambulance fleet dispatch.'}
                              {stage === 'AMBULANCE_ASSIGNED' && 'ALS Unit #OD-19-B-1082 confirmed and preparing departure.'}
                              {stage === 'EN_ROUTE' && 'Ambulance is driving toward pickup location with sirens on.'}
                              {stage === 'PATIENT_PICKED_UP' && 'Patient onboard. Medical technician stabilizing vitals.'}
                              {stage === 'REACHED_HOSPITAL' && 'Vehicle arrived at casualty entrance. Transferred to ER.'}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {activeRequest?.status === 'CANCELLED' && (
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                      <XCircle className="w-4 h-4 shrink-0" />
                      <span>This ambulance request was cancelled by the requester.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Demo Test Bar (for judges & presentation) */}
              <div className="p-3 bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900 rounded-xl flex items-center justify-between text-xs">
                <span className="text-teal-800 dark:text-teal-200 font-medium">
                  Hackathon Interactive Simulator:
                </span>
                <button
                  type="button"
                  onClick={handleAdvanceStatus}
                  disabled={currentStageIndex >= STAGES.length - 1 || activeRequest?.status === 'CANCELLED'}
                  className="px-3 py-1.5 rounded-lg bg-[#0F8B8D] hover:bg-[#0c7375] text-white font-semibold text-xs flex items-center gap-1 shadow-xs disabled:opacity-40 transition-colors"
                >
                  <span>Advance to Next Stage</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Footer Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                {activeRequest?.status !== 'CANCELLED' && activeRequest?.status !== 'REACHED_HOSPITAL' && (
                  <button
                    type="button"
                    onClick={handleCancelRequest}
                    className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 font-semibold hover:underline"
                  >
                    {t.ambulance.cancelRequestBtn}
                  </button>
                )}

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Simulated 112 Call Confirmation Modal */}
        {simulatedCallModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
            <div className="bg-white dark:bg-[#102A43] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-red-200 dark:border-red-900 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 flex items-center justify-center">
                <PhoneCall className="w-6 h-6 animate-bounce" />
              </div>
              <h3 className="font-bold text-base text-[#102A43] dark:text-white">
                Simulated 112 Emergency Hotline
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                <strong>Demonstration Safety Protocol:</strong> In this hackathon demo, emergency phone dialing is simulated to prevent unintended dispatch to national telecommunication centers.
              </p>
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200">
                In a real-life emergency, immediately dial <strong>112</strong> or <strong>108</strong> from any phone.
              </div>
              <button
                type="button"
                onClick={() => setSimulatedCallModal(false)}
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md"
              >
                Return to Triage Session
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
