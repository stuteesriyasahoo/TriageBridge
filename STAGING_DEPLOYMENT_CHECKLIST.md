# TriageBridge Staging Deployment & Hackathon Demo Readiness Checklist

**System:** TriageBridge (Emergency Clinical Triage Platform)  
**Safety Protocol:** Strict Silent Shadow Mode (Disabled by Default)  
**Document Version:** 1.0.0-hackathon-demo  
**Last Updated:** 2026-09-26  
**Status:** **READY FOR STAGING DEPLOYMENT & LOCAL DEMONSTRATION**

---

> [!IMPORTANT]
> ### MANDATORY CLINICAL & AI SAFETY NOTICE
> **“AI-generated triage support — not a diagnosis. Final decisions must be made by a qualified healthcare professional.”**
>
> 1. `TRIAGE_ML_SHADOW_ENABLED=false` must remain enforced in production and demo configurations.
> 2. Model predictions (both provisional urgency and auxiliary disease patterns) must **NEVER** be shown to patients.
> 3. Only clearly labelled synthetic demo cases (`is_synthetic: true`) may be used during presentations.
> 4. All clinical decisions must follow the mandatory deterministic clinical workflow:
>    $$\text{Patient Intake} \longrightarrow \text{Missing-Info Check (GREY)} \longrightarrow \text{Red-Flag Rules (RED)} \longrightarrow \text{Provisional Triage} \longrightarrow \text{Healthcare-Worker Final Review}$$

---

## 1. Supabase Staging Project Setup

- [ ] **1.1 Create Staging Project**:
  - Create a new project in the Supabase Dashboard: e.g. `triagebridge-staging` in region `ap-south-1` (Mumbai).
  - Record the Project Reference, Project URL (`https://<ref>.supabase.co`), and Anon Key.
- [ ] **1.2 Database Password & Connection String**:
  - Securely store the Postgres database password in your team's password vault.
  - Test connectivity via psql or Supabase CLI:
    ```bash
    supabase link --project-ref <your-staging-ref>
    ```
- [ ] **1.3 Authentication Configuration**:
  - Enable Email/Password Auth in `Authentication -> Providers`.
  - Disable public user signups if staging is restricted, or configure email confirmation.
  - Set JWT expiration to a safe default (e.g. 3600 seconds).

---

## 2. Required Environment Variables

Configure `.env.local` (or staging deployment environment settings):

```ini
# =====================================================================
# TriageBridge Staging Configuration
# =====================================================================

# 1. Feature Flag: STRICTLY FALSE FOR DEMO & PRODUCTION
TRIAGE_ML_SHADOW_ENABLED=false

# 2. Remote ML Service URL (Optional container microservice; omit for demo subprocess)
TRIAGE_ML_SERVICE_URL=http://localhost:8001

# 3. Server-Only Secrets (NEVER prefix with NEXT_PUBLIC_)
TRIAGE_ML_SERVICE_SECRET=generate_strong_random_secret_min_32_chars
TRIAGE_DEID_SALT=generate_strong_random_salt_min_32_chars
SUPABASE_SERVICE_ROLE_KEY=eyJh...<your_supabase_service_role_key>

# 4. Public Client Configuration
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...<your_supabase_anon_key>
NEXT_PUBLIC_APP_ENV=staging
NEXT_PUBLIC_DEMO_MODE=true
```

- [ ] **Verification**:
  - [ ] No secret contains `NEXT_PUBLIC_`.
  - [ ] `git ls-files .env.local` returns 0 files.
  - [ ] `TRIAGE_ML_SERVICE_SECRET` and `TRIAGE_DEID_SALT` are strong independent 32-byte hex values.

---

## 3. Database Migration Application

Execute database migrations in strict sequential order against the staging database:

- [ ] **3.1 Base Schema**:
  ```bash
  psql "$DATABASE_URL" -f supabase/schema.sql
  ```
  *Verifies tables:* `patient_profiles`, `healthcare_workers`, `triage_cases`, `appointments`, `health_documents`, `ml_shadow_predictions`.
- [ ] **3.2 ML Shadow Predictions Table**:
  ```bash
  psql "$DATABASE_URL" -f supabase/migrations/20260925_ml_shadow_predictions.sql
  ```
- [ ] **3.3 Permissions Hardening & Default-Deny RLS**:
  ```bash
  psql "$DATABASE_URL" -f supabase/migrations/20260925_ml_shadow_predictions_hardening.sql
  ```
  *Verifies:*
  - `REVOKE ALL ON TABLE ml_shadow_predictions FROM anon, authenticated;`
  - Restrictive default-deny policies on `SELECT`, `INSERT`, `UPDATE`, `DELETE`.
  - Append-only server-side insertion via `service_role`.

---

## 4. Live Supabase RLS Integration Testing

- [ ] **4.1 Execute Test Suite**:
  Run the automated live integration test:
  ```bash
  node scripts/supabase_rls_integration_test.mjs
  ```
