/**
 * TriageBridge ML Silent Shadow Comparison & Audit Helpers
 * ========================================================
 * Pure, browser-safe functions for comparison logic and de-identification.
 * Zero Node.js standard library dependencies (runs safely in Client and Server).
 */

import { MLAgreementStatus, UrgencyCategory } from './types';

/**
 * Irreversible de-identified case ID generation.
 * Deterministic and safe to run in both Node.js and browser environments.
 */
export function generateDeidentifiedCaseId(caseIdentifier: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c64e6d;
  const str = `${caseIdentifier}-tb-shadow-audit-2026-salt`;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const part1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const part2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return `deid_${part1}${part2}`;
}

/**
 * Calculates comparative safety metrics when a qualified healthcare worker
 * makes their authoritative final decision.
 * 
 * Rules:
 * - Exact agreement: ML === Clinician
 * - ML higher: ML escalated beyond clinician
 * - ML lower: ML downgraded below clinician
 * - RED missed by ML: Clinician RED, ML YELLOW or GREEN (unsafe downgrade)
 * - YELLOW predicted GREEN: Clinician YELLOW, ML GREEN (critical unsafe downgrade)
 * - Deterministic gate disagreement: Deterministic gate != ML output
 */
export function calculateComparisonAudit(
  mlPred: UrgencyCategory | null,
  clinicianFinal: UrgencyCategory,
  deterministicGate: string
): {
  agreementStatus: MLAgreementStatus;
  unsafeDowngrade: boolean;
  conservativeEscalation: boolean;
} {
  if (!mlPred) {
    return {
      agreementStatus: 'PENDING_REVIEW',
      unsafeDowngrade: false,
      conservativeEscalation: false,
    };
  }

  // Critical Safety: RED missed by ML
  if (clinicianFinal === 'RED' && (mlPred === 'YELLOW' || mlPred === 'GREEN')) {
    return {
      agreementStatus: 'RED_MISSED',
      unsafeDowngrade: true,
      conservativeEscalation: false,
    };
  }

  // Critical Safety: YELLOW predicted GREEN
  if (clinicianFinal === 'YELLOW' && mlPred === 'GREEN') {
    return {
      agreementStatus: 'YELLOW_PREDICTED_GREEN',
      unsafeDowngrade: true,
      conservativeEscalation: false,
    };
  }

  // Gate Disagreement: Deterministic gate assigned RED or GREY, but ML predicted differently
  if (deterministicGate === 'RED' && mlPred !== 'RED') {
    return {
      agreementStatus: 'GATE_DISAGREEMENT',
      unsafeDowngrade: true,
      conservativeEscalation: false,
    };
  }

  if (deterministicGate === 'GREY' && mlPred !== 'GREY') {
    return {
      agreementStatus: 'GATE_DISAGREEMENT',
      unsafeDowngrade: false,
      conservativeEscalation: false,
    };
  }

  // Exact agreement
  if (mlPred === clinicianFinal) {
    return {
      agreementStatus: 'EXACT_AGREEMENT',
      unsafeDowngrade: false,
      conservativeEscalation: false,
    };
  }

  // Urgency rank mapping for relative comparisons
  const rank: Record<string, number> = {
    RED: 3,
    YELLOW: 2,
    GREEN: 1,
    GREY: 0,
    NEEDS_CLINICIAN_REVIEW: 0,
  };

  const mlRank = rank[mlPred] ?? 1;
  const clinRank = rank[clinicianFinal] ?? 1;

  if (mlRank > clinRank) {
    return {
      agreementStatus: 'ML_HIGHER',
      unsafeDowngrade: false,
      conservativeEscalation: mlPred === 'RED',
    };
  } else {
    return {
      agreementStatus: 'ML_LOWER',
      unsafeDowngrade: false,
      conservativeEscalation: false,
    };
  }
}
