import { ExtractedReportData, FollowUpQuestion, DocumentCategory } from './types';

export function simulateOcrExtraction(fileName: string, _fileSize: number): ExtractedReportData {
  const lowerName = fileName.toLowerCase();

  let rawOcrText = '';
  const extractedLabValues: Record<string, string> = {};
  const suggestedPatientName = 'Ramesh Nayak';
  let suggestedDoctorName = 'Dr. P. K. Dash, MD (Med)';
  let suggestedHospitalName = 'District Headquarters Hospital, Angul';
  const today = new Date();
  const suggestedDate = today.toISOString().split('T')[0];
  let suggestedDepartment = 'General Medicine';

  // Calculate suggested next appointment date (3 days ahead for review)
  const apptDateObj = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
  const suggestedAppointmentDate = apptDateObj.toISOString().split('T')[0];
  const suggestedAppointmentTime = '10:30 AM';

  // Determine suggested document category from filename & simulated contents
  let suggestedDocumentType: DocumentCategory = 'MEDICAL_REPORT';
  if (lowerName.includes('blood') || lowerName.includes('cbc') || lowerName.includes('lab') || lowerName.includes('path')) {
    suggestedDocumentType = 'LABORATORY_REPORT';
  } else if (lowerName.includes('xray') || lowerName.includes('chest') || lowerName.includes('scan') || lowerName.includes('mri') || lowerName.includes('ct')) {
    suggestedDocumentType = 'IMAGING_SCAN';
  } else if (lowerName.includes('discharge')) {
    suggestedDocumentType = 'DISCHARGE_SUMMARY';
  } else if (lowerName.includes('rx') || lowerName.includes('prescription')) {
    suggestedDocumentType = 'PRESCRIPTION';
  } else if (lowerName.includes('referral')) {
    suggestedDocumentType = 'REFERRAL_LETTER';
  } else if (lowerName.includes('appointment') || lowerName.includes('slip') || lowerName.includes('token')) {
    suggestedDocumentType = 'APPOINTMENT_LETTER';
  } else if (lowerName.includes('vaccin') || lowerName.includes('immuniz')) {
    suggestedDocumentType = 'VACCINATION_RECORD';
  } else if (lowerName.includes('certificate')) {
    suggestedDocumentType = 'MEDICAL_CERTIFICATE';
  }

  if (lowerName.includes('blood') || lowerName.includes('cbc') || lowerName.includes('lab')) {
    rawOcrText = `
GOVERNMENT OF ODISHA - HEALTH & FAMILY WELFARE DEPT
DISTRICT HEADQUARTERS HOSPITAL, ANGUL
CENTRAL CLINICAL PATHOLOGY LABORATORY
Patient: Ramesh Nayak | Age/Sex: 48Y/M | Ref By: Dr. P. K. Dash
Date of Collection: ${suggestedDate}

COMPLETE BLOOD COUNT (CBC):
Hemoglobin (Hb): 10.4 g/dL (Normal: 13.0 - 17.0) [LOW]
Total Leukocyte Count (TLC): 14,800 /cumm (Normal: 4000 - 11000) [HIGH - Leukocytosis]
Platelet Count: 1.85 Lakhs/cumm (Normal: 1.5 - 4.5)
Neutrophils: 82% (Normal: 50 - 70) [HIGH]
Lymphocytes: 14% (Normal: 20 - 40)
Erythrocyte Sedimentation Rate (ESR): 44 mm/1st hr [ELEVATED]
Peripheral Smear: Normocytic normochromic with toxic granules in neutrophils.
Verified by: Dr. S. K. Mahapatra (Consultant Pathologist)
    `.trim();

    extractedLabValues['Hemoglobin'] = '10.4 g/dL (LOW)';
    extractedLabValues['Total Leukocytes'] = '14,800 /cumm (HIGH)';
    extractedLabValues['Platelets'] = '1.85 Lakhs/cumm (NORMAL)';
    extractedLabValues['Neutrophils'] = '82% (HIGH)';
    extractedLabValues['ESR'] = '44 mm/1st hr (ELEVATED)';
    suggestedDepartment = 'Clinical Pathology';
  } else if (lowerName.includes('xray') || lowerName.includes('chest') || lowerName.includes('scan')) {
    rawOcrText = `
SCB MEDICAL COLLEGE & HOSPITAL, CUTTACK
DEPARTMENT OF RADIODIAGNOSIS & IMAGING
Patient: Sunita Sharma | Age/Sex: 39Y/F
Examination: Digital Chest X-Ray (PA View) | Date: ${suggestedDate}

FINDINGS:
Bilateral lower lobe heterogeneous haziness noted with patchy consolidation.
Costophrenic angles are clear. Cardiac silhouette is normal in size and contour.
Hilar vascular markings are prominent. Trachea is central.
IMPRESSION: Findings suggestive of acute lower respiratory tract infection / bronchopneumonia.
Correlate clinically and with inflammatory markers.
Reporting Radiologist: Dr. Ananya Mishra, MD (Radio)
    `.trim();

    extractedLabValues['Chest PA View'] = 'Bilateral lower lobe patchy consolidation';
    extractedLabValues['Cardiac Silhouette'] = 'Normal size and contour';
    suggestedHospitalName = 'SCB Medical College & Hospital, Cuttack';
    suggestedDoctorName = 'Dr. Ananya Mishra';
    suggestedDepartment = 'Radiodiagnosis';
  } else if (lowerName.includes('appointment') || lowerName.includes('slip') || lowerName.includes('opd')) {
    rawOcrText = `
COMMUNITY HEALTH CENTRE (CHC) - ATHAMALLIK
OPD SLIP & APPOINTMENT ADVICE
Date: ${suggestedDate} | Appointment Token: #42
Patient: Ramesh Nayak | Age: 48 | Sex: Male
Department: Outpatient Clinical Review
Follow-up Consult: ${suggestedAppointmentDate} at ${suggestedAppointmentTime}
Doctor: Dr. Alok Mohanty (Medical Officer, CHC)
Room: Room 3, OPD Wing
    `.trim();

    extractedLabValues['Token'] = '#42';
    extractedLabValues['Appointment Date'] = suggestedAppointmentDate;
    extractedLabValues['Appointment Time'] = suggestedAppointmentTime;
    suggestedHospitalName = 'Community Health Centre, Athamallik';
    suggestedDoctorName = 'Dr. Alok Mohanty';
    suggestedDepartment = 'General Outpatient';
  } else {
    // General OPD slip or prescription
    rawOcrText = `
COMMUNITY HEALTH CENTRE (CHC) - ATHAMALLIK
OPD SLIP & CLINICAL ENCOUNTER
Date: ${suggestedDate} | OPD Token: #42
Patient: Ramesh Nayak | Age: 48 | Sex: Male
Complaints: High fever x 3 days, cough with yellowish sputum, mild dyspnea on exertion.
Vitals: BP 138/88 mmHg | PR 98 bpm | SpO2 93% on room air | Temp 101.4°F
Advised: Tab Paracetamol 650mg TDS x 3d, Syp Ambroxol 10ml TDS, CBC & Chest X-Ray.
Review in 48 hours or immediately if breathlessness worsens.
Doctor: Dr. Alok Mohanty (Medical Officer, CHC)
    `.trim();

    extractedLabValues['BP'] = '138/88 mmHg';
    extractedLabValues['Pulse'] = '98 bpm';
    extractedLabValues['SpO2'] = '93%';
    extractedLabValues['Temperature'] = '101.4°F';
    suggestedHospitalName = 'Community Health Centre, Athamallik';
    suggestedDoctorName = 'Dr. Alok Mohanty';
  }

  return {
    id: `ocr-${Date.now()}`,
    reportId: '',
    rawOcrText,
    suggestedPatientName,
    suggestedDoctorName,
    suggestedHospitalName,
    suggestedDate,
    suggestedDepartment,
    suggestedAppointmentDate,
    suggestedAppointmentTime,
    suggestedDocumentType,
    extractedLabValues,
    ocrConfidence: 0.94,
    isConfirmedByPatient: false,
  };
}

