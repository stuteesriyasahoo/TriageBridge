-- =====================================================================
-- Migration: 20260925_ml_shadow_predictions.sql
-- Table: ml_shadow_predictions
-- Purpose: Silent shadow mode prediction tracking and safety audit
-- Security: Strict RLS - Zero Patient Access, Server/Admin Only
-- =====================================================================

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

-- Index for efficient lookup and audit queries
CREATE INDEX IF NOT EXISTS idx_ml_shadow_deidentified_case ON ml_shadow_predictions(deidentified_case_id);
CREATE INDEX IF NOT EXISTS idx_ml_shadow_agreement_status ON ml_shadow_predictions(agreement_status);
CREATE INDEX IF NOT EXISTS idx_ml_shadow_unsafe_flag ON ml_shadow_predictions(unsafe_downgrade_flag);
CREATE INDEX IF NOT EXISTS idx_ml_shadow_created_at ON ml_shadow_predictions(created_at);

-- Enable Row-Level Security (RLS)
ALTER TABLE ml_shadow_predictions ENABLE ROW LEVEL SECURITY;

-- CRITICAL RESTRICTION: Patients must NEVER access this table
-- Drop any potentially permissive existing policies
DROP POLICY IF EXISTS "Deny all patient access" ON ml_shadow_predictions;
DROP POLICY IF EXISTS "Server and admin view shadow predictions" ON ml_shadow_predictions;
DROP POLICY IF EXISTS "Server inserts shadow predictions" ON ml_shadow_predictions;

-- Policy 1: Only administrators and clinical audit officers can view shadow evaluation records
CREATE POLICY "Server and admin view shadow predictions" ON ml_shadow_predictions
  FOR SELECT USING (
    -- If auth_user_role function exists in schema, restrict to ADMIN
    (SELECT current_setting('role', true)) = 'service_role'
    OR (auth.jwt() ->> 'role') = 'service_role'
    OR (auth_user_role() = 'ADMIN')
  );

-- Policy 2: Server-only insertion (service_role or authenticated backend service)
CREATE POLICY "Server inserts shadow predictions" ON ml_shadow_predictions
  FOR INSERT WITH CHECK (
    (SELECT current_setting('role', true)) = 'service_role'
    OR (auth.jwt() ->> 'role') = 'service_role'
    OR (auth_user_role() IN ('ADMIN', 'DOCTOR', 'MEDICAL_OFFICER'))
  );

-- Policy 3: Updates permitted only for recording clinician comparison results
CREATE POLICY "Server updates shadow predictions" ON ml_shadow_predictions
  FOR UPDATE USING (
    (SELECT current_setting('role', true)) = 'service_role'
    OR (auth.jwt() ->> 'role') = 'service_role'
    OR (auth_user_role() IN ('ADMIN', 'DOCTOR', 'MEDICAL_OFFICER'))
  );
