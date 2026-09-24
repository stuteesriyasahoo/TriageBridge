-- =====================================================================
-- TriageBridge - Multimodal Healthcare Triage Assistant Schema
-- BPUT Hackathon 2026 - Problem Statement 03
-- Supabase PostgreSQL with Strict Row-Level Security (RLS)
-- =====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom Enums
CREATE TYPE user_role AS ENUM ('PATIENT', 'DOCTOR', 'NURSE', 'MEDICAL_OFFICER', 'HEALTH_WORKER', 'ADMIN');
CREATE TYPE urgency_category AS ENUM ('RED', 'YELLOW', 'GREEN', 'GREY');
CREATE TYPE case_status AS ENUM (
  'DRAFT', 
  'SUBMITTED', 
  'AWAITING_REVIEW', 
  'MORE_INFO_REQUIRED', 
  'UNDER_REVIEW', 
  'REVIEWED', 
  'REFERRED', 
  'CLOSED'
);
CREATE TYPE appointment_status AS ENUM ('UPCOMING', 'COMPLETED', 'CANCELLED', 'RESCHEDULED');
CREATE TYPE document_category AS ENUM (
  'APPOINTMENT_LETTER',
  'MEDICAL_REPORT',
  'LABORATORY_REPORT',
  'PRESCRIPTION',
  'REFERRAL_LETTER',
  'DISCHARGE_SUMMARY',
  'VACCINATION_RECORD',
  'MEDICAL_CERTIFICATE',
  'IMAGING_SCAN',
  'OTHER'
);

-- 1. Profiles (Base Auth Link)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'PATIENT',
  full_name TEXT NOT NULL,
  phone_number TEXT,
  preferred_language VARCHAR(5) DEFAULT 'en', -- 'en', 'hi', 'or'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Patient Profiles
CREATE TABLE patient_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  synthetic_id VARCHAR(50) UNIQUE NOT NULL, -- e.g. PAT-2026-XXXX
  masked_aadhaar VARCHAR(16) NOT NULL, -- e.g. "XXXX-XXXX-1234" (NEVER store raw Aadhaar)
  age INTEGER,
  gender VARCHAR(20),
  location TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Healthcare Worker Profiles
CREATE TABLE healthcare_worker_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  professional_role user_role NOT NULL, -- DOCTOR, NURSE, MEDICAL_OFFICER, etc.
  medical_council TEXT NOT NULL,        -- e.g. "Odisha Medical Council"
  registration_number TEXT NOT NULL,    -- e.g. "SMC-ODI-48291"
  licence_number TEXT NOT NULL,
  facility_name TEXT NOT NULL,          -- e.g. "SCB Medical College & Hospital, Cuttack"
  department TEXT NOT NULL,             -- e.g. "Emergency / Triage Unit"
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Consents
CREATE TABLE consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  consent_given BOOLEAN NOT NULL DEFAULT TRUE,
  consent_text TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  granted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Triage Cases
CREATE TABLE triage_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_number VARCHAR(30) UNIQUE NOT NULL, -- e.g. TB-2026-8942
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_worker_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status case_status NOT NULL DEFAULT 'SUBMITTED',
  provisional_urgency urgency_category NOT NULL DEFAULT 'GREY',
  final_urgency urgency_category,
  facility_id TEXT,
  department TEXT,
  chief_complaint TEXT NOT NULL,
  original_language VARCHAR(5) DEFAULT 'en',
  has_red_flags BOOLEAN DEFAULT FALSE,
  red_flags_details JSONB DEFAULT '[]'::jsonb,
  is_overridden BOOLEAN DEFAULT FALSE,
  override_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Symptom Entries
CREATE TABLE symptom_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES triage_cases(id) ON DELETE CASCADE,
  original_statement TEXT NOT NULL,
  original_language VARCHAR(5) NOT NULL DEFAULT 'en',
  translated_english_statement TEXT,
  extracted_symptoms JSONB DEFAULT '[]'::jsonb,
  onset_duration TEXT,
  progression TEXT,
  is_machine_translated BOOLEAN DEFAULT TRUE,
  translation_confidence NUMERIC(4,2) DEFAULT 0.95,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Voice Transcripts
