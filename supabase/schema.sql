-- =====================================================================
-- TriageBridge - Multimodal Healthcare Triage Assistant Schema
-- BPUT Hackathon 2026 - Problem Statement 03
-- Supabase PostgreSQL with Strict Row-Level Security (RLS)
-- Fully Idempotent & Consolidated (Core + Hardening Migrations)
-- =====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom Enums (Idempotent)
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('PATIENT', 'DOCTOR', 'NURSE', 'MEDICAL_OFFICER', 'HEALTH_WORKER', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE urgency_category AS ENUM ('RED', 'YELLOW', 'GREEN', 'GREY');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE case_status AS ENUM (
    'DRAFT', 'SUBMITTED', 'AWAITING_REVIEW', 'MORE_INFO_REQUIRED', 
    'UNDER_REVIEW', 'REVIEWED', 'REFERRED', 'CLOSED'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE appointment_status AS ENUM ('UPCOMING', 'COMPLETED', 'CANCELLED', 'RESCHEDULED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE document_category AS ENUM (
    'APPOINTMENT_LETTER', 'MEDICAL_REPORT', 'LABORATORY_REPORT', 'PRESCRIPTION',
    'REFERRAL_LETTER', 'DISCHARGE_SUMMARY', 'VACCINATION_RECORD', 'MEDICAL_CERTIFICATE',
    'IMAGING_SCAN', 'OTHER'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 1. Profiles (Base Auth Link)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'PATIENT',
  full_name TEXT NOT NULL,
  phone_number TEXT,
  preferred_language VARCHAR(5) DEFAULT 'en', -- 'en', 'hi', 'or'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Patient Profiles
CREATE TABLE IF NOT EXISTS patient_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  synthetic_id VARCHAR(50) UNIQUE, -- e.g. PAT-2026-XXXX
  masked_aadhaar VARCHAR(16) DEFAULT 'XXXX-XXXX-0000', -- e.g. "XXXX-XXXX-1234" (NEVER store raw Aadhaar)
  full_name TEXT,
  phone_number TEXT,
  preferred_language VARCHAR(5) DEFAULT 'en',
  age INTEGER,
  gender VARCHAR(20),
  location TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Healthcare Workers
CREATE TABLE IF NOT EXISTS healthcare_workers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'DOCTOR',
  registration_number TEXT,
  facility_name TEXT,
  medical_council TEXT,
  department TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Healthcare Worker Profiles (Extended details)
CREATE TABLE IF NOT EXISTS healthcare_worker_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  professional_role user_role NOT NULL DEFAULT 'DOCTOR',
  medical_council TEXT,
  registration_number TEXT,
  licence_number TEXT,
  facility_name TEXT,
  department TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Consents
CREATE TABLE IF NOT EXISTS consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  consent_given BOOLEAN NOT NULL DEFAULT TRUE,
  consent_text TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  granted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Triage Cases
CREATE TABLE IF NOT EXISTS triage_cases (
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

-- 7. Symptom Entries
CREATE TABLE IF NOT EXISTS symptom_entries (
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

-- 8. Voice Transcripts
CREATE TABLE IF NOT EXISTS voice_transcripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES triage_cases(id) ON DELETE CASCADE,
  audio_storage_path TEXT,
  transcript_text TEXT NOT NULL,
  detected_language VARCHAR(5) DEFAULT 'en',
  confidence NUMERIC(4,2) DEFAULT 0.92,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Vital Signs
CREATE TABLE IF NOT EXISTS vital_signs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES triage_cases(id) ON DELETE CASCADE,
  systolic_bp INTEGER,
  diastolic_bp INTEGER,
  heart_rate INTEGER,
  oxygen_saturation INTEGER,
  temperature_celsius NUMERIC(4,1),
  respiratory_rate INTEGER,
  recorded_by VARCHAR(50) DEFAULT 'PATIENT',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Uploaded Reports
CREATE TABLE IF NOT EXISTS uploaded_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES triage_cases(id) ON DELETE SET NULL,
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  storage_path TEXT NOT NULL,
  category document_category DEFAULT 'MEDICAL_REPORT',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Extracted Report Data (OCR & Clinical NLP)
CREATE TABLE IF NOT EXISTS extracted_report_data (
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

-- 12. Follow-Up Questions & Answers
CREATE TABLE IF NOT EXISTS follow_up_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES triage_cases(id) ON DELETE CASCADE,
  question_key VARCHAR(100) NOT NULL,
  question_en TEXT NOT NULL,
  question_hi TEXT NOT NULL,
  question_or TEXT NOT NULL,
  reason_for_question TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS follow_up_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES follow_up_questions(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES triage_cases(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL,
  input_mode VARCHAR(20) DEFAULT 'TEXT',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Urgency Assessments (AI Suggestion Layer)
CREATE TABLE IF NOT EXISTS urgency_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES triage_cases(id) ON DELETE CASCADE,
  suggested_urgency urgency_category NOT NULL,
  confidence_score NUMERIC(4,2) NOT NULL,
  rationale_en TEXT NOT NULL,
  rationale_hi TEXT NOT NULL,
  rationale_or TEXT NOT NULL,
  triggered_red_flags JSONB DEFAULT '[]'::jsonb,
  missing_information JSONB DEFAULT '[]'::jsonb,
  is_diagnostic BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Clinical Reviews (Healthcare Worker Final Review)
CREATE TABLE IF NOT EXISTS clinical_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID UNIQUE NOT NULL REFERENCES triage_cases(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  final_urgency urgency_category NOT NULL,
  override_reason TEXT,
  clinical_triage_notes TEXT NOT NULL,
  action_taken TEXT NOT NULL,
  reviewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Referrals
CREATE TABLE IF NOT EXISTS referrals (
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

-- 16. Appointments
CREATE TABLE IF NOT EXISTS appointments (
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
  appointment_letter_name TEXT,
  referral_letter_url TEXT,
  referral_letter_name TEXT,
  reminder_scheduled BOOLEAN DEFAULT FALSE,
  reminder_scheduled_at TIMESTAMPTZ,
  sync_status VARCHAR(20) DEFAULT 'SYNCED',
  idempotency_key VARCHAR(100) UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. Health Documents (Vault)
CREATE TABLE IF NOT EXISTS health_documents (
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
  secure_file_path TEXT,
  signed_url_expires_at TIMESTAMPTZ,
  sync_status VARCHAR(20) DEFAULT 'SYNCED',
  idempotency_key VARCHAR(100) UNIQUE,
  ocr_extracted_metadata JSONB DEFAULT '{}'::jsonb,
  is_verified_by_patient BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. Document Shares (Time-Limited, Controlled Sharing)
CREATE TABLE IF NOT EXISTS document_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES health_documents(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  shared_with_worker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  case_id UUID REFERENCES triage_cases(id) ON DELETE SET NULL,
  sharing_type VARCHAR(20) DEFAULT 'SINGLE',
  document_ids JSONB DEFAULT '[]'::jsonb,
  document_titles JSONB DEFAULT '[]'::jsonb,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  is_revoked BOOLEAN DEFAULT FALSE,
  revoked_at TIMESTAMPTZ
);

-- 19. Secure Messages
CREATE TABLE IF NOT EXISTS secure_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES triage_cases(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. Notifications
CREATE TABLE IF NOT EXISTS notifications (
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

-- 21. Audit Logs (Immutable Clinical Trail)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  actor_role user_role,
  action_type VARCHAR(80) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. Patient Locations (Geographic Triage & Fleet Coordination)
CREATE TABLE IF NOT EXISTS patient_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  accuracy_meters DOUBLE PRECISION,
  address TEXT,
  landmark TEXT,
  district TEXT,
  pincode VARCHAR(10),
  emergency_contact_number TEXT,
  location_type VARCHAR(20) DEFAULT 'HOME',
  sharing_status VARCHAR(20) DEFAULT 'SHARING_ACTIVE',
  requires_transport_assistance BOOLEAN DEFAULT FALSE,
  distance_km_from_hospital DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. Ambulance Requests (Emergency Transport Dispatch Trail)
CREATE TABLE IF NOT EXISTS ambulance_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES triage_cases(id) ON DELETE SET NULL,
  case_number VARCHAR(30),
  patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  patient_name TEXT,
  phone_number TEXT,
  emergency_contact TEXT,
  pickup_address TEXT,
  pickup_latitude DOUBLE PRECISION,
  pickup_longitude DOUBLE PRECISION,
  hospital_name TEXT,
  primary_symptoms TEXT,
  urgency_level urgency_category DEFAULT 'RED',
  status VARCHAR(30) DEFAULT 'EN_ROUTE',
  eta_minutes INTEGER,
  vehicle_details TEXT,
  driver_details TEXT,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 24. ML Shadow Predictions (Strict Silent Shadow Mode Audit Table)
CREATE TABLE IF NOT EXISTS ml_shadow_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deidentified_case_id VARCHAR(64) NOT NULL,
  model_version VARCHAR(64) NOT NULL,
  dataset_hash VARCHAR(128) NOT NULL,
  predicted_class VARCHAR(10), -- RED, YELLOW, GREEN (NULL on error)
  model_score_json JSONB,      -- Contains uncalibrated model scores
  deterministic_gate_result VARCHAR(20) NOT NULL, -- GREY, RED, PASSED, NONE
  clinician_final_category VARCHAR(10), -- Populated upon qualified human review
  agreement_status VARCHAR(50) DEFAULT 'PENDING_REVIEW', -- EXACT_AGREEMENT, ML_HIGHER, ML_LOWER, RED_MISSED, YELLOW_PREDICTED_GREEN, GATE_DISAGREEMENT, PENDING_REVIEW
  unsafe_downgrade_flag BOOLEAN DEFAULT FALSE,
  conservative_escalation_flag BOOLEAN DEFAULT FALSE,
  processing_time_ms DOUBLE PRECISION,
  model_error_code VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ml_shadow_deidentified_case ON ml_shadow_predictions(deidentified_case_id);
CREATE INDEX IF NOT EXISTS idx_ml_shadow_agreement_status ON ml_shadow_predictions(agreement_status);
CREATE INDEX IF NOT EXISTS idx_ml_shadow_unsafe_flag ON ml_shadow_predictions(unsafe_downgrade_flag);
CREATE INDEX IF NOT EXISTS idx_ml_shadow_created_at ON ml_shadow_predictions(created_at);

-- =====================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE healthcare_workers ENABLE ROW LEVEL SECURITY;
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
ALTER TABLE patient_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambulance_requests ENABLE ROW LEVEL SECURITY;

ALTER TABLE ml_shadow_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_shadow_predictions FORCE ROW LEVEL SECURITY;

-- Helper functions for RBAC
CREATE OR REPLACE FUNCTION auth_user_role() RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE;

-- Profiles Policies
DROP POLICY IF EXISTS "Users view own profile" ON profiles;
CREATE POLICY "Users view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id OR auth_user_role() IN ('DOCTOR', 'NURSE', 'MEDICAL_OFFICER', 'HEALTH_WORKER', 'ADMIN'));

DROP POLICY IF EXISTS "Users update own profile" ON profiles;
CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users insert own profile" ON profiles;
CREATE POLICY "Users insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id OR (SELECT current_setting('role', true)) = 'service_role');

-- Patient Profiles Policies
DROP POLICY IF EXISTS "Patient view own" ON patient_profiles;
CREATE POLICY "Patient view own" ON patient_profiles
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = id OR auth_user_role() IN ('DOCTOR', 'NURSE', 'MEDICAL_OFFICER', 'HEALTH_WORKER'));

DROP POLICY IF EXISTS "Patient manage own" ON patient_profiles;
CREATE POLICY "Patient manage own" ON patient_profiles
  FOR ALL USING (auth.uid() = user_id OR auth.uid() = id OR (SELECT current_setting('role', true)) = 'service_role');

-- Healthcare Workers Policies
DROP POLICY IF EXISTS "Healthcare workers viewable by authenticated" ON healthcare_workers;
CREATE POLICY "Healthcare workers viewable by authenticated" ON healthcare_workers
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Healthcare workers manage own" ON healthcare_workers;
CREATE POLICY "Healthcare workers manage own" ON healthcare_workers
  FOR ALL USING (auth.uid() = id OR auth.uid() = user_id OR auth_user_role() = 'ADMIN' OR (SELECT current_setting('role', true)) = 'service_role');

-- Triage Cases Policies
DROP POLICY IF EXISTS "Patients view own cases" ON triage_cases;
CREATE POLICY "Patients view own cases" ON triage_cases
  FOR SELECT USING (auth.uid() = patient_id);

DROP POLICY IF EXISTS "Healthcare workers view cases" ON triage_cases;
CREATE POLICY "Healthcare workers view cases" ON triage_cases
  FOR SELECT USING (auth_user_role() IN ('DOCTOR', 'NURSE', 'MEDICAL_OFFICER', 'HEALTH_WORKER'));

DROP POLICY IF EXISTS "Patients insert own cases" ON triage_cases;
CREATE POLICY "Patients insert own cases" ON triage_cases
  FOR INSERT WITH CHECK (auth.uid() = patient_id);

DROP POLICY IF EXISTS "Healthcare workers update cases" ON triage_cases;
CREATE POLICY "Healthcare workers update cases" ON triage_cases
  FOR UPDATE USING (auth_user_role() IN ('DOCTOR', 'NURSE', 'MEDICAL_OFFICER', 'HEALTH_WORKER'));

-- Health Documents Policies
DROP POLICY IF EXISTS "Owners view own documents" ON health_documents;
CREATE POLICY "Owners view own documents" ON health_documents
  FOR SELECT USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Healthcare workers view shared documents only" ON health_documents;
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

DROP POLICY IF EXISTS "Owners manage own documents" ON health_documents;
CREATE POLICY "Owners manage own documents" ON health_documents
  FOR ALL USING (auth.uid() = owner_id);

-- Document Shares Policies
DROP POLICY IF EXISTS "Owner manages document shares" ON document_shares;
CREATE POLICY "Owner manages document shares" ON document_shares
  FOR ALL USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Worker views assigned shares" ON document_shares;
CREATE POLICY "Worker views assigned shares" ON document_shares
  FOR SELECT USING (auth.uid() = shared_with_worker_id);

-- Appointments Policies
DROP POLICY IF EXISTS "Patients view own appointments" ON appointments;
CREATE POLICY "Patients view own appointments" ON appointments
  FOR ALL USING (auth.uid() = patient_id OR auth_user_role() IN ('DOCTOR', 'NURSE', 'MEDICAL_OFFICER', 'ADMIN'));

-- Notifications Policies
DROP POLICY IF EXISTS "User views own notifications" ON notifications;
CREATE POLICY "User views own notifications" ON notifications
  FOR ALL USING (auth.uid() = user_id);

-- Audit Logs Policies
DROP POLICY IF EXISTS "Staff views audit logs" ON audit_logs;
CREATE POLICY "Staff views audit logs" ON audit_logs
  FOR SELECT USING (auth_user_role() IN ('DOCTOR', 'NURSE', 'MEDICAL_OFFICER', 'ADMIN'));

DROP POLICY IF EXISTS "Insert audit log" ON audit_logs;
CREATE POLICY "Insert audit log" ON audit_logs
  FOR INSERT WITH CHECK (TRUE);

-- Patient Locations Policies
DROP POLICY IF EXISTS "Patients manage own location" ON patient_locations;
CREATE POLICY "Patients manage own location" ON patient_locations
  FOR ALL USING (auth.uid() = patient_id OR (SELECT current_setting('role', true)) = 'service_role');

DROP POLICY IF EXISTS "Healthcare workers view patient locations" ON patient_locations;
CREATE POLICY "Healthcare workers view patient locations" ON patient_locations
  FOR SELECT USING (auth_user_role() IN ('DOCTOR', 'NURSE', 'MEDICAL_OFFICER', 'HEALTH_WORKER', 'ADMIN'));

-- Ambulance Requests Policies
DROP POLICY IF EXISTS "Patients view own ambulance requests" ON ambulance_requests;
CREATE POLICY "Patients view own ambulance requests" ON ambulance_requests
  FOR SELECT USING (auth.uid() = patient_id);

DROP POLICY IF EXISTS "Patients insert own ambulance requests" ON ambulance_requests;
CREATE POLICY "Patients insert own ambulance requests" ON ambulance_requests
  FOR INSERT WITH CHECK (auth.uid() = patient_id);

DROP POLICY IF EXISTS "Healthcare workers manage ambulance requests" ON ambulance_requests;
CREATE POLICY "Healthcare workers manage ambulance requests" ON ambulance_requests
  FOR ALL USING (auth_user_role() IN ('DOCTOR', 'NURSE', 'MEDICAL_OFFICER', 'HEALTH_WORKER', 'ADMIN') OR (SELECT current_setting('role', true)) = 'service_role');

-- =====================================================================
-- ML SHADOW PREDICTIONS: RESTRICTIVE DEFAULT-DENY CLIENT POLICIES
-- =====================================================================
REVOKE ALL ON TABLE ml_shadow_predictions FROM anon, authenticated;

DROP POLICY IF EXISTS "Deny all client select" ON ml_shadow_predictions;
CREATE POLICY "Deny all client select" ON ml_shadow_predictions
  AS RESTRICTIVE FOR SELECT TO anon, authenticated USING (false);

DROP POLICY IF EXISTS "Deny all client insert" ON ml_shadow_predictions;
CREATE POLICY "Deny all client insert" ON ml_shadow_predictions
  AS RESTRICTIVE FOR INSERT TO anon, authenticated WITH CHECK (false);

DROP POLICY IF EXISTS "Deny all client update" ON ml_shadow_predictions;
CREATE POLICY "Deny all client update" ON ml_shadow_predictions
  AS RESTRICTIVE FOR UPDATE TO anon, authenticated USING (false);

DROP POLICY IF EXISTS "Deny all client delete" ON ml_shadow_predictions;
CREATE POLICY "Deny all client delete" ON ml_shadow_predictions
  AS RESTRICTIVE FOR DELETE TO anon, authenticated USING (false);

-- Only trusted backend code using the Supabase service_role key can insert or update records.
