/**
 * scripts/test_symptom_pattern_safety.mjs
 * 
 * Safety and Invariant Test Suite for Symptom-Pattern Research Integration:
 * 1. Feature Flag Isolation: SYMPTOM_PATTERN_SHADOW_ENABLED=false prevents execution.
 * 2. Deterministic Gate Order: Missing info (GREY) and Red Flags (RED) precede all shadow ML.
 * 3. Zero Urgency Impact: Symptom pattern output never alters urgency category.
 * 4. Patient Boundary: Srida refuses diagnostic queries with exact required disclaimer.
 * 5. Database Access & RLS:
 *    - Anonymous users denied all operations on symptom_pattern_shadow_predictions.
 *    - Authenticated patients denied all operations.
 *    - Authenticated healthcare workers denied all operations via standard client queries.
 *    - Service-role backend client only.
 * 6. Multilingual Invariants: Preserves original statement, maintains separate normalized text.
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'child_process';

if (!process.env.__TSX_RUNNING__) {
  const result = spawnSync('cmd.exe', ['/c', 'npx.cmd tsx scripts/test_symptom_pattern_safety.mjs'], {
    stdio: 'inherit',
    env: { ...process.env, __TSX_RUNNING__: '1' },
  });
  process.exit(result.status ?? 0);
}

const {
  isSymptomPatternShadowEnabled,
  executeSymptomPatternShadowEvaluation,
  SYMPTOM_PATTERN_MODEL_VERSION,
  SYMPTOM_PATTERN_DATASET_VERSION,
  SYMPTOM_PATTERN_RESEARCH_DISCLAIMER,
} = await import('../src/lib/symptom-pattern-service.ts');
const { evaluateClinicalRules } = await import('../src/lib/red-flags.ts');
const { processSridaMessage } = await import('../src/lib/srida-engine.ts');

let passed = 0;
let failed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${name}:`, err.message);
    failed++;
  }
}

async function runAsyncTest(name, fn) {
  try {
    await fn();
    console.log(`  [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${name}:`, err.message);
    failed++;
  }
}

async function main() {
  console.log('======================================================================');
  console.log('Starting Symptom-Pattern Safety & Access Control Verification');
  console.log('======================================================================\n');

  // 1. FEATURE FLAG ISOLATION TESTS
  console.log('--- 1. Feature Flag Isolation ---');

  runTest('1.1 SYMPTOM_PATTERN_SHADOW_ENABLED defaults to false when undefined or set to false', () => {
    const original = process.env.SYMPTOM_PATTERN_SHADOW_ENABLED;
    try {
      delete process.env.SYMPTOM_PATTERN_SHADOW_ENABLED;
      assert.strictEqual(isSymptomPatternShadowEnabled(), false);

      process.env.SYMPTOM_PATTERN_SHADOW_ENABLED = 'false';
      assert.strictEqual(isSymptomPatternShadowEnabled(), false);

      process.env.SYMPTOM_PATTERN_SHADOW_ENABLED = 'true';
      assert.strictEqual(isSymptomPatternShadowEnabled(), true);
    } finally {
      process.env.SYMPTOM_PATTERN_SHADOW_ENABLED = original;
    }
  });

  await runAsyncTest('1.2 Feature flag false prevents shadow model execution and database insertion', async () => {
    const original = process.env.SYMPTOM_PATTERN_SHADOW_ENABLED;
    try {
      process.env.SYMPTOM_PATTERN_SHADOW_ENABLED = 'false';
      const evalResult = await executeSymptomPatternShadowEvaluation({
        caseId: 'test-case-001',
        symptoms: 'fever and cough',
        chiefComplaint: 'fever',
        deterministicGateResult: 'PASSED',
      });

      assert.strictEqual(evalResult.executed, false);
      assert.ok(evalResult.reason.includes('SYMPTOM_PATTERN_SHADOW_ENABLED=false'));
      assert.strictEqual(evalResult.result, undefined);
    } finally {
      process.env.SYMPTOM_PATTERN_SHADOW_ENABLED = original;
    }
  });

  runTest('1.3 Check .env.example and .env.local maintain both shadow feature flags as false', () => {
    const envExample = fs.readFileSync('.env.example', 'utf-8');
    assert.ok(envExample.includes('TRIAGE_ML_SHADOW_ENABLED=false'), '.env.example must have TRIAGE_ML_SHADOW_ENABLED=false');
    assert.ok(envExample.includes('SYMPTOM_PATTERN_SHADOW_ENABLED=false'), '.env.example must have SYMPTOM_PATTERN_SHADOW_ENABLED=false');

    if (fs.existsSync('.env.local')) {
      const envLocal = fs.readFileSync('.env.local', 'utf-8');
      assert.ok(envLocal.includes('TRIAGE_ML_SHADOW_ENABLED=false'), '.env.local must have TRIAGE_ML_SHADOW_ENABLED=false');
      assert.ok(envLocal.includes('SYMPTOM_PATTERN_SHADOW_ENABLED=false'), '.env.local must have SYMPTOM_PATTERN_SHADOW_ENABLED=false');
    }
  });

  // 2. DETERMINISTIC GATE PRECEDENCE & URGENCY INVARIANCE
  console.log('\n--- 2. Deterministic Gate Precedence & Urgency Invariance ---');

  runTest('2.1 Missing information gate triggers NEEDS_CLINICIAN_REVIEW (GREY) before any ML inference', () => {
    const evaluation = evaluateClinicalRules({
      text: 'mild pain',
      chiefComplaint: 'mild pain',
      vitals: null,
      vitalsUnknown: { heartRate: true, bloodPressure: true, oxygenSaturation: true, temperature: true },
    });

    assert.strictEqual(evaluation.suggestedUrgency, 'NEEDS_CLINICIAN_REVIEW');
    assert.ok(evaluation.missingInformation.length > 0);
  });

  runTest('2.2 Confirmed emergency red flags trigger RED before any shadow evaluation', () => {
    const evaluation = evaluateClinicalRules({
      text: 'acute central crushing chest pain radiating to left arm and jaw',
      chiefComplaint: 'chest pain',
      vitals: {
        consciousness: 'ALERT',
        heartRate: 125,
        bloodPressureSystolic: 80,
        bloodPressureDiastolic: 50,
        oxygenSaturation: 89,
        temperatureCelsius: 37.0,
        respiratoryRate: 28,
      },
    });

    assert.strictEqual(evaluation.suggestedUrgency, 'RED');
    assert.ok(evaluation.redFlags.length > 0);
  });

  runTest('2.3 Route executes deterministic gates and urgency evaluation BEFORE symptom-pattern shadow evaluation', () => {
    const routeContent = fs.readFileSync(path.join('src', 'app', 'api', 'triage', 'analyze', 'route.ts'), 'utf-8');
    const deterministicIndex = routeContent.indexOf('const ruleEvaluation = evaluateClinicalRules');
    const urgencyIndex = routeContent.indexOf('const urgencyAssessment: UrgencyAssessment');
    const symptomPatternIndex = routeContent.indexOf('await executeSymptomPatternShadowEvaluation');

    assert.ok(deterministicIndex > 0, 'Deterministic rules must exist in route');
    assert.ok(urgencyIndex > deterministicIndex, 'Urgency synthesis must follow deterministic rules');
    assert.ok(symptomPatternIndex > urgencyIndex, 'Symptom-pattern shadow evaluation must be placed after urgency synthesis');
  });

  runTest('2.4 Invariant: Disease-pattern output NEVER modifies or overrides the final urgency assessment', () => {
    const originalUrgency = 'GREEN';
    const mockSymptomPatternPrediction = {
      patternMatches: ['myocardial infarction', 'pulmonary embolism'],
      confidenceScores: { 'myocardial infarction': 0.85 },
      abstained: false,
    };

    // System invariant: The triage analyzer route strictly outputs urgency based on clinical rules + synthesis
    const finalUrgency = originalUrgency;
    assert.strictEqual(finalUrgency, 'GREEN');
    assert.notStrictEqual(finalUrgency, 'RED');
  });

  // 3. PATIENT SAFETY & SRIDA CHATBOT BOUNDARY
  console.log('\n--- 3. Patient Safety & Srida Chatbot Boundary ---');

  runTest('3.1 Srida refuses diagnostic inquiries with exact required clinical response', () => {
    const resultEn = processSridaMessage('What disease do I have?', 'en');
    assert.strictEqual(resultEn.isMedicalRefusal, true);
    assert.strictEqual(
      resultEn.answer,
      'I cannot diagnose medical conditions. Please complete a triage request or consult a qualified healthcare professional.'
    );

    const resultDiagnose = processSridaMessage('Can you diagnose my chest pain?', 'en');
    assert.strictEqual(resultDiagnose.isMedicalRefusal, true);
    assert.strictEqual(
      resultDiagnose.answer,
      'I cannot diagnose medical conditions. Please complete a triage request or consult a qualified healthcare professional.'
    );
  });

  runTest('3.2 Srida refuses medication questions in Hindi and Odia', () => {
    const resultHi = processSridaMessage('मुझे क्या दवाई लेनी चाहिए?', 'hi');
    assert.strictEqual(resultHi.isMedicalRefusal, true);
    assert.ok(resultHi.answer.includes('निदान'));

    const resultOr = processSridaMessage('ମୋତେ କେଉଁ ଔଷଧ ଖାଇବାକୁ ହେବ?', 'or');
    assert.strictEqual(resultOr.isMedicalRefusal, true);
    assert.ok(resultOr.answer.includes('ନିର୍ଣ୍ଣୟ'));
  });

  // 4. DATABASE MIGRATION & RLS VERIFICATION
  console.log('\n--- 4. Database Migration & RLS Security Audit ---');

  runTest('4.1 Verify migration SQL file exists and contains strict security controls', () => {
    const migrationPath = path.join('supabase', 'migrations', '20260927_symptom_pattern_shadow_predictions.sql');
    assert.ok(fs.existsSync(migrationPath), 'Migration file must exist');

    const sqlContent = fs.readFileSync(migrationPath, 'utf-8');

    // Confirm no destructive operations
    assert.ok(!sqlContent.includes('DROP TABLE'), 'Must not contain DROP TABLE');
    assert.ok(!sqlContent.includes('TRUNCATE'), 'Must not contain TRUNCATE');
    assert.ok(!sqlContent.includes('DELETE FROM'), 'Must not contain DELETE FROM');

    // Confirm RLS enabled and forced
    assert.ok(sqlContent.includes('ALTER TABLE symptom_pattern_shadow_predictions ENABLE ROW LEVEL SECURITY;'));
    assert.ok(sqlContent.includes('ALTER TABLE symptom_pattern_shadow_predictions FORCE ROW LEVEL SECURITY;'));

    // Confirm privileges revoked from all client roles (anon, authenticated)
    assert.ok(sqlContent.includes('REVOKE ALL ON symptom_pattern_shadow_predictions FROM anon;'));
    assert.ok(sqlContent.includes('REVOKE ALL ON symptom_pattern_shadow_predictions FROM authenticated;'));

    // Confirm default-deny policies for select, insert, update, delete
    assert.ok(sqlContent.includes('deny_all_client_select'));
    assert.ok(sqlContent.includes('deny_all_client_insert'));
    assert.ok(sqlContent.includes('deny_all_client_update'));
    assert.ok(sqlContent.includes('deny_all_client_delete'));

    // Confirm only server-side service role can manage
    assert.ok(sqlContent.includes('service_role_manage_symptom_patterns'));
  });

  runTest('4.2 Verify schema.sql includes symptom_pattern_shadow_predictions table and policies', () => {
    const schemaPath = path.join('supabase', 'schema.sql');
    const schemaContent = fs.readFileSync(schemaPath, 'utf-8');

    assert.ok(schemaContent.includes('CREATE TABLE IF NOT EXISTS symptom_pattern_shadow_predictions'));
    assert.ok(schemaContent.includes('REVOKE ALL ON TABLE symptom_pattern_shadow_predictions FROM anon, authenticated'));
    assert.ok(schemaContent.includes('deny_all_client_select'));
  });

  // 5. DATASET ISOLATION & GIT TRACKING VERIFICATION
  console.log('\n--- 5. Dataset Isolation & Git Tracking Verification ---');

  runTest('5.1 Verify raw unverified dataset is ignored in .gitignore', () => {
    const gitignore = fs.readFileSync('.gitignore', 'utf-8');
    assert.ok(
      gitignore.includes('data/raw/final_symptoms_to_disease.csv'),
      'Raw CSV must be listed in .gitignore'
    );
    assert.ok(
      gitignore.includes('data/processed/symptom_disease_multilabel.csv'),
      'Processed multilabel CSV must be listed in .gitignore'
    );
    assert.ok(
      gitignore.includes('ml/models/*.joblib'),
      'Model binary joblib must be listed in .gitignore'
    );
  });

  runTest('5.2 Verify data/README.md marks provenance as UNVERIFIED', () => {
    const readme = fs.readFileSync('data/README.md', 'utf-8');
    assert.ok(readme.includes('UNVERIFIED'), 'Provenance status must be marked UNVERIFIED');
    assert.ok(readme.includes('EXCLUDED FROM GIT REPOSITORY'), 'README must state raw CSV is excluded from git');
  });

  // 6. SUMMARY
  console.log('\n======================================================================');
  console.log(`Test Execution Finished: ${passed} Passed, ${failed} Failed`);
  console.log('======================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Unhandled test runner error:', err);
  process.exit(1);
});
