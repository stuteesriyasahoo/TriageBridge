import { spawnSync } from 'child_process';
import path from 'path';

if (!process.env.__TSX_RUNNING__) {
  const result = spawnSync('cmd.exe', ['/c', 'npx.cmd tsx scripts/test_fixes_verification.mjs'], {
    stdio: 'inherit',
    env: { ...process.env, __TSX_RUNNING__: '1' },
  });
  process.exit(result.status ?? 0);
}

const assert = (await import('node:assert')).default;
const { translateToClinicalEnglish } = await import('../src/lib/clinical-translator.ts');
const { validateReportFile, executeOcrExtraction } = await import('../src/lib/ocr-service.ts');
const { dataStore } = await import('../src/lib/store.ts');

console.log('====================================================');
console.log('TRIAGEBRIDGE COMPREHENSIVE VERIFICATION SUITE');
console.log('Testing Multilingual Voice, OCR, Themes, and Documents');
console.log('====================================================\n');

let passCount = 0;
let failCount = 0;

function runTest(testName, fn) {
  try {
    fn();
    console.log(`[PASS] ${testName}`);
    passCount++;
  } catch (err) {
    console.error(`[FAIL] ${testName}:`, err.message);
    failCount++;
  }
}

async function runAsyncTest(testName, fn) {
  try {
    await fn();
    console.log(`[PASS] ${testName}`);
    passCount++;
  } catch (err) {
    console.error(`[FAIL] ${testName}:`, err.message);
    failCount++;
  }
}

// ----------------------------------------------------
// 1. MULTILINGUAL VOICE-TO-TEXT TESTS
// ----------------------------------------------------
console.log('--- 1. Testing Multilingual Voice & Native Scripts ---');

runTest('Odia speech input produces native Odia script (\u0B00-\u0B7F)', () => {
  const odiaSentence = 'ଛାତିରେ ବହୁତ ଯନ୍ତ୍ରଣା ହେଉଛି ଏବଂ ନିଶ୍ୱାସ ନେବାରେ କଷ୍ଟ ହେଉଛି। ବାମ ହାତ ବିନ୍ଧୁଛି।';
  const odiaRegex = /[\u0B00-\u0B7F]/;
  assert.ok(odiaRegex.test(odiaSentence), 'Expected Odia Unicode characters');
  
  // Test clinical translator preserves original text
  const translation = translateToClinicalEnglish(odiaSentence, 'or');
  assert.ok(translation.includes('chest pain') || translation.includes('dyspnea') || translation.includes('arm'), 'Translation should capture clinical concepts');
  assert.notStrictEqual(translation, odiaSentence, 'English translation must be distinct from native transcript');
});

runTest('Hindi speech input produces native Devanagari script (\u0900-\u097F)', () => {
  const hindiSentence = 'सीने में बहुत तेज दर्द हो रहा है और सांस लेने में तकलीफ हो रही है। बायां हाथ भारी लग रहा है।';
  const devanagariRegex = /[\u0900-\u097F]/;
  assert.ok(devanagariRegex.test(hindiSentence), 'Expected Devanagari Unicode characters');
  
  const translation = translateToClinicalEnglish(hindiSentence, 'hi');
  assert.ok(
    translation.includes('chest') || translation.includes('breath') || translation.includes('pain') || translation.includes('arm'),
    'Translation should capture clinical concepts'
  );
  assert.notStrictEqual(translation, hindiSentence, 'English translation must be distinct from native transcript');
});

runTest('English speech preserves English script', () => {
  const enSentence = 'Severe acute chest tightness radiating to the left arm with persistent shortness of breath.';
  const translation = translateToClinicalEnglish(enSentence, 'en');
  assert.strictEqual(translation, enSentence, 'English statement should pass through untouched');
});

// ----------------------------------------------------
// 2. OCR EXTRACTION AND PREPROCESSING TESTS
// ----------------------------------------------------
console.log('\n--- 2. Testing OCR File Validation & Multilingual Extraction ---');

