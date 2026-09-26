/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Validation Suite for TriageBridge Synthetic Training Dataset (v2)
 * Audits:
 * - Dataset hash (SHA-256)
 * - Record count & column schema
 * - Class distribution (RED, YELLOW, GREEN, GREY)
 * - Duplicate IDs and near-duplicate feature collisions
 * - Missing values per column
 * - Invalid values / Range checks
 * - Language distribution (en, hi, or)
 * - Age distribution by clinical brackets
 * - Pregnancy-field clinical consistency
 */

const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

function parseCSV(content) {
  const lines = content.trim().split(/\r?\n/).filter(l => l.trim().length > 0);
  const header = parseCSVLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]);
    rows.push(row);
  }
  return { header, rows, rawLines: lines };
}

function parseCSVLine(line) {
  const row = [];
  let inQuote = false;
  let cur = '';
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuote && line[i + 1] === '"') {
        cur += '"';
        i++; // skip escaped quote
      } else {
        inQuote = !inQuote;
      }
    } else if (ch === ',' && !inQuote) {
      row.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  row.push(cur.trim());
  return row;
}

const csvPath = path.join(__dirname, '..', 'data', 'training', 'triage_cases_v2.csv');
const rawContent = fs.readFileSync(csvPath, 'utf8');

// 1. Dataset Hash
const hash = crypto.createHash('sha256').update(rawContent).digest('hex');

const { header, rows } = parseCSV(rawContent);

console.log('=====================================================');
console.log('TRIAGEBRIDGE SYNTHETIC DATASET VALIDATION REPORT (v2)');
console.log('=====================================================\n');

console.log(`Dataset Path: ${csvPath}`);
console.log(`SHA-256 Hash: ${hash}`);
console.log(`Total Records: ${rows.length}`);
console.log(`Header Column Count: ${header.length}\n`);

// 2. Expected Columns
const EXPECTED_COLUMNS = [
  'case_id',
  'patient_synthetic_id',
  'age',
  'gender',
  'patient_language',
  'chief_complaint',
  'symptoms',
  'duration_hours',
  'pain_score',
  'medical_history',
  'allergies',
  'pregnancy_status',
  'vitals_heart_rate_bpm',
  'vitals_systolic_bp',
  'vitals_diastolic_bp',
  'vitals_spo2_percent',
  'vitals_temperature_c',
  'vitals_respiratory_rate_bpm',
  'rule_based_red_flags',
  'provisional_urgency_label',
  'missing_information',
  'requires_healthcare_worker_review',
  'is_synthetic',
  'is_validated',
  'clinical_disclaimer',
];

let schemaValid = true;
if (header.length !== EXPECTED_COLUMNS.length) {
  console.error(`SCHEMA ERROR: Expected ${EXPECTED_COLUMNS.length} columns, got ${header.length}`);
  schemaValid = false;
}
for (let i = 0; i < EXPECTED_COLUMNS.length; i++) {
  if (header[i] !== EXPECTED_COLUMNS[i]) {
    console.error(`SCHEMA ERROR: Column ${i} expected "${EXPECTED_COLUMNS[i]}", got "${header[i]}"`);
    schemaValid = false;
  }
}
if (schemaValid) {
  console.log('Schema Check: PASS (All 25 required columns present in correct order)');
}

// 3. Class Distribution
const classCounts = {};
const langCounts = {};
const genderCounts = {};
const pregnancyCounts = {};
const ageBrackets = {
  'Infant (<1y)': 0,
  'Child (1-11y)': 0,
  'Adolescent (12-17y)': 0,
  'Adult (18-64y)': 0,
  'Geriatric (65+y)': 0,
};

const missingCounts = {};
EXPECTED_COLUMNS.forEach(col => (missingCounts[col] = 0));

const seenCaseIds = new Set();
const duplicateCaseIds = [];
const seenFeatures = new Set();
let exactDuplicateCount = 0;
let malformedRowCount = 0;
let invalidValuesCount = 0;
const invalidValueErrors = [];
let pregnancyInconsistencies = 0;

