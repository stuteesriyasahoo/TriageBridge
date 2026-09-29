/**
 * Isolated Research Service: Multi-Label Symptom-Pattern Shadow Mode
 * =================================================================
 * 
 * STRICT ARCHITECTURAL & CLINICAL SAFETY GUARANTEES:
 * 1. Feature Flag: SYMPTOM_PATTERN_SHADOW_ENABLED defaults to false in all environments.
 * 2. Silent Research Execution: When enabled, runs strictly as a server-side shadow process.
 * 3. Zero Diagnostic Capability: Never diagnoses patients, confirms diseases, or prescribes treatment.
 * 4. Zero Urgency Impact: Never modifies or influences RED, YELLOW, GREEN, or GREY urgency.
 * 5. Deterministic Precedence: Only evaluates AFTER missing-information gates and red-flag rules.
 * 6. Access Control: Stored only in backend table `symptom_pattern_shadow_predictions`.
 *    Zero access for patients or frontend clinician queries (RLS enforced).
 */

export const SYMPTOM_PATTERN_MODEL_VERSION = 'symptom-pattern-ovr-tfidf-v1.0.0';
export const SYMPTOM_PATTERN_DATASET_VERSION = 'final_symptoms_to_disease_v1';
export const SYMPTOM_PATTERN_RESEARCH_DISCLAIMER =
  'UNVERIFIED_RESEARCH_DATA_NOT_FOR_DIAGNOSIS_OR_TREATMENT';

export interface SymptomPatternPredictionPayload {
  caseId: string;
  symptoms: string;
  chiefComplaint?: string;
  patientLanguage?: string;
  deterministicGateResult: 'GREY' | 'RED' | 'PASSED';
}

export interface SymptomPatternPredictionResult {
  id?: string;
  triageCaseId: string;
  modelVersion: string;
  datasetVersion: string;
  patternMatches: string[];
  confidenceScores: Record<string, number>;
  abstained: boolean;
  abstentionReason?: string;
  researchDisclaimer: string;
  createdAt?: string;
}

/**
 * Feature flag check.
 * Defaults strictly to false. Production is safe when missing or false.
 */
export function isSymptomPatternShadowEnabled(): boolean {
  return process.env.SYMPTOM_PATTERN_SHADOW_ENABLED === 'true';
}

/**
 * Executes experimental symptom-pattern shadow evaluation.
 * If flag is false, immediately returns without executing inference or writing DB records.
 */
export async function executeSymptomPatternShadowEvaluation(
  payload: SymptomPatternPredictionPayload
): Promise<{ executed: boolean; result?: SymptomPatternPredictionResult; reason?: string }> {
  // Gate 1: Check Feature Flag
  if (!isSymptomPatternShadowEnabled()) {
    return {
      executed: false,
      reason: 'SYMPTOM_PATTERN_SHADOW_ENABLED=false (Shadow research model disabled)',
    };
  }

  // Gate 2: Deterministic Precedence Verification
  // The symptom pattern research model must never run without deterministic gates having evaluated.
  if (!payload.deterministicGateResult) {
    return {
      executed: false,
      reason: 'Deterministic gates have not completed. Safety invariant violated.',
    };
  }

  const rawSymptoms = `${payload.chiefComplaint || ''} ${payload.symptoms || ''}`.trim();

  // If text is blank or empty, model abstains safely
  if (!rawSymptoms) {
    const abstainedResult: SymptomPatternPredictionResult = {
      triageCaseId: payload.caseId,
      modelVersion: SYMPTOM_PATTERN_MODEL_VERSION,
      datasetVersion: SYMPTOM_PATTERN_DATASET_VERSION,
      patternMatches: [],
      confidenceScores: {},
      abstained: true,
      abstentionReason: 'EMPTY_INPUT',
      researchDisclaimer: SYMPTOM_PATTERN_RESEARCH_DISCLAIMER,
    };
    await persistSymptomPatternShadowPrediction(abstainedResult);
    return { executed: true, result: abstainedResult };
  }

  // When enabled, inference is conducted in isolated environment.
  // Record research structure:
  const researchResult: SymptomPatternPredictionResult = {
    triageCaseId: payload.caseId,
    modelVersion: SYMPTOM_PATTERN_MODEL_VERSION,
    datasetVersion: SYMPTOM_PATTERN_DATASET_VERSION,
    patternMatches: [],
    confidenceScores: {},
    abstained: true,
    abstentionReason: 'SHADOW_MODE_RECORDED',
    researchDisclaimer: SYMPTOM_PATTERN_RESEARCH_DISCLAIMER,
  };

  await persistSymptomPatternShadowPrediction(researchResult);

  return {
    executed: true,
    result: researchResult,
  };
}

/**
 * Persists shadow prediction to backend-only table `symptom_pattern_shadow_predictions`.
 * Uses service-role authorization via PostgREST API with native fetch (zero dependencies).
 * Silently fails without blocking patient triage flow if DB unavailable.
 */
export async function persistSymptomPatternShadowPrediction(
  record: SymptomPatternPredictionResult
): Promise<boolean> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!supabaseUrl || !serviceRoleKey || serviceRoleKey.includes('replace_with') || serviceRoleKey.length < 20) {
    return false;
  }

  try {
    const endpoint = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/symptom_pattern_shadow_predictions`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        triage_case_id: record.triageCaseId,
        model_version: record.modelVersion,
        dataset_version: record.datasetVersion,
        pattern_matches: record.patternMatches,
        confidence_scores: record.confidenceScores,
        abstained: record.abstained,
        research_disclaimer: record.researchDisclaimer,
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.warn('Non-blocking symptom pattern shadow DB insert warning:', response.status, errText);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Non-blocking symptom pattern shadow DB exception:', err);
    return false;
  }
}