- [ ] **4.2 Verification Points**:
  - [ ] **Anonymous Access**: Direct `SELECT`, `INSERT`, `UPDATE`, `DELETE` on `ml_shadow_predictions` return 0 rows or are rejected (HTTP 401/403).
  - [ ] **Patient Role Access**: Patients cannot query `ml_shadow_predictions`, cannot view other patients' triage cases, and cannot mutate clinical decisions.
  - [ ] **Doctor Role Access**: Doctors cannot directly modify hidden ML shadow records (client queries return 0 rows or HTTP 403).
  - [ ] **Service-Role Privileged Access**: Trusted server code using `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS and writes audit records without error.
  - [ ] **Live Verification Requirement**: Do not sign off on RLS until this script runs against a live Supabase URL and reports all test suites passed.

---

## 5. Patient & Healthcare-Worker Role Isolation

- [ ] **5.1 Patient Screen Isolation**:
  - Login as test patient (`pat-001`).
  - Attempt navigation to `/healthcare/dashboard`, `/healthcare/queue`, `/healthcare/review/[id]`.
  - Confirm automatic redirection to `/access-denied` or patient portal.
- [ ] **5.2 Healthcare-Worker Screen Isolation**:
  - Login as test nurse or medical officer (`doc-001`).
  - Confirm access to queue and triage review screens.
  - Confirm ML predictions are hidden from review cards until human clinician selects an urgency.

---

## 6. Offline Submission & Resynchronization

- [ ] **6.1 Offline Intake**:
  - In browser DevTools, toggle **Network $\rightarrow$ Offline**.
  - Submit a new emergency intake through `/patient/triage`.
  - Confirm submission is stored in client IndexedDB (`tb_triage_drafts_v1` / `tb_cases_v1`).
  - Confirm user receives offline confirmation slip with local reference number.
- [ ] **6.2 Resynchronization**:
  - Toggle **Network $\rightarrow$ Online**.
  - Confirm offline sync engine (`src/lib/offline-sync.ts`) automatically flushes queued cases.
  - Confirm status transitions from `LOCAL_PENDING_SYNC` $\rightarrow$ `SUBMITTED`.
- [ ] **6.3 Duplicate Submission Prevention (Idempotency)**:
  - Submit the same case payload twice in rapid succession.
  - Confirm idempotency token (`clientSubmissionId`) deduplicates the request; exactly one case record is created.

---

## 7. Document Upload Authorization

- [ ] **7.1 Storage Buckets**:
  - Confirm storage buckets (`medical-reports`, `patient-images`) are configured as **Private** (public read = `false`).
- [ ] **7.2 Path-Based Isolation**:
  - Objects must be uploaded with paths prefixed by the patient's authenticated UUID:
    `medical-reports/{patient_id}/{document_uuid}.pdf`
  - Attempting to download a report belonging to another patient via raw URL must return HTTP 403 Forbidden.

---

## 8. Hackathon Demo Mode & Synthetic Data Integrity

- [ ] **8.1 Demo Mode Configuration**:
  - Verify `NEXT_PUBLIC_DEMO_MODE=true` in `.env.local`.
- [ ] **8.2 Clearly Labelled Synthetic Patients**:
  - All test patients must use synthetic IDs: e.g. `PAT-2026-8912`, `PAT-SYNTH-101`.
  - Aadhaar / ID numbers must be masked: `XXXX-XXXX-8912`.
  - Every demo case must carry `is_synthetic: true` and `is_validated: false`.
- [ ] **8.3 Banner & Disclaimer Display**:
  - Verify the global clinical disclaimer banner is visible on the presentation header:
    > **“AI-generated triage support — not a diagnosis. Final decisions must be made by a qualified healthcare professional.”**

---

## 9. Production Build & Lint Verification

- [ ] **9.1 TypeScript Check**:
  ```bash
  npx tsc --noEmit
  ```
  *Expected result:* 0 errors.
- [ ] **9.2 Production Build**:
  ```bash
  npm run build
  ```
  *Expected result:* All 27 routes compiled successfully with Turbopack.
- [ ] **9.3 Staging E2E Test Suite**:
  ```bash
  node scripts/e2e_shadow_staging_test.mjs
  ```
  *Expected result:* 19 PASSED, 0 FAILED.

---

## 10. Final Presentation Sign-Off

| Milestone | Owner | Status | Date |
| :--- | :--- | :---: | :---: |
| Database RLS Migration Applied | DevOps / Backend | [ ] PENDING LIVE STAGING | — |
| RLS Integration Script Executed | QA / Security | [ ] PENDING LIVE STAGING | — |
| Secret Leakage Verified (0 tracked) | Security | [X] VERIFIED CLEAN | 2026-09-26 |
| Feature Flag Disabled (`false`) | ML Engineering | [X] VERIFIED FALSE | 2026-09-26 |
| Hackathon Synthetic Data Guard | Clinical Lead | [X] READY | 2026-09-26 |
| Production Build Passing | Lead Engineer | [X] VERIFIED (27/27) | 2026-09-26 |