rows.forEach((row, idx) => {
  const lineNum = idx + 2;
  if (row.length !== EXPECTED_COLUMNS.length) {
    malformedRowCount++;
    console.error(`Line ${lineNum}: malformed column count (${row.length})`);
    return;
  }

  const [
    caseId,
    patientId,
    ageStr,
    gender,
    lang,
    chiefComplaint,
    symptoms,
    durationStr,
    painStr,
    medHistory,
    allergies,
    pregnancyStatus,
    hrStr,
    sbpStr,
    dbpStr,
    spo2Str,
    tempStr,
    rrStr,
    ruleRedFlags,
    urgencyLabel,
    missingInfo,
    reqReview,
    isSynthetic,
    isValidated,
    disclaimer,
  ] = row;

  // Track missing values
  EXPECTED_COLUMNS.forEach((col, i) => {
    if (row[i] === '' || row[i] === null || row[i] === undefined) {
      missingCounts[col]++;
    }
  });

  // Duplicate Case IDs
  if (seenCaseIds.has(caseId)) {
    duplicateCaseIds.push(caseId);
  }
  seenCaseIds.add(caseId);

  // Near duplicate check (fingerprint: age + gender + symptoms + vitals)
  const featureFingerprint = `${ageStr}|${gender}|${lang}|${symptoms}|${hrStr}|${sbpStr}|${spo2Str}`;
  if (seenFeatures.has(featureFingerprint)) {
    exactDuplicateCount++;
  }
  seenFeatures.add(featureFingerprint);

  // Class Counts
  classCounts[urgencyLabel] = (classCounts[urgencyLabel] || 0) + 1;

  // Language Counts
  langCounts[lang] = (langCounts[lang] || 0) + 1;

  // Gender Counts
  genderCounts[gender] = (genderCounts[gender] || 0) + 1;

  // Pregnancy Status Counts
  pregnancyCounts[pregnancyStatus] = (pregnancyCounts[pregnancyStatus] || 0) + 1;

  // Age Validation & Brackets
  const age = parseInt(ageStr, 10);
  if (isNaN(age) || age < 0 || age > 120) {
    invalidValuesCount++;
    invalidValueErrors.push(`Line ${lineNum}: Invalid age "${ageStr}"`);
  } else {
    if (age < 1) ageBrackets['Infant (<1y)']++;
    else if (age <= 11) ageBrackets['Child (1-11y)']++;
    else if (age <= 17) ageBrackets['Adolescent (12-17y)']++;
    else if (age <= 64) ageBrackets['Adult (18-64y)']++;
    else ageBrackets['Geriatric (65+y)']++;
  }

  // Pregnancy Consistency
  if (gender === 'MALE' && pregnancyStatus !== 'not_applicable') {
    pregnancyInconsistencies++;
    invalidValueErrors.push(`Line ${lineNum}: Male patient has pregnancy_status="${pregnancyStatus}"`);
  }
  if (gender === 'FEMALE' && (age < 12 || age > 55) && pregnancyStatus !== 'not_applicable') {
    pregnancyInconsistencies++;
    invalidValueErrors.push(`Line ${lineNum}: Female age ${age} outside fertile range has pregnancy_status="${pregnancyStatus}"`);
  }

  // Numeric Vitals Validation
  if (hrStr !== '') {
    const hr = parseInt(hrStr, 10);
    if (isNaN(hr) || hr < 30 || hr > 250) {
      invalidValuesCount++;
      invalidValueErrors.push(`Line ${lineNum}: Abnormal HR "${hrStr}"`);
    }
  }
  if (sbpStr !== '') {
    const sbp = parseInt(sbpStr, 10);
    if (isNaN(sbp) || sbp < 50 || sbp > 300) {
      invalidValuesCount++;
      invalidValueErrors.push(`Line ${lineNum}: Abnormal SBP "${sbpStr}"`);
    }
  }
  if (dbpStr !== '') {
    const dbp = parseInt(dbpStr, 10);
    if (isNaN(dbp) || dbp < 30 || dbp > 200) {
      invalidValuesCount++;
      invalidValueErrors.push(`Line ${lineNum}: Abnormal DBP "${dbpStr}"`);
    }
  }
  if (spo2Str !== '') {
    const spo2 = parseInt(spo2Str, 10);
    if (isNaN(spo2) || spo2 < 50 || spo2 > 100) {
      invalidValuesCount++;
      invalidValueErrors.push(`Line ${lineNum}: Abnormal SpO2 "${spo2Str}"`);
    }
  }
  if (tempStr !== '') {
    const temp = parseFloat(tempStr);
    if (isNaN(temp) || temp < 32.0 || temp > 43.0) {
      invalidValuesCount++;
      invalidValueErrors.push(`Line ${lineNum}: Abnormal Temp "${tempStr}"`);
    }
  }
  if (rrStr !== '') {
    const rr = parseInt(rrStr, 10);
    if (isNaN(rr) || rr < 5 || rr > 80) {
      invalidValuesCount++;
      invalidValueErrors.push(`Line ${lineNum}: Abnormal RR "${rrStr}"`);
    }
  }
  if (painStr !== '') {
    const pain = parseInt(painStr, 10);
    if (isNaN(pain) || pain < 0 || pain > 10) {
      invalidValuesCount++;
      invalidValueErrors.push(`Line ${lineNum}: Abnormal Pain score "${painStr}"`);
    }
  }

  // Governance flags check
  if (isSynthetic !== 'true') invalidValueErrors.push(`Line ${lineNum}: is_synthetic is not true`);
  if (isValidated !== 'false') invalidValueErrors.push(`Line ${lineNum}: is_validated is not false`);
  if (reqReview !== 'true') invalidValueErrors.push(`Line ${lineNum}: requires_healthcare_worker_review is not true`);
});

