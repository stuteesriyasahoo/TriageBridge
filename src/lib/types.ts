export type UserRole = 'PATIENT' | 'DOCTOR' | 'NURSE' | 'MEDICAL_OFFICER' | 'HEALTH_WORKER' | 'ADMIN';

export type UrgencyCategory = 'RED' | 'YELLOW' | 'GREEN' | 'GREY';

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

export interface VitalSigns {
  systolicBp?: number;
  diastolicBp?: number;
  heartRate?: number;
  oxygenSaturation?: number; // SpO2 in %
  temperatureCelsius?: number;
  respiratoryRate?: number;
  recordedAt?: string;
}

export interface ExtractedReportData {
  id: string;
  reportId: string;
  rawOcrText: string;
  suggestedPatientName?: string;
  suggestedDoctorName?: string;
  suggestedHospitalName?: string;
  suggestedDate?: string;
  suggestedDepartment?: string;
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
  missingInformation: string[];
  isDiagnostic: false; // Must always be false
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
  status: CaseStatus;
  provisionalUrgency: UrgencyCategory;
  finalUrgency?: UrgencyCategory;
  facilityName?: string;
  department?: string;
  vitals?: VitalSigns;
  uploadedReports: UploadedReport[];
  visibleConditionImageUrl?: string;
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
  createdAt: string;
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
  ocrExtractedMetadata?: Record<string, string>;
  isVerifiedByPatient: boolean;
}

export interface DocumentShare {
  id: string;
  documentId: string;
  documentTitle: string;
  ownerId: string;
  sharedWithWorkerId: string;
  sharedWithWorkerName: string;
  sharedWithWorkerRole: string;
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
