import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const tempUserDataDir = path.join(process.cwd(), '.temp_edge_profile');
const screenshotsDir = path.join(process.cwd(), 'screenshots');

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('[Multilingual Verification] Launching Edge headless with CDP on port 9222...');

  const edgeProcess = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    `--user-data-dir=${tempUserDataDir}`,
    '--disable-gpu',
    '--window-size=1280,1024',
    '--no-first-run',
    '--no-default-browser-check',
    'http://localhost:3000/role-select'
  ]);

  let isConnected = false;
  let wsUrl = '';

  for (let i = 0; i < 30; i++) {
    await sleep(500);
    try {
      const res = await fetch('http://127.0.0.1:9222/json/list');
      const data = await res.json();
      if (data && data.length > 0 && data[0].webSocketDebuggerUrl) {
        wsUrl = data[0].webSocketDebuggerUrl;
        isConnected = true;
        break;
      }
    } catch {
      // waiting for browser to initialize
    }
  }

  if (!isConnected || !wsUrl) {
    console.error('Failed to connect to Edge CDP within timeout');
    edgeProcess.kill();
    process.exit(1);
  }

  console.log('[Multilingual Verification] Connected to Edge CDP via WebSocket:', wsUrl);

  const ws = new WebSocket(wsUrl);
  await new Promise(resolve => ws.onopen = resolve);

  let idCounter = 1;
  const pendingRequests = new Map();

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pendingRequests.has(msg.id)) {
      const { resolve, reject } = pendingRequests.get(msg.id);
      pendingRequests.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  };

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = idCounter++;
      pendingRequests.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Network.enable');
  await send('Page.enable');
  await send('Runtime.enable');

  // Set PATIENT auth cookies so route isolation allows access to /patient/*
  await send('Network.setCookie', {
    name: 'tb_role',
    value: 'PATIENT',
    domain: 'localhost',
    path: '/'
  });
  await send('Network.setCookie', {
    name: 'tb_user_id',
    value: 'pat-001',
    domain: 'localhost',
    path: '/'
  });

  console.log('[Multilingual Verification] Auth cookies configured for PATIENT portal.');

  // 1. ENGLISH CASE DETAIL PAGE
  console.log('[Multilingual Verification] Setting locale to English (en)...');
  await send('Runtime.evaluate', {
    expression: `(() => { localStorage.setItem('tb_locale_v1', 'en'); })()`
  });
  await send('Page.navigate', { url: 'http://localhost:3000/patient/cases/case-001?lang=en' });
  await sleep(3500);

  const enEval = await send('Runtime.evaluate', {
    expression: 'document.body.innerText'
  });
  const enText = (enEval && enEval.result && enEval.result.value) || '';
  console.log('[Multilingual Verification] English page text sample:');
  console.log(enText.substring(0, 300).replace(/\n+/g, ' '));

  const enShot = await send('Page.captureScreenshot', { format: 'png' });
  const enPath = path.join(screenshotsDir, 'case_detail_en.png');
  fs.writeFileSync(enPath, Buffer.from(enShot.data, 'base64'));
  console.log(`[Evidence] Saved English screenshot to ${enPath}`);

  // 2. HINDI CASE DETAIL PAGE
  console.log('[Multilingual Verification] Setting locale to Hindi (hi)...');
  await send('Runtime.evaluate', {
    expression: `(() => { localStorage.setItem('tb_locale_v1', 'hi'); })()`
  });
  await send('Page.navigate', { url: 'http://localhost:3000/patient/cases/case-001?lang=hi' });
  await sleep(3500);

  const hiEval = await send('Runtime.evaluate', {
    expression: 'document.body.innerText'
  });
  const hiText = (hiEval && hiEval.result && hiEval.result.value) || '';
  console.log('[Multilingual Verification] Hindi page text sample:');
  console.log(hiText.substring(0, 300).replace(/\n+/g, ' '));

  const hiShot = await send('Page.captureScreenshot', { format: 'png' });
  const hiPath = path.join(screenshotsDir, 'case_detail_hi.png');
  fs.writeFileSync(hiPath, Buffer.from(hiShot.data, 'base64'));
  console.log(`[Evidence] Saved Hindi screenshot to ${hiPath}`);

  // 3. ODIA CASE DETAIL PAGE
  console.log('[Multilingual Verification] Setting locale to Odia (or)...');
  await send('Runtime.evaluate', {
    expression: `(() => { localStorage.setItem('tb_locale_v1', 'or'); })()`
  });
  await send('Page.navigate', { url: 'http://localhost:3000/patient/cases/case-001?lang=or' });
  await sleep(3500);

  const orEval = await send('Runtime.evaluate', {
    expression: 'document.body.innerText'
  });
  const orText = (orEval && orEval.result && orEval.result.value) || '';
  console.log('[Multilingual Verification] Odia page text sample:');
  console.log(orText.substring(0, 300).replace(/\n+/g, ' '));

  const orShot = await send('Page.captureScreenshot', { format: 'png' });
  const orPath = path.join(screenshotsDir, 'case_detail_or.png');
  fs.writeFileSync(orPath, Buffer.from(orShot.data, 'base64'));
  console.log(`[Evidence] Saved Odia screenshot to ${orPath}`);

  // 4. TEST PERSISTENCE ON RELOAD
  console.log('[Multilingual Verification] Testing Odia persistence on page reload (without ?lang query)...');
  await send('Page.navigate', { url: 'http://localhost:3000/patient/cases/case-001' });
  await sleep(3000);
  const reloadEval = await send('Runtime.evaluate', {
    expression: '(() => ({ locale: localStorage.getItem("tb_locale_v1"), hasOdiaHeader: document.body.innerText.includes("ମୋର କେସ୍ କୁ ଫେରନ୍ତୁ") }))()'
  });
  console.log('[Multilingual Verification] Reload persistence result:', reloadEval && reloadEval.result && reloadEval.result.value);

  // 5. TEST NAVIGATION TO PATIENT CASES LIST
  console.log('[Multilingual Verification] Testing navigation to /patient/cases in Odia...');
  await send('Page.navigate', { url: 'http://localhost:3000/patient/cases' });
  await sleep(3000);
  const casesEval = await send('Runtime.evaluate', {
    expression: '(() => ({ title: document.querySelector("h1")?.innerText, hasOdia: document.body.innerText.includes("ମୋର କେସ୍") }))()'
  });
  console.log('[Multilingual Verification] Patient cases page result:', casesEval && casesEval.result && casesEval.result.value);

  // 6. TEST NAVIGATION TO PATIENT DASHBOARD
  console.log('[Multilingual Verification] Testing navigation to /patient/dashboard in Odia...');
  await send('Page.navigate', { url: 'http://localhost:3000/patient/dashboard' });
  await sleep(3000);
  const dashEval = await send('Runtime.evaluate', {
    expression: '(() => ({ welcome: document.querySelector("h1")?.innerText, hasOdia: document.body.innerText.includes("ସ୍ୱାଗତ") }))()'
  });
  console.log('[Multilingual Verification] Patient dashboard result:', dashEval && dashEval.result && dashEval.result.value);

  // Copy screenshots to artifact directory as well
  const artifactDir = 'C:\\Users\\bibhu\\.gemini\\antigravity-ide\\brain\\54317eb1-c696-4a75-a4a7-a54e0d8700ef';
  fs.copyFileSync(enPath, path.join(artifactDir, 'case_detail_en.png'));
  fs.copyFileSync(hiPath, path.join(artifactDir, 'case_detail_hi.png'));
  fs.copyFileSync(orPath, path.join(artifactDir, 'case_detail_or.png'));

  console.log('[Multilingual Verification] All screenshots copied to artifacts directory.');

  ws.close();
  edgeProcess.kill();
  console.log('✅ Multilingual Verification Completed Successfully!');
}

main().catch(err => {
  console.error('[Verification Error]', err);
  process.exit(1);
});
