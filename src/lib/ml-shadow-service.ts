/**
 * TriageBridge ML Silent Shadow Execution & Audit Service
 * ========================================================
 * 
 * CRITICAL SAFETY RULES:
 * 1. Feature Flag: TRIAGE_ML_SHADOW_ENABLED defaults to false.
 * 2. Model predictions are strictly silent: NEVER exposed to patients or clinicians.
 * 3. Never affects queue priority, referrals, ambulance dispatch, or clinical advice.
 * 4. Strictly de-identified payload: Zero PII (no Aadhaar, name, phone, address, images, audio).
 * 5. Deterministic safety gates (GREY/RED) strictly take precedence.
 * 6. Non-blocking failure: Timeout or unavailable model records error and continues normal triage.
 */

import { spawn } from 'child_process';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { MLShadowPrediction, UrgencyCategory } from './types';

export interface ShadowFeatureInput {
  caseId?: string;
  caseNumber?: string;
  age?: number;
  gender?: string;
  patientLanguage?: string;
  chiefComplaint?: string;
  symptoms?: string;
  durationHours?: number;
  painScore?: number;
  medicalHistory?: string;
  allergies?: string;
  pregnancyStatus?: string;
  vitals?: {
    heartRate?: number | null;
    systolicBp?: number | null;
    diastolicBp?: number | null;
    oxygenSaturation?: number | null;
    temperatureCelsius?: number | null;
    respiratoryRate?: number | null;
  } | null;
  deterministicGateResult: string; // 'GREY' | 'RED' | 'PASSED'
}

export interface ShadowExecutionResult {
  executed: boolean;
  shadowPrediction?: MLShadowPrediction;
  error?: string;
  errorCode?: string;
}

const DEFAULT_MODEL_VERSION = '1.0.0-synthetic-prototype';
const DEFAULT_DATASET_HASH = 'bc08362530d3eb7e12647df889fe17b44614c6f5bda0bf0e3bd23509c4df033f';

/**
 * Checks if ML Shadow Mode is enabled server-side.
 * Default is FALSE. Missing or invalid variable safely evaluates to FALSE.
 */
export function isMLShadowModeEnabled(): boolean {
  if (typeof process === 'undefined' || !process.env) return false;
  return process.env.TRIAGE_ML_SHADOW_ENABLED === 'true';
}

export {
  generateDeidentifiedCaseId,
  calculateComparisonAudit,
} from './ml-shadow-comparison';
import {
  generateDeidentifiedCaseId,
  calculateComparisonAudit,
} from './ml-shadow-comparison';

/**
 * Sanitizes and strips all PII from input, extracting only allowed features.
 */
export function buildDeidentifiedFeaturePayload(input: ShadowFeatureInput): Record<string, unknown> {
  return {
    age: typeof input.age === 'number' ? input.age : null,
    gender: input.gender || 'OTHER',
    patient_language: input.patientLanguage ? input.patientLanguage.slice(0, 5) : 'en',
    chief_complaint: input.chiefComplaint ? input.chiefComplaint.slice(0, 300) : '',
    symptoms: input.symptoms ? input.symptoms.slice(0, 1000) : '',
    duration_hours: typeof input.durationHours === 'number' ? input.durationHours : null,
    pain_score: typeof input.painScore === 'number' ? input.painScore : null,
    medical_history: input.medicalHistory ? input.medicalHistory.slice(0, 300) : 'none_reported',
    allergies: input.allergies ? input.allergies.slice(0, 200) : 'none_known',
    pregnancy_status: input.pregnancyStatus || 'not_applicable',
    vitals_heart_rate_bpm: input.vitals?.heartRate ?? null,
    vitals_systolic_bp: input.vitals?.systolicBp ?? null,
    vitals_diastolic_bp: input.vitals?.diastolicBp ?? null,
    vitals_spo2_percent: input.vitals?.oxygenSaturation ?? null,
    vitals_temperature_c: input.vitals?.temperatureCelsius ?? null,
    vitals_respiratory_rate_bpm: input.vitals?.respiratoryRate ?? null,
  };
}

/**
 * Runs the Python ML Service in a protected subprocess with strict timeout.
 * Returns generic error codes without stack traces.
 */
