'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { dataStore } from '../../../lib/store';
import { NotificationItem, TriageCase } from '../../../lib/types';
import { Bell, MessageSquare, Send, CheckCircle2, ShieldCheck, Clock } from 'lucide-react';

export default function PatientMessagesPage() {
  const { currentUser } = useAuth();
  const { t, locale } = useLanguage();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [cases, setCases] = useState<TriageCase[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [outgoingText, setOutgoingText] = useState('');
  const [sentSuccess, setSentSuccess] = useState('');

  useEffect(() => {
    if (currentUser) {
      setNotifications(dataStore.getNotifications(currentUser.id));
      const userCases = dataStore.getCasesByPatientId(currentUser.id);
      setCases(userCases);
      if (userCases.length > 0) {
        setSelectedCaseId(userCases[0].id);
      }
    }
  }, [currentUser]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!outgoingText.trim() || !selectedCaseId || !currentUser) return;

    const targetCase = cases.find(c => c.id === selectedCaseId);

    // Audit log message
    dataStore.addAuditLog({
      id: `audit-${Date.now()}`,
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      actorRole: 'PATIENT',
      actionType: 'TRIAGE_SUBMISSION',
      resourceType: 'SECURE_MESSAGE',
      resourceId: selectedCaseId,
      details: { caseNumber: targetCase?.caseNumber, messageText: outgoingText },
      timestamp: new Date().toISOString(),
    });

    setSentSuccess(`Message sent to Duty Medical Officer for case ${targetCase?.caseNumber}.`);
    setOutgoingText('');
    setTimeout(() => setSentSuccess(''), 4000);
  };

  return (
    <div className="flex-1 bg-[#F7FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#102A43]">
            {t.nav.messages} &amp; Notifications
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Case-linked secure communications with your treating healthcare unit.
          </p>
        </div>

        {sentSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{sentSuccess}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Notifications Panel */}
          <div className="md:col-span-6 space-y-4">
            <h2 className="text-sm font-bold text-[#102A43] flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#0F8B8D]" />
              <span>Official Case Notifications</span>
            </h2>

            <div className="space-y-3">
              {notifications.length > 0 ? (
                notifications.map(n => {
                  const title = locale === 'or' ? n.titleOr : locale === 'hi' ? n.titleHi : n.titleEn;
                  const body = locale === 'or' ? n.bodyOr : locale === 'hi' ? n.bodyHi : n.bodyEn;
                  return (
                    <div
                      key={n.id}
                      className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#102A43]">{title}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{body}</p>
                    </div>
                  );
                })
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                  No notifications at this time.
                </div>
              )}
            </div>
          </div>

          {/* Secure Case Inquiry Form */}
          <div className="md:col-span-6 space-y-4">
            <h2 className="text-sm font-bold text-[#102A43] flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#0F8B8D]" />
              <span>Send Clarification on Case</span>
            </h2>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <form onSubmit={handleSendMessage} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#102A43] mb-1">
                    Select Active Case Reference
                  </label>
                  <select
                    value={selectedCaseId}
                    onChange={e => setSelectedCaseId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
                  >
                    {cases.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.caseNumber} - {c.chiefComplaint.slice(0, 35)}...
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#102A43] mb-1">
                    Your Message to Reviewing Doctor / Nurse
                  </label>
                  <textarea
                    rows={4}
                    value={outgoingText}
                    onChange={e => setOutgoingText(e.target.value)}
                    placeholder="e.g. My fever reduced to 99°F after paracetamol, but mild cough persists..."
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#0F8B8D]/30"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#0F8B8D] hover:bg-[#0c7375] text-white font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <Send className="w-4 h-4" />
                  <span>Transmit to Clinical Review Desk</span>
                </button>
              </form>

              <div className="p-3 bg-slate-50 rounded-xl border text-[11px] text-slate-500 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0F8B8D] shrink-0 mt-0.5" />
                <span>All messages are appended to your permanent clinical audit timeline.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
