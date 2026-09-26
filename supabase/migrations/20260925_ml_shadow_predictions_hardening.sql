-- =====================================================================
-- Migration: 20260925_ml_shadow_predictions_hardening.sql
-- Description: Corrective hardening of ml_shadow_predictions table
-- 
-- SECURITY POSTURE:
-- 1. Default-Deny RLS: Zero direct access for anon and authenticated client roles.
--    - Patients CANNOT SELECT, INSERT, UPDATE, or DELETE.
--    - Doctors CANNOT SELECT, INSERT, UPDATE, or DELETE.
--    - Medical Officers CANNOT SELECT, INSERT, UPDATE, or DELETE.
--    - Client-side Administrators CANNOT SELECT, INSERT, UPDATE, or DELETE.
-- 2. Trusted Backend Only:
--    - Inserts and comparison updates are executed strictly server-side
--      via the Supabase service_role credential (which bypasses RLS).
--    - The service_role credential NEVER appears in browser code.
-- 3. Immutability & Append-Only:
--    - No DELETE policy granted to any user role.
--    - Records are append-only except for server-side clinician comparison updates.
-- =====================================================================

-- Ensure RLS is active and forced on table
ALTER TABLE ml_shadow_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_shadow_predictions FORCE ROW LEVEL SECURITY;

-- Drop all previous policies that permitted client-side roles to query or insert
DROP POLICY IF EXISTS "Server and admin view shadow predictions" ON ml_shadow_predictions;
DROP POLICY IF EXISTS "Server inserts shadow predictions" ON ml_shadow_predictions;
DROP POLICY IF EXISTS "Server updates shadow predictions" ON ml_shadow_predictions;
DROP POLICY IF EXISTS "Deny all patient access" ON ml_shadow_predictions;
DROP POLICY IF EXISTS "Deny all user access" ON ml_shadow_predictions;

-- Explicitly revoke all privileges from anon and authenticated client roles
REVOKE ALL ON TABLE ml_shadow_predictions FROM anon, authenticated;

-- Explicit Default-Deny Policies (Defence-in-Depth)
-- Under Postgres RLS, absence of policies denies all access.
-- We also add explicit restrictive denial policies to ensure no ambient grants apply:

CREATE POLICY "Deny all client select" ON ml_shadow_predictions
  AS RESTRICTIVE
  FOR SELECT
  TO anon, authenticated
  USING (false);

CREATE POLICY "Deny all client insert" ON ml_shadow_predictions
  AS RESTRICTIVE
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (false);

CREATE POLICY "Deny all client update" ON ml_shadow_predictions
  AS RESTRICTIVE
  FOR UPDATE
  TO anon, authenticated
  USING (false);

CREATE POLICY "Deny all client delete" ON ml_shadow_predictions
  AS RESTRICTIVE
  FOR DELETE
  TO anon, authenticated
  USING (false);

-- Commentary:
-- The trusted backend communicates using the Supabase service-role key or directly via server-side connection.
-- The service_role identity automatically bypasses RLS policies in Supabase PostgreSQL,
-- ensuring that only server-side orchestration code can write shadow predictions.