async function callMLServiceSubprocess(
  payload: Record<string, unknown>,
  timeoutMs: number = 2500
): Promise<{
  success: boolean;
  prediction: UrgencyCategory | null;
  modelVersion: string;
  datasetHash: string;
  scores: Record<string, number> | null;
  processingTimeMs: number;
  errorCode?: string;
}> {
  const startTime = Date.now();
  const scriptPath = path.join(process.cwd(), 'ml', 'service.py');

  return new Promise((resolve) => {
    let resolved = false;

    // Timeout guard
    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        try {
          proc.kill('SIGKILL');
        } catch {
          // ignore
        }
        resolve({
          success: false,
          prediction: null,
          modelVersion: DEFAULT_MODEL_VERSION,
          datasetHash: DEFAULT_DATASET_HASH,
          scores: null,
          processingTimeMs: Date.now() - startTime,
          errorCode: 'ERR_TIMEOUT',
        });
      }
    }, timeoutMs);

    const proc = spawn('python', [scriptPath, '--predict'], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        PYTHONIOENCODING: 'utf-8',
      },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdoutData = '';
    let stderrData = '';

    proc.stdout.on('data', (chunk) => {
      stdoutData += chunk.toString();
    });

    proc.stderr.on('data', (chunk) => {
      stderrData += chunk.toString();
    });

    proc.on('error', () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        resolve({
          success: false,
          prediction: null,
          modelVersion: DEFAULT_MODEL_VERSION,
          datasetHash: DEFAULT_DATASET_HASH,
          scores: null,
          processingTimeMs: Date.now() - startTime,
          errorCode: 'ERR_MODEL_UNAVAILABLE',
        });
      }
    });

    proc.on('close', (code) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);

        if (code !== 0 || !stdoutData.trim()) {
          const codeErr = stderrData.trim() ? 'ERR_SERVICE_EXEC' : 'ERR_SERVICE_EXIT_' + (code ?? 'UNKNOWN');
          resolve({
            success: false,
            prediction: null,
            modelVersion: DEFAULT_MODEL_VERSION,
            datasetHash: DEFAULT_DATASET_HASH,
            scores: null,
            processingTimeMs: Date.now() - startTime,
            errorCode: codeErr,
          });
          return;
        }

        try {
          const parsed = JSON.parse(stdoutData.trim());
          resolve({
            success: parsed.success ?? true,
            prediction: (parsed.prediction as UrgencyCategory) || null,
            modelVersion: parsed.model_version || DEFAULT_MODEL_VERSION,
            datasetHash: parsed.dataset_hash || DEFAULT_DATASET_HASH,
            scores: parsed.uncalibrated_model_scores || null,
            processingTimeMs: parsed.processing_time_ms || (Date.now() - startTime),
            errorCode: parsed.error_code || undefined,
          });
        } catch {
          resolve({
            success: false,
            prediction: null,
            modelVersion: DEFAULT_MODEL_VERSION,
            datasetHash: DEFAULT_DATASET_HASH,
            scores: null,
            processingTimeMs: Date.now() - startTime,
            errorCode: 'ERR_INVALID_OUTPUT',
          });
        }
      }
    });

    // Write sanitized de-identified JSON to stdin
    try {
      proc.stdin.write(JSON.stringify(payload));
      proc.stdin.end();
    } catch {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        resolve({
          success: false,
          prediction: null,
          modelVersion: DEFAULT_MODEL_VERSION,
          datasetHash: DEFAULT_DATASET_HASH,
          scores: null,
          processingTimeMs: Date.now() - startTime,
          errorCode: 'ERR_STDIN_WRITE',
        });
      }
    }
  });
}

/**
 * Calls remote authenticated ML container microservice via HTTPS/HTTP.
 * Enables zero-dependency orchestration suitable for serverless / Vercel deployment.
 */
