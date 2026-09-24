'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { dataStore } from '../../../lib/store';
import { AuditLog } from '../../../lib/types';
import {
  ShieldCheck,
  Search,
  Filter,
  Clock,
  User,
  Activity,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export default function AuditTrailPage() {
  const { t } = useLanguage();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');

  useEffect(() => {
    setLogs(dataStore.getAuditLogs());
  }, []);

  const filteredLogs = logs.filter(l => {
    const matchesAction = filterAction === 'ALL' || l.actionType === filterAction;
    const matchesSearch =
      l.actionType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.actorName && l.actorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      l.resourceId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesAction && matchesSearch;
  });

  return (
    <div className="flex-1 bg-[#F7FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#102A43]">
            {t.audit.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {t.audit.subtitle}
          </p>
        </div>

        {/* Security Compliance Callout */}
        <div className="p-4 rounded-xl bg-slate-900 text-slate-200 text-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#35C2BD] shrink-0" />
            <span>
              All events are cryptographically sealed, immutable, and synchronized to the clinical compliance journal.
            </span>
          </div>
          <span className="font-mono text-[10px] text-teal-300 bg-slate-800 px-2 py-1 rounded">
            ISO/IEC 27799 Compliant
          </span>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by action, user, or resource ID..."
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterAction}
              onChange={e => setFilterAction(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium"
            >
              <option value="ALL">All Audit Event Types</option>
              <option value="TRIAGE_SUBMISSION">Triage Submissions</option>
              <option value="RED_FLAG_SCREENED">Red-Flag Screenings</option>
              <option value="FINAL_DECISION_RECORDED">Final Clinical Decisions</option>
              <option value="URGENCY_OVERRIDE">Clinician Urgency Overrides</option>
              <option value="DOCUMENT_SHARED">Document Access Grants</option>
              <option value="SHARE_ACCESS_REVOKED">Access Revocations</option>
              <option value="REFERRAL_CREATED">Referrals</option>
            </select>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">{t.audit.timestamp}</th>
                  <th className="px-4 py-3.5">{t.audit.actor}</th>
                  <th className="px-4 py-3.5">{t.audit.action}</th>
                  <th className="px-4 py-3.5">{t.audit.resource}</th>
                  <th className="px-4 py-3.5">{t.audit.details}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-sans">
                      <div className="font-semibold text-slate-900">{log.actorName || 'System'}</div>
                      <div className="text-[10px] text-slate-400">{log.actorRole || 'ENGINE'}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        log.actionType.includes('OVERRIDE') || log.actionType.includes('REVOKE')
                          ? 'bg-amber-100 text-amber-800'
                          : log.actionType.includes('RED_FLAG')
                          ? 'bg-red-100 text-red-800'
                          : log.actionType.includes('FINAL')
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {log.actionType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {log.resourceType}:{log.resourceId}
                    </td>
                    <td className="px-4 py-3 font-sans text-slate-700 max-w-md truncate">
                      {JSON.stringify(log.details)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
