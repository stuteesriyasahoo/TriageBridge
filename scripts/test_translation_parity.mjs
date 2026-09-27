import fs from 'fs';
import path from 'path';
import ts from 'typescript';

function loadTsModule(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  // Strip import statements for self-contained translation dictionaries
  const stripped = code.replace(/import\s+.*?from\s+['"][^'"]+['"];?/g, '');
  const transpileResult = ts.transpileModule(stripped, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  });

  const moduleObj = { exports: {} };
  const runFn = new Function('module', 'exports', transpileResult.outputText);
  runFn(moduleObj, moduleObj.exports);
  return moduleObj.exports;
}

function getAllKeyPaths(obj, prefix = '') {
  const keys = [];
  for (const key of Object.keys(obj || {})) {
    const currentPath = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...getAllKeyPaths(value, currentPath));
    } else {
      keys.push(currentPath);
    }
  }
  return keys;
}

export function verifyTranslationParity() {
  const root = process.cwd();
  const enPath = path.join(root, 'src', 'lib', 'translations', 'en.ts');
  const hiPath = path.join(root, 'src', 'lib', 'translations', 'hi.ts');
  const orPath = path.join(root, 'src', 'lib', 'translations', 'or.ts');

  const en = loadTsModule(enPath).en;
  const hi = loadTsModule(hiPath).hi;
  const or = loadTsModule(orPath).or;

  const enKeys = new Set(getAllKeyPaths(en));
  const hiKeys = new Set(getAllKeyPaths(hi));
  const orKeys = new Set(getAllKeyPaths(or));

  console.log(`[i18n Parity Audit] Key Counts: en=${enKeys.size}, hi=${hiKeys.size}, or=${orKeys.size}`);

  const missingInHi = [...enKeys].filter((k) => !hiKeys.has(k));
  const missingInOr = [...enKeys].filter((k) => !orKeys.has(k));
  const extraInHi = [...hiKeys].filter((k) => !enKeys.has(k));
  const extraInOr = [...orKeys].filter((k) => !enKeys.has(k));

  let hasError = false;

  if (missingInHi.length > 0) {
    console.error(`\n❌ Keys in en.ts missing from hi.ts (${missingInHi.length}):`);
    missingInHi.forEach((k) => console.error(`  - ${k}`));
    hasError = true;
  }

  if (missingInOr.length > 0) {
    console.error(`\n❌ Keys in en.ts missing from or.ts (${missingInOr.length}):`);
    missingInOr.forEach((k) => console.error(`  - ${k}`));
    hasError = true;
  }

  if (extraInHi.length > 0) {
    console.warn(`\n⚠️ Extra keys in hi.ts not present in en.ts (${extraInHi.length}):`);
    extraInHi.forEach((k) => console.warn(`  - ${k}`));
  }

  if (extraInOr.length > 0) {
    console.warn(`\n⚠️ Extra keys in or.ts not present in en.ts (${extraInOr.length}):`);
    extraInOr.forEach((k) => console.warn(`  - ${k}`));
  }

  if (hasError) {
    console.error('\n💥 Translation parity check FAILED. hi.ts and or.ts must contain every key present in en.ts.');
    process.exit(1);
  }

  console.log('\n✅ Translation key parity check PASSED: en.ts, hi.ts, and or.ts are 100% synchronized!');
}

verifyTranslationParity();