async function callMLServiceHTTP(
  serviceUrl: string,
  payload: Record<string, unknown>,
  timeoutMs: number = 2500
): Promise<{
  success: boolean;
  prediction: UrgencyCategory | null;
  modelVersion: string;
  datasetHash: string;
  scores: Record<string, number> | null;
  processingTimeMs: number;
  errorCode?: string;
}> {
  const startTime = Date.now();
  const secret = process.env.TRIAGE_ML_SERVICE_SECRET || '';

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(`${serviceUrl.replace(/\/+$/, '')}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${secret}`,
        'X-Service-Client': 'TriageBridge-Backend',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      return {
        success: false,
        prediction: null,
        modelVersion: DEFAULT_MODEL_VERSION,
        datasetHash: DEFAULT_DATASET_HASH,
        scores: null,
        processingTimeMs: Date.now() - startTime,
        errorCode: `ERR_HTTP_${res.status}`,
      };
    }

    const data = await res.json();
    return {
      success: data.success ?? true,
      prediction: (data.prediction as UrgencyCategory) || null,
      modelVersion: data.model_version || DEFAULT_MODEL_VERSION,
      datasetHash: data.dataset_hash || DEFAULT_DATASET_HASH,
      scores: data.uncalibrated_model_scores || null,
      processingTimeMs: data.processing_time_ms || (Date.now() - startTime),
      errorCode: data.error_code || undefined,
    };
  } catch (err) {
    const isTimeout = err instanceof Error && (err.name === 'AbortError' || err.name === 'TimeoutError');
    return {
      success: false,
      prediction: null,
      modelVersion: DEFAULT_MODEL_VERSION,
      datasetHash: DEFAULT_DATASET_HASH,
      scores: null,
      processingTimeMs: Date.now() - startTime,
      errorCode: isTimeout ? 'ERR_TIMEOUT' : 'ERR_SERVICE_UNAVAILABLE',
    };
  }
}

const SHADOW_STORAGE_DIR = path.join(process.cwd(), 'data', 'shadow');
const SHADOW_STORAGE_FILE = path.join(SHADOW_STORAGE_DIR, 'ml_shadow_predictions.json');

// In-memory cache for fast lookup and mock testing
let inMemoryShadowStore: MLShadowPrediction[] = [];
const evaluatedIdempotencyKeys = new Set<string>();

export function getShadowPredictionRecords(): MLShadowPrediction[] {
  try {
    if (typeof fs !== 'undefined' && fs.existsSync(SHADOW_STORAGE_FILE)) {
      const data = JSON.parse(fs.readFileSync(SHADOW_STORAGE_FILE, 'utf-8'));
      if (Array.isArray(data)) {
        inMemoryShadowStore = data;
        return data;
      }
    }
  } catch {
    // fallback to in-memory store
  }
  return inMemoryShadowStore;
}

export function saveShadowPredictionRecord(record: MLShadowPrediction): void {
  try {
    if (typeof fs !== 'undefined') {
      if (!fs.existsSync(SHADOW_STORAGE_DIR)) {
        fs.mkdirSync(SHADOW_STORAGE_DIR, { recursive: true });
      }
      const current = getShadowPredictionRecords();
      const idx = current.findIndex(p => p.id === record.id || p.deidentifiedCaseId === record.deidentifiedCaseId);
      if (idx >= 0) {
        current[idx] = record;
      } else {
        current.push(record);
      }
      inMemoryShadowStore = current;
      fs.writeFileSync(SHADOW_STORAGE_FILE, JSON.stringify(current, null, 2), 'utf-8');
      return;
    }
  } catch {
    // fallback to in-memory
  }
  const idx = inMemoryShadowStore.findIndex(p => p.id === record.id || p.deidentifiedCaseId === record.deidentifiedCaseId);
  if (idx >= 0) inMemoryShadowStore[idx] = record;
  else inMemoryShadowStore.push(record);
}

export function getShadowPredictionByDeidentifiedId(deidentifiedCaseId: string): MLShadowPrediction | undefined {
  const records = getShadowPredictionRecords();
  return records.find(r => r.deidentifiedCaseId === deidentifiedCaseId);
}

export function resetShadowPredictionStoreForTesting(): void {
  inMemoryShadowStore = [];
  evaluatedIdempotencyKeys.clear();
  try {
    if (typeof fs !== 'undefined' && fs.existsSync(SHADOW_STORAGE_FILE)) {
      fs.unlinkSync(SHADOW_STORAGE_FILE);
    }
  } catch {
    // ignore
  }
}

