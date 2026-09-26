# TriageBridge Live Supabase RLS Integration Test Report

**Execution Timestamp:** 2026-09-26T14:43:15.017Z
**Staging Target:** https://qqyimugnnhaocwangdmm.supabase.co
**Environment:** Staging / Pre-Production
**Sanitization Notice:** All keys, tokens, emails, passwords, and synthetic identities are masked in this report.

## 1. Test Execution Summary

| Total Tests Planned | Executed Tests | Passed | Failed | Skipped | Status |
| :---: | :---: | :---: | :---: | :---: | :---: |
| 23 | 8 | 8 | 0 | 15 | **EXECUTED PASSED (SOME SKIPPED)** |

## 2. Executed Row-Level Security Matrix Results

| Test Description | Role Tested | Operation | Target Table | Expected Result | Actual HTTP Status | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| Anon cannot SELECT ml_shadow_predictions | `ANONYMOUS` | `SELECT` | `ml_shadow_predictions` | 0 rows or 401/403 | HTTP 401 | PASSED |
| Anon cannot INSERT ml_shadow_predictions | `ANONYMOUS` | `INSERT` | `ml_shadow_predictions` | 401/403/42501 | HTTP 401 | PASSED |
| Anon cannot UPDATE ml_shadow_predictions | `ANONYMOUS` | `UPDATE` | `ml_shadow_predictions` | Blocked / 0 rows | HTTP 401 | PASSED |
| Anon cannot DELETE ml_shadow_predictions | `ANONYMOUS` | `DELETE` | `ml_shadow_predictions` | Blocked / 0 rows | HTTP 401 | PASSED |
| Anon cannot SELECT triage_cases | `ANONYMOUS` | `SELECT` | `triage_cases` | 0 rows or 401/403 | HTTP 401 | PASSED |
| Anon cannot INSERT triage_cases | `ANONYMOUS` | `INSERT` | `triage_cases` | Blocked / Error | HTTP 401 | PASSED |
| Anon cannot SELECT consents | `ANONYMOUS` | `SELECT` | `consents` | 0 rows or 401/403 | HTTP 401 | PASSED |
| Anon cannot INSERT consents | `ANONYMOUS` | `INSERT` | `consents` | Blocked / 401/403 | HTTP 401 | PASSED |

## 3. Skipped Tests (Awaiting Staging Service-Role Key)

| Test Description | Intended Role | Operation | Target Table | Reason Skipped |
| :--- | :---: | :---: | :---: | :--- |
| Patient cannot SELECT ml_shadow_predictions | `PATIENT` | `SELECT` | `ml_shadow_predictions` | Awaiting test account provisioning via service role key |
| Patient cannot INSERT ml_shadow_predictions | `PATIENT` | `INSERT` | `ml_shadow_predictions` | Awaiting test account provisioning via service role key |
| Patient can INSERT own triage case | `PATIENT` | `INSERT` | `triage_cases` | Awaiting test account provisioning via service role key |
| Patient can SELECT own triage case | `PATIENT` | `SELECT` | `triage_cases` | Awaiting test account provisioning via service role key |
| Patient CANNOT SELECT other patients cases | `PATIENT` | `SELECT` | `triage_cases` | Awaiting test account provisioning via service role key |
| Patient can INSERT own consent | `PATIENT` | `INSERT` | `consents` | Awaiting test account provisioning via service role key |
| Patient can SELECT own consent | `PATIENT` | `SELECT` | `consents` | Awaiting test account provisioning via service role key |
| Patient CANNOT SELECT other patients consents | `PATIENT` | `SELECT` | `consents` | Awaiting test account provisioning via service role key |
| Doctor client cannot SELECT ml_shadow_predictions | `DOCTOR` | `SELECT` | `ml_shadow_predictions` | Awaiting doctor account provisioning via service role key |
| Doctor client cannot INSERT ml_shadow_predictions | `DOCTOR` | `INSERT` | `ml_shadow_predictions` | Awaiting doctor account provisioning via service role key |
| Doctor client cannot UPDATE ml_shadow_predictions | `DOCTOR` | `UPDATE` | `ml_shadow_predictions` | Awaiting doctor account provisioning via service role key |
| Doctor client cannot DELETE ml_shadow_predictions | `DOCTOR` | `DELETE` | `ml_shadow_predictions` | Awaiting doctor account provisioning via service role key |
| Doctor client cannot SELECT unassigned patient consents | `DOCTOR` | `SELECT` | `consents` | Awaiting doctor account provisioning via service role key |
| Service-role can INSERT ml_shadow_predictions | `SERVICE_ROLE` | `INSERT` | `ml_shadow_predictions` | SUPABASE_SERVICE_ROLE_KEY missing or placeholder in .env.staging.local |
| Service-role can UPDATE comparison audit fields | `SERVICE_ROLE` | `UPDATE` | `ml_shadow_predictions` | SUPABASE_SERVICE_ROLE_KEY missing or placeholder in .env.staging.local |

## 4. Governance & Safety Attestation

1. **Shadow Mode Invariant**: `TRIAGE_ML_SHADOW_ENABLED=false` was verified during testing.
2. **Zero Client Access to Shadow Audit**: Anonymous users cannot view or alter `ml_shadow_predictions`.
3. **Accurate Role Attribution**: Unauthenticated HTTP 401 responses are strictly classified as ANONYMOUS and never misattributed to authenticated DOCTOR or PATIENT roles.
4. **Cleanup Confirmation**: No synthetic test data created; cleanup not needed.
5. **Sanitization**: Zero credentials, tokens, passwords, or personal data are logged or included in this report.
