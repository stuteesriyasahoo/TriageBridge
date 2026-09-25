'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import { useLanguage } from '../../../../context/LanguageContext';
import { dataStore } from '../../../../lib/store';
import { DocumentShare, HealthDocument, TriageCase, AuditLog } from '../../../../lib/types';
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
  Layers,
  FileText,
  FileCheck,
  History,
  AlertCircle,
  Building,
} from 'lucide-react';

export default function DocumentSharingPage() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'PERMISSIONS' | 'AUDIT_TRAIL'>('PERMISSIONS');
  const [shares, setShares] = useState<DocumentShare[]>([]);
  const [documents, setDocuments] = useState<HealthDocument[]>([]);
  const [cases, setCases] = useState<TriageCase[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Grant Form States
  const [showGrantForm, setShowGrantForm] = useState(false);
  const [shareMode, setShareMode] = useState<'SINGLE' | 'BATCH' | 'CASE_ATTACHED'>('SINGLE');
  const [selectedDocId, setSelectedDocId] = useState('');
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [selectedWorkerId, setSelectedWorkerId] = useState(DEMO_HEALTHCARE_WORKERS[0].id);
  const [durationDays, setDurationDays] = useState('7');
  const [toastMessage, setToastMessage] = useState('');

  const loadData = () => {
    if (currentUser) {
      setShares(dataStore.getDocumentShares(currentUser.id));
      const userDocs = dataStore.getDocuments(currentUser.id);
      setDocuments(userDocs);
      if (userDocs.length > 0 && !selectedDocId) {
        setSelectedDocId(userDocs[0].id);
      }
      const userCases = dataStore.getCasesByPatientId(currentUser.id);
      setCases(userCases);
      if (userCases.length > 0 && !selectedCaseId) {
        setSelectedCaseId(userCases[0].id);
      }

      // Filter audit logs relating to document sharing
      const allAudits = dataStore.getAuditLogs();
      const shareAudits = allAudits.filter(
        (log) =>
          log.actorId === currentUser.id ||
          log.resourceType === 'DOCUMENT_SHARE' ||
          log.resourceType === 'HEALTH_DOCUMENT' ||
          log.actionType === 'DOCUMENT_SHARED' ||
          log.actionType === 'SHARE_ACCESS_REVOKED'
      );
      setAuditLogs(shareAudits);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const toggleDocSelection = (id: string) => {
    if (selectedDocIds.includes(id)) {
      setSelectedDocIds(selectedDocIds.filter((d) => d !== id));
    } else {
      setSelectedDocIds([...selectedDocIds, id]);
    }
  };

  const handleGrantShare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const worker = DEMO_HEALTHCARE_WORKERS.find((w) => w.id === selectedWorkerId);
    if (!worker) return;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + Number(durationDays));

    if (shareMode === 'SINGLE') {
      const doc = documents.find((d) => d.id === selectedDocId);
      if (!doc) return;

      const newShare: DocumentShare = {
        id: `share-${Date.now()}`,
        documentId: doc.id,
        documentTitle: doc.title,
        ownerId: currentUser.id,
        sharedWithWorkerId: worker.id,
        sharedWithWorkerName: worker.fullName,
        sharedWithWorkerRole: `${worker.role} (${worker.facilityName.split(',')[0]})`,
        sharingType: 'SINGLE',
        grantedAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString(),
        isRevoked: false,
      };

      dataStore.grantShare(newShare);
      setToastMessage(`Access to "${doc.title}" granted to ${worker.fullName} for ${durationDays} days.`);
    } else if (shareMode === 'BATCH') {
      if (selectedDocIds.length === 0) {
        alert('Please select at least one document to share.');
        return;
      }

      const selectedDocs = documents.filter((d) => selectedDocIds.includes(d.id));
      const titles = selectedDocs.map((d) => d.title);

      const newShare: DocumentShare = {
        id: `share-batch-${Date.now()}`,
        documentId: selectedDocs[0].id,
        documentTitle: `Batch (${selectedDocs.length} Documents): ${titles.slice(0, 2).join(', ')}${titles.length > 2 ? '...' : ''}`,
        documentIds: selectedDocIds,
        documentTitles: titles,
        ownerId: currentUser.id,
        sharedWithWorkerId: worker.id,
        sharedWithWorkerName: worker.fullName,
        sharedWithWorkerRole: `${worker.role} (${worker.facilityName.split(',')[0]})`,
        sharingType: 'BATCH',
        grantedAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString(),
        isRevoked: false,
      };

      dataStore.grantShare(newShare);
      setToastMessage(
        `Batch access (${selectedDocs.length} documents) granted to ${worker.fullName} for ${durationDays} days.`
      );
    } else if (shareMode === 'CASE_ATTACHED') {
      const targetCase = cases.find((c) => c.id === selectedCaseId);
      if (!targetCase) return;

      const newShare: DocumentShare = {
        id: `share-case-${Date.now()}`,
        documentId: targetCase.id,
        documentTitle: `Case #${targetCase.caseNumber} Diagnostic Records & Attached Reports`,
        ownerId: currentUser.id,
        sharedWithWorkerId: worker.id,
        sharedWithWorkerName: worker.fullName,
        sharedWithWorkerRole: `${worker.role} (${worker.facilityName.split(',')[0]})`,
        sharingType: 'CASE_ATTACHED',
        caseId: targetCase.id,
        caseNumber: targetCase.caseNumber,
        grantedAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString(),
        isRevoked: false,
      };

      dataStore.grantShare(newShare);
      setToastMessage(
        `Records for Case #${targetCase.caseNumber} shared with ${worker.fullName} for ${durationDays} days.`
      );
    }

    loadData();
    setShowGrantForm(false);
    setSelectedDocIds([]);
    setTimeout(() => setToastMessage(''), 4500);
  };

  const handleRevokeShare = (shareId: string) => {
    if (
      window.confirm(
        'Immediately revoke this healthcare worker\'s access? They will no longer be able to view the document.'
      )
    ) {
      dataStore.revokeShare(shareId);
      loadData();
      setToastMessage('Document access revoked immediately.');
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  return (
    <div className="flex-1 bg-[#F7FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Back */}
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
            <div className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-[#0F8B8D]" />
              <h1 className="text-2xl font-bold text-[#102A43]">
                {t.vault.shareTitle}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {t.vault.shareDesc}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowGrantForm(!showGrantForm)}
            className="py-2.5 px-4 rounded-xl bg-[#0F8B8D] hover:bg-[#0c7375] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Grant Sharing Permission</span>
          </button>
        </div>

        {/* Zero-Trust Notice Banner */}
        <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-start gap-3">
          <Lock className="w-4 h-4 text-[#0F8B8D] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-[#102A43]">
              Zero-Trust Architecture &amp; Controlled Privacy
            </span>
            <p className="text-teal-800 leading-relaxed">
              Healthcare professionals do NOT receive automatic access to your full document vault. They can only view the specific documents or case attachments granted below. You may revoke access at any time with immediate effect.
            </p>
          </div>
        </div>

        {toastMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fade-in shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{toastMessage}</span>
          </div>
        )}

        {/* Grant Permission Form (Drawer/Card) */}
        {showGrantForm && (
          <div className="bg-white rounded-2xl border border-teal-300 p-6 shadow-md space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-sm font-bold text-[#102A43]">
                Grant Time-Limited Access to Healthcare Professional
              </h2>
              <button
                type="button"
                onClick={() => setShowGrantForm(false)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                Cancel
              </button>
            </div>

            {/* Sharing Mode Switcher */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShareMode('SINGLE')}
                className={`p-2.5 rounded-xl font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                  shareMode === 'SINGLE'
                    ? 'border-[#0F8B8D] bg-teal-50 text-[#0F8B8D]'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>One Document</span>
              </button>

              <button
                type="button"
                onClick={() => setShareMode('BATCH')}
                className={`p-2.5 rounded-xl font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                  shareMode === 'BATCH'
                    ? 'border-[#0F8B8D] bg-teal-50 text-[#0F8B8D]'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Selected Documents (Batch)</span>
              </button>

              <button
                type="button"
                onClick={() => setShareMode('CASE_ATTACHED')}
                className={`p-2.5 rounded-xl font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                  shareMode === 'CASE_ATTACHED'
                    ? 'border-[#0F8B8D] bg-teal-50 text-[#0F8B8D]'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Attached to Triage Case</span>
              </button>
            </div>

            <form onSubmit={handleGrantShare} className="space-y-3.5 text-xs">
              {/* SINGLE DOC MODE */}
              {shareMode === 'SINGLE' && (
                <div>
                  <label className="block font-semibold text-[#102A43] mb-1">
                    Select Document to Share *
                  </label>
                  <select
                    value={selectedDocId}
                    onChange={(e) => setSelectedDocId(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs"
                  >
                    {documents.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.title} ({d.category.replace(/_/g, ' ')}) — {d.hospitalName || 'Health Center'}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* BATCH MODE */}
              {shareMode === 'BATCH' && (
                <div>
                  <label className="block font-semibold text-[#102A43] mb-1">
                    Select Documents to Include in Share Batch:
                  </label>
                  <div className="max-h-40 overflow-y-auto space-y-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200">
                    {documents.map((d) => (
                      <label
                        key={d.id}
                        className="flex items-center gap-2 p-1.5 hover:bg-white rounded-lg cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedDocIds.includes(d.id)}
                          onChange={() => toggleDocSelection(d.id)}
                          className="rounded text-[#0F8B8D] focus:ring-[#0F8B8D]"
                        />
                        <span className="text-xs text-slate-700 font-medium">
                          {d.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono ml-auto">
                          {d.category.replace(/_/g, ' ')}
                        </span>
                      </label>
                    ))}
                  </div>
                  <span className="text-[11px] text-teal-800 font-medium block mt-1">
                    {selectedDocIds.length} document(s) selected
                  </span>
                </div>
              )}

              {/* CASE ATTACHED MODE */}
              {shareMode === 'CASE_ATTACHED' && (
                <div>
                  <label className="block font-semibold text-[#102A43] mb-1">
                    Select Triage Case *
                  </label>
                  <select
                    value={selectedCaseId}
                    onChange={(e) => setSelectedCaseId(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs"
                  >
                    {cases.map((c) => (
                      <option key={c.id} value={c.id}>
                        Case #{c.caseNumber}: {c.chiefComplaint} ({c.provisionalUrgency})
                      </option>
                    ))}
                  </select>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    All reports and clinical recordings attached to this case will be authorized.
                  </span>
                </div>
              )}

              {/* AUTHORIZED WORKER SELECTION */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#102A43] mb-1">
                    Select Authorized Healthcare Worker *
                  </label>
                  <select
                    value={selectedWorkerId}
                    onChange={(e) => setSelectedWorkerId(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs"
                  >
                    {DEMO_HEALTHCARE_WORKERS.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.fullName} • {w.role} ({w.facilityName.split(',')[0]})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#102A43] mb-1">
                    Access Duration Validity *
                  </label>
                  <select
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs"
                  >
                    <option value="1">24 Hours (Immediate Consultation)</option>
                    <option value="3">3 Days (Observation Period)</option>
                    <option value="7">7 Days (Standard Post-Triage Review)</option>
                    <option value="30">30 Days (Extended Episode of Care)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowGrantForm(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0F8B8D] text-white font-semibold shadow-xs"
                >
                  Confirm &amp; Share
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab Switcher: Active Permissions vs. Sharing Audit Trail */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('PERMISSIONS')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'PERMISSIONS'
                ? 'bg-[#102A43] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t.vault.activeShares} ({shares.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('AUDIT_TRAIL')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'AUDIT_TRAIL'
                ? 'bg-[#102A43] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>{t.vault.sharingAuditHistory}</span>
          </button>
        </div>

        {/* TAB 1: ACTIVE PERMISSIONS */}
        {activeTab === 'PERMISSIONS' && (
          <div className="space-y-4">
            {shares.length > 0 ? (
              shares.map((share) => {
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
                      <div className="flex flex-wrap items-center gap-2">
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

                        {share.sharingType && (
                          <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {share.sharingType}
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-600">
                        Recipient: <strong>{share.sharedWithWorkerName}</strong> (
                        {share.sharedWithWorkerRole})
                      </div>

                      {share.documentTitles && share.documentTitles.length > 0 && (
                        <div className="text-[11px] text-teal-800 bg-teal-50/60 p-2 rounded-lg border border-teal-100">
                          <span className="font-semibold">Shared Documents: </span>
                          <span>{share.documentTitles.join(' • ')}</span>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                        <span>
                          Granted: {new Date(share.grantedAt).toLocaleString()}
                        </span>
                        <span>•</span>
                        <span>
                          Expires: {new Date(share.expiresAt).toLocaleString()}
                        </span>
                        {share.revokedAt && (
                          <>
                            <span>•</span>
                            <span className="text-red-500">
                              Revoked: {new Date(share.revokedAt).toLocaleString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {!share.isRevoked && !isExpired && (
                      <button
                        type="button"
                        onClick={() => handleRevokeShare(share.id)}
                        className="px-3.5 py-2 rounded-xl border border-red-300 text-red-700 hover:bg-red-50 font-semibold text-xs flex items-center gap-1.5 self-start sm:self-center transition-colors shadow-2xs"
                      >
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span>{t.vault.revokeBtn}</span>
                      </button>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500 space-y-2">
                <Lock className="w-8 h-8 text-slate-300 mx-auto" />
                <p>No active document shares. Your medical records are 100% private to you.</p>
                <button
                  type="button"
                  onClick={() => setShowGrantForm(true)}
                  className="text-xs font-semibold text-[#0F8B8D] hover:underline"
                >
                  + Grant Sharing Access
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SHARING AUDIT TRAIL */}
        {activeTab === 'AUDIT_TRAIL' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-[#102A43]">
                Immutable Sharing &amp; Access Audit Trail
              </h3>
              <span className="text-xs text-slate-400">
                Total Events: {auditLogs.length}
              </span>
            </div>

            <div className="space-y-3">
              {auditLogs.length > 0 ? (
                auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#102A43]">
                          {log.actionType.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          [{log.resourceType}]
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600">
                        {log.details ? JSON.stringify(log.details) : 'N/A'}
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 shrink-0 sm:text-right">
                      <div>{new Date(log.timestamp).toLocaleString()}</div>
                      <div className="font-mono text-[9px]">ID: {log.id}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  No document sharing events logged yet.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