/**
 * Main shadow evaluation coordinator:
 * 1. Checks feature flag (defaults to false).
 * 2. Checks idempotency key to prevent duplicate analysis.
 * 3. De-identifies payload (Zero PII).
 * 4. Executes prediction with timeout.
 * 5. Stores record separately in ml_shadow_predictions.
 * 6. Returns record without ever altering patient or clinician triage decision.
 */
export async function executeShadowEvaluation(
  input: ShadowFeatureInput,
  idempotencyKey?: string
): Promise<ShadowExecutionResult> {
  // Requirement: Feature flag must be checked server-side. Default is false.
  if (!isMLShadowModeEnabled()) {
    return {
      executed: false,
      error: 'Shadow mode disabled by server configuration (TRIAGE_ML_SHADOW_ENABLED=false)',
      errorCode: 'FLAG_DISABLED',
    };
  }

  const deidentifiedCaseId = generateDeidentifiedCaseId(
    input.caseId || input.caseNumber || idempotencyKey || `anonymous-${Date.now()}`
  );

  // Idempotency check: prevent duplicate analysis
  if (idempotencyKey) {
    if (evaluatedIdempotencyKeys.has(idempotencyKey)) {
      const existing = getShadowPredictionByDeidentifiedId(deidentifiedCaseId);
      if (existing) {
        return { executed: true, shadowPrediction: existing };
      }
    }
    evaluatedIdempotencyKeys.add(idempotencyKey);
  }

  const payload = buildDeidentifiedFeaturePayload(input);
  
  // Deployment Target Adaptation:
  // When TRIAGE_ML_SERVICE_URL is configured, orchestrate via authenticated HTTP/HTTPS (e.g. Vercel/container).
  // Otherwise, fallback to local Python subprocess (Local Hackathon Demo Only - Not for Serverless Production).
  const remoteServiceUrl = process.env.TRIAGE_ML_SERVICE_URL;
  const result = (remoteServiceUrl && remoteServiceUrl !== 'local')
    ? await callMLServiceHTTP(remoteServiceUrl, payload)
    : await callMLServiceSubprocess(payload);

  const shadowPrediction: MLShadowPrediction = {
    id: `ml-shadow-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
    deidentifiedCaseId,
    modelVersion: result.modelVersion,
    datasetHash: result.datasetHash,
    predictedClass: result.prediction,
    modelScoreJson: result.scores,
    deterministicGateResult: input.deterministicGateResult,
    clinicianFinalCategory: null,
    agreementStatus: 'PENDING_REVIEW',
    unsafeDowngradeFlag: false,
    conservativeEscalationFlag: false,
    processingTimeMs: result.processingTimeMs,
    modelErrorCode: result.errorCode || null,
    createdAt: new Date().toISOString(),
  };

  // Persist separately in protected storage
  saveShadowPredictionRecord(shadowPrediction);

  return {
    executed: true,
    shadowPrediction,
  };
}


/**
 * Calculates comparative safety metrics when a qualified healthcare worker
 * makes their authoritative final decision.
 * 
 * Rules:
 * - Exact agreement: ML === Clinician
 * - ML higher: ML escalated beyond clinician


/**
 * Updates shadow prediction audit comparison upon qualified clinician review.
 * For technical evaluation only. Never retrains the model.
 */
export function updateShadowPredictionComparison(
  caseIdentifier: string,
  clinicianFinal: UrgencyCategory
): MLShadowPrediction | undefined {
  const deidentifiedId = generateDeidentifiedCaseId(caseIdentifier);
  const existing = getShadowPredictionByDeidentifiedId(deidentifiedId);
  if (!existing) return undefined;

  const comparison = calculateComparisonAudit(
    existing.predictedClass,
    clinicianFinal,
    existing.deterministicGateResult
  );

  const updated: MLShadowPrediction = {
    ...existing,
    clinicianFinalCategory: clinicianFinal,
    agreementStatus: comparison.agreementStatus,
    unsafeDowngradeFlag: comparison.unsafeDowngrade,
    conservativeEscalationFlag: comparison.conservativeEscalation,
  };

  saveShadowPredictionRecord(updated);
  return updated;
}