export function generateFollowUpQuestions(text: string): FollowUpQuestion[] {
  const lower = (text || '').toLowerCase();
  const questions: FollowUpQuestion[] = [];

  // Duration
  if (!lower.includes('day') && !lower.includes('week') && !lower.includes('month') && !lower.includes('दिन') && !lower.includes('ଦିନ')) {
    questions.push({
      id: 'q-duration',
      questionKey: 'DURATION',
      questionEn: 'Approximately how many days or hours have you experienced these symptoms?',
      questionHi: 'आप लगभग कितने दिनों या घंटों से इन लक्षणों का अनुभव कर रहे हैं?',
      questionOr: 'ଆପଣ ପ୍ରାୟ କେତେ ଦିନ କିମ୍ବା ଘଣ୍ଟା ଧରି ଏହି ସବୁ ଲକ୍ଷଣ ଅନୁଭବ କରୁଛନ୍ତି?',
      reasonEn: 'Onset duration helps clinicians distinguish acute emergencies from chronic ailments.',
    });
  }

  // Progression
  questions.push({
    id: 'q-progression',
    questionKey: 'PROGRESSION',
    questionEn: 'Are your symptoms worsening rapidly, improving, or staying the same?',
    questionHi: 'क्या आपके लक्षण तेजी से बिगड़ रहे हैं, सुधर रहे हैं, या वैसे ही बने हुए हैं?',
    questionOr: 'ଆପଣଙ୍କ ଲକ୍ଷଣ ଦ୍ରୁତ ଗତିରେ ବିଗିଡ଼ିବାରେ ଲାଗିଛି, ସୁଧୁରୁଛି କିମ୍ବା ସମାନ ରହିଛି?',
    reasonEn: 'Progression trajectory determines triage review urgency.',
  });

  // Current Medication
  questions.push({
    id: 'q-medication',
    questionKey: 'MEDICATIONS',
    questionEn: 'Are you currently taking any regular medications or traditional remedies?',
    questionHi: 'क्या आप वर्तमान में कोई नियमित दवाएं या घरेलू उपचार ले रहे हैं?',
    questionOr: 'ଆପଣ ବର୍ତ୍ତମାନ କୌଣସି ନିୟମିତ ଔଷଧ କିମ୍ବା ଘରୋଇ ଉପଚାର ଗ୍ରହଣ କରୁଛନ୍ତି କି?',
    reasonEn: 'Prevents drug interactions and identifies self-medication.',
  });

  // Allergies
  questions.push({
    id: 'q-allergies',
    questionKey: 'ALLERGIES',
    questionEn: 'Do you have any known allergies to medicines (such as Penicillin or Sulfa drugs)?',
    questionHi: 'क्या आपको दवाओं (जैसे पेनिसिलिन या सल्फा) से कोई ज्ञात एलर्जी है?',
    questionOr: 'ଔଷଧ (ଯଥା ପେନିସିଲିନ୍) ପ୍ରତି ଆପଣଙ୍କର କୌଣସି ଆଲର୍ଜି ଅଛି କି?',
    reasonEn: 'Essential safety checkpoint before healthcare worker prescribing.',
  });

  return questions;
}
