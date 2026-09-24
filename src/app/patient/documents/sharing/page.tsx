'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import { useLanguage } from '../../../../context/LanguageContext';
import { dataStore } from '../../../../lib/store';
import { DocumentShare, HealthDocument } from '../../../../lib/types';
import { DEMO_HEALTHCARE_WORKERS } from '../../../../lib/mock-data';
import {
  Share2,
  Lock,
  ArrowLeft,
  Clock,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  CheckCircle2,
  XCircle,
  Plus,
} from 'lucide-react';

export default function DocumentSharingPage() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [shares, setShares] = useState<DocumentShare[]>([]);
  const [documents, setDocuments] = useState<HealthDocument[]>([]);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [selectedWorkerId, setSelectedWorkerId] = useState(DEMO_HEALTHCARE_WORKERS[0].id);
  const [durationDays, setDurationDays] = useState('7');
  const [showGrantForm, setShowGrantForm] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (currentUser) {
      setShares(dataStore.getDocumentShares(currentUser.id));
      const userDocs = dataStore.getDocuments(currentUser.id);
      setDocuments(userDocs);
      if (userDocs.length > 0) {
        setSelectedDocId(userDocs[0].id);
      }
    }
  }, [currentUser]);

  const handleGrantShare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const doc = documents.find(d => d.id === selectedDocId);
    const worker = DEMO_HEALTHCARE_WORKERS.find(w => w.id === selectedWorkerId);
    if (!doc || !worker) return;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + Number(durationDays));

    const newShare: DocumentShare = {
      id: `share-${Date.now()}`,
      documentId: doc.id,
      documentTitle: doc.title,
      ownerId: currentUser.id,
      sharedWithWorkerId: worker.id,
      sharedWithWorkerName: worker.fullName,
      sharedWithWorkerRole: `${worker.role} (${worker.facilityName.split(',')[0]})`,
      grantedAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      isRevoked: false,
    };

    dataStore.grantShare(newShare);
    setShares(dataStore.getDocumentShares(currentUser.id));
    setShowGrantForm(false);
    setToastMessage(`Access granted to ${worker.fullName} for ${durationDays} days.`);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleRevokeShare = (shareId: string) => {
    if (window.confirm('Immediately revoke this healthcare worker\'s access to this document?')) {
      dataStore.revokeShare(shareId);
      if (currentUser) {
        setShares(dataStore.getDocumentShares(currentUser.id));
      }
      setToastMessage('Document access revoked immediately.');
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  return (
    <div className="flex-1 bg-[#F7FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation */}
        <button
          type="button"
          onClick={() => router.push('/patient/documents')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#0F8B8D] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Document Vault</span>
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#102A43]">
              {t.vault.shareTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              {t.vault.shareDesc}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowGrantForm(!showGrantForm)}
            className="py-2.5 px-4 rounded-xl bg-[#0F8B8D] hover:bg-[#0c7375] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Grant New Permission</span>
          </button>
        </div>

        {/* Privacy by Default Callout */}
        <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-start gap-3">
          <Lock className="w-4 h-4 text-[#0F8B8D] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-[#102A43]">Zero-Trust Document Vault</span>
            <p className="text-teal-800 leading-relaxed">
              Healthcare professionals can ONLY view records explicitly granted below. They cannot view your other health documents, and access expires automatically.
            </p>
          </div>
        </div>

        {toastMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Grant Form Drawer */}
        {showGrantForm && (
          <div className="bg-white rounded-2xl border border-teal-300 p-6 shadow-md space-y-4">
            <h2 className="text-sm font-bold text-[#102A43]">
              Grant Time-Limited Access to Healthcare Professional
            </h2>

            <form onSubmit={handleGrantShare} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#102A43] mb-1">
                    Select Document to Share
                  </label>
                  <select
                    value={selectedDocId}
                    onChange={e => setSelectedDocId(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
                  >
                    {documents.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.title} ({d.category.replace(/_/g, ' ')})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#102A43] mb-1">
                    Select Authorized Healthcare Worker
                  </label>
                  <select
                    value={selectedWorkerId}
                    onChange={e => setSelectedWorkerId(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
                  >
                    {DEMO_HEALTHCARE_WORKERS.map(w => (
                      <option key={w.id} value={w.id}>
                        {w.fullName} • {w.role} ({w.facilityName.split(',')[0]})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#102A43] mb-1">
                  Access Duration Validity
                </label>
                <select
                  value={durationDays}
                  onChange={e => setDurationDays(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
                >
                  <option value="1">24 Hours (Immediate Consultation)</option>
                  <option value="3">3 Days (Observation Period)</option>
                  <option value="7">7 Days (Standard Post-Triage Review)</option>
                  <option value="30">30 Days (Extended Episode of Care)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowGrantForm(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#0F8B8D] text-white font-semibold"
                >
                  Confirm &amp; Share
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Active Shares List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#102A43] uppercase tracking-wider">
              {t.vault.activeShares}
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              Total Grants: {shares.length}
            </span>
          </div>

          {shares.length > 0 ? (
            shares.map(share => {
              const isExpired = new Date(share.expiresAt) < new Date();
              return (
                <div
                  key={share.id}
                  className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                    share.isRevoked || isExpired
                      ? 'border-slate-200 opacity-60 bg-slate-50/50'
                      : 'border-slate-200 hover:border-[#0F8B8D]'
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#102A43]">
                        {share.documentTitle}
                      </span>
                      {share.isRevoked ? (
                        <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                          REVOKED
                        </span>
                      ) : isExpired ? (
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                          EXPIRED
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          ACTIVE ACCESS
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-600">
                      Shared with: <strong>{share.sharedWithWorkerName}</strong> ({share.sharedWithWorkerRole})
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                      <span>Granted: {new Date(share.grantedAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>Expires: {new Date(share.expiresAt).toLocaleString()}</span>
                    </div>
                  </div>

                  {!share.isRevoked && !isExpired && (
                    <button
                      type="button"
                      onClick={() => handleRevokeShare(share.id)}
                      className="px-3.5 py-2 rounded-xl border border-red-300 text-red-700 hover:bg-red-50 font-semibold text-xs flex items-center gap-1.5 self-start sm:self-center transition-colors"
                    >
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span>{t.vault.revokeBtn}</span>
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-xs text-slate-500">
              No active document shares. Your medical records are 100% private to you.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
