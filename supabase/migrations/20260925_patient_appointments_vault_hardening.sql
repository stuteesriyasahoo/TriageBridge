-- =====================================================================
-- Migration: 20260925_patient_appointments_vault_hardening.sql
-- TriageBridge - Patient Appointments & Secure Health Document Vault
-- =====================================================================

-- 1. APPOINTMENTS TABLE HARDENING
ALTER TABLE appointments 
  ADD COLUMN IF NOT EXISTS appointment_letter_name TEXT,
  ADD COLUMN IF NOT EXISTS referral_letter_url TEXT,
  ADD COLUMN IF NOT EXISTS referral_letter_name TEXT,
  ADD COLUMN IF NOT EXISTS reminder_scheduled BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS reminder_scheduled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sync_status VARCHAR(20) DEFAULT 'SYNCED',
  ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(100) UNIQUE;

-- Create index for quick lookup of appointments by patient and status
CREATE INDEX IF NOT EXISTS idx_appointments_patient_status 
  ON appointments(patient_id, status, appointment_date DESC);

-- 2. HEALTH DOCUMENTS VAULT HARDENING
ALTER TABLE health_documents 
  ADD COLUMN IF NOT EXISTS secure_file_path TEXT,
  ADD COLUMN IF NOT EXISTS signed_url_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sync_status VARCHAR(20) DEFAULT 'SYNCED',
  ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(100) UNIQUE;

-- Create indexes for document category search and patient vault queries
CREATE INDEX IF NOT EXISTS idx_health_documents_owner_category 
  ON health_documents(owner_id, category);

CREATE INDEX IF NOT EXISTS idx_health_documents_created_at 
  ON health_documents(owner_id, created_at DESC);

-- Ensure allowed mime types for security
ALTER TABLE health_documents 
  DROP CONSTRAINT IF EXISTS chk_valid_document_mime;

ALTER TABLE health_documents 
  ADD CONSTRAINT chk_valid_document_mime 
  CHECK (mime_type IN (
    'application/pdf', 
    'image/jpeg', 
    'image/jpg', 
    'image/png'
  ));

-- 3. DOCUMENT SHARES HARDENING (Controlled, Time-Limited, Zero-Trust)
ALTER TABLE document_shares
  ADD COLUMN IF NOT EXISTS sharing_type VARCHAR(20) DEFAULT 'SINGLE', -- 'SINGLE', 'BATCH', 'CASE_ATTACHED'
  ADD COLUMN IF NOT EXISTS document_ids JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS document_titles JSONB DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_document_shares_worker_active 
  ON document_shares(shared_with_worker_id, is_revoked, expires_at);

CREATE INDEX IF NOT EXISTS idx_document_shares_owner 
  ON document_shares(owner_id);

-- 4. PRIVATE SUPABASE STORAGE BUCKETS CONFIGURATION
-- Ensure buckets exist and are marked private (public = false)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  (
    'health-documents', 
    'health-documents', 
    false, 
    15728640, -- 15MB limit
    ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
  ),
  (
    'appointment-letters', 
    'appointment-letters', 
    false, 
    10485760, -- 10MB limit
    ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
  )
ON CONFLICT (id) DO UPDATE SET 
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 5. STORAGE ROW-LEVEL SECURITY (RLS) POLICIES
-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Patients can upload to their own scoped vault folder: vault/{auth.uid()}/...
DROP POLICY IF EXISTS "Patients upload own vault documents" ON storage.objects;
CREATE POLICY "Patients upload own vault documents" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id IN ('health-documents', 'appointment-letters') 
    AND (storage.foldername(name))[1] = 'vault'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

-- Patients can read their own documents in their scoped vault folder
DROP POLICY IF EXISTS "Patients view own vault documents" ON storage.objects;
CREATE POLICY "Patients view own vault documents" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id IN ('health-documents', 'appointment-letters') 
    AND (storage.foldername(name))[1] = 'vault'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

-- Patients can delete their own documents
DROP POLICY IF EXISTS "Patients delete own vault documents" ON storage.objects;
CREATE POLICY "Patients delete own vault documents" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id IN ('health-documents', 'appointment-letters') 
    AND (storage.foldername(name))[1] = 'vault'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

-- Healthcare workers can ONLY view documents that are explicitly shared with them
DROP POLICY IF EXISTS "Clinicians view explicitly shared documents" ON storage.objects;
CREATE POLICY "Clinicians view explicitly shared documents" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'health-documents'
    AND EXISTS (
      SELECT 1 FROM document_shares ds
      JOIN health_documents hd ON hd.id = ds.document_id
      WHERE ds.shared_with_worker_id = auth.uid()
        AND ds.is_revoked = FALSE
        AND ds.expires_at > NOW()
        AND storage.objects.name = hd.storage_path
    )
  );

