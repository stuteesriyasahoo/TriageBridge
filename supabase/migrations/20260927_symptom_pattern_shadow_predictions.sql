-- =====================================================================
-- Migration: 20260927_symptom_pattern_shadow_predictions.sql
-- Table: symptom_pattern_shadow_predictions
-- STATUS: DRAFT / REJECTED FOR APPLICATION ACTIVATION - DO NOT APPLY YET
--
-- CRITICAL APPLICATION GATE:
-- Do NOT activate, deploy or apply this migration to any database until:
--   1. Model safety gates pass.
--   2. Dataset provenance is verified.
--   3. Migration receives explicit approval.
--
-- AUDIT CLARIFICATION:
-- Existing RLS checks for this migration are static SQL script inspections,
-- NOT live Supabase database RLS verification.
--
-- Purpose: Isolated backend-only storage for experimental symptom-pattern research
-- Security: Strict RLS with FORCE RLS - Zero Patient and Zero Client Doctor Access
-- =====================================================================

CREATE TABLE IF NOT EXISTS symptom_pattern_shadow_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  triage_case_id UUID REFERENCES triage_cases(id) ON DELETE CASCADE,
  model_version TEXT NOT NULL,
  dataset_version TEXT NOT NULL,
  pattern_matches JSONB NOT NULL DEFAULT '[]'::jsonb,
  confidence_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  abstained BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  research_disclaimer TEXT NOT NULL DEFAULT 'UNVERIFIED_RESEARCH_DATA_NOT_FOR_DIAGNOSIS_OR_TREATMENT'
);

-- Performance and audit indexing
CREATE INDEX IF NOT EXISTS idx_symptom_pattern_case_id ON symptom_pattern_shadow_predictions(triage_case_id);
CREATE INDEX IF NOT EXISTS idx_symptom_pattern_created_at ON symptom_pattern_shadow_predictions(created_at);
CREATE INDEX IF NOT EXISTS idx_symptom_pattern_abstained ON symptom_pattern_shadow_predictions(abstained);

-- Enable and FORCE Row-Level Security
ALTER TABLE symptom_pattern_shadow_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_pattern_shadow_predictions FORCE ROW LEVEL SECURITY;

-- CRITICAL ACCESS RESTRICTION:
-- Explicitly revoke all privileges from client roles: 'anon' and 'authenticated'
-- Both patients and doctors operating through standard frontend clients have NO access.
REVOKE ALL ON symptom_pattern_shadow_predictions FROM anon;
REVOKE ALL ON symptom_pattern_shadow_predictions FROM authenticated;

-- Ensure public cannot access
REVOKE ALL ON symptom_pattern_shadow_predictions FROM public;

-- Drop any existing policies
DROP POLICY IF EXISTS "service_role_manage_symptom_patterns" ON symptom_pattern_shadow_predictions;
DROP POLICY IF EXISTS "deny_all_client_access" ON symptom_pattern_shadow_predictions;

-- Policy 1: Service-Role Only Policy
-- Trusted backend service-role execution only (API routes with SUPABASE_SERVICE_ROLE_KEY)
CREATE POLICY "service_role_manage_symptom_patterns" ON symptom_pattern_shadow_predictions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy 2..5: Explicit Restrictive Default-Deny Policies for Client Roles
DROP POLICY IF EXISTS "deny_all_client_select" ON symptom_pattern_shadow_predictions;
CREATE POLICY "deny_all_client_select" ON symptom_pattern_shadow_predictions
  AS RESTRICTIVE FOR SELECT TO anon, authenticated USING (false);

DROP POLICY IF EXISTS "deny_all_client_insert" ON symptom_pattern_shadow_predictions;
CREATE POLICY "deny_all_client_insert" ON symptom_pattern_shadow_predictions
  AS RESTRICTIVE FOR INSERT TO anon, authenticated WITH CHECK (false);

DROP POLICY IF EXISTS "deny_all_client_update" ON symptom_pattern_shadow_predictions;
CREATE POLICY "deny_all_client_update" ON symptom_pattern_shadow_predictions
  AS RESTRICTIVE FOR UPDATE TO anon, authenticated USING (false);

DROP POLICY IF EXISTS "deny_all_client_delete" ON symptom_pattern_shadow_predictions;
CREATE POLICY "deny_all_client_delete" ON symptom_pattern_shadow_predictions
  AS RESTRICTIVE FOR DELETE TO anon, authenticated USING (false);
