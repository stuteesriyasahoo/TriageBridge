-- Migration: harden_consents_functions_and_indexes
-- Description: Enable and force RLS on public.consents with granular patient and assigned-worker policies,
-- fix function search_path warnings, and add covering indexes for foreign keys.

-- =====================================================================
-- 1. FUNCTIONS: FIX MUTABLE SEARCH_PATH
-- =====================================================================
CREATE OR REPLACE FUNCTION public.auth_user_role()
RETURNS public.user_role
LANGUAGE sql
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT role FROM public.profiles WHERE id = (SELECT auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- =====================================================================
-- 2. PUBLIC.CONSENTS: RLS, FORCE RLS, GRANTS & SCOPED POLICIES
-- =====================================================================
ALTER TABLE public.consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consents FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.consents FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.consents TO authenticated;

DROP POLICY IF EXISTS "Patients view own consents" ON public.consents;
DROP POLICY IF EXISTS "Patients manage own consents" ON public.consents;
DROP POLICY IF EXISTS "patients_select_own_consents" ON public.consents;
DROP POLICY IF EXISTS "patients_insert_own_consents" ON public.consents;
DROP POLICY IF EXISTS "patients_update_own_consents" ON public.consents;
DROP POLICY IF EXISTS "patients_delete_own_consents" ON public.consents;
DROP POLICY IF EXISTS "Assigned healthcare workers view consents" ON public.consents;
DROP POLICY IF EXISTS "authorized_healthcare_workers_select_assigned_consents" ON public.consents;

-- Patients may read only their own consent records
CREATE POLICY "patients_select_own_consents" ON public.consents
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = patient_id);

-- Patients may insert only consent records for themselves
CREATE POLICY "patients_insert_own_consents" ON public.consents
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = patient_id);

-- Patients may update only their own consent records
CREATE POLICY "patients_update_own_consents" ON public.consents
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = patient_id)
  WITH CHECK ((SELECT auth.uid()) = patient_id);

-- Patients may delete only their own consent records
CREATE POLICY "patients_delete_own_consents" ON public.consents
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = patient_id);

-- Authorized healthcare workers may read only consent records required for assigned/shared cases
CREATE POLICY "authorized_healthcare_workers_select_assigned_consents" ON public.consents
  FOR SELECT TO authenticated
  USING (
    public.auth_user_role() IN ('DOCTOR', 'NURSE', 'MEDICAL_OFFICER', 'HEALTH_WORKER')
    AND (
      EXISTS (
        SELECT 1 FROM public.triage_cases tc
        WHERE tc.patient_id = consents.patient_id
          AND tc.assigned_worker_id = (SELECT auth.uid())
      )
      OR EXISTS (
        SELECT 1 FROM public.document_shares ds
        WHERE ds.owner_id = consents.patient_id
          AND ds.shared_with_worker_id = (SELECT auth.uid())
          AND ds.is_revoked = FALSE
          AND ds.expires_at > NOW()
      )
      OR EXISTS (
        SELECT 1 FROM public.referrals ref
        WHERE ref.patient_id = consents.patient_id
          AND ref.referring_worker_id = (SELECT auth.uid())
      )
    )
  );

-- =====================================================================
-- 3. COVERING INDEXES FOR FOREIGN KEYS
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_ambulance_requests_case_id ON public.ambulance_requests(case_id);
CREATE INDEX IF NOT EXISTS idx_ambulance_requests_patient_id ON public.ambulance_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_case_id ON public.appointments(case_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_clinical_reviews_reviewer_id ON public.clinical_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_consents_patient_id ON public.consents(patient_id);
CREATE INDEX IF NOT EXISTS idx_document_shares_case_id ON public.document_shares(case_id);
CREATE INDEX IF NOT EXISTS idx_document_shares_document_id ON public.document_shares(document_id);
CREATE INDEX IF NOT EXISTS idx_document_shares_owner_id ON public.document_shares(owner_id);
CREATE INDEX IF NOT EXISTS idx_document_shares_shared_with_worker_id ON public.document_shares(shared_with_worker_id);
CREATE INDEX IF NOT EXISTS idx_extracted_report_data_report_id ON public.extracted_report_data(report_id);
CREATE INDEX IF NOT EXISTS idx_follow_up_answers_case_id ON public.follow_up_answers(case_id);
CREATE INDEX IF NOT EXISTS idx_follow_up_answers_question_id ON public.follow_up_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_follow_up_questions_case_id ON public.follow_up_questions(case_id);
CREATE INDEX IF NOT EXISTS idx_health_documents_owner_id ON public.health_documents(owner_id);
CREATE INDEX IF NOT EXISTS idx_healthcare_workers_user_id ON public.healthcare_workers(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_case_id ON public.notifications(case_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_patient_locations_patient_id ON public.patient_locations(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_profiles_user_id ON public.patient_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_case_id ON public.referrals(case_id);
CREATE INDEX IF NOT EXISTS idx_referrals_patient_id ON public.referrals(patient_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referring_worker_id ON public.referrals(referring_worker_id);
CREATE INDEX IF NOT EXISTS idx_secure_messages_case_id ON public.secure_messages(case_id);
CREATE INDEX IF NOT EXISTS idx_secure_messages_recipient_id ON public.secure_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_secure_messages_sender_id ON public.secure_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_symptom_entries_case_id ON public.symptom_entries(case_id);
CREATE INDEX IF NOT EXISTS idx_triage_cases_assigned_worker_id ON public.triage_cases(assigned_worker_id);
CREATE INDEX IF NOT EXISTS idx_triage_cases_patient_id ON public.triage_cases(patient_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_reports_case_id ON public.uploaded_reports(case_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_reports_patient_id ON public.uploaded_reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_urgency_assessments_case_id ON public.urgency_assessments(case_id);
CREATE INDEX IF NOT EXISTS idx_vital_signs_case_id ON public.vital_signs(case_id);
CREATE INDEX IF NOT EXISTS idx_voice_transcripts_case_id ON public.voice_transcripts(case_id);