-- 6. AUDIT TRAIL LOGGING FUNCTION FOR DOCUMENT ACTIONS
CREATE OR REPLACE FUNCTION log_document_action() 
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO audit_logs (actor_id, actor_role, action_type, resource_type, resource_id, details)
    VALUES (
      NEW.owner_id, 
      'PATIENT', 
      'DOCUMENT_UPLOADED', 
      'HEALTH_DOCUMENT', 
      NEW.id::text, 
      jsonb_build_object('title', NEW.title, 'category', NEW.category, 'fileName', NEW.file_name)
    );
  ELSIF (TG_OP = 'UPDATE' AND OLD.title <> NEW.title) THEN
    INSERT INTO audit_logs (actor_id, actor_role, action_type, resource_type, resource_id, details)
    VALUES (
      NEW.owner_id, 
      'PATIENT', 
      'DOCUMENT_RENAMED', 
      'HEALTH_DOCUMENT', 
      NEW.id::text, 
      jsonb_build_object('oldTitle', OLD.title, 'newTitle', NEW.title)
    );
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO audit_logs (actor_id, actor_role, action_type, resource_type, resource_id, details)
    VALUES (
      OLD.owner_id, 
      'PATIENT', 
      'DOCUMENT_DELETED', 
      'HEALTH_DOCUMENT', 
      OLD.id::text, 
      jsonb_build_object('title', OLD.title, 'fileName', OLD.file_name)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_audit_health_documents ON health_documents;
CREATE TRIGGER trg_audit_health_documents
  AFTER INSERT OR UPDATE OR DELETE ON health_documents
  FOR EACH ROW EXECUTE FUNCTION log_document_action();

-- 7. AUDIT TRAIL LOGGING FUNCTION FOR DOCUMENT SHARING
CREATE OR REPLACE FUNCTION log_share_action() 
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO audit_logs (actor_id, actor_role, action_type, resource_type, resource_id, details)
    VALUES (
      NEW.owner_id, 
      'PATIENT', 
      'DOCUMENT_SHARED', 
      'DOCUMENT_SHARE', 
      NEW.id::text, 
      jsonb_build_object(
        'documentId', NEW.document_id,
        'sharedWithWorkerId', NEW.shared_with_worker_id,
        'expiresAt', NEW.expires_at,
        'sharingType', NEW.sharing_type
      )
    );
  ELSIF (TG_OP = 'UPDATE' AND OLD.is_revoked = FALSE AND NEW.is_revoked = TRUE) THEN
    INSERT INTO audit_logs (actor_id, actor_role, action_type, resource_type, resource_id, details)
    VALUES (
      NEW.owner_id, 
      'PATIENT', 
      'SHARE_REVOKED', 
      'DOCUMENT_SHARE', 
      NEW.id::text, 
      jsonb_build_object('documentId', NEW.document_id, 'revokedAt', NEW.revoked_at)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_audit_document_shares ON document_shares;
CREATE TRIGGER trg_audit_document_shares
  AFTER INSERT OR UPDATE ON document_shares
  FOR EACH ROW EXECUTE FUNCTION log_share_action();

-- 8. AUDIT TRAIL LOGGING FOR APPOINTMENTS
CREATE OR REPLACE FUNCTION log_appointment_action() 
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO audit_logs (actor_id, actor_role, action_type, resource_type, resource_id, details)
    VALUES (
      NEW.patient_id, 
      'PATIENT', 
      'APPOINTMENT_CREATED', 
      'APPOINTMENT', 
      NEW.id::text, 
      jsonb_build_object('hospital', NEW.hospital_name, 'department', NEW.department, 'date', NEW.appointment_date)
    );
  ELSIF (TG_OP = 'UPDATE' AND OLD.status <> NEW.status) THEN
    INSERT INTO audit_logs (actor_id, actor_role, action_type, resource_type, resource_id, details)
    VALUES (
      NEW.patient_id, 
      'PATIENT', 
      CASE 
        WHEN NEW.status = 'CANCELLED' THEN 'APPOINTMENT_CANCELLED'
        WHEN NEW.status = 'RESCHEDULED' THEN 'APPOINTMENT_RESCHEDULED'
        ELSE 'APPOINTMENT_UPDATED'
      END, 
      'APPOINTMENT', 
      NEW.id::text, 
      jsonb_build_object('oldStatus', OLD.status, 'newStatus', NEW.status, 'date', NEW.appointment_date)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_audit_appointments ON appointments;
CREATE TRIGGER trg_audit_appointments
  AFTER INSERT OR UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION log_appointment_action();