CREATE TABLE voice_transcripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES triage_cases(id) ON DELETE CASCADE,
  audio_storage_path TEXT, -- Secure Supabase Storage path
  transcript_text TEXT NOT NULL,
  detected_language VARCHAR(5) DEFAULT 'en',
  confidence NUMERIC(4,2) DEFAULT 0.92,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Vital Signs
CREATE TABLE vital_signs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES triage_cases(id) ON DELETE CASCADE,
  systolic_bp INTEGER,
  diastolic_bp INTEGER,
  heart_rate INTEGER,
  oxygen_saturation INTEGER, -- SpO2 %
  temperature_celsius NUMERIC(4,1),
  respiratory_rate INTEGER,
  recorded_by VARCHAR(50) DEFAULT 'PATIENT',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Uploaded Reports
CREATE TABLE uploaded_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES triage_cases(id) ON DELETE SET NULL,
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type VARCHAR(50) NOT NULL, -- application/pdf, image/png, image/jpeg
  file_size_bytes BIGINT NOT NULL,
  storage_path TEXT NOT NULL,
  category document_category DEFAULT 'MEDICAL_REPORT',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Extracted Report Data (OCR & Clinical NLP)
CREATE TABLE extracted_report_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES uploaded_reports(id) ON DELETE CASCADE,
  raw_ocr_text TEXT,
  extracted_lab_values JSONB DEFAULT '{}'::jsonb,
  suggested_patient_name TEXT,
  suggested_doctor_name TEXT,
  suggested_hospital_name TEXT,
  suggested_date DATE,
  ocr_confidence NUMERIC(4,2) DEFAULT 0.88,
  is_confirmed_by_patient BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Follow-Up Questions & Answers