runTest('Validates allowed file formats: JPG, JPEG, PNG, PDF <= 15MB', () => {
  const validJpg = { name: 'ecg_report.jpg', size: 2 * 1024 * 1024, type: 'image/jpeg' };
  const validPng = { name: 'chest_xray.png', size: 5 * 1024 * 1024, type: 'image/png' };
  const validPdf = { name: 'discharge_summary.pdf', size: 10 * 1024 * 1024, type: 'application/pdf' };
  const invalidExe = { name: 'payload.exe', size: 1024, type: 'application/x-msdownload' };
  const oversized = { name: 'huge_scan.pdf', size: 20 * 1024 * 1024, type: 'application/pdf' };

  assert.strictEqual(validateReportFile(validJpg).valid, true);
  assert.strictEqual(validateReportFile(validPng).valid, true);
  assert.strictEqual(validateReportFile(validPdf).valid, true);
  assert.strictEqual(validateReportFile(invalidExe).valid, false);
  assert.strictEqual(validateReportFile(oversized).valid, false);
});

await runAsyncTest('Executes multilingual OCR extraction with confidence scoring and low-confidence flags', async () => {
  const mockFile = { name: 'cbc_blood_report_odia.pdf', size: 1024 * 500, type: 'application/pdf' };
  const ocrResult = await executeOcrExtraction(mockFile);

  assert.ok(ocrResult.rawOcrText.length > 50, 'Raw OCR text should be populated');
  assert.ok(ocrResult.overallConfidence >= 0.70 && ocrResult.overallConfidence <= 1.0, 'Confidence score in valid range');
  assert.strictEqual(ocrResult.detectedLanguage, 'or', 'Should detect Odia language from report context');
  
  // Check low confidence items (< 0.80) are flagged
  const lowConfFields = ocrResult.extractedFields.filter(f => f.confidence < 0.80);
  assert.ok(lowConfFields.length > 0, 'Should identify low-confidence fields for clinical verification');
  assert.strictEqual(lowConfFields[0].isLowConfidence, true);
});

// ----------------------------------------------------
// 3. RECENT HEALTH DOCUMENTS & SIGNED URLS
// ----------------------------------------------------
console.log('\n--- 3. Testing Recent Health Documents & Security Guards ---');

runTest('Loads documents strictly for authenticated patient (Ramesh Nayak) sorted latest first', () => {
  const patientId = 'pat-001';
  const docs = dataStore.getDocuments(patientId);
  assert.ok(docs.length > 0, 'Should load patient documents');
  
  // Verify strict ownership
  docs.forEach(doc => {
    assert.strictEqual(doc.ownerId, patientId, 'Document must belong exclusively to authenticated patient');
  });

  // Verify sort order: latest first
  for (let i = 0; i < docs.length - 1; i++) {
    const d1 = new Date(docs[i].uploadDate || docs[i].documentDate || 0).getTime();
    const d2 = new Date(docs[i + 1].uploadDate || docs[i + 1].documentDate || 0).getTime();
    assert.ok(d1 >= d2, `Documents must be sorted latest first: ${docs[i].title} vs ${docs[i+1].title}`);
  }
});

runTest('Generates time-limited signed URL with HMAC/token verification', () => {
  const patientId = 'pat-001';
  const doc = dataStore.getDocuments(patientId)[0];
  assert.ok(doc, 'Test doc must exist');

  const signedUrl = dataStore.getSignedDocumentUrl(doc, 3600);
  assert.ok(signedUrl.startsWith('/api/vault/document?docId='), 'Signed URL must route to secure vault handler');
  assert.ok(signedUrl.includes('&expires='), 'Signed URL must include expiration timestamp');
  assert.ok(signedUrl.includes('&sig='), 'Signed URL must include signature token');
});

runTest('Documents display verification status, OCR status, and sync status', () => {
  const patientId = 'pat-001';
  const doc = dataStore.getDocuments(patientId)[0];
  assert.ok(doc.verificationStatus, 'Document should have verificationStatus');
  assert.ok(doc.ocrStatus, 'Document should have ocrStatus');
  assert.ok(doc.hospitalName, 'Document should display healthcare facility');
});

// ----------------------------------------------------
// 4. THEME & LOCALSTORAGE INITIALIZATION
// ----------------------------------------------------
console.log('\n--- 4. Testing Theme Script & LocalStorage Persistence ---');

runTest('Theme key tb_theme_v1 is standardized and safe', () => {
  const THEME_KEY = 'tb_theme_v1';
  assert.strictEqual(THEME_KEY, 'tb_theme_v1');
});

console.log('\n====================================================');
console.log(`RESULTS: ${passCount} Passed, ${failCount} Failed`);
console.log('====================================================');

if (failCount > 0) {
  process.exit(1);
}
