import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const tempUserDataDir = path.join(process.cwd(), '.temp_edge_live_profile');
const liveUrl = 'https://triage-bridge-beige.vercel.app';
const screenshotsDir = path.join(process.cwd(), 'screenshots_live');

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log('[Live Vercel Verification] Testing live deployment at:', liveUrl);

  const edgeProcess = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9225',
    `--user-data-dir=${tempUserDataDir}`,
    '--disable-gpu',
    '--window-size=1280,1024',
    '--no-first-run',
    '--no-default-browser-check',
    `${liveUrl}/role-select`,
  ]);

  let isConnected = false;
  let wsUrl = '';

  for (let i = 0; i < 30; i++) {
    await sleep(500);
    try {
      const res = await fetch('http://127.0.0.1:9225/json/list');
      const data = await res.json();
      if (data && data.length > 0 && data[0].webSocketDebuggerUrl) {
        wsUrl = data[0].webSocketDebuggerUrl;
        isConnected = true;
        break;
      }
    } catch {
      // wait
    }
  }

  if (!isConnected || !wsUrl) {
    console.error('Failed to connect to Edge CDP');
    edgeProcess.kill();
    process.exit(1);
  }

  const ws = new WebSocket(wsUrl);
  await new Promise((resolve) => (ws.onopen = resolve));

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

  // TEST 1: Role select in English
  console.log('\n--- 1. Testing Live /role-select in English ---');
  await send('Runtime.evaluate', {
    expression: `(() => { localStorage.setItem('tb_locale_v1', 'en'); })()`,
  });
  await send('Page.navigate', { url: `${liveUrl}/role-select?lang=en` });
  await sleep(4000);

  let evalRes = await send('Runtime.evaluate', {
    expression: 'document.body.innerText',
  });
  let pageText = (evalRes && evalRes.result && evalRes.result.value) || '';
  const hasEnRoleSelect = pageText.includes('Select Your Access Portal') || pageText.includes('Patient Portal');
  console.log('English Role-Select Verified:', hasEnRoleSelect);

  // TEST 2: Role select in Hindi
  console.log('\n--- 2. Testing Live /role-select in Hindi (Devanagari) ---');
  await send('Runtime.evaluate', {
    expression: `(() => { localStorage.setItem('tb_locale_v1', 'hi'); })()`,
  });
  await send('Page.navigate', { url: `${liveUrl}/role-select?lang=hi` });
  await sleep(4000);

  evalRes = await send('Runtime.evaluate', {
    expression: 'document.body.innerText',
  });
  pageText = (evalRes && evalRes.result && evalRes.result.value) || '';
  const hasHiRoleSelect = pageText.includes('अपना एक्सेस पोर्टल चुनें') || pageText.includes('मरीज (रोगी) पोर्टल');
  console.log('Hindi Role-Select Verified:', hasHiRoleSelect);

  // TEST 3: Role select in Odia
  console.log('\n--- 3. Testing Live /role-select in Odia (Odia Script) ---');
  await send('Runtime.evaluate', {
    expression: `(() => { localStorage.setItem('tb_locale_v1', 'or'); })()`,
  });
  await send('Page.navigate', { url: `${liveUrl}/role-select?lang=or` });
  await sleep(4000);

  evalRes = await send('Runtime.evaluate', {
    expression: 'document.body.innerText',
  });
  pageText = (evalRes && evalRes.result && evalRes.result.value) || '';
  const hasOrRoleSelect = pageText.includes('ଆପଣଙ୍କ ପୋର୍ଟାଲ୍ ଚୟନ କରନ୍ତୁ') || pageText.includes('ରୋଗୀ ପୋର୍ଟାଲ୍');
  console.log('Odia Role-Select Verified:', hasOrRoleSelect);

  // Set patient auth state for Ramesh Nayak
  await send('Runtime.evaluate', {
    expression: `(() => {
      localStorage.setItem('tb_auth_user_v1', JSON.stringify({
        id: 'pat-001',
        role: 'PATIENT',
        syntheticId: 'PAT-2026-8912 [Synthetic]',
        fullName: 'Ramesh Nayak [Synthetic Patient]',
        preferredLanguage: 'or',
        age: 48,
        gender: 'MALE',
        location: 'Athamallik, Angul District, Odisha [Synthetic Address]'
      }));
    })()`,
  });

  const parsedUrl = new URL(liveUrl);
  await send('Network.setCookie', {
    name: 'tb_role',
    value: 'PATIENT',
    domain: parsedUrl.hostname,
    path: '/',
    secure: true,
    sameSite: 'Lax',
  });
  await send('Network.setCookie', {
    name: 'tb_user_id',
    value: 'pat-001',
    domain: parsedUrl.hostname,
    path: '/',
    secure: true,
    sameSite: 'Lax',
  });

  // TEST 4: Case Detail in Odia on Live Vercel
  console.log('\n--- 4. Testing Live Case Detail in Odia ---');
  await send('Runtime.evaluate', {
    expression: `(() => { localStorage.setItem('tb_locale_v1', 'or'); })()`,
  });
  await send('Page.navigate', { url: `${liveUrl}/patient/cases/case-001?lang=or` });
  await sleep(4500);

  evalRes = await send('Runtime.evaluate', {
    expression: 'document.body.innerText',
  });
  const liveOdiaText = (evalRes && evalRes.result && evalRes.result.value) || '';
  const hasOdiaCaseBack = liveOdiaText.includes('ମୋର କେସ୍ ତାଲିକାକୁ ଫେରନ୍ତୁ');
  const hasOdiaSubmitted = liveOdiaText.includes('ଦାଖଲ ହୋଇଛି');
  const hasOdiaEvidence = liveOdiaText.includes('ରୋଗୀଙ୍କ ପ୍ରଦତ୍ତ ପ୍ରମାଣ');
  const hasOdiaVitals = liveOdiaText.includes('ରେକର୍ଡ କରାଯାଇଥିବା ଭାଇଟାଲ୍ ସାଇନ୍');
  console.log('- Back link in Odia:', hasOdiaCaseBack);
  console.log('- Submitted status in Odia:', hasOdiaSubmitted);
  console.log('- Evidence card in Odia:', hasOdiaEvidence);
  console.log('- Vitals card in Odia:', hasOdiaVitals);

  const orShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(screenshotsDir, 'live_case_detail_or.png'), Buffer.from(orShot.data, 'base64'));

  // TEST 5: Case Detail in Hindi on Live Vercel
  console.log('\n--- 5. Testing Live Case Detail in Hindi ---');
  await send('Runtime.evaluate', {
    expression: `(() => { localStorage.setItem('tb_locale_v1', 'hi'); })()`,
  });
  await send('Page.navigate', { url: `${liveUrl}/patient/cases/case-001?lang=hi` });
  await sleep(4500);

  evalRes = await send('Runtime.evaluate', {
    expression: 'document.body.innerText',
  });
  const liveHindiText = (evalRes && evalRes.result && evalRes.result.value) || '';
  const hasHiCaseBack = liveHindiText.includes('वापस मेरे मामलों पर जाएं');
  const hasHiSubmitted = liveHindiText.includes('जमा किया गया');
  const hasHiEvidence = liveHindiText.includes('मरीज द्वारा दर्ज साक्ष्य') || liveHindiText.includes('मूल विवरण:');
  const hasHiVitals = liveHindiText.includes('दर्ज किए गए वाइटल साइन');
  console.log('- Back link in Hindi:', hasHiCaseBack);
  console.log('- Submitted status in Hindi:', hasHiSubmitted);
  console.log('- Evidence card in Hindi:', hasHiEvidence);
  console.log('- Vitals card in Hindi:', hasHiVitals);

  const hiShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(screenshotsDir, 'live_case_detail_hi.png'), Buffer.from(hiShot.data, 'base64'));

  // TEST 6: Case Detail in English on Live Vercel
  console.log('\n--- 6. Testing Live Case Detail in English ---');
  await send('Runtime.evaluate', {
    expression: `(() => { localStorage.setItem('tb_locale_v1', 'en'); })()`,
  });
  await send('Page.navigate', { url: `${liveUrl}/patient/cases/case-001?lang=en` });
  await sleep(4500);

  evalRes = await send('Runtime.evaluate', {
    expression: 'document.body.innerText',
  });
  const liveEnText = (evalRes && evalRes.result && evalRes.result.value) || '';
  const hasEnCaseBack = liveEnText.includes('Back to My Cases');
  const hasEnSubmitted = liveEnText.includes('Submitted');
  const hasEnEvidence = liveEnText.includes('Patient Input Evidence');
  console.log('- Back link in English:', hasEnCaseBack);
  console.log('- Submitted status in English:', hasEnSubmitted);
  console.log('- Evidence card in English:', hasEnEvidence);

  const enShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(screenshotsDir, 'live_case_detail_en.png'), Buffer.from(enShot.data, 'base64'));

  ws.close();
  edgeProcess.kill();

  console.log('\n====================================================');
  console.log('LIVE VERCEL MULTILINGUAL VERIFICATION RESULTS:');
  console.log('- Role-Select English:', hasEnRoleSelect ? 'PASS' : 'FAIL');
  console.log('- Role-Select Hindi:', hasHiRoleSelect ? 'PASS' : 'FAIL');
  console.log('- Role-Select Odia:', hasOrRoleSelect ? 'PASS' : 'FAIL');
  console.log('- Case-Detail Odia (all cards & headers):', (hasOdiaCaseBack && hasOdiaSubmitted && hasOdiaEvidence) ? 'PASS' : 'FAIL');
  console.log('- Case-Detail Hindi (all cards & headers):', (hasHiCaseBack && hasHiSubmitted && hasHiEvidence) ? 'PASS' : 'FAIL');
  console.log('- Case-Detail English (all cards & headers):', (hasEnCaseBack && hasEnSubmitted && hasEnEvidence) ? 'PASS' : 'FAIL');
  console.log('====================================================');

  const allPassed =
    hasEnRoleSelect &&
    hasHiRoleSelect &&
    hasOrRoleSelect &&
    hasOdiaCaseBack &&
    hasOdiaSubmitted &&
    hasHiCaseBack &&
    hasHiSubmitted &&
    hasEnCaseBack &&
    hasEnSubmitted;

  if (allPassed) {
    console.log('🎉 ALL LIVE VERCEL DEPLOYMENT TESTS PASSED SUCCESSFULLY!');
  } else {
    console.error('Some tests failed.');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