CREATE TABLE follow_up_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES triage_cases(id) ON DELETE CASCADE,
  question_key VARCHAR(100) NOT NULL,
  question_en TEXT NOT NULL,
  question_hi TEXT NOT NULL,
  question_or TEXT NOT NULL,
  reason_for_question TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE follow_up_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES follow_up_questions(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES triage_cases(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL,
  input_mode VARCHAR(20) DEFAULT 'TEXT', -- 'TEXT' or 'VOICE'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Urgency Assessments (AI Suggestion Layer)
CREATE TABLE urgency_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES triage_cases(id) ON DELETE CASCADE,
  suggested_urgency urgency_category NOT NULL,
  confidence_score NUMERIC(4,2) NOT NULL,
  rationale_en TEXT NOT NULL,
  rationale_hi TEXT NOT NULL,
  rationale_or TEXT NOT NULL,
  triggered_red_flags JSONB DEFAULT '[]'::jsonb,
  missing_information JSONB DEFAULT '[]'::jsonb,
  is_diagnostic BOOLEAN DEFAULT FALSE, -- MUST ALWAYS BE FALSE
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Clinical Reviews (Healthcare Worker Final Review)
CREATE TABLE clinical_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID UNIQUE NOT NULL REFERENCES triage_cases(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  final_urgency urgency_category NOT NULL,
  override_reason TEXT,
  clinical_triage_notes TEXT NOT NULL,
  action_taken TEXT NOT NULL, -- e.g. "Admitted to Red Triage Bed 2", "Assigned OPD Token"
  reviewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Referrals
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES triage_cases(id) ON DELETE CASCADE,
  referring_worker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_facility TEXT NOT NULL,
  target_department TEXT NOT NULL,
  referral_reason TEXT NOT NULL,
  urgency urgency_category NOT NULL,
  status VARCHAR(30) DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Appointments
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  case_id UUID REFERENCES triage_cases(id) ON DELETE SET NULL,
  hospital_name TEXT NOT NULL,
  department TEXT NOT NULL,
  doctor_name TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  location_room TEXT,
  status appointment_status DEFAULT 'UPCOMING',
  notes TEXT,
  appointment_letter_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Health Documents (Vault)
CREATE TABLE health_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category document_category NOT NULL DEFAULT 'MEDICAL_REPORT',
  hospital_name TEXT,
  doctor_name TEXT,
  document_date DATE,
  description TEXT,
  file_name TEXT NOT NULL,
  file_size_bytes BIGINT,
  mime_type VARCHAR(100) NOT NULL,
  storage_path TEXT NOT NULL,
  ocr_extracted_metadata JSONB DEFAULT '{}'::jsonb,
  is_verified_by_patient BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. Document Shares (Time-Limited, Controlled Sharing)
CREATE TABLE document_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES health_documents(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  shared_with_worker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  case_id UUID REFERENCES triage_cases(id) ON DELETE SET NULL,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  is_revoked BOOLEAN DEFAULT FALSE,
  revoked_at TIMESTAMPTZ
);

-- 18. Secure Messages (Case-Linked Healthcare Communication)
CREATE TABLE secure_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES triage_cases(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  case_id UUID REFERENCES triage_cases(id) ON DELETE SET NULL,
  title_en TEXT NOT NULL,
  title_hi TEXT NOT NULL,
  title_or TEXT NOT NULL,
  body_en TEXT NOT NULL,
  body_hi TEXT NOT NULL,
  body_or TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. Audit Logs (Immutable Clinical Trail)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  actor_role user_role,
  action_type VARCHAR(80) NOT NULL, -- e.g. "TRIAGE_SUBMITTED", "RED_FLAG_TRIGGERED", "OVERRIDE_APPLIED"
  resource_type VARCHAR(50) NOT NULL,
  resource_id TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE healthcare_worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE triage_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE vital_signs ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE extracted_report_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_up_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_up_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE urgency_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE secure_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper functions for RBAC
CREATE OR REPLACE FUNCTION auth_user_role() RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE;

-- Profiles: Users can see own profile; Healthcare workers can view patient names linked to their cases
CREATE POLICY "Users view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id OR auth_user_role() IN ('DOCTOR', 'NURSE', 'MEDICAL_OFFICER', 'HEALTH_WORKER', 'ADMIN'));

CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Patient Profiles: Patients see own profile; Healthcare workers see all
CREATE POLICY "Patient view own" ON patient_profiles
  FOR SELECT USING (auth.uid() = user_id OR auth_user_role() IN ('DOCTOR', 'NURSE', 'MEDICAL_OFFICER', 'HEALTH_WORKER'));

-- Triage Cases: Patient sees own cases; Healthcare workers can see all cases in queue
CREATE POLICY "Patients view own cases" ON triage_cases
  FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Healthcare workers view cases" ON triage_cases
  FOR SELECT USING (auth_user_role() IN ('DOCTOR', 'NURSE', 'MEDICAL_OFFICER', 'HEALTH_WORKER'));

CREATE POLICY "Patients insert own cases" ON triage_cases
  FOR INSERT WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Healthcare workers update cases" ON triage_cases
  FOR UPDATE USING (auth_user_role() IN ('DOCTOR', 'NURSE', 'MEDICAL_OFFICER', 'HEALTH_WORKER'));

-- Health Documents: STRICTLY PRIVATE by default
CREATE POLICY "Owners view own documents" ON health_documents
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Healthcare workers view shared documents only" ON health_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM document_shares
      WHERE document_shares.document_id = health_documents.id
        AND document_shares.shared_with_worker_id = auth.uid()
        AND document_shares.is_revoked = FALSE
        AND document_shares.expires_at > NOW()
    )
  );

CREATE POLICY "Owners manage own documents" ON health_documents
  FOR ALL USING (auth.uid() = owner_id);

-- Document Shares: Owner manages shares, worker views granted
CREATE POLICY "Owner manages document shares" ON document_shares
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Worker views assigned shares" ON document_shares
  FOR SELECT USING (auth.uid() = shared_with_worker_id);

-- Appointments: Patient sees own appointments
CREATE POLICY "Patients view own appointments" ON appointments
  FOR ALL USING (auth.uid() = patient_id);

-- Notifications: User sees only own notifications
CREATE POLICY "User views own notifications" ON notifications
  FOR ALL USING (auth.uid() = user_id);

-- Audit Logs: Read-only for authorized healthcare staff, write-only system triggers
CREATE POLICY "Staff views audit logs" ON audit_logs
  FOR SELECT USING (auth_user_role() IN ('DOCTOR', 'NURSE', 'MEDICAL_OFFICER', 'ADMIN'));

CREATE POLICY "Insert audit log" ON audit_logs
  FOR INSERT WITH CHECK (TRUE);

-- =====================================================================
-- STORAGE BUCKETS (Private by default)
-- =====================================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES 
--   ('medical-reports', 'medical-reports', false),
--   ('health-documents', 'health-documents', false),
--   ('voice-recordings', 'voice-recordings', false),
--   ('patient-images', 'patient-images', false);
