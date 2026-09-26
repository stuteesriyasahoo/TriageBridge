export type UserRole = 'PATIENT' | 'DOCTOR' | 'NURSE' | 'MEDICAL_OFFICER' | 'HEALTH_WORKER' | 'ADMIN';

export type UrgencyCategory = 'RED' | 'YELLOW' | 'GREEN' | 'NEEDS_CLINICIAN_REVIEW' | 'GREY';

export type CaseStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'AWAITING_REVIEW'
  | 'MORE_INFO_REQUIRED'
  | 'UNDER_REVIEW'
  | 'REVIEWED'
  | 'REFERRED'
  | 'CLOSED';

export type AppointmentStatus = 'UPCOMING' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';

export type DocumentCategory =
  | 'APPOINTMENT_LETTER'
  | 'MEDICAL_REPORT'
  | 'LABORATORY_REPORT'
  | 'PRESCRIPTION'
  | 'REFERRAL_LETTER'
  | 'DISCHARGE_SUMMARY'
  | 'VACCINATION_RECORD'
  | 'MEDICAL_CERTIFICATE'
  | 'IMAGING_SCAN'
  | 'OTHER';

export type SupportedLocale =
  | 'en'
  | 'as'
  | 'bn'
  | 'brx'
  | 'doi'
  | 'gu'
  | 'hi'
  | 'kn'
  | 'ks'
  | 'kok'
  | 'mai'
  | 'ml'
  | 'mni'
  | 'mr'
  | 'ne'
  | 'or'
  | 'pa'
  | 'sa'
  | 'sat'
  | 'sd'
  | 'ta'
  | 'te'
  | 'ur';

export interface BaseUser {
  id: string;
  role: UserRole;
  fullName: string;
  phoneNumber: string;
  preferredLanguage: SupportedLocale;
  email?: string;
  avatarUrl?: string;
}

