/**
 * Automated Route-Isolation & Demo-Safety Test Suite
 * Tests strict server-side middleware route guards, role isolation, and demo switching.
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, {
    redirect: 'manual', // Do not automatically follow redirects to inspect HTTP 307/Location headers
    ...options,
  });
  const location = response.headers.get('location') || '';
  return { status: response.status, location, headers: response.headers };
}

async function runTests() {
  console.log(`\n======================================================`);
  console.log(`TriageBridge Role-Isolation & Demo-Safety Test Suite`);
  console.log(`Testing target: ${BASE_URL}`);
  console.log(`======================================================\n`);

  // -----------------------------------------------------------------
  // 1. PATIENT Accessing Healthcare Route
  // -----------------------------------------------------------------
  console.log(`[TEST GROUP 1] PATIENT Accessing Healthcare Route`);
  {
    const res1 = await request('/healthcare/dashboard', {
      headers: { Cookie: 'tb_role=PATIENT; tb_user_id=pat-001' },
    });
    assert(
      res1.status === 307,
      `PATIENT accessing /healthcare/dashboard returns HTTP 307 (got ${res1.status})`
    );
    assert(
      res1.location.includes('/patient/dashboard'),
      `Redirect target is /patient/dashboard (got "${res1.location}")`
    );

    const res2 = await request('/healthcare/queue', {
      headers: { Cookie: 'tb_role=PATIENT; tb_user_id=pat-001' },
    });
    assert(
      res2.status === 307 && res2.location.includes('/patient/dashboard'),
      `PATIENT accessing /healthcare/queue redirected to /patient/dashboard`
    );
  }

  // -----------------------------------------------------------------
  // 2. DOCTOR Accessing Patient Route
  // -----------------------------------------------------------------
  console.log(`\n[TEST GROUP 2] DOCTOR Accessing Patient Route`);
  {
    const res1 = await request('/patient/dashboard', {
      headers: { Cookie: 'tb_role=DOCTOR; tb_user_id=hcw-001' },
    });
    assert(
      res1.status === 307,
      `DOCTOR accessing /patient/dashboard returns HTTP 307 (got ${res1.status})`
    );
    assert(
      res1.location.includes('/healthcare/dashboard'),
      `Redirect target is /healthcare/dashboard (got "${res1.location}")`
    );

    const res2 = await request('/patient/triage', {
      headers: { Cookie: 'tb_role=DOCTOR; tb_user_id=hcw-001' },
    });
    assert(
      res2.status === 307 && res2.location.includes('/healthcare/dashboard'),
      `DOCTOR accessing /patient/triage redirected to /healthcare/dashboard`
    );
  }

  // -----------------------------------------------------------------
  // 3. NURSE Accessing Patient Route
  // -----------------------------------------------------------------
  console.log(`\n[TEST GROUP 3] NURSE Accessing Patient Route`);
  {
    const res1 = await request('/patient/dashboard', {
      headers: { Cookie: 'tb_role=NURSE; tb_user_id=hcw-002' },
    });
    assert(
      res1.status === 307,
      `NURSE accessing /patient/dashboard returns HTTP 307 (got ${res1.status})`
    );
    assert(
      res1.location.includes('/healthcare/dashboard'),
      `Redirect target is /healthcare/dashboard (got "${res1.location}")`
    );

    const res2 = await request('/patient/appointments', {
      headers: { Cookie: 'tb_role=NURSE; tb_user_id=hcw-002' },
    });
    assert(
      res2.status === 307 && res2.location.includes('/healthcare/dashboard'),
      `NURSE accessing /patient/appointments redirected to /healthcare/dashboard`
    );
  }

  // -----------------------------------------------------------------
  // 4. Unauthenticated Access
  // -----------------------------------------------------------------
  console.log(`\n[TEST GROUP 4] Unauthenticated Access`);
  {
    const res1 = await request('/patient/dashboard');
    assert(
      res1.status === 307,
      `Unauthenticated access to /patient/dashboard returns HTTP 307 (got ${res1.status})`
    );
    assert(
      res1.location.includes('/login/patient'),
      `Redirect target is /login/patient (got "${res1.location}")`
    );

    const res2 = await request('/healthcare/dashboard');
    assert(
      res2.status === 307,
      `Unauthenticated access to /healthcare/dashboard returns HTTP 307 (got ${res2.status})`
    );
    assert(
      res2.location.includes('/login/healthcare'),
      `Redirect target is /login/healthcare (got "${res2.location}")`
    );
  }

  // -----------------------------------------------------------------
  // 5. Browser Refresh Simulation
  // -----------------------------------------------------------------
  console.log(`\n[TEST GROUP 5] Browser Refresh Simulation`);
  {
    const refreshPatientToHc = await request('/healthcare/dashboard', {
      headers: {
        Cookie: 'tb_role=PATIENT; tb_user_id=pat-001',
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    });
    assert(
      refreshPatientToHc.status === 307 &&
        refreshPatientToHc.location.includes('/patient/dashboard'),
      `Page refresh on /healthcare/dashboard with PATIENT role securely redirects to /patient/dashboard`
    );

    const refreshDoctorToPatient = await request('/patient/dashboard', {
      headers: {
        Cookie: 'tb_role=DOCTOR; tb_user_id=hcw-001',
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    });
    assert(
      refreshDoctorToPatient.status === 307 &&
        refreshDoctorToPatient.location.includes('/healthcare/dashboard'),
      `Page refresh on /patient/dashboard with DOCTOR role securely redirects to /healthcare/dashboard`
    );
  }

  // -----------------------------------------------------------------
  // 6. Browser Back Navigation Simulation
  // -----------------------------------------------------------------
  console.log(`\n[TEST GROUP 6] Browser Back Navigation Simulation`);
  {
    const backNavPatient = await request('/healthcare/dashboard', {
      headers: {
        Cookie: 'tb_role=PATIENT; tb_user_id=pat-001',
        Referer: `${BASE_URL}/patient/dashboard`,
      },
    });
    assert(
      backNavPatient.status === 307 &&
        backNavPatient.location.includes('/patient/dashboard'),
      `Browser back navigation to /healthcare/dashboard by PATIENT redirects to /patient/dashboard`
    );

    const backNavNurse = await request('/patient/dashboard', {
      headers: {
        Cookie: 'tb_role=NURSE; tb_user_id=hcw-002',
        Referer: `${BASE_URL}/healthcare/dashboard`,
      },
    });
    assert(
      backNavNurse.status === 307 &&
        backNavNurse.location.includes('/healthcare/dashboard'),
      `Browser back navigation to /patient/dashboard by NURSE redirects to /healthcare/dashboard`
    );
  }

  // -----------------------------------------------------------------
  // 7. Demo Role Switching
  // -----------------------------------------------------------------
  console.log(`\n[TEST GROUP 7] Demo Role Switching`);
  {
    // Step A: Active role PATIENT
    const stepA_patient = await request('/patient/dashboard', {
      headers: { Cookie: 'tb_role=PATIENT; tb_user_id=pat-001' },
    });
    assert(
      stepA_patient.status === 200,
      `Step A: PATIENT permitted on /patient/dashboard (status ${stepA_patient.status})`
    );

    const stepA_blocked = await request('/healthcare/dashboard', {
      headers: { Cookie: 'tb_role=PATIENT; tb_user_id=pat-001' },
    });
    assert(
      stepA_blocked.status === 307 &&
        stepA_blocked.location.includes('/patient/dashboard'),
      `Step A: PATIENT blocked from /healthcare/dashboard -> redirected to /patient/dashboard`
    );

    // Step B: Switch to DOCTOR
    const stepB_doctor = await request('/healthcare/dashboard', {
      headers: { Cookie: 'tb_role=DOCTOR; tb_user_id=hcw-001' },
    });
    assert(
      stepB_doctor.status === 200,
      `Step B: Switched to DOCTOR, permitted on /healthcare/dashboard (status ${stepB_doctor.status})`
    );

    const stepB_blocked = await request('/patient/dashboard', {
      headers: { Cookie: 'tb_role=DOCTOR; tb_user_id=hcw-001' },
    });
    assert(
      stepB_blocked.status === 307 &&
        stepB_blocked.location.includes('/healthcare/dashboard'),
      `Step B: DOCTOR blocked from /patient/dashboard -> redirected to /healthcare/dashboard`
    );

    // Step C: Switch to NURSE
    const stepC_nurse = await request('/healthcare/dashboard', {
      headers: { Cookie: 'tb_role=NURSE; tb_user_id=hcw-002' },
    });
    assert(
      stepC_nurse.status === 200,
      `Step C: Switched to NURSE, permitted on /healthcare/dashboard (status ${stepC_nurse.status})`
    );

    const stepC_blocked = await request('/patient/dashboard', {
      headers: { Cookie: 'tb_role=NURSE; tb_user_id=hcw-002' },
    });
    assert(
      stepC_blocked.status === 307 &&
        stepC_blocked.location.includes('/healthcare/dashboard'),
      `Step C: NURSE blocked from /patient/dashboard -> redirected to /healthcare/dashboard`
    );

    // Step D: Switch back to PATIENT
    const stepD_patient = await request('/patient/dashboard', {
      headers: { Cookie: 'tb_role=PATIENT; tb_user_id=pat-001' },
    });
    assert(
      stepD_patient.status === 200,
      `Step D: Switched back to PATIENT, permitted on /patient/dashboard (status ${stepD_patient.status})`
    );

    const stepD_blocked = await request('/healthcare/dashboard', {
      headers: { Cookie: 'tb_role=PATIENT; tb_user_id=pat-001' },
    });
    assert(
      stepD_blocked.status === 307 &&
        stepD_blocked.location.includes('/patient/dashboard'),
      `Step D: PATIENT blocked from /healthcare/dashboard -> redirected to /patient/dashboard`
    );
  }

  // -----------------------------------------------------------------
  // 8. Public Shared Routes
  // -----------------------------------------------------------------
  console.log(`\n[TEST GROUP 8] Shared Public Routes Accessible to All`);
  {
    const rootRes = await request('/');
    assert(rootRes.status === 200, `Root page '/' is public (status ${rootRes.status})`);

    const roleSelectRes = await request('/role-select');
    assert(
      roleSelectRes.status === 200,
      `Role select page '/role-select' is public (status ${roleSelectRes.status})`
    );

    const patientLoginRes = await request('/login/patient');
    assert(
      patientLoginRes.status === 200,
      `Login page '/login/patient' is public (status ${patientLoginRes.status})`
    );

    const healthcareLoginRes = await request('/login/healthcare');
    assert(
      healthcareLoginRes.status === 200,
      `Login page '/login/healthcare' is public (status ${healthcareLoginRes.status})`
    );
  }

  console.log(`\n======================================================`);
  console.log(`TEST RESULTS SUMMARY`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total:  ${passed + failed}`);
  console.log(`======================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal error during test run:', err);
  process.exit(1);
});