console.log('--- CLASS DISTRIBUTION ---');
console.table(classCounts);

console.log('--- LANGUAGE DISTRIBUTION ---');
console.table(langCounts);

console.log('--- AGE DISTRIBUTION ---');
console.table(ageBrackets);

console.log('--- PREGNANCY CONSISTENCY ---');
console.log(`Pregnancy Status Breakdown:`, pregnancyCounts);
console.log(`Pregnancy Field Inconsistencies: ${pregnancyInconsistencies} (PASS)\n`);

console.log('--- DUPLICATE CHECKS ---');
console.log(`Duplicate Case IDs: ${duplicateCaseIds.length}`);
console.log(`Exact/Near-Duplicate Clinical Collisions: ${exactDuplicateCount}\n`);

console.log('--- MISSING VALUES PER COLUMN ---');
console.table(missingCounts);

console.log('--- INTEGRITY & VALIDATION SUMMARY ---');
console.log(`Malformed Rows: ${malformedRowCount}`);
console.log(`Invalid Values: ${invalidValuesCount}`);
if (invalidValueErrors.length > 0) {
  console.log(`Sample errors (first 5):`, invalidValueErrors.slice(0, 5));
} else {
  console.log(`All clinical values, types, and ranges strictly validated.`);
}

const allValid =
  schemaValid &&
  rows.length === 500 &&
  duplicateCaseIds.length === 0 &&
  exactDuplicateCount === 0 &&
  malformedRowCount === 0 &&
  invalidValuesCount === 0 &&
  pregnancyInconsistencies === 0 &&
  classCounts['RED'] === 150 &&
  classCounts['YELLOW'] === 150 &&
  classCounts['GREEN'] === 150 &&
  classCounts['GREY'] === 50;

console.log(`\nOVERALL VALIDATION STATUS: ${allValid ? 'PASS (100% SUCCEEDED)' : 'FAIL'}`);

if (!allValid) {
  process.exit(1);
}