export interface PatientProfile extends BaseUser {
  role: 'PATIENT';
  syntheticId: string; // e.g. PAT-2026-9812
  maskedAadhaar: string; // e.g. "XXXX-XXXX-8921"
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  location: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

export interface HealthcareWorkerProfile extends BaseUser {
  role: 'DOCTOR' | 'NURSE' | 'MEDICAL_OFFICER' | 'HEALTH_WORKER';
  medicalCouncil: string;
  registrationNumber: string;
  licenceNumber: string;
  facilityName: string;
  department: string;
}

export type CurrentUser = PatientProfile | HealthcareWorkerProfile;

export type ConsciousnessLevel = 'ALERT' | 'VOICE_RESPONSIVE' | 'PAIN_RESPONSIVE' | 'UNRESPONSIVE';

export type AgeGroup = 'INFANT' | 'TODDLER' | 'CHILD' | 'ADOLESCENT' | 'ADULT';

export interface VitalSigns {
  systolicBp?: number | null;
  diastolicBp?: number | null;
  heartRate?: number | null;
  oxygenSaturation?: number | null; // SpO2 in %
  temperatureCelsius?: number | null;
  respiratoryRate?: number | null;
  bloodGlucoseMgDl?: number | null;
  painScore?: number | null; // 0 to 10 scale
  consciousness?: ConsciousnessLevel | string | null;
  recordedAt?: string;
  isUnknown?: Record<string, boolean>;
}

export interface ExtractedSymptom {
  name: string;
  duration: string;
  severity: string;
  source: 'text' | 'voice' | 'report' | 'image';
}

export interface ExtractedTriageData {
  originalLanguage: string;
  chiefComplaint: string;
  symptoms: ExtractedSymptom[];
  vitals: {
    temperature: number | null;
    bloodPressureSystolic: number | null;
    bloodPressureDiastolic: number | null;
    heartRate: number | null;
    respiratoryRate: number | null;
    spo2: number | null;
    bloodGlucose: number | null;
    painScore: number | null;
    consciousness: ConsciousnessLevel | string;
  };
  conditions: string[];
  medicines: string[];
  allergies: string[];
  pregnancyStatus: string;
  pregnancyWeeks?: number | null;
  pregnancyWarningSigns?: string[];
  reportFindings: string[];
  possibleRedFlags: string[];
  missingInformation: string[];
}

export interface TriageDraft {
  id: string;
  patientId: string;
  lastSavedStep: number;
  patientName: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  location: string;
  phone: string;
  chiefComplaint: string;
  typedSymptoms: string;
  symptomDuration: string;
  symptomSeverity: string;
  voiceTranscript: string;
  audioUrl?: string;
  clinicalImageUri?: string;
  uploadedReports: UploadedReport[];
  vitals: VitalSigns;
  vitalsUnknown: Record<string, boolean>;
  existingConditions: string[];
  currentMedicines: string[];
  allergies: string[];
  pregnancyStatus: string;
  pregnancyWeeks?: number | null;
  pregnancyWarningSigns: string[];
  updatedAt: string;
}

export interface ClinicalRuleTrigger {
  id: string;
  ruleName: string;
  category: 'RED' | 'YELLOW' | 'GREEN' | 'NEEDS_CLINICIAN_REVIEW';
  reason: string;
  ageGroup: 'PAEDIATRIC' | 'ADULT';
  medicalReference: string;
  sourceCriterion: 'VITAL_SIGN' | 'SYMPTOM' | 'RED_FLAG' | 'PREGNANCY' | 'MISSING_DATA';
}

export interface ExtractedReportData {
  id: string;
  reportId: string;
  rawOcrText: string;
  suggestedPatientName?: string;
  suggestedDoctorName?: string;
  suggestedHospitalName?: string;
  suggestedDepartment?: string;
  suggestedDate?: string;
  suggestedAppointmentDate?: string;
  suggestedAppointmentTime?: string;
  suggestedDocumentType?: DocumentCategory;
  extractedLabValues: Record<string, string>;
  ocrConfidence: number;
  isConfirmedByPatient: boolean;
}

export interface UploadedReport {
  id: string;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  storageUrl: string;
  category: DocumentCategory;
  uploadedAt: string;
  extractedData?: ExtractedReportData;
}

export interface StructuredTriageNote {
  chiefComplaint: string;
  symptoms: string[];
  symptomDuration: string;
  severity: string;
  severityTrajectory?: string;
  existingConditions: string[];
  currentMedicines: string[];
  allergies: string[];
  uploadedReportSummary: string;
  reportSummary?: string;
  warningSigns: string[];
  missingInformation: string[];
  suggestedUrgency: UrgencyCategory;
  patientLocation: string;
  transportOrAmbulanceRequired: boolean;
  transportRequirement?: string;
  isDiagnostic?: boolean;
  clinicalDisclaimer?: string;
  notesTimestamp: string;
}

export interface RedFlagAlert {
  id: string;
  name: string;
  severity: 'CRITICAL' | 'WARNING';
  descriptionEn: string;
  descriptionHi: string;
  descriptionOr: string;
  descriptionTranslations?: Partial<Record<SupportedLocale, string>>;
  matchedTrigger: string;
}

export interface FollowUpQuestion {
  id: string;
  questionKey: string;
  questionEn: string;
  questionHi: string;
  questionOr: string;
  questionTranslations?: Partial<Record<SupportedLocale, string>>;
  reasonEn: string;
  answer?: string;
  inputMode?: 'TEXT' | 'VOICE';
}

export interface UrgencyAssessment {
  suggestedUrgency: UrgencyCategory;
  confidenceScore: number; // 0 to 1
  rationaleEn: string;
  rationaleHi: string;
  rationaleOr: string;
  rationaleTranslations?: Partial<Record<SupportedLocale, string>>;
  triggeredRedFlags: string[];
  triggeredRules?: ClinicalRuleTrigger[];
  missingInformation: string[];
  isDiagnostic: false; // Must always be false
  clinicalDisclaimer?: string;
  evaluatedAt?: string;
}

export interface ClinicalReview {
  id: string;
  caseId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: string;
  reviewerRegNumber: string;
  finalUrgency: UrgencyCategory;
  isOverridden: boolean;
  overrideReason?: string;
  clinicalTriageNotes: string;
  actionTaken: string;
  reviewedAt: string;
}

export type OfflineSyncStatus =
  | 'SAVED_OFFLINE'
  | 'WAITING_TO_SYNC'
  | 'SYNCHRONIZING'
  | 'SUCCESSFULLY_SYNCHRONIZED'
  | 'SYNCHRONIZATION_FAILED'
  | 'REQUIRES_USER_ATTENTION';

export interface TriageCase {
  id: string;
  caseNumber: string; // e.g. TB-2026-1049
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  patientLocation: string;
  patientPhone: string;
  chiefComplaint: string;
  originalLanguage: SupportedLocale;
  originalStatement: string;
  translatedEnglishStatement?: string;
  voiceTranscript?: string;
  audioUrl?: string;
  detectedLanguage?: SupportedLocale;
  translationConfidence?: number;
  structuredTriageNote?: StructuredTriageNote;
  extractedTriageData?: ExtractedTriageData;
  status: CaseStatus;
  provisionalUrgency: UrgencyCategory;
  finalUrgency?: UrgencyCategory;
  facilityName?: string;
  department?: string;
  vitals?: VitalSigns;
  uploadedReports: UploadedReport[];
  visibleConditionImageUrl?: string;
  clinicalImageUri?: string;
  pregnancyStatus?: string;
  pregnancyWeeks?: number | null;
  pregnancyWarningSigns?: string[];
  symptomsList?: ExtractedSymptom[];
  existingConditionsList?: string[];
  currentMedicinesList?: string[];
  allergiesList?: string[];
  draftId?: string;
  syncStatus?: OfflineSyncStatus;
  idempotencyKey?: string;
  redFlags: RedFlagAlert[];
  followUpQuestions: FollowUpQuestion[];
  urgencyAssessment: UrgencyAssessment;
  clinicalReview?: ClinicalReview;
  assignedWorkerId?: string;
  assignedWorkerName?: string;
  submittedAt: string;
  updatedAt: string;
}

export interface Referral {
  id: string;
  caseId: string;
  caseNumber: string;
  patientId: string;
  patientName: string;
  referringWorkerName: string;
  targetFacility: string;
  targetDepartment: string;
  referralReason: string;
  urgency: UrgencyCategory;
  status: 'ACTIVE' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  caseId?: string;
  hospitalName: string;
  department: string;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  locationRoom?: string;
  status: AppointmentStatus;
  notes?: string;
  appointmentLetterUrl?: string;
  appointmentLetterName?: string;
  referralLetterUrl?: string;
  referralLetterName?: string;
  reminderScheduled?: boolean;
  reminderScheduledAt?: string;
  syncStatus?: OfflineSyncStatus;
  idempotencyKey?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface HealthDocument {
  id: string;
  ownerId: string;
  title: string;
  category: DocumentCategory;
  hospitalName?: string;
  doctorName?: string;
  documentDate?: string;
  uploadDate: string;
  description?: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  filePreviewUrl?: string;
  secureFilePath?: string;
  signedUrlExpiresAt?: string;
  ocrExtractedMetadata?: Record<string, string>;
  isVerifiedByPatient: boolean;
  syncStatus?: OfflineSyncStatus;
  idempotencyKey?: string;
}

export interface DocumentShare {
  id: string;
  documentId: string;
  documentTitle: string;
  ownerId: string;
  sharedWithWorkerId: string;
  sharedWithWorkerName: string;
  sharedWithWorkerRole: string;
  sharingType?: 'SINGLE' | 'BATCH' | 'CASE_ATTACHED';
  documentIds?: string[];
  documentTitles?: string[];
  caseId?: string;
  caseNumber?: string;
  grantedAt: string;
  expiresAt: string;
  isRevoked: boolean;
  revokedAt?: string;
}

export interface SecureMessage {
  id: string;
  caseId: string;
  caseNumber: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  recipientId: string;
  recipientName: string;
  messageText: string;
  isRead: boolean;
  sentAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  caseId?: string;
  type: 'CASE_SUBMITTED' | 'INFO_REQUESTED' | 'CASE_REVIEWED' | 'REFERRAL_CREATED' | 'APPOINTMENT' | 'MESSAGE' | 'SECURITY';
  titleEn: string;
  titleHi: string;
  titleOr: string;
  bodyEn: string;
  bodyHi: string;
  bodyOr: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId?: string;
  actorName?: string;
  actorRole?: UserRole;
  actionType:
    | 'USER_LOGIN'
    | 'PATIENT_CONSENT'
    | 'TRIAGE_SUBMISSION'
    | 'FILE_UPLOAD'
    | 'OCR_EXTRACTION'
    | 'TRANSLATION_GENERATED'
    | 'RED_FLAG_SCREENED'
    | 'URGENCY_PROPOSED'
    | 'CASE_REVIEW_START'
    | 'CLINICAL_NOTE_EDIT'
    | 'URGENCY_OVERRIDE'
    | 'FINAL_DECISION_RECORDED'
    | 'REFERRAL_CREATED'
    | 'DOCUMENT_SHARED'
    | 'SHARE_ACCESS_REVOKED'
    | 'DOCUMENT_RENAMED'
    | 'DOCUMENT_DELETED'
    | 'DOCUMENT_DOWNLOADED'
    | 'APPOINTMENT_CREATED'
    | 'APPOINTMENT_UPDATED'
    | 'APPOINTMENT_CANCELLED'
    | 'APPOINTMENT_RESCHEDULED'
    | 'APPOINTMENT_REMINDER_SET'
    | 'LOCATION_CONSENT_GRANTED'
    | 'LOCATION_ACCESSED'
    | 'LOCATION_SHARE_REVOKED'
    | 'AMBULANCE_REQUESTED'
    | 'AMBULANCE_STATUS_UPDATED';
  resourceType: string;
  resourceId: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  timestamp: string;
}

export type LocationType = 'HOME' | 'HOSPITAL' | 'WORKPLACE' | 'OTHER';

export type LocationShareStatus = 'PRIVATE' | 'SHARING_ACTIVE' | 'REVOKED';

export interface LocationAccessAudit {
  id: string;
  workerId: string;
  workerName: string;
  workerRole: string;
  facilityName: string;
  accessedAt: string;
}

export interface PatientLocationData {
  patientId: string;
  latitude?: number;
  longitude?: number;
  accuracyMeters?: number;
  address: string;
  landmark?: string;
  district?: string;
  pincode?: string;
  emergencyContactNumber?: string;
  locationType: LocationType;
  sharingStatus: LocationShareStatus;
  lastUpdated: string;
  sharedWithWorkerIds: string[];
  requiresTransportAssistance: boolean;
  distanceKmFromHospital?: number;
  accessLogs: LocationAccessAudit[];
}

export type AmbulanceRequestStatus =
  | 'REQUEST_SUBMITTED'
  | 'AWAITING_CONFIRMATION'
  | 'AMBULANCE_ASSIGNED'
  | 'EN_ROUTE'
  | 'PATIENT_PICKED_UP'
  | 'REACHED_HOSPITAL'
  | 'CANCELLED';

export interface AmbulanceTimelineEvent {
  status: AmbulanceRequestStatus;
  timestamp: string;
  note: string;
}

export interface AmbulanceRequest {
  id: string; // e.g. AMB-2026-8912
  caseId?: string;
  caseNumber?: string;
  patientId: string;
  patientName: string;
  phoneNumber: string;
  emergencyContact: string;
  pickupAddress: string;
  pickupCoordinates?: { lat: number; lng: number };
  hospitalName: string;
  primarySymptoms: string;
  urgencyLevel: UrgencyCategory;
  status: AmbulanceRequestStatus;
  etaMinutes: number;
  vehicleDetails?: string;
  driverDetails?: string;
  requestedAt: string;
  timeline: AmbulanceTimelineEvent[];
  initiatedBy: 'PATIENT' | 'DOCTOR';
  cancellationReason?: string;
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[P] extends object
    ? DeepPartial<T[P]>
    : T[P];
};

export type MLAgreementStatus =
  | 'EXACT_AGREEMENT'
  | 'ML_HIGHER'
  | 'ML_LOWER'
  | 'RED_MISSED'
  | 'YELLOW_PREDICTED_GREEN'
  | 'GATE_DISAGREEMENT'
  | 'PENDING_REVIEW';

export interface MLShadowPrediction {
  id: string;
  deidentifiedCaseId: string;
  modelVersion: string;
  datasetHash: string;
  predictedClass: UrgencyCategory | null;
  modelScoreJson: Record<string, number> | null;
  deterministicGateResult: string;
  clinicianFinalCategory?: UrgencyCategory | null;
  agreementStatus: MLAgreementStatus;
  unsafeDowngradeFlag: boolean;
  conservativeEscalationFlag: boolean;
  processingTimeMs?: number | null;
  modelErrorCode?: string | null;
  createdAt: string;
}

export interface MLShadowServiceResult {
  success: boolean;
  prediction: UrgencyCategory | null;
  modelVersion: string;
  datasetHash: string;
  modelScores: Record<string, number> | null;
  processingTimeMs: number;
  warning: string;
  errorCode?: string;
}


