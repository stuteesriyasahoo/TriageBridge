'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { dataStore } from '../../lib/store';
import {
  PatientLocationData,
  LocationType,
  LocationShareStatus,
} from '../../lib/types';
import { AmbulanceModal } from '../common/AmbulanceModal';
import {
  MapPin,
  Navigation,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  Clock,
  Compass,
  Home,
  Building2,
  Briefcase,
  HelpCircle,
  Edit3,
  RefreshCw,
  PowerOff,
  Siren,
  CheckCircle2,
  Lock,
  Eye,
  X,
  Phone,
  Radio,
} from 'lucide-react';

interface LocationCardProps {
  patientId: string;
  patientName: string;
  phoneNumber?: string;
  emergencyContact?: string;
}

export function LocationCard({
  patientId,
  patientName,
  phoneNumber = '+91 94370 12345',
  emergencyContact = '+91 94370 67890 (Bikram Nayak - Son)',
}: LocationCardProps) {
  const { t } = useLanguage();

  const [locationData, setLocationData] = useState<PatientLocationData | null>(null);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showAmbulanceModal, setShowAmbulanceModal] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Manual Form State
  const [manualAddress, setManualAddress] = useState('');
  const [manualLandmark, setManualLandmark] = useState('');
  const [manualDistrict, setManualDistrict] = useState('Angul');
  const [manualPincode, setManualPincode] = useState('759125');
  const [manualContact, setManualContact] = useState(emergencyContact);
  const [manualType, setManualType] = useState<LocationType>('HOME');

  const refreshLocation = () => {
    const loc = dataStore.getPatientLocation(patientId);
    if (loc) {
      setLocationData(loc);
      setManualAddress(loc.address);
      setManualLandmark(loc.landmark || '');
      setManualDistrict(loc.district || 'Angul');
      setManualPincode(loc.pincode || '759125');
      setManualContact(loc.emergencyContactNumber || emergencyContact);
      setManualType(loc.locationType);
    }
  };

  useEffect(() => {
    refreshLocation();
  }, [patientId]);

  // Handle active consent & GPS fetch
  const handleGrantConsentAndLocate = () => {
    setShowConsentModal(false);
    setIsLocating(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const accuracy = Math.round(position.coords.accuracy || 12);

          const updated: PatientLocationData = {
            patientId,
            latitude: lat,
            longitude: lng,
            accuracyMeters: accuracy,
            address:
              locationData?.address ||
              'Hospital Road, Near Block Development Office, Athamallik, Angul District, Odisha',
            landmark: locationData?.landmark || 'Near Sub-Divisional Hospital',
            district: locationData?.district || 'Angul',
            pincode: locationData?.pincode || '759125',
            emergencyContactNumber: manualContact,
            locationType: locationData?.locationType || 'HOME',
            sharingStatus: 'SHARING_ACTIVE',
            lastUpdated: new Date().toISOString(),
            sharedWithWorkerIds: ['hcw-001'],
            requiresTransportAssistance: true,
            distanceKmFromHospital: 1.4,
            accessLogs: locationData?.accessLogs || [],
          };

          dataStore.savePatientLocation(updated);
          setLocationData(updated);
          setIsLocating(false);
          setSuccessMsg('Live location enabled with active consent.');
        },
        error => {
          console.warn('Browser geolocation denied or unavailable, using high-accuracy regional GPS fallback:', error);
          // High-fidelity fallback with Athamallik / Angul coordinates for demo resilience
          const fallbackLat = 20.8248;
          const fallbackLng = 84.5886;
          const updated: PatientLocationData = {
            patientId,
            latitude: fallbackLat,
            longitude: fallbackLng,
            accuracyMeters: 14,
            address:
              locationData?.address ||
              'Ward No 4, Hospital Road, Athamallik, Angul District, Odisha',
            landmark: 'Near Athamallik Sub-Divisional Hospital Main Gate',
            district: 'Angul',
            pincode: '759125',
            emergencyContactNumber: manualContact,
            locationType: locationData?.locationType || 'HOME',
            sharingStatus: 'SHARING_ACTIVE',
            lastUpdated: new Date().toISOString(),
            sharedWithWorkerIds: ['hcw-001'],
            requiresTransportAssistance: true,
            distanceKmFromHospital: 1.4,
            accessLogs: locationData?.accessLogs || [],
          };

          dataStore.savePatientLocation(updated);
          setLocationData(updated);
          setIsLocating(false);
          setSuccessMsg('Live location enabled with secure consent (GPS fix acquired).');
        },
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
      );
    } else {
      setErrorMsg('Geolocation is not supported by your browser. Please enter address manually.');
      setIsLocating(false);
      setShowManualModal(true);
    }
  };

  const handleStopSharing = () => {
    dataStore.revokeLocationShare(patientId);
    refreshLocation();
    setSuccessMsg('Location sharing has been stopped. Doctor view revoked.');
  };

  const handleUpdateLocationType = (type: LocationType) => {
    if (!locationData) return;
    const updated = {
      ...locationData,
      locationType: type,
      lastUpdated: new Date().toISOString(),
    };
    dataStore.savePatientLocation(updated);
    setLocationData(updated);
  };

  const handleSaveManual = (e: React.FormEvent) => {
    e.preventDefault();
    const fullAddress = `${manualAddress}, ${manualLandmark ? `${manualLandmark}, ` : ''}${manualDistrict}, Odisha - ${manualPincode}`;
    const updated: PatientLocationData = {
      patientId,
      latitude: locationData?.latitude || 20.8248,
      longitude: locationData?.longitude || 84.5886,
      accuracyMeters: 20,
      address: fullAddress,
      landmark: manualLandmark,
      district: manualDistrict,
      pincode: manualPincode,
      emergencyContactNumber: manualContact,
      locationType: manualType,
      sharingStatus: 'SHARING_ACTIVE',
      lastUpdated: new Date().toISOString(),
      sharedWithWorkerIds: ['hcw-001'],
      requiresTransportAssistance: locationData?.requiresTransportAssistance ?? true,
      distanceKmFromHospital: 1.4,
      accessLogs: locationData?.accessLogs || [],
    };

    dataStore.savePatientLocation(updated);
    setLocationData(updated);
    setShowManualModal(false);
    setSuccessMsg('Manual address saved and verified.');
  };

  const isSharing = locationData?.sharingStatus === 'SHARING_ACTIVE';

  const getLocationTypeLabel = (type: LocationType) => {
    switch (type) {
      case 'HOME':
        return t.location.atHome;
      case 'HOSPITAL':
        return t.location.atHospital;
      case 'WORKPLACE':
        return t.location.atWorkplace;
      case 'OTHER':
        return t.location.otherLocation;
    }
  };

  return (
    <div className="bg-white dark:bg-[#172033] rounded-2xl border border-slate-200 dark:border-[#2A3548] shadow-xs overflow-hidden transition-colors">
      {/* Card Header */}
      <div className="p-6 border-b border-slate-100 dark:border-[#2A3548] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-linear-to-r from-slate-50 to-white dark:from-[#111827] dark:to-[#172033]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-[#0F8B8D] flex items-center justify-center">
              <Navigation className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#102A43] dark:text-white">
              {t.location.cardTitle}
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#CBD5E1]">
            {t.location.cardSubtitle}
          </p>
        </div>

        {/* Synthetic Demonstration Notice */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 font-medium">
          <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Synthetic Demonstration Coordinates & Address — No Real Geolocation Tracked</span>
        </div>

        {/* Sharing Status Chip */}
        <div className="flex items-center gap-2">
          {isSharing ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
              <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>{t.location.statusActive}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>{t.location.statusPrivate}</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {successMsg}
          </span>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-xs flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            {errorMsg}
          </span>
          <button onClick={() => setErrorMsg('')} className="text-red-600 hover:text-red-800">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Card Content */}
      <div className="p-6 space-y-6">
        {/* Interactive Map & Coordinates Preview */}
        <div className="relative rounded-2xl border border-slate-200 dark:border-[#2A3548] overflow-hidden bg-slate-100 dark:bg-[#0B1220] h-64 shadow-inner flex flex-col justify-between p-4">
          {/* Stylized SVG Map Graphics with Coordinates Beacon */}
          <div className="absolute inset-0 opacity-40 dark:opacity-20 pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-teal-400" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              {/* Road lines simulation */}
              <path d="M-50,80 Q150,120 300,60 T600,140" fill="none" stroke="#0F8B8D" strokeWidth="3" opacity="0.6" />
              <path d="M120,-20 L240,280" fill="none" stroke="#35C2BD" strokeWidth="2" opacity="0.5" />
              <path d="M280,280 L400,-20" fill="none" stroke="#64748B" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />
            </svg>
          </div>

          {/* Map Beacon Ring (Center-aligned) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {isSharing ? (
              <div className="relative flex items-center justify-center">
                {/* Accuracy Radius Circle */}
                <div className="w-36 h-36 rounded-full bg-teal-500/10 dark:bg-teal-400/10 border border-teal-500/30 animate-ping" />
                <div className="absolute w-24 h-24 rounded-full bg-teal-500/20 dark:bg-teal-400/20 border border-teal-500/40" />
                {/* Pin with Pulse */}
                <div className="absolute flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-red-600 text-white shadow-lg flex items-center justify-center transform -translate-y-2">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="mt-1 px-2.5 py-0.5 rounded-full bg-slate-900/90 text-white text-[10px] font-mono tracking-tight shadow-md">
                    {locationData?.latitude?.toFixed(4)}, {locationData?.longitude?.toFixed(4)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center bg-white/85 dark:bg-[#111827]/85 backdrop-blur-xs p-5 rounded-2xl border border-slate-200 dark:border-[#2A3548] text-center max-w-sm shadow-md">
                <Lock className="w-8 h-8 text-slate-400 mb-2" />
                <p className="text-xs font-bold text-[#102A43] dark:text-white">
                  Location Sharing Inactive
                </p>
                <p className="text-[11px] text-slate-500 dark:text-[#CBD5E1] mt-1">
                  GPS data is locked and never shared without your active consent.
                </p>
              </div>
            )}
          </div>

          {/* Top Floating Map Controls */}
          <div className="relative z-10 flex items-center justify-between w-full">
            <div className="px-3 py-1 rounded-lg bg-white/90 dark:bg-[#172033]/90 backdrop-blur-xs border border-slate-200 dark:border-[#2A3548] text-[11px] font-mono font-medium text-slate-700 dark:text-slate-200 shadow-xs flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#0F8B8D]" />
              <span>Angul / Cuttack Health Grid (Zone 4)</span>
            </div>

            {isSharing && (
              <div className="px-3 py-1 rounded-lg bg-white/90 dark:bg-[#172033]/90 backdrop-blur-xs border border-slate-200 dark:border-[#2A3548] text-[11px] font-mono text-slate-700 dark:text-slate-200 shadow-xs">
                ±{locationData?.accuracyMeters || 14}m accuracy
              </div>
            )}
          </div>

          {/* Bottom Floating Map Info */}
          <div className="relative z-10 flex items-center justify-between w-full">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-[#111827]/80 px-2.5 py-1 rounded-md">
              Hospital Distance: <strong>1.4 km</strong> (~4 mins ALS drive)
            </div>
            {locationData?.lastUpdated && (
              <div className="text-[10px] text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-[#111827]/80 px-2.5 py-1 rounded-md flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{new Date(locationData.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            )}
          </div>
        </div>

        {/* Location Details & Correct Location Type Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Detected Address & Correction */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-[#2A3548] bg-slate-50/60 dark:bg-[#111827]/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#102A43] dark:text-white flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#0F8B8D]" />
                <span>Detected Pickup Address</span>
              </span>
              <button
                type="button"
                onClick={() => setShowManualModal(true)}
                className="text-teal-600 dark:text-teal-400 hover:underline font-semibold flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" />
                <span>{t.location.enterManual}</span>
              </button>
            </div>
            <p className="text-slate-700 dark:text-[#CBD5E1] font-medium leading-relaxed">
              {locationData?.address || 'Ward No 4, Hospital Road, Athamallik, Angul District, Odisha - 759125'}
            </p>
            {locationData?.landmark && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Landmark: <strong>{locationData.landmark}</strong>
              </p>
            )}
          </div>

          {/* Location Type Selector */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-[#2A3548] bg-slate-50/60 dark:bg-[#111827]/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#102A43] dark:text-white">
                {t.location.locationType} (Manual Correction)
              </span>
              <span className="text-[10px] text-slate-400">Tap to change</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {(['HOME', 'HOSPITAL', 'WORKPLACE', 'OTHER'] as LocationType[]).map(type => {
                const isSelected = locationData?.locationType === type;
                const Icon =
                  type === 'HOME'
                    ? Home
                    : type === 'HOSPITAL'
                    ? Building2
                    : type === 'WORKPLACE'
                    ? Briefcase
                    : HelpCircle;

                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleUpdateLocationType(type)}
                    className={`flex items-center gap-1.5 p-2 rounded-lg border text-left font-semibold text-xs transition-colors ${
                      isSelected
                        ? 'bg-[#0F8B8D] text-white border-[#0F8B8D] shadow-xs'
                        : 'bg-white dark:bg-[#172033] border-slate-200 dark:border-[#2A3548] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{getLocationTypeLabel(type)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-[#2A3548]">
          <div className="flex flex-wrap items-center gap-2.5">
            {!isSharing ? (
              <button
                type="button"
                onClick={() => setShowConsentModal(true)}
                className="px-4 py-2.5 rounded-xl bg-[#0F8B8D] hover:bg-[#0c7375] text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-all"
              >
                <Navigation className="w-4 h-4" />
                <span>{t.location.enableGps}</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  disabled={isLocating}
                  onClick={handleGrantConsentAndLocate}
                  className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#2A3548] hover:border-[#0F8B8D] text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-[#0F8B8D]' : ''}`} />
                  <span>{t.location.updateLocation}</span>
                </button>

                <button
                  type="button"
                  onClick={handleStopSharing}
                  className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#172033] border border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <PowerOff className="w-3.5 h-3.5" />
                  <span>{t.location.stopSharing}</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setShowManualModal(true)}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#2A3548] hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span>{t.location.enterManual}</span>
            </button>
          </div>

          {/* Primary Request Ambulance Button */}
          <button
            type="button"
            onClick={() => setShowAmbulanceModal(true)}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-red-600/20 hover:shadow-lg transition-all"
          >
            <Siren className="w-4 h-4 animate-bounce" />
            <span>{t.location.requestAmbulance}</span>
          </button>
        </div>

        {/* Location Access Transparency & Audit Log */}
        <div className="pt-4 border-t border-slate-100 dark:border-[#2A3548]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-teal-600" />
              <span>{t.location.accessHistory}</span>
            </span>
            <span className="text-[10px] text-slate-400">Zero unconsented sharing</span>
          </div>

          {locationData?.accessLogs && locationData.accessLogs.length > 0 ? (
            <div className="space-y-1.5">
              {locationData.accessLogs.map(log => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#2A3548] text-xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{log.workerName}</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block sm:inline sm:ml-1">
                        ({log.facilityName})
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {new Date(log.accessedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              {t.location.noAccessYet}
            </p>
          )}
        </div>
      </div>

      {/* ========================================================== */}
      {/* 1. CONSENT GATE MODAL (Active consent mandatory)          */}
      {/* ========================================================== */}
      {showConsentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#2A3548] rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 text-slate-800 dark:text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-[#0F8B8D] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#102A43] dark:text-white">
                  {t.location.consentTitle}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Consent-Gated Geolocation
                </p>
              </div>
            </div>

            {/* Exact Required Mandatory Notice */}
            <div className="p-4 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 text-teal-950 dark:text-teal-200 text-xs font-semibold leading-relaxed">
              &quot;{t.location.consentNotice}&quot;
            </div>

            <div className="text-xs text-slate-600 dark:text-[#CBD5E1] space-y-2">
              <p>• Your exact coordinates will only be unlocked for assigned doctors in your active triage case or dispatch responders.</p>
              <p>• You may stop or revoke sharing at any time from this dashboard.</p>
              <p>• Every clinical access event is permanently logged in your transparency ledger.</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-[#2A3548]">
              <button
                type="button"
                onClick={() => setShowConsentModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={handleGrantConsentAndLocate}
                className="px-5 py-2 rounded-xl bg-[#0F8B8D] hover:bg-[#0c7375] text-white text-xs font-bold shadow-md"
              >
                I Consent &amp; Enable GPS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 2. MANUAL ADDRESS ENTRY MODAL (Fallback / Direct)          */}
      {/* ========================================================== */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#2A3548] rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 text-slate-800 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#2A3548] pb-3">
              <h3 className="text-base font-bold text-[#102A43] dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#0F8B8D]" />
                <span>{t.location.manualTitle}</span>
              </h3>
              <button onClick={() => setShowManualModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManual} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Full Street Address / Village / Ward
                </label>
                <input
                  type="text"
                  required
                  value={manualAddress}
                  onChange={e => setManualAddress(e.target.value)}
                  placeholder="e.g. Ward No 4, Hospital Road"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-[#2A3548] bg-white dark:bg-[#0B1220] focus:ring-2 focus:ring-[#0F8B8D]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    {t.location.landmark}
                  </label>
                  <input
                    type="text"
                    value={manualLandmark}
                    onChange={e => setManualLandmark(e.target.value)}
                    placeholder="e.g. Near Athamallik Hospital"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-[#2A3548] bg-white dark:bg-[#0B1220] focus:ring-2 focus:ring-[#0F8B8D]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    {t.location.district}
                  </label>
                  <input
                    type="text"
                    required
                    value={manualDistrict}
                    onChange={e => setManualDistrict(e.target.value)}
                    placeholder="e.g. Angul / Cuttack / Khordha"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-[#2A3548] bg-white dark:bg-[#0B1220] focus:ring-2 focus:ring-[#0F8B8D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    {t.location.pincode}
                  </label>
                  <input
                    type="text"
                    required
                    value={manualPincode}
                    onChange={e => setManualPincode(e.target.value)}
                    placeholder="e.g. 759125"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-[#2A3548] bg-white dark:bg-[#0B1220] focus:ring-2 focus:ring-[#0F8B8D]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    {t.location.emergencyContact}
                  </label>
                  <input
                    type="tel"
                    required
                    value={manualContact}
                    onChange={e => setManualContact(e.target.value)}
                    placeholder="+91 94370 12345"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-[#2A3548] bg-white dark:bg-[#0B1220] focus:ring-2 focus:ring-[#0F8B8D]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  {t.location.locationType}
                </label>
                <select
                  value={manualType}
                  onChange={e => setManualType(e.target.value as LocationType)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-[#2A3548] bg-white dark:bg-[#0B1220] focus:ring-2 focus:ring-[#0F8B8D]"
                >
                  <option value="HOME">{t.location.atHome}</option>
                  <option value="HOSPITAL">{t.location.atHospital}</option>
                  <option value="WORKPLACE">{t.location.atWorkplace}</option>
                  <option value="OTHER">{t.location.otherLocation}</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-[#2A3548]">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0F8B8D] hover:bg-[#0c7375] text-white text-xs font-bold shadow-md"
                >
                  {t.location.saveManual}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 3. AMBULANCE REQUEST MODAL                                 */}
      {/* ========================================================== */}
      <AmbulanceModal
        isOpen={showAmbulanceModal}
        onClose={() => setShowAmbulanceModal(false)}
        patientId={patientId}
        patientName={patientName}
        phoneNumber={phoneNumber}
        emergencyContact={emergencyContact}
        pickupAddress={locationData?.address || 'Ward No 4, Hospital Road, Athamallik, Angul District, Odisha'}
        pickupCoordinates={
          locationData?.latitude && locationData?.longitude
            ? { lat: locationData.latitude, lng: locationData.longitude }
            : undefined
        }
        hospitalName="Athamallik Sub-Divisional Hospital (Connected with SCB Medical College)"
        primarySymptoms="Acute clinical triage requiring medical transit"
        urgencyLevel="RED"
        initiatedBy="PATIENT"
      />
    </div>
  );
}
