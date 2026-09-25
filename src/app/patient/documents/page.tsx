'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { dataStore } from '../../../lib/store';
import { offlineSyncEngine } from '../../../lib/offline-sync';
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
  Camera,
  Edit2,
  AlertTriangle,
  Lock,
  CloudOff,
  RefreshCw,
  Clock,
  Shield,
  FileCheck,
} from 'lucide-react';

const ALL_CATEGORIES: DocumentCategory[] = [
  'APPOINTMENT_LETTER',
  'MEDICAL_REPORT',
  'LABORATORY_REPORT',
  'PRESCRIPTION',
  'REFERRAL_LETTER',
  'DISCHARGE_SUMMARY',
  'VACCINATION_RECORD',
  'MEDICAL_CERTIFICATE',
  'IMAGING_SCAN',
  'OTHER',
];

export default function DocumentVaultPage() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [documents, setDocuments] = useState<HealthDocument[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activePreviewDoc, setActivePreviewDoc] = useState<HealthDocument | null>(null);

  // Rename document state
  const [docToRename, setDocToRename] = useState<HealthDocument | null>(null);
  const [renameValue, setRenameValue] = useState('');

  // Upload wizard state
  const [uploadStep, setUploadStep] = useState<
    'SELECT' | 'PROGRESS' | 'OCR_CONFIRM' | 'DETAILS'
  >('SELECT');
  const [tempFile, setTempFile] = useState<File | null>(null);
  const [filePreviewDataUrl, setFilePreviewDataUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadProgressStage, setUploadProgressStage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Form fields
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState<DocumentCategory>('LABORATORY_REPORT');
  const [hospital, setHospital] = useState('');
  const [doctor, setDoctor] = useState('');
  const [department, setDepartment] = useState('');
  const [docDate, setDocDate] = useState('');
  const [description, setDescription] = useState('');
  const [extractedOcrValues, setExtractedOcrValues] = useState<Record<string, string>>({});

  const loadDocuments = () => {
    if (currentUser) {
      setDocuments(dataStore.getDocuments(currentUser.id));
    }
  };

  useEffect(() => {
    loadDocuments();
    const unsubscribe = offlineSyncEngine.subscribe(() => {
      loadDocuments();
    });
    return () => unsubscribe();
  }, [currentUser]);

  const filteredDocs = documents.filter((doc) => {
    const matchesCategory =
      selectedCategory === 'ALL' || doc.category === selectedCategory;
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.hospitalName &&
        doc.hospitalName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doc.doctorName &&
        doc.doctorName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Safe file validation & progress simulation
  const processChosenFile = (file: File) => {
    setErrorMessage('');

    // File type validation
    const validExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
    const lowerName = file.name.toLowerCase();
    const isValidType = validExtensions.some((ext) => lowerName.endsWith(ext));
    if (!isValidType) {
      setErrorMessage(
        'Invalid file format. Supported file formats: PDF, JPG, JPEG, PNG.'
      );
      return;
    }

    // File size validation (15 MB maximum)
    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 15MB limit. Please upload a smaller file.');
      return;
    }

    setTempFile(file);

    // Sanitize title from safe file name
    const sanitizedTitle = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_\-\s]/g, '')
      .replace(/_/g, ' ')
      .trim();
    setDocTitle(sanitizedTitle || 'Health Document');

    // Create thumbnail / preview URL for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFilePreviewDataUrl(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreviewDataUrl(null);
    }

    // Step to PROGRESS
    setUploadStep('PROGRESS');
    setUploadProgress(15);
    setUploadProgressStage('Scanning file with security filters...');

    setTimeout(() => {
      setUploadProgress(45);
      setUploadProgressStage('Running Optical Character Recognition (OCR)...');
    }, 400);

    setTimeout(() => {
      setUploadProgress(85);
      setUploadProgressStage('Extracting clinical entities & metadata...');

      // Run client-side OCR analysis
      const ocrResult = simulateOcrExtraction(file.name, file.size);
      setHospital(ocrResult.suggestedHospitalName || 'District HQ Hospital');
      setDoctor(ocrResult.suggestedDoctorName || 'Consultant Specialist');
      setDepartment(ocrResult.suggestedDepartment || 'General Medicine');
      setDocDate(ocrResult.suggestedDate || new Date().toISOString().split('T')[0]);
      setExtractedOcrValues(ocrResult.extractedLabValues);
      if (ocrResult.suggestedDocumentType) {
        setDocCategory(ocrResult.suggestedDocumentType);
      }
    }, 900);

    setTimeout(() => {
      setUploadProgress(100);
      setUploadProgressStage('Ready for patient confirmation');
      setUploadStep('OCR_CONFIRM');
    }, 1300);
  };

  const handleFileChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processChosenFile(file);
  };

  const handleSaveDocument = async () => {
    if (!currentUser || !tempFile) return;

    const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;

    // Safe sanitized file name
    const safeName = tempFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const securePath = `vault/${currentUser.id}/${Date.now()}_${safeName}`;

    const newDoc: HealthDocument = {
      id: `doc-${Date.now()}`,
      ownerId: currentUser.id,
      title: docTitle.trim() || 'Untitled Health Document',
      category: docCategory,
      hospitalName: hospital,
      doctorName: doctor,
      documentDate: docDate,
      uploadDate: new Date().toISOString().split('T')[0],
      description,
      fileName: safeName,
      fileSizeBytes: tempFile.size,
      mimeType: tempFile.type || 'application/pdf',
      filePreviewUrl: filePreviewDataUrl || undefined,
      secureFilePath: securePath,
      signedUrlExpiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      ocrExtractedMetadata: extractedOcrValues,
      isVerifiedByPatient: true,
      syncStatus: isOffline ? 'SAVED_OFFLINE' : 'SUCCESSFULLY_SYNCHRONIZED',
    };

    if (isOffline) {
      await offlineSyncEngine.saveOfflineDocument(newDoc);
      setToastMessage(
        `${t.vault.savedLocally}. ${t.vault.offlineSecureNotice}`
      );
    } else {
      dataStore.addDocument(newDoc);
      setToastMessage('Document stored securely in private vault!');
    }

    loadDocuments();
    setShowUploadModal(false);
    setUploadStep('SELECT');
    setTempFile(null);
    setFilePreviewDataUrl(null);
    setTimeout(() => setToastMessage(''), 4500);
  };

  const handleRenameConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docToRename || !renameValue.trim()) return;

    dataStore.renameDocument(docToRename.id, renameValue.trim());
    loadDocuments();
    setDocToRename(null);
    setToastMessage('Document title updated successfully.');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleDelete = (docId: string) => {
    if (window.confirm(t.vault.confirmDelete)) {
      dataStore.deleteDocument(docId);
      loadDocuments();
      setToastMessage('Document deleted and all active sharing permissions revoked.');
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  const handleDownload = (doc: HealthDocument) => {
    dataStore.logDocumentDownload(doc.id, doc.title, currentUser?.id);

    const content = `
TRIAGEBRIDGE SECURE VAULT DOCUMENT
==================================
Title: ${doc.title}
Category: ${doc.category}
Facility: ${doc.hospitalName || 'Not specified'}
Doctor: ${doc.doctorName || 'Not specified'}
Document Date: ${doc.documentDate || 'N/A'}
Upload Date: ${doc.uploadDate}
Verified by Patient: ${doc.isVerifiedByPatient}
Secure Storage Path: ${doc.secureFilePath || 'private-vault/encrypted-record'}
Signed URL Expiry: ${doc.signedUrlExpiresAt || 'Standard 60-min token'}

OCR Extracted Metadata:
${JSON.stringify(doc.ocrExtractedMetadata, null, 2)}
==================================
* Note: Private patient record managed by TriageBridge Secure Document Vault.
    `.trim();

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${doc.fileName}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getCategoryLabel = (cat: DocumentCategory | string) => {
    if (cat === 'ALL') return t.vault.allCategories;
    const catKeys = t.vault.categories as Record<string, string> | undefined;
    if (catKeys && catKeys[cat]) return catKeys[cat];
    return cat.replace(/_/g, ' ');
  };

  return (
    <div className="flex-1 bg-[#F7FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FolderLock className="w-6 h-6 text-[#0F8B8D]" />
              <h1 className="text-2xl font-bold text-[#102A43]">
                {t.vault.title}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {t.vault.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => router.push('/patient/documents/sharing')}
              className="py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              <Share2 className="w-4 h-4 text-[#0F8B8D]" />
              <span>{t.vault.shareManager}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowUploadModal(true);
                setUploadStep('SELECT');
                setErrorMessage('');
              }}
              className="py-2.5 px-4 rounded-xl bg-[#0F8B8D] hover:bg-[#0c7375] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{t.vault.uploadBtn}</span>
            </button>
          </div>
        </div>

        {/* AI Disclaimer & Zero-Trust Notice */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-[#0F8B8D] shrink-0" />
            <span className="font-medium">{t.vault.aiExtractionDisclaimer}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-slate-500 shrink-0" />
            <span>
              Private by default. Healthcare workers only see records explicitly shared.
            </span>
          </div>
        </div>

        {toastMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fade-in shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{toastMessage}</span>
          </div>
        )}

        {/* Search and Category Filters */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.vault.searchPlaceholder}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#0F8B8D]/30 bg-white"
              />
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Showing {filteredDocs.length} of {documents.length} records
            </div>
          </div>

          {/* 10 Categories Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs scrollbar-thin">
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition-all ${
                selectedCategory === 'ALL'
                  ? 'bg-[#102A43] text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t.vault.allCategories}
            </button>

            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#102A43] text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {getCategoryLabel(cat)}
              </button>
            ))}
          </div>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocs.length > 0 ? (
            filteredDocs.map((doc) => {
              const isOffline = doc.syncStatus === 'SAVED_OFFLINE';
              return (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-[#0F8B8D] p-5 shadow-xs flex flex-col justify-between space-y-4 group transition-all"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0F8B8D] flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {getCategoryLabel(doc.category)}
                        </span>
                        {isOffline && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                            <CloudOff className="w-2.5 h-2.5 text-amber-600" />
                            <span>Saved Locally</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-[#102A43] group-hover:text-[#0F8B8D] line-clamp-2">
                      {doc.title}
                    </h3>

                    <div className="text-[11px] text-slate-500 space-y-0.5">
                      <div>Facility: {doc.hospitalName || 'Health Center'}</div>
                      <div>Doctor: {doc.doctorName || 'Consultant Specialist'}</div>
                      <div>Date: {doc.documentDate || doc.uploadDate}</div>
                      <div className="font-mono text-[10px] text-slate-400">
                        {doc.fileName} ({Math.round((doc.fileSizeBytes || 0) / 1024)} KB)
                      </div>
                    </div>

                    {doc.ocrExtractedMetadata &&
                      Object.keys(doc.ocrExtractedMetadata).length > 0 && (
                        <div className="p-2.5 rounded-lg bg-teal-50/60 border border-teal-100 text-[11px] text-slate-700 space-y-1">
                          <div className="font-semibold text-teal-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-teal-600" />
                            <span>OCR Findings:</span>
                          </div>
                          <div className="text-[10px] text-slate-600 line-clamp-2">
                            {Object.entries(doc.ocrExtractedMetadata)
                              .slice(0, 2)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(' • ')}
                          </div>
                        </div>
                      )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setActivePreviewDoc(doc)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#0F8B8D] hover:bg-slate-50 transition-colors"
                        title={t.vault.previewDoc}
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownload(doc)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#0F8B8D] hover:bg-slate-50 transition-colors"
                        title={t.vault.downloadDoc}
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setDocToRename(doc);
                          setRenameValue(doc.title);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#0F8B8D] hover:bg-slate-50 transition-colors"
                        title={t.vault.renameDoc}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => router.push('/patient/documents/sharing')}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#0F8B8D] hover:bg-slate-50 transition-colors"
                        title="Controlled Share"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(doc.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title={t.vault.deleteDoc}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500 space-y-3">
              <FolderLock className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-medium text-slate-600">
                No health documents found matching this filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setShowUploadModal(true);
                  setUploadStep('SELECT');
                }}
                className="text-xs font-semibold text-[#0F8B8D] hover:underline"
              >
                + Upload New Health Document
              </button>
            </div>
          )}
        </div>

        {/* Upload Modal (Wizard: SELECT -> PROGRESS -> OCR_CONFIRM -> DETAILS) */}
        {showUploadModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4 my-8">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#0F8B8D]" />
                  <h3 className="text-sm font-bold text-[#102A43]">
                    {uploadStep === 'SELECT' && 'Secure Health Document Upload'}
                    {uploadStep === 'PROGRESS' && 'Processing & OCR Analysis'}
                    {uploadStep === 'OCR_CONFIRM' && 'Verify AI Extracted Findings'}
                    {uploadStep === 'DETAILS' && 'Document Classification & Metadata'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* STEP 1: SELECT FILE / CAMERA */}
              {uploadStep === 'SELECT' && (
                <div className="space-y-4 text-center py-4">
                  <div className="border-2 border-dashed border-slate-300 hover:border-[#0F8B8D] rounded-2xl p-8 cursor-pointer transition-all bg-slate-50/50">
                    <input
                      type="file"
                      id="vault-file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleFileChosen}
                      className="hidden"
                    />
                    <label htmlFor="vault-file" className="cursor-pointer block space-y-2">
                      <Upload className="w-10 h-10 text-slate-400 mx-auto" />
                      <span className="text-xs font-semibold text-[#0F8B8D] block">
                        Select PDF, JPG, JPEG or PNG file from device
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        Maximum file size: 15MB • Private encrypted storage
                      </span>
                    </label>
                  </div>

                  <div className="flex items-center justify-center gap-3">
                    <span className="text-slate-400 text-xs">— OR —</span>
                  </div>

                  {/* Mobile Camera Scan Option */}
                  <div>
                    <input
                      type="file"
                      id="camera-scan"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileChosen}
                      className="hidden"
                    />
                    <label
                      htmlFor="camera-scan"
                      className="cursor-pointer py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs inline-flex items-center justify-center gap-2 w-full transition-all border border-slate-200"
                    >
                      <Camera className="w-4 h-4 text-[#0F8B8D]" />
                      <span>{t.vault.cameraScanBtn} (Physical Slip / Prescription)</span>
                    </label>
                  </div>
                </div>
              )}

              {/* STEP 2: UPLOAD PROGRESS */}
              {uploadStep === 'PROGRESS' && (
                <div className="py-8 space-y-4 text-center">
                  <RefreshCw className="w-8 h-8 text-[#0F8B8D] animate-spin mx-auto" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-[#102A43]">
                      {uploadProgressStage}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Processing {tempFile?.name}...
                    </p>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-[#0F8B8D] h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: OCR CONFIRMATION */}
              {uploadStep === 'OCR_CONFIRM' && (
                <div className="space-y-3.5 text-xs">
                  <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#0F8B8D]" />
                      <span>{t.vault.aiExtractionDisclaimer}</span>
                    </div>
                    <p className="text-[11px] text-teal-800">
                      Our OCR system extracted the clinical findings below. Please verify each entry against your physical document before confirming.
                    </p>
                  </div>

                  {/* Thumbnail if Image */}
                  {filePreviewDataUrl && (
                    <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                      <img
                        src={filePreviewDataUrl}
                        alt="Document Preview"
                        className="w-14 h-14 object-cover rounded-lg border border-slate-200"
                      />
                      <div className="text-[11px] text-slate-600">
                        <div className="font-semibold text-slate-800">{tempFile?.name}</div>
                        <div>{Math.round((tempFile?.size || 0) / 1024)} KB • Image Scan</div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {Object.entries(extractedOcrValues).map(([key, val]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200 gap-2"
                      >
                        <span className="font-semibold text-slate-700 shrink-0">{key}:</span>
                        <input
                          type="text"
                          defaultValue={val}
                          onChange={(e) => {
                            setExtractedOcrValues({
                              ...extractedOcrValues,
                              [key]: e.target.value,
                            });
                          }}
                          className="px-2 py-1 rounded border text-xs bg-white text-right font-mono flex-1 max-w-[220px]"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[10px]">
                    * TriageBridge does not diagnose, prescribe, or recommend treatment based on uploaded documents.
                  </div>

                  <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setUploadStep('SELECT')}
                      className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-600 font-semibold"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadStep('DETAILS')}
                      className="px-4 py-2 rounded-xl bg-[#0F8B8D] text-white font-semibold shadow-xs"
                    >
                      {t.vault.confirmOcrBtn} &amp; Categorize
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: DETAILS & CLASSIFICATION */}
              {uploadStep === 'DETAILS' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-[#102A43] mb-1">
                      Document Title *
                    </label>
                    <input
                      type="text"
                      value={docTitle}
                      onChange={(e) => setDocTitle(e.target.value)}
                      required
                      placeholder="e.g. CBC Blood Test Report"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-[#102A43] mb-1">
                        Category *
                      </label>
                      <select
                        value={docCategory}
                        onChange={(e) => setDocCategory(e.target.value as DocumentCategory)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                      >
                        {ALL_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {getCategoryLabel(cat)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-[#102A43] mb-1">
                        Document Date *
                      </label>
                      <input
                        type="date"
                        value={docDate}
                        onChange={(e) => setDocDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-[#102A43] mb-1">
                        Hospital / Health Facility
                      </label>
                      <input
                        type="text"
                        value={hospital}
                        onChange={(e) => setHospital(e.target.value)}
                        placeholder="e.g. SCB Medical College"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#102A43] mb-1">
                        Doctor / Consultant Name
                      </label>
                      <input
                        type="text"
                        value={doctor}
                        onChange={(e) => setDoctor(e.target.value)}
                        placeholder="e.g. Dr. P. K. Dash"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#102A43] mb-1">
                      Optional Clinical Notes or Description
                    </label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g. Follow-up diagnostic scan for chest congestion"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>

                  <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setUploadStep('OCR_CONFIRM')}
                      className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-600 font-semibold"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveDocument}
                      className="px-5 py-2 rounded-xl bg-[#0F8B8D] text-white font-semibold shadow-xs"
                    >
                      Securely Store Document
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Rename Document Modal */}
        {docToRename && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-[#0F8B8D]" />
                  <h3 className="text-sm font-bold text-[#102A43]">
                    {t.vault.renameDoc}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setDocToRename(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRenameConfirm} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#102A43] mb-1">
                    New Document Title *
                  </label>
                  <input
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setDocToRename(null)}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#0F8B8D] text-white font-semibold shadow-xs"
                  >
                    Update Title
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Document Preview Modal */}
        {activePreviewDoc && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full p-6 space-y-4 my-8">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#0F8B8D]" />
                  <h3 className="text-sm font-bold text-[#102A43] truncate max-w-md">
                    {activePreviewDoc.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActivePreviewDoc(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {/* Image preview if image */}
                {activePreviewDoc.filePreviewUrl && (
                  <div className="p-3 bg-slate-900 rounded-xl flex items-center justify-center overflow-hidden max-h-64">
                    <img
                      src={activePreviewDoc.filePreviewUrl}
                      alt={activePreviewDoc.title}
                      className="max-h-60 object-contain rounded-lg"
                    />
                  </div>
                )}

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span>
                      Category: <strong>{getCategoryLabel(activePreviewDoc.category)}</strong>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                      Signed Token Active (Expires in 60m)
                    </span>
                  </div>
                  <div>Facility: <strong>{activePreviewDoc.hospitalName || 'N/A'}</strong></div>
                  <div>Doctor: <strong>{activePreviewDoc.doctorName || 'N/A'}</strong></div>
                  <div>Date: <strong>{activePreviewDoc.documentDate || activePreviewDoc.uploadDate}</strong></div>
                  <div>
                    File: <strong>{activePreviewDoc.fileName}</strong> (
                    {Math.round((activePreviewDoc.fileSizeBytes || 0) / 1024)} KB)
                  </div>
                  <div className="font-mono text-[10px] text-slate-400 truncate">
                    Storage Path: {activePreviewDoc.secureFilePath || `vault/${activePreviewDoc.ownerId}/${activePreviewDoc.fileName}`}
                  </div>
                </div>

                {activePreviewDoc.description && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-[#102A43] block mb-0.5">Notes:</span>
                    <p className="text-slate-600">{activePreviewDoc.description}</p>
                  </div>
                )}

                {activePreviewDoc.ocrExtractedMetadata &&
                  Object.keys(activePreviewDoc.ocrExtractedMetadata).length > 0 && (
                    <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-200 space-y-2">
                      <span className="font-bold text-[#0F8B8D]">
                        OCR Verified Findings:
                      </span>
                      <pre className="text-[11px] font-mono text-slate-700 bg-white p-2.5 rounded-lg border border-teal-100 overflow-x-auto">
                        {JSON.stringify(activePreviewDoc.ocrExtractedMetadata, null, 2)}
                      </pre>
                    </div>
                  )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => router.push('/patient/documents/sharing')}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-1.5"
                >
                  <Share2 className="w-4 h-4 text-[#0F8B8D]" />
                  <span>Share Access</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownload(activePreviewDoc)}
                    className="px-4 py-2 rounded-xl bg-[#0F8B8D] text-white font-semibold flex items-center gap-1.5 shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download File</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePreviewDoc(null)}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
