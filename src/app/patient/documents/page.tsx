'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { dataStore } from '../../../lib/store';
import { HealthDocument, DocumentCategory } from '../../../lib/types';
import { simulateOcrExtraction } from '../../../lib/ocr-simulator';
import {
  FolderLock,
  Plus,
  Search,
  Upload,
  FileText,
  Trash2,
  Download,
  Eye,
  Share2,
  CheckCircle2,
  Sparkles,
  X,
  ShieldAlert,
} from 'lucide-react';

export default function DocumentVaultPage() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [documents, setDocuments] = useState<HealthDocument[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activePreviewDoc, setActivePreviewDoc] = useState<HealthDocument | null>(null);

  // Upload wizard state
  const [uploadStep, setUploadStep] = useState<'SELECT' | 'OCR_CONFIRM' | 'DETAILS'>('SELECT');
  const [tempFile, setTempFile] = useState<File | null>(null);
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState<DocumentCategory>('LABORATORY_REPORT');
  const [hospital, setHospital] = useState('');
  const [doctor, setDoctor] = useState('');
  const [docDate, setDocDate] = useState('');
  const [description, setDescription] = useState('');
  const [extractedOcrValues, setExtractedOcrValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (currentUser) {
      setDocuments(dataStore.getDocuments(currentUser.id));
    }
  }, [currentUser]);

  const filteredDocs = documents.filter(doc => {
    const matchesCategory = selectedCategory === 'ALL' || doc.category === selectedCategory;
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.hospitalName && doc.hospitalName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doc.doctorName && doc.doctorName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleFileChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setTempFile(file);
    setDocTitle(file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));

    // Run client-side OCR analysis
    const ocrResult = simulateOcrExtraction(file.name, file.size);
    setHospital(ocrResult.suggestedHospitalName || 'District HQ Hospital');
    setDoctor(ocrResult.suggestedDoctorName || 'Consultant Specialist');
    setDocDate(ocrResult.suggestedDate || new Date().toISOString().split('T')[0]);
    setExtractedOcrValues(ocrResult.extractedLabValues);

    setUploadStep('OCR_CONFIRM');
  };

  const handleSaveDocument = () => {
    if (!currentUser || !tempFile) return;

    const newDoc: HealthDocument = {
      id: `doc-${Date.now()}`,
      ownerId: currentUser.id,
      title: docTitle,
      category: docCategory,
      hospitalName: hospital,
      doctorName: doctor,
      documentDate: docDate,
      uploadDate: new Date().toISOString().split('T')[0],
      description,
      fileName: tempFile.name,
      fileSizeBytes: tempFile.size,
      mimeType: tempFile.type || 'application/pdf',
      ocrExtractedMetadata: extractedOcrValues,
      isVerifiedByPatient: true,
    };

    dataStore.addDocument(newDoc);
    setDocuments(dataStore.getDocuments(currentUser.id));
    setShowUploadModal(false);
    setUploadStep('SELECT');
    setTempFile(null);
  };

  const handleDelete = (docId: string) => {
    if (window.confirm(t.vault.confirmDelete)) {
      dataStore.deleteDocument(docId);
      if (currentUser) {
        setDocuments(dataStore.getDocuments(currentUser.id));
      }
    }
  };

  const handleDownload = (doc: HealthDocument) => {
    const content = `
TRIAGEBRIDGE SECURE VAULT DOCUMENT
==================================
Title: ${doc.title}
Category: ${doc.category}
Hospital: ${doc.hospitalName}
Doctor: ${doc.doctorName}
Document Date: ${doc.documentDate}
Verified by Patient: ${doc.isVerifiedByPatient}
Extracted Metadata:
${JSON.stringify(doc.ocrExtractedMetadata, null, 2)}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${doc.fileName}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 bg-[#F7FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#102A43]">
              {t.vault.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              {t.vault.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => router.push('/patient/documents/sharing')}
              className="py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors"
            >
              <Share2 className="w-4 h-4 text-[#0F8B8D]" />
              <span>{t.vault.shareManager}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowUploadModal(true);
                setUploadStep('SELECT');
              }}
              className="py-2.5 px-4 rounded-xl bg-[#0F8B8D] hover:bg-[#0c7375] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{t.vault.uploadBtn}</span>
            </button>
          </div>
        </div>

        {/* AI Summary Notice */}
        <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#0F8B8D] shrink-0" />
          <span>{t.brand.docAiNotice}</span>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={t.vault.searchPlaceholder}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#0F8B8D]/30"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {['ALL', 'LABORATORY_REPORT', 'DISCHARGE_SUMMARY', 'IMAGING_SCAN', 'PRESCRIPTION'].map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#102A43] text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat === 'ALL' ? t.vault.allCategories : cat.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Document Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocs.length > 0 ? (
            filteredDocs.map(doc => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-[#0F8B8D] p-5 shadow-xs flex flex-col justify-between space-y-4 group transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#0F8B8D] flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {doc.category.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#102A43] group-hover:text-[#0F8B8D] line-clamp-1">
                    {doc.title}
                  </h3>

                  <div className="text-[11px] text-slate-500 space-y-0.5">
                    <div>Facility: {doc.hospitalName || 'Health Center'}</div>
                    <div>Doctor: {doc.doctorName || 'Consultant'}</div>
                    <div>Date: {doc.documentDate || doc.uploadDate}</div>
                  </div>

                  {doc.ocrExtractedMetadata && Object.keys(doc.ocrExtractedMetadata).length > 0 && (
                    <div className="p-2.5 rounded-lg bg-teal-50/60 border border-teal-100 text-[11px] text-slate-700 space-y-1">
                      <div className="font-semibold text-teal-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-teal-600" />
                        <span>OCR Verified Findings:</span>
                      </div>
                      <div className="text-[10px] text-slate-600 line-clamp-2">
                        {Object.entries(doc.ocrExtractedMetadata).slice(0, 2).map(([k, v]) => `${k}: ${v}`).join(' • ')}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setActivePreviewDoc(doc)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-[#0F8B8D] hover:bg-slate-50"
                      title={t.vault.previewDoc}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownload(doc)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-[#0F8B8D] hover:bg-slate-50"
                      title={t.vault.downloadDoc}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push('/patient/documents/sharing')}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-[#0F8B8D] hover:bg-slate-50"
                      title="Share document"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(doc.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                    title={t.vault.deleteDoc}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500">
              No health documents found. Upload your medical reports or prescription cards.
            </div>
          )}
        </div>

        {/* Upload Modal with 3-step OCR verification */}
        {showUploadModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-[#102A43]">
                  {uploadStep === 'SELECT' && 'Select Health Document'}
                  {uploadStep === 'OCR_CONFIRM' && 'Verify OCR Extracted Metadata'}
                  {uploadStep === 'DETAILS' && 'Document Classification'}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {uploadStep === 'SELECT' && (
                <div className="space-y-4 text-center py-4">
                  <div className="border-2 border-dashed border-slate-300 hover:border-[#0F8B8D] rounded-xl p-8 cursor-pointer">
                    <input
                      type="file"
                      id="vault-file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleFileChosen}
                      className="hidden"
                    />
                    <label htmlFor="vault-file" className="cursor-pointer block space-y-2">
                      <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                      <span className="text-xs font-semibold text-[#0F8B8D] block">
                        Select file from device or camera scan
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        PDF, JPG, JPEG, PNG (Max 15MB)
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {uploadStep === 'OCR_CONFIRM' && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-lg bg-teal-50 border border-teal-200 text-teal-900">
                    <span className="font-semibold">{t.vault.ocrPrompt}:</span>
                    <p className="text-[11px] text-teal-800 mt-0.5">
                      Please verify and confirm the extracted values before saving.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {Object.entries(extractedOcrValues).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border">
                        <span className="font-medium text-slate-700">{key}:</span>
                        <input
                          type="text"
                          defaultValue={val}
                          onChange={e => {
                            setExtractedOcrValues({ ...extractedOcrValues, [key]: e.target.value });
                          }}
                          className="px-2 py-1 rounded border text-xs bg-white text-right font-mono"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setUploadStep('SELECT')}
                      className="px-3 py-2 rounded-lg border text-slate-600 font-semibold"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadStep('DETAILS')}
                      className="px-4 py-2 rounded-lg bg-[#0F8B8D] text-white font-semibold"
                    >
                      {t.vault.confirmOcrBtn}
                    </button>
                  </div>
                </div>
              )}

              {uploadStep === 'DETAILS' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-[#102A43] mb-1">
                      Document Title
                    </label>
                    <input
                      type="text"
                      value={docTitle}
                      onChange={e => setDocTitle(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-[#102A43] mb-1">
                        Category
                      </label>
                      <select
                        value={docCategory}
                        onChange={e => setDocCategory(e.target.value as DocumentCategory)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                      >
                        <option value="LABORATORY_REPORT">Laboratory Report</option>
                        <option value="MEDICAL_REPORT">Medical Report</option>
                        <option value="PRESCRIPTION">Prescription</option>
                        <option value="DISCHARGE_SUMMARY">Discharge Summary</option>
                        <option value="IMAGING_SCAN">Imaging / X-Ray / Scan</option>
                        <option value="APPOINTMENT_LETTER">Appointment Letter</option>
                        <option value="REFERRAL_LETTER">Referral Letter</option>
                        <option value="VACCINATION_RECORD">Vaccination Record</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-[#102A43] mb-1">
                        Document Date
                      </label>
                      <input
                        type="date"
                        value={docDate}
                        onChange={e => setDocDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-[#102A43] mb-1">
                        Hospital / Health Facility
                      </label>
                      <input
                        type="text"
                        value={hospital}
                        onChange={e => setHospital(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#102A43] mb-1">
                        Doctor Name
                      </label>
                      <input
                        type="text"
                        value={doctor}
                        onChange={e => setDoctor(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#102A43] mb-1">
                      Notes or Clinical Summary
                    </label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="e.g. Follow-up test requested by medicine OPD"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setUploadStep('OCR_CONFIRM')}
                      className="px-3 py-2 rounded-lg border text-slate-600 font-semibold"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveDocument}
                      className="px-4 py-2 rounded-lg bg-[#0F8B8D] text-white font-semibold"
                    >
                      Securely Store Document
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Document Preview Modal */}
        {activePreviewDoc && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-[#102A43] truncate max-w-md">
                  {activePreviewDoc.title}
                </h3>
                <button
                  type="button"
                  onClick={() => setActivePreviewDoc(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border space-y-1">
                  <div>Facility: <strong>{activePreviewDoc.hospitalName}</strong></div>
                  <div>Doctor: <strong>{activePreviewDoc.doctorName}</strong></div>
                  <div>Date: <strong>{activePreviewDoc.documentDate}</strong></div>
                  <div>File: <strong>{activePreviewDoc.fileName}</strong> ({Math.round(activePreviewDoc.fileSizeBytes / 1024)} KB)</div>
                </div>

                {activePreviewDoc.ocrExtractedMetadata && (
                  <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-200 space-y-2">
                    <span className="font-bold text-[#0F8B8D]">OCR Extracted Values:</span>
                    <pre className="text-[11px] font-mono text-slate-700 bg-white p-2.5 rounded border border-teal-100 overflow-x-auto">
                      {JSON.stringify(activePreviewDoc.ocrExtractedMetadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleDownload(activePreviewDoc)}
                  className="px-4 py-2 rounded-lg bg-[#0F8B8D] text-white font-semibold flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Download File</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewDoc(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
