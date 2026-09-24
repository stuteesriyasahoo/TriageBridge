import {
  TriageCase,
  Appointment,
  HealthDocument,
  DocumentShare,
  Referral,
  NotificationItem,
  AuditLog,
  ClinicalReview,
  PatientLocationData,
  AmbulanceRequest,
  AmbulanceRequestStatus,
  LocationAccessAudit,
} from './types';
import {
  INITIAL_TRIAGE_CASES,
  INITIAL_APPOINTMENTS,
  INITIAL_HEALTH_DOCUMENTS,
  INITIAL_DOCUMENT_SHARES,
  INITIAL_REFERRALS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_PATIENT_LOCATIONS,
  INITIAL_AMBULANCE_REQUESTS,
} from './mock-data';

const STORAGE_KEYS = {
  CASES: 'tb_cases_v1',
  APPOINTMENTS: 'tb_appointments_v1',
  DOCUMENTS: 'tb_documents_v1',
  SHARES: 'tb_shares_v1',
  REFERRALS: 'tb_referrals_v1',
  NOTIFICATIONS: 'tb_notifications_v1',
  AUDIT_LOGS: 'tb_audit_logs_v1',
  LOCATIONS: 'tb_locations_v1',
  AMBULANCES: 'tb_ambulances_v1',
};

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving to localStorage key "${key}":`, e);
  }
}

export const dataStore = {
  // --- CASES ---
  getCases(): TriageCase[] {
    return safeGet<TriageCase[]>(STORAGE_KEYS.CASES, INITIAL_TRIAGE_CASES);
  },

  getCaseById(id: string): TriageCase | undefined {
    const cases = this.getCases();
    return cases.find(c => c.id === id || c.caseNumber === id);
  },

  getCasesByPatientId(patientId: string): TriageCase[] {
    return this.getCases().filter(c => c.patientId === patientId);
  },

  addCase(newCase: TriageCase): void {
    const cases = this.getCases();
    const updated = [newCase, ...cases];
    safeSet(STORAGE_KEYS.CASES, updated);

    // Record audit event
    this.addAuditLog({
      id: `audit-${Date.now()}`,
      actorId: newCase.patientId,
      actorName: newCase.patientName,
      actorRole: 'PATIENT',
      actionType: 'TRIAGE_SUBMISSION',
      resourceType: 'TRIAGE_CASE',
      resourceId: newCase.id,
      details: {
        caseNumber: newCase.caseNumber,
        chiefComplaint: newCase.chiefComplaint,
        urgency: newCase.provisionalUrgency,
      },
      timestamp: new Date().toISOString(),
    });

    // Add in-app notification
    this.addNotification({
      id: `notif-${Date.now()}`,
      userId: newCase.patientId,
      caseId: newCase.id,
      type: 'CASE_SUBMITTED',
      titleEn: `Case ${newCase.caseNumber} Received`,
      titleHi: `मामला ${newCase.caseNumber} प्राप्त हुआ`,
      titleOr: `କେସ୍ ${newCase.caseNumber} ଦାଖଲ ହୋଇଛି`,
      bodyEn: `Your triage submission has been prioritized as ${newCase.provisionalUrgency} and queued for clinical verification.`,
      bodyHi: `आपका मामला ${newCase.provisionalUrgency} श्रेणी में क्लिनिकल समीक्षा हेतु कतारबद्ध है।`,
      bodyOr: `ଆପଣଙ୍କ କେସ୍ ${newCase.provisionalUrgency} ପ୍ରାଥମିକତା ସହିତ ଡାକ୍ତରୀ ସମୀକ୍ଷା ପାଇଁ ଯୋଡ଼ାଗଲା।`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  },

  updateCase(id: string, updates: Partial<TriageCase>): TriageCase | undefined {
    const cases = this.getCases();
    const index = cases.findIndex(c => c.id === id);
    if (index === -1) return undefined;

    const updatedCase = {
      ...cases[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    cases[index] = updatedCase;
    safeSet(STORAGE_KEYS.CASES, cases);
    return updatedCase;
  },

  reviewCase(
    caseId: string,
    review: Omit<ClinicalReview, 'id' | 'caseId' | 'reviewedAt'>
  ): TriageCase | undefined {
    const clinicalReview: ClinicalReview = {
      ...review,
      id: `review-${Date.now()}`,
      caseId,
      reviewedAt: new Date().toISOString(),
    };

    const targetCase = this.getCaseById(caseId);
    if (!targetCase) return undefined;

    const isOverridden = review.finalUrgency !== targetCase.provisionalUrgency;

    const updatedCase = this.updateCase(caseId, {
      status: 'REVIEWED',
      finalUrgency: review.finalUrgency,
      clinicalReview: {
        ...clinicalReview,
        isOverridden,
      },
    });

    // Audit log for review and possible override
    this.addAuditLog({
      id: `audit-${Date.now()}`,
      actorId: review.reviewerId,
      actorName: review.reviewerName,
      actorRole: 'DOCTOR',
      actionType: isOverridden ? 'URGENCY_OVERRIDE' : 'FINAL_DECISION_RECORDED',
      resourceType: 'TRIAGE_CASE',
      resourceId: caseId,
      details: {
        caseNumber: targetCase.caseNumber,
        originalUrgency: targetCase.provisionalUrgency,
        finalUrgency: review.finalUrgency,
        isOverridden,
        overrideReason: review.overrideReason || 'N/A',
        actionTaken: review.actionTaken,
        reviewerRegNumber: review.reviewerRegNumber,
      },
      timestamp: new Date().toISOString(),
    });

    // Notify patient
    this.addNotification({
      id: `notif-${Date.now()}`,
      userId: targetCase.patientId,
      caseId: targetCase.id,
      type: 'CASE_REVIEWED',
      titleEn: `Case ${targetCase.caseNumber} Reviewed by Clinician`,
      titleHi: `मामला ${targetCase.caseNumber} डॉक्टर द्वारा समीक्षित`,
      titleOr: `କେସ୍ ${targetCase.caseNumber} ଡାକ୍ତରୀ ସମୀକ୍ଷା ସମ୍ପନ୍ନ`,
      bodyEn: `${review.reviewerName} confirmed urgency as ${review.finalUrgency}. Action: ${review.actionTaken}`,
      bodyHi: `${review.reviewerName} ने ${review.finalUrgency} श्रेणी की पुष्टि की। निर्देश: ${review.actionTaken}`,
      bodyOr: `${review.reviewerName} ଏହାକୁ ${review.finalUrgency} ବୋଲି ନିଶ୍ଚିତ କଲେ। ପଦକ୍ଷେପ: ${review.actionTaken}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    return updatedCase;
  },

  // --- APPOINTMENTS ---
  getAppointments(patientId?: string): Appointment[] {
    const all = safeGet<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
    if (!patientId) return all;
    return all.filter(a => a.patientId === patientId);
  },

  addAppointment(appt: Appointment): void {
    const all = this.getAppointments();
    safeSet(STORAGE_KEYS.APPOINTMENTS, [appt, ...all]);

    this.addAuditLog({
      id: `audit-${Date.now()}`,
      actorId: appt.patientId,
      actorName: 'Patient / Staff',
      actionType: 'FILE_UPLOAD',
      resourceType: 'APPOINTMENT',
      resourceId: appt.id,
      details: { hospital: appt.hospitalName, doctor: appt.doctorName, date: appt.appointmentDate },
      timestamp: new Date().toISOString(),
    });
  },

  // --- DOCUMENTS (Vault) ---
  getDocuments(ownerId?: string): HealthDocument[] {
    const all = safeGet<HealthDocument[]>(STORAGE_KEYS.DOCUMENTS, INITIAL_HEALTH_DOCUMENTS);
    if (!ownerId) return all;
    return all.filter(d => d.ownerId === ownerId);
  },

  addDocument(doc: HealthDocument): void {
    const all = this.getDocuments();
    safeSet(STORAGE_KEYS.DOCUMENTS, [doc, ...all]);

    this.addAuditLog({
      id: `audit-${Date.now()}`,
      actorId: doc.ownerId,
      actionType: 'FILE_UPLOAD',
      resourceType: 'HEALTH_DOCUMENT',
      resourceId: doc.id,
      details: { fileName: doc.fileName, category: doc.category, sizeBytes: doc.fileSizeBytes },
      timestamp: new Date().toISOString(),
    });
  },

  deleteDocument(docId: string): void {
    const all = this.getDocuments();
    const filtered = all.filter(d => d.id !== docId);
    safeSet(STORAGE_KEYS.DOCUMENTS, filtered);

    // Also revoke any active shares for this document
    const shares = this.getDocumentShares();
    const updatedShares = shares.map(s => (s.documentId === docId ? { ...s, isRevoked: true } : s));
    safeSet(STORAGE_KEYS.SHARES, updatedShares);
  },

  confirmOcr(docId: string, metadata: Record<string, string>): void {
    const docs = this.getDocuments();
    const idx = docs.findIndex(d => d.id === docId);
    if (idx !== -1) {
      docs[idx].ocrExtractedMetadata = { ...docs[idx].ocrExtractedMetadata, ...metadata };
      docs[idx].isVerifiedByPatient = true;
      safeSet(STORAGE_KEYS.DOCUMENTS, docs);
    }
  },

  // --- DOCUMENT SHARES ---
  getDocumentShares(ownerId?: string): DocumentShare[] {
    const all = safeGet<DocumentShare[]>(STORAGE_KEYS.SHARES, INITIAL_DOCUMENT_SHARES);
    if (!ownerId) return all;
    return all.filter(s => s.ownerId === ownerId);
  },

  getSharesForWorker(workerId: string): DocumentShare[] {
    const all = safeGet<DocumentShare[]>(STORAGE_KEYS.SHARES, INITIAL_DOCUMENT_SHARES);
    const now = new Date().toISOString();
    return all.filter(s => s.sharedWithWorkerId === workerId && !s.isRevoked && s.expiresAt > now);
  },

  grantShare(share: DocumentShare): void {
    const all = this.getDocumentShares();
    safeSet(STORAGE_KEYS.SHARES, [share, ...all]);

    this.addAuditLog({
      id: `audit-${Date.now()}`,
      actorId: share.ownerId,
      actionType: 'DOCUMENT_SHARED',
      resourceType: 'DOCUMENT_SHARE',
      resourceId: share.id,
      details: {
        documentTitle: share.documentTitle,
        sharedWith: share.sharedWithWorkerName,
        expiresAt: share.expiresAt,
      },
      timestamp: new Date().toISOString(),
    });
  },

  revokeShare(shareId: string): void {
    const all = this.getDocumentShares();
    const idx = all.findIndex(s => s.id === shareId);
    if (idx !== -1) {
      all[idx].isRevoked = true;
      all[idx].revokedAt = new Date().toISOString();
      safeSet(STORAGE_KEYS.SHARES, all);

      this.addAuditLog({
        id: `audit-${Date.now()}`,
        actorId: all[idx].ownerId,
        actionType: 'SHARE_ACCESS_REVOKED',
        resourceType: 'DOCUMENT_SHARE',
        resourceId: shareId,
        details: { documentTitle: all[idx].documentTitle, revokedAt: all[idx].revokedAt },
        timestamp: new Date().toISOString(),
      });
    }
  },

  // --- REFERRALS ---
  getReferrals(): Referral[] {
    return safeGet<Referral[]>(STORAGE_KEYS.REFERRALS, INITIAL_REFERRALS);
  },

  addReferral(referral: Referral): void {
    const all = this.getReferrals();
    safeSet(STORAGE_KEYS.REFERRALS, [referral, ...all]);

    this.addAuditLog({
      id: `audit-${Date.now()}`,
      actionType: 'REFERRAL_CREATED',
      resourceType: 'REFERRAL',
      resourceId: referral.id,
      details: {
        caseNumber: referral.caseNumber,
        targetFacility: referral.targetFacility,
        targetDepartment: referral.targetDepartment,
        urgency: referral.urgency,
      },
      timestamp: new Date().toISOString(),
    });

    this.addNotification({
      id: `notif-${Date.now()}`,
      userId: referral.patientId,
      caseId: referral.caseId,
      type: 'REFERRAL_CREATED',
      titleEn: `Hospital Referral: ${referral.targetFacility}`,
      titleHi: `अस्पताल रेफरल: ${referral.targetFacility}`,
      titleOr: `ଡାକ୍ତରଖାନା ରେଫରାଲ୍: ${referral.targetFacility}`,
      bodyEn: `You have been referred to ${referral.targetDepartment} with ${referral.urgency} urgency.`,
      bodyHi: `आपको ${referral.urgency} तात्कालिकता के साथ ${referral.targetDepartment} में रेफर किया गया है।`,
      bodyOr: `ଆପଣଙ୍କୁ ${referral.urgency} ଜରୁରୀତା ସହ ${referral.targetDepartment} କୁ ରେଫର୍ କରାଯାଇଛି।`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  },

  // --- NOTIFICATIONS ---
  getNotifications(userId?: string): NotificationItem[] {
    const all = safeGet<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    if (!userId) return all;
    return all.filter(n => n.userId === userId);
  },

  addNotification(notif: NotificationItem): void {
    const all = safeGet<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    safeSet(STORAGE_KEYS.NOTIFICATIONS, [notif, ...all]);
  },

  markNotificationAsRead(id: string): void {
    const all = safeGet<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const updated = all.map(n => (n.id === id ? { ...n, isRead: true } : n));
    safeSet(STORAGE_KEYS.NOTIFICATIONS, updated);
  },

  // --- AUDIT LOGS ---
  getAuditLogs(): AuditLog[] {
    return safeGet<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  },

  addAuditLog(entry: AuditLog): void {
    const all = this.getAuditLogs();
    safeSet(STORAGE_KEYS.AUDIT_LOGS, [entry, ...all]);
  },

  // --- LOCATION & EMERGENCY TRACKING ---
  getAllLocations(): PatientLocationData[] {
    return safeGet<PatientLocationData[]>(STORAGE_KEYS.LOCATIONS, INITIAL_PATIENT_LOCATIONS);
  },

  getPatientLocation(patientId: string): PatientLocationData | undefined {
    const all = this.getAllLocations();
    return all.find(l => l.patientId === patientId);
  },

  savePatientLocation(data: PatientLocationData): void {
    const all = this.getAllLocations();
    const existingIndex = all.findIndex(l => l.patientId === data.patientId);
    let updated: PatientLocationData[];
    if (existingIndex >= 0) {
      updated = [...all];
      updated[existingIndex] = data;
    } else {
      updated = [data, ...all];
    }
    safeSet(STORAGE_KEYS.LOCATIONS, updated);

    this.addAuditLog({
      id: `audit-${Date.now()}`,
      actorId: data.patientId,
      actorName: 'Patient',
      actorRole: 'PATIENT',
      actionType: 'LOCATION_CONSENT_GRANTED',
      resourceType: 'PATIENT_LOCATION',
      resourceId: data.patientId,
      details: {
        locationType: data.locationType,
        accuracyMeters: data.accuracyMeters,
        sharingStatus: data.sharingStatus,
        hasCoords: !!(data.latitude && data.longitude),
      },
      timestamp: new Date().toISOString(),
    });
  },

  revokeLocationShare(patientId: string): void {
    const all = this.getAllLocations();
    const updated = all.map(l =>
      l.patientId === patientId
        ? {
            ...l,
            sharingStatus: 'REVOKED' as const,
            lastUpdated: new Date().toISOString(),
          }
        : l
    );
    safeSet(STORAGE_KEYS.LOCATIONS, updated);

    this.addAuditLog({
      id: `audit-${Date.now()}`,
      actorId: patientId,
      actorName: 'Patient',
      actorRole: 'PATIENT',
      actionType: 'LOCATION_SHARE_REVOKED',
      resourceType: 'PATIENT_LOCATION',
      resourceId: patientId,
      details: { reason: 'Revoked by user request' },
      timestamp: new Date().toISOString(),
    });
  },

  logLocationAccess(
    patientId: string,
    worker: { id: string; name: string; role: string; facilityName: string }
  ): void {
    const all = this.getAllLocations();
    const target = all.find(l => l.patientId === patientId);
    if (!target) return;

    // Check if worker already logged an access in the last 2 minutes to prevent log spamming
    const now = Date.now();
    const recent = target.accessLogs?.find(
      log =>
        log.workerId === worker.id &&
        now - new Date(log.accessedAt).getTime() < 120000
    );
    if (recent) return;

    const newLog: LocationAccessAudit = {
      id: `loc-acc-${now}`,
      workerId: worker.id,
      workerName: worker.name,
      workerRole: worker.role,
      facilityName: worker.facilityName,
      accessedAt: new Date().toISOString(),
    };

    const updated = all.map(l =>
      l.patientId === patientId
        ? {
            ...l,
            accessLogs: [newLog, ...(l.accessLogs || [])],
          }
        : l
    );
    safeSet(STORAGE_KEYS.LOCATIONS, updated);

    this.addAuditLog({
      id: `audit-${now}`,
      actorId: worker.id,
      actorName: worker.name,
      actorRole: 'DOCTOR',
      actionType: 'LOCATION_ACCESSED',
      resourceType: 'PATIENT_LOCATION',
      resourceId: patientId,
      details: {
        workerRole: worker.role,
        facilityName: worker.facilityName,
      },
      timestamp: new Date().toISOString(),
    });
  },

  // --- AMBULANCE ASSISTANCE ---
  getAmbulanceRequests(patientId?: string): AmbulanceRequest[] {
    const all = safeGet<AmbulanceRequest[]>(STORAGE_KEYS.AMBULANCES, INITIAL_AMBULANCE_REQUESTS);
    if (!patientId) return all;
    return all.filter(a => a.patientId === patientId);
  },

  getAmbulanceById(id: string): AmbulanceRequest | undefined {
    const all = this.getAmbulanceRequests();
    return all.find(a => a.id === id);
  },

  createAmbulanceRequest(req: AmbulanceRequest): void {
    const all = safeGet<AmbulanceRequest[]>(STORAGE_KEYS.AMBULANCES, INITIAL_AMBULANCE_REQUESTS);
    safeSet(STORAGE_KEYS.AMBULANCES, [req, ...all]);

    this.addAuditLog({
      id: `audit-${Date.now()}`,
      actorId: req.patientId,
      actorName: req.patientName,
      actorRole: req.initiatedBy === 'DOCTOR' ? 'DOCTOR' : 'PATIENT',
      actionType: 'AMBULANCE_REQUESTED',
      resourceType: 'AMBULANCE_REQUEST',
      resourceId: req.id,
      details: {
        hospitalName: req.hospitalName,
        urgencyLevel: req.urgencyLevel,
        pickupAddress: req.pickupAddress,
        initiatedBy: req.initiatedBy,
      },
      timestamp: new Date().toISOString(),
    });

    this.addNotification({
      id: `notif-${Date.now()}`,
      userId: req.patientId,
      caseId: req.caseId,
      type: 'SECURITY',
      titleEn: `Ambulance Request Registered (${req.id})`,
      titleHi: `एम्बुलेंस अनुरोध पंजीकृत (${req.id})`,
      titleOr: `ଆମ୍ବୁଲାନ୍ସ ଅନୁରୋଧ ପଞ୍ଜିକୃତ ହୋଇଛି (${req.id})`,
      bodyEn: `Emergency vehicle dispatched towards ${req.pickupAddress}. Call 112 for direct assistance.`,
      bodyHi: `${req.pickupAddress} की ओर आपातकालीन वाहन भेजा जा रहा है। तत्काल 112 डायल करें।`,
      bodyOr: `${req.pickupAddress} ଅଭିମୁଖେ ଜରୁରୀକାଳୀନ ଗାଡ଼ି ପଠାଯାଉଛି। ସିଧାସଳଖ 112 ଡାଏଲ୍ କରନ୍ତୁ।`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  },

  updateAmbulanceStatus(id: string, status: AmbulanceRequestStatus, note?: string): void {
    const all = safeGet<AmbulanceRequest[]>(STORAGE_KEYS.AMBULANCES, INITIAL_AMBULANCE_REQUESTS);
    const updated = all.map(a => {
      if (a.id !== id) return a;
      const event = {
        status,
        timestamp: new Date().toISOString(),
        note: note || `Status updated to ${status}`,
      };
      return {
        ...a,
        status,
        timeline: [...a.timeline, event],
      };
    });
    safeSet(STORAGE_KEYS.AMBULANCES, updated);

    this.addAuditLog({
      id: `audit-${Date.now()}`,
      actorName: 'Dispatch System',
      actionType: 'AMBULANCE_STATUS_UPDATED',
      resourceType: 'AMBULANCE_REQUEST',
      resourceId: id,
      details: { newStatus: status, note },
      timestamp: new Date().toISOString(),
    });
  },

  cancelAmbulanceRequest(id: string, reason?: string): void {
    this.updateAmbulanceStatus(id, 'CANCELLED', reason || 'Cancelled by requester');
  },

  // --- DEMO RESET ---
  resetToDemo(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.CASES);
    localStorage.removeItem(STORAGE_KEYS.APPOINTMENTS);
    localStorage.removeItem(STORAGE_KEYS.DOCUMENTS);
    localStorage.removeItem(STORAGE_KEYS.SHARES);
    localStorage.removeItem(STORAGE_KEYS.REFERRALS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
    localStorage.removeItem(STORAGE_KEYS.LOCATIONS);
    localStorage.removeItem(STORAGE_KEYS.AMBULANCES);
    window.location.reload();
  },
};
