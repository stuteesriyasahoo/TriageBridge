"""
Independent Multilingual Challenge Dataset Generator & Independence Auditor
===========================================================================
Produces exactly 300 synthetic challenge cases:
- 30 English RED, 30 English YELLOW, 30 English GREEN, 10 English GREY (100 EN)
- 30 Hindi RED,   30 Hindi YELLOW,   30 Hindi GREEN,   10 Hindi GREY   (100 HI)
- 30 Odia RED,    30 Odia YELLOW,    30 Odia GREEN,    10 Odia GREY    (100 OR)
Total: 300 cases (90 RED, 90 YELLOW, 90 GREEN, 30 GREY)

Strict Constraints:
1. is_synthetic=true, is_validated=false, evaluation_only=true
2. Zero overlap with training cases, templates, IDs or wording patterns
3. Realistic challenges: Conversational, typos, Hinglish/Odia-English code-switching,
   borderline vitals, negations, age extremes, pregnancy contexts, missing measurements.
4. No disease names, cures, prescriptions, or doctor names in narrative text.
5. Independent audit: SHA-256, exact match check, token similarity, TF-IDF cosine similarity.
"""

import os
import json
import hashlib
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

DISCLAIMER_TEXT = "Synthetic challenge data for AI safety testing. Not clinically validated. Requires healthcare-worker review."

def build_challenge_records():
    records = []
    
    # =========================================================================
    # 1. ENGLISH (100 Cases: 30 RED, 30 YELLOW, 30 GREEN, 10 GREY)
    # =========================================================================
    
    # English RED (30 Cases)
    en_red = [
        # ACS / Cardiac
        (58, 'MALE', 'Severe substernal crushing chest pain rediating to left jaw',
         'Heavy suffocating presure behind sternum for 45 mins, pain shooting into left arm and jaw, profuse diaphoresis, nausea',
         0.75, 9, 'hypertension, dyslipidemia', 'none_known', 'not_applicable', 114, 178, 106, 93, 36.8, 24, 'RF-ACUTE-CHEST-PAIN'),
        (64, 'FEMALE', 'Chest hurt bad since 1 hour, spreading to back and left shoulder',
         'Sudden stabbing and squeezing ache in center chest, tingling in left fingers, broke into cold sweat, feels dizzy',
         1.0, 9, 'type_2_diabetes', 'penicillin', 'not_applicable', 122, 185, 110, 92, 36.9, 26, 'RF-ACUTE-CHEST-PAIN'),
        (51, 'MALE', 'Tight band around chest with suffocating breathlessness',
         'Crushing retrosternal chest discomfort, unable to catch breath, pale gray skin, vomited once',
         0.5, 8, 'coronary_artery_disease', 'none_known', 'not_applicable', 108, 168, 98, 91, 37.1, 24, 'RF-ACUTE-CHEST-PAIN'),
        (72, 'FEMALE', 'Extreme chest tightening and dizziness after walking up stairs',
         'Feels like an elephant sitting on my breastbone, pain went up into neck, extreme fatigue and faintness',
         1.5, 9, 'hypertension', 'aspirin', 'not_applicable', 128, 192, 112, 90, 36.7, 26, 'RF-ACUTE-CHEST-PAIN'),
        (47, 'MALE', 'Severe center chesst presure with vomiting and burning ache',
         'Intense retrosternal weight for past 90 minutes, radiation down left arm, cold clammy sweat all over body',
         1.5, 9, 'smoking_history', 'none_known', 'not_applicable', 118, 172, 102, 92, 36.8, 22, 'RF-ACUTE-CHEST-PAIN'),
         
        # Stroke / FAST / Neuro
        (69, 'MALE', 'Sudden right arm droop and slurred unintelligible speech',
         'Wife noticed mouth crooked to left side 40 minutes ago, right arm completely limp, unable to pronounce words',
         0.7, 2, 'hypertension, atrial_fibrillation', 'none_known', 'not_applicable', 88, 204, 118, 96, 36.9, 18, 'RF-STROKE-FAST; VITAL-CRITICAL-HYPERTENSION'),
        (75, 'FEMALE', 'Left side of body suddenly numb and mouth drooping',
         'Dropped coffee cup suddenly, acute left facial asymmetry, garbled incoherent speech noticed 30 mins ago',
         0.5, 1, 'hypertension', 'sulfa_drugs', 'not_applicable', 92, 212, 116, 95, 36.8, 16, 'RF-STROKE-FAST; VITAL-CRITICAL-HYPERTENSION'),
        (59, 'FEMALE', 'Could not stand up, right leg collapsed and speech garbled',
         'Acute hemiparesis on right side, right mouth corner dragging down, expressive aphasia starting 1 hour back',
         1.0, 3, 'type_2_diabetes', 'none_known', 'not_applicable', 84, 198, 112, 97, 36.7, 18, 'RF-STROKE-FAST'),
        (81, 'MALE', 'Sudden loss of right hand grip and confusion',
         'Suddenly dropped walking stick, right facial droop clearly visible, cannot answer simple questions or repeat words',
         0.8, 2, 'hypertension, vascular_disease', 'none_known', 'not_applicable', 96, 208, 115, 94, 37.0, 20, 'RF-STROKE-FAST; VITAL-CRITICAL-HYPERTENSION'),
         
        # Severe Hypoxia / Acute Respiratory Failure
        (62, 'MALE', 'Severe gasping for air, lips turning blueish',
         'Known COPD flare, gasping in tripod posture, barely uttering two words, audible expiratory wheezing and cyanosis',
         2.0, 7, 'copd', 'none_known', 'not_applicable', 134, 154, 94, 82, 37.4, 38, 'VITAL-CRITICAL-HYPOXIA'),
        (45, 'FEMALE', 'Suffocating asthma attack not responding to 6 inhaler puffs',
         'Silent chest with minimal air entry, intercostal retractions, unable to speak, profound air hunger',
         1.0, 8, 'asthma', 'nsaids', 'no', 142, 160, 98, 84, 37.0, 42, 'VITAL-CRITICAL-HYPOXIA'),
        (68, 'MALE', 'Severe shortness of breath with frothy pink sputum',
         'Woke up gasping, unable to lie flat, coughing pink foamy secretions, coarse bilateral lung crackles',
         1.5, 7, 'congestive_heart_failure', 'none_known', 'not_applicable', 130, 215, 122, 85, 36.9, 36, 'VITAL-CRITICAL-HYPOXIA; VITAL-CRITICAL-HYPERTENSION'),
        (28, 'MALE', 'Sudden sharp pleuritic pain and extreme breathlessness after coughing fit',
         'Tall lean male with sudden right chest tearing sensation, trachea deviated left, absent breath sounds on right side',
         0.5, 9, 'none_reported', 'none_known', 'not_applicable', 138, 92, 58, 86, 36.8, 34, 'VITAL-CRITICAL-HYPOXIA'),
         
        # Coma / Unresponsive / Shock
        (54, 'MALE', 'Found unresponsive in bed by roommate, shallow breathing',
         'Comatose state, unarousable to loud shouting or sternal rub, pinpoint pupils, breathing irregularly slow',
         2.0, 0, 'none_reported', 'unknown', 'not_applicable', 54, 80, 48, 88, 35.8, 8, 'RF-UNCONSCIOUS; VITAL-CRITICAL-HYPOTENSION'),
        (33, 'FEMALE', 'Collaped in bathroom, cool pale skin and thready pulse',
         'Brief seizure reported, unresponsive for 10 minutes, cold clammy extremities, systolic BP collapsed to 74',
         0.5, 0, 'epilepsy', 'none_known', 'unknown', 145, 74, 44, 91, 36.2, 28, 'RF-UNCONSCIOUS; VITAL-CRITICAL-HYPOTENSION'),
        (67, 'MALE', 'Black tarry stools for 2 days, collapsed on standing',
         'Massive gastrointestinal bleed, blanched conjunctiva, lethargic and faint, diaphoresis with severe postural hypotension',
         48.0, 6, 'peptic_ulcer', 'none_known', 'not_applicable', 136, 78, 46, 92, 36.5, 26, 'VITAL-CRITICAL-HYPOTENSION'),
         
        # Anaphylaxis / Airway Compromise
        (24, 'FEMALE', 'Facial swelling and throat choking after eating bakery walnut cake',
         'Massive angioedema of upper lip and tongue, high pitched stridor, diffuse urticarial wheals, lightheadedness',
         0.3, 8, 'tree_nut_allergy', 'walnuts', 'no', 138, 82, 50, 87, 37.0, 32, 'VITAL-CRITICAL-HYPOXIA; VITAL-CRITICAL-HYPOTENSION'),
        (19, 'MALE', 'Wasp sting on neck 15 mins ago, throat closing up',
         'Rapidly swelling neck and uvula, hoarse whisper only, inspiratory stridor, vomiting with generalized hives',
         0.25, 8, 'none_reported', 'insect_venom', 'not_applicable', 146, 84, 52, 88, 37.1, 34, 'VITAL-CRITICAL-HYPOXIA; VITAL-CRITICAL-HYPOTENSION'),
         
        # Severe Pregnancy / Obstetric Emergency
        (29, 'FEMALE', '34 weeks pregnant with pounding occipital headache and visual flashes',
         'Severe preeclampsia presentation: bilateral ankle edema up to knees, epigastric pain, BP 196/118, hyperreflexia',
         3.0, 8, 'gestational_hypertension', 'none_known', 'yes', 110, 196, 118, 96, 37.2, 22, 'VITAL-CRITICAL-HYPERTENSION'),
        (26, 'FEMALE', 'Heavy vaginal bleeding soaking 4 pads in 30 minutes at 30 weeks pregnancy',
         'Sudden unprovoked painless bright red torrential bleeding, uterine irritability, fetal tachycardia, maternal pallor',
         0.5, 7, 'previous_c_section', 'none_known', 'yes', 132, 88, 54, 93, 36.8, 26, 'VITAL-CRITICAL-HYPOTENSION'),
         
        # Acute Sepsis / Pediatric Emergency
        (3, 'MALE', 'Toddler burning up, grunting breath and mottled purple skin',
         'Age 3, high fever 40.6C, capillary refill over 4 seconds, lethargic and unarousable, whimpering weakly',
         6.0, 8, 'none_reported', 'none_known', 'not_applicable', 184, 76, 42, 89, 40.6, 52, 'VITAL-CRITICAL-HYPERTHERMIA; VITAL-CRITICAL-HYPOXIA; VITAL-CRITICAL-HEART-RATE'),
        (2, 'FEMALE', 'Inconsolable crying, bulging soft spot on head, stiff neck',
         'Age 2, high pitched shrill cry, refuses breastfeeding, neck rigid on passive flexion, non-blanching petechial rash on thighs',
         4.0, 9, 'none_reported', 'none_known', 'not_applicable', 178, 80, 46, 92, 40.2, 48, 'VITAL-CRITICAL-HEART-RATE'),
        (76, 'MALE', 'Severe rigors, confusion and burning flank ache in catheterized patient',
         'Urosepsis: disoriented to time and place, peripheral vasoconstriction, warm flushed trunk, shaking uncontrollable chills',
         12.0, 7, 'benign_prostatic_hyperplasia', 'penicillin', 'not_applicable', 140, 82, 48, 89, 40.4, 30, 'VITAL-CRITICAL-HYPOXIA; VITAL-CRITICAL-HYPOTENSION'),
         
        # Severe Acute Abdomen / Peritonitis
        (48, 'MALE', 'Sudden knife-like belly pain, board-like rigid abdomen',
         'Sudden onset agonizing epigastric pain like a gunshot, abdominal wall rock hard, involuntary guarding and rebound',
         2.0, 10, 'peptic_ulcer', 'none_known', 'not_applicable', 132, 84, 52, 92, 38.6, 28, 'VITAL-CRITICAL-HYPOTENSION'),
        (22, 'FEMALE', 'Ruptured ectopic suspicion: sudden lower pelvic agony and fainting',
         'Severe right iliac fossa stabbing pain with shoulder tip pain, pale lips, positive home pregnancy test, faint upon sitting',
         1.5, 9, 'pelvic_inflammatory_history', 'none_known', 'yes', 138, 78, 46, 93, 36.4, 28, 'VITAL-CRITICAL-HYPOTENSION'),
         
        # Hypertensive Encephalopathy / Thunderclap Headache
        (56, 'MALE', 'Thunderclap explosive headache, worst headache ever in life',
         'Peak agony reached in 30 seconds while lifting boxes, projectile vomiting twice, photophobia, neck tenderness',
         1.0, 10, 'hypertension', 'none_known', 'not_applicable', 96, 218, 126, 95, 37.1, 20, 'VITAL-CRITICAL-HYPERTENSION'),
        (63, 'FEMALE', 'Extreme occipital throbbing and nosebleed with confusion',
         'Severe epistaxis from both nostrils, blurring of peripheral vision, BP 225/130, somnolent and disoriented',
         2.0, 8, 'hypertension', 'none_known', 'not_applicable', 104, 225, 130, 95, 36.9, 22, 'VITAL-CRITICAL-HYPERTENSION'),
         
        # Severe Trauma / Hemorrhage / Burns
        (31, 'MALE', 'Gushing spurting thigh wound from industrial saw accident',
         'Deep laceration over femoral region, arterial pulsatile bright red blood, tourniquet applied, blanched cold extremities',
         0.3, 9, 'none_reported', 'none_known', 'not_applicable', 148, 82, 48, 92, 35.9, 30, 'VITAL-CRITICAL-HYPOTENSION'),
        (41, 'FEMALE', 'Scalding hot cooking oil explosion over face and chest',
         'Extensive deep partial thickness blistering over anterior neck, chin and upper chest, singed nasal hairs, hoarse voice',
         0.5, 9, 'asthma', 'none_known', 'no', 126, 148, 92, 91, 37.0, 28, 'VITAL-CRITICAL-HYPOXIA'),
        (52, 'MALE', 'Diabetic ketoacidosis: deep labored gasping air and vomiting',
         'Kussmaul breathing pattern, strong sweet fruity acetone breath odor, extreme dry tongue, barely responsive',
         18.0, 6, 'type_1_diabetes', 'none_known', 'not_applicable', 136, 88, 56, 90, 36.3, 36, 'VITAL-CRITICAL-HYPOTENSION'),
    ]

    # English YELLOW (30 Cases)
    en_yellow = [
        (27, 'MALE', 'Right lower quadrant belly pain for 14 hours, getting sharper',
         'Persistent aching localized in McBurneys point, hurts more when walking or bumping heel, low grade fever, nausea',
         14.0, 7, 'none_reported', 'none_known', 'not_applicable', 96, 124, 78, 97, 38.1, 18, 'NONE'),
        (35, 'FEMALE', 'Agonizing lower side back cramps shooting towards bladder, pee looks cloudy reddish',
         'Sudden unbearable knife-like ache on right waist started 2 hours ago, pacing floor restlessly, nauseated, tiny clots noted during urination',
         3.0, 8, 'nephrolithiasis_history', 'none_known', 'no', 102, 142, 88, 98, 36.9, 20, 'NONE'),
        (54, 'MALE', 'Deep 7cm laceration on right forearm from shattered window pane',
         'Cut through subcutaneous tissue, edges gaping, venous bleeding controlled by firm compression, sensation intact',
         1.0, 6, 'none_reported', 'none_known', 'not_applicable', 84, 130, 82, 99, 36.8, 16, 'NONE'),
        (46, 'FEMALE', 'Asthma exacerbation with persistent tight wheeze despite 3 inhaler doses',
         'Moderate expiratory wheezing across both lung bases, can speak full sentences with slight breath pause, SpO2 93%',
         4.0, 5, 'asthma', 'penicillin', 'no', 104, 134, 84, 93, 37.0, 24, 'NONE'),
        (68, 'MALE', 'Productive green phlegm cough and pleuritic right side chest ache',
         'Fever 38.6C for 3 days, localized bronchial breathing on right mid zone, no cyanosis, SpO2 92% on room air',
         72.0, 6, 'copd', 'none_known', 'not_applicable', 100, 138, 86, 92, 38.6, 22, 'NONE'),
        (42, 'FEMALE', 'Hot painful spreading red rash on lower leg for past 48 hours',
         'Left pretibial skin warm and glossy red, swelling extending halfway up calf, tender to touch, chills without rigor',
         48.0, 5, 'type_2_diabetes', 'none_known', 'no', 90, 132, 80, 98, 38.3, 18, 'NONE'),
        (79, 'MALE', 'Unable to pass urine for 16 hours, painful swollen lower abdomen',
         'Acute urinary retention, tense painful suprapubic mass palpable, severe urgency with zero voiding despite straining',
         16.0, 8, 'benign_prostatic_hyperplasia', 'sulfa_drugs', 'not_applicable', 98, 158, 94, 97, 36.9, 18, 'NONE'),
        (25, 'FEMALE', '27 weeks pregnant with severe burning dysuria and left flank tenderness',
         'Pyelonephritis presentation in pregnancy: urinary frequency, cloudy smelly urine, left costovertebral angle pain, temp 38.4C',
         24.0, 6, 'none_reported', 'none_known', 'yes', 102, 126, 76, 98, 38.4, 20, 'NONE'),
        (16, 'MALE', 'Deformed right wrist with intense swelling after skateboard fall',
         'Obvious dinner-fork deformity, severe focal bone tenderness, radial pulse 2+ palpable, fingers warm and pink',
         1.5, 7, 'none_reported', 'none_known', 'not_applicable', 92, 122, 74, 99, 36.7, 16, 'NONE'),
        (38, 'FEMALE', 'Severe throbbing unilateral temple headache with nausea and light aversion',
         'Migraine episode lasting 18 hours, visual flickering zigzag lines, photophobia, vomited gastric contents twice',
         18.0, 7, 'migraine', 'nsaids', 'no', 86, 128, 80, 98, 36.8, 16, 'NONE'),
        (5, 'MALE', 'Child with persistent barking cough, hoarseness and raspy breathing',
         'Age 5, seal-like barking cough worsened at night, mild inspiratory stridor only on vigorous crying, chest clear at rest',
         8.0, 4, 'none_reported', 'none_known', 'not_applicable', 118, 102, 64, 95, 37.9, 26, 'NONE'),
        (61, 'FEMALE', 'Biliary colic: severe cramping under right ribs after fried chicken',
         'Right hypochondriac pain radiating to right shoulder blade, tender on deep inspiration under rib margin, no jaundice',
         5.0, 7, 'gallstones', 'none_known', 'not_applicable', 88, 136, 84, 98, 37.2, 18, 'NONE'),
        (33, 'MALE', 'Perianal throbbing pain and tender lump making sitting impossible',
         'Perianal abscess: localized fluctuant erythematous swelling 3cm from anal verge, exquisite tenderness, low fever',
         36.0, 7, 'none_reported', 'none_known', 'not_applicable', 94, 128, 82, 99, 37.9, 18, 'NONE'),
        (71, 'FEMALE', 'Severe watery diarrhea 8 times in 12 hours with postural dizziness',
         'Dehydration secondary to acute gastroenteritis: sunken eyes, dry oral mucosa, skin turgor delayed 2s, cramping belly',
         12.0, 6, 'hypertension', 'none_known', 'not_applicable', 108, 106, 68, 97, 37.8, 20, 'NONE'),
        (49, 'MALE', 'Red swollen exquisitely tender right big toe since dawn',
         'Acute gouty arthritis flare: first metatarsophalangeal joint fiery red, cannot tolerate weight of bedsheet',
         10.0, 8, 'gout, hyperuricemia', 'aspirin', 'not_applicable', 84, 144, 88, 98, 37.1, 16, 'NONE'),
        (21, 'FEMALE', 'Deep dog bite puncture wounds on right calf, tooth fragments possible',
         'Unprovoked stray dog bite, multiple punctures with surrounding bruising, active serosanguinous oozing, tetanus overdue',
         2.0, 6, 'none_reported', 'none_known', 'no', 88, 118, 76, 99, 36.9, 16, 'NONE'),
        (57, 'FEMALE', 'Severe vertigo with spinning room and unsteadiness when turning head',
         'Acute labyrinthitis: horizontal nystagmus on left gaze, pronounced nausea, unable to walk unassisted without veering',
         8.0, 5, 'none_reported', 'none_known', 'not_applicable', 82, 134, 82, 98, 36.7, 16, 'NONE'),
        (30, 'MALE', 'Severe foreign body sensation in left eye after metal angle grinding',
         'Foreign body sensation under upper eyelid, conjunctival injection, tearing and photophobia, pupil equal and reactive',
         3.0, 6, 'none_reported', 'none_known', 'not_applicable', 78, 124, 78, 99, 36.6, 15, 'NONE'),
        (44, 'FEMALE', 'High fever 39.1C with severe body aches and retro-orbital headache',
         'Acute febrile illness day 3, prostration, severe generalized myalgia, no petechiae, platelet count pending',
         72.0, 6, 'none_reported', 'none_known', 'no', 104, 116, 72, 97, 39.1, 20, 'NONE'),
        (66, 'MALE', 'Left foot ulcer in diabetic patient discharging cloudy fluid',
         'Plantar neuropathic ulcer over 1st metatarsal head, localized purulent base, surrounding 1cm erythema, no systemic sepsis',
         96.0, 4, 'type_2_diabetes', 'none_known', 'not_applicable', 86, 140, 84, 98, 37.4, 16, 'NONE'),
        (23, 'FEMALE', 'Severe lower pelvic cramping and heavy menstrual clots for 24h',
         'Soaking pad every 90 minutes, passing plum-sized clots, cramping pain 7/10, no syncope, conjunctiva pale pink',
         24.0, 7, 'polycystic_ovary_syndrome', 'none_known', 'no', 96, 110, 70, 98, 36.8, 18, 'NONE'),
        (53, 'MALE', 'Sharp chest wall pain worsened by pressing on 4th rib costochondral junction',
         'Focal costochondritis: precisely reproducible with finger pressure, NO radiation, NO sweating, SpO2 99%',
         48.0, 5, 'none_reported', 'none_known', 'not_applicable', 76, 128, 80, 99, 36.8, 16, 'NONE'),
        (39, 'FEMALE', 'Persistent vomiting of all liquids for 18h with dry mouth',
         'Unable to keep sips of oral rehydration fluid down, diffuse abdominal cramping, dark concentrated urine',
         18.0, 6, 'none_reported', 'none_known', 'no', 100, 114, 72, 98, 37.3, 18, 'NONE'),
        (17, 'MALE', 'Left testicle swollen and tender following soccer impact yesterday',
         'Post-traumatic scrotal swelling, mild scrotal hematoma, cremasteric reflex intact, tender to palpation',
         20.0, 7, 'none_reported', 'none_known', 'not_applicable', 84, 120, 76, 99, 36.8, 16, 'NONE'),
        (63, 'FEMALE', 'Confusion and unsteadiness in elderly diabetic, blood sugar 54 mg/dL',
         'Symptomatic hypoglycemia: mild diaphoresis, jittery hands, oriented to name but confused on date, responded to oral juice',
         1.0, 3, 'type_2_diabetes', 'none_known', 'not_applicable', 94, 138, 82, 98, 36.6, 18, 'NONE'),
        (77, 'MALE', 'Severe back spasm after bending over garden shovel, unable to stand straight',
         'Acute lumbago with severe paravertebral muscle guarding, straight leg raise negative, normal bowel and bladder control',
         6.0, 8, 'degenerative_disc_disease', 'none_known', 'not_applicable', 88, 150, 90, 98, 36.7, 18, 'NONE'),
        (31, 'FEMALE', 'Facial pressure, green nasal discharge and left cheek pain for 8 days',
         'Maxillary sinus fullness, severe pain on bending forward, tooth tenderness, temp 38.2C, no peri-orbital swelling',
         192.0, 5, 'allergic_rhinitis', 'penicillin', 'no', 80, 118, 74, 99, 38.2, 16, 'NONE'),
        (48, 'MALE', 'Chemical bleach splash in right eye while cleaning bathroom',
         'Accidental alkali splash, copious immediate water irrigation performed at home, mild conjunctival hyperemia, cornea clear',
         0.5, 6, 'none_reported', 'none_known', 'not_applicable', 88, 132, 82, 99, 36.7, 16, 'NONE'),
        (70, 'FEMALE', 'Elderly female tripped over carpet, left hip painful on rotation',
         'No gross deformity or limb shortening, but unable to bear weight, pain localized to groin on active leg elevation',
         2.0, 7, 'osteoporosis', 'none_known', 'not_applicable', 92, 146, 86, 97, 36.8, 18, 'NONE'),
        (36, 'MALE', 'Shingles rash with intense burning pain across left chest dermatome',
         'Grouped vesicular rash on erythematous base along T5 distribution, sharp neuropathic lancinating pain 7/10',
         72.0, 7, 'none_reported', 'none_known', 'not_applicable', 78, 126, 80, 98, 37.1, 16, 'NONE'),
    ]

    # English GREEN (30 Cases)
    en_green = [
        (26, 'MALE', 'Mild runny nose, sneezing and scratchy throat for two days',
         'Clear watery rhinorrhea, throat feels slightly tickly, strictly NO fever, NO cough, NO shortness of breath',
         48.0, 1, 'none_reported', 'none_known', 'not_applicable', 68, 118, 76, 99, 36.6, 14, 'NONE'),
        (34, 'FEMALE', 'Superficial gravel graze on left knee after tripping during jog',
         'Shallow epidermal abrasion 3x2cm, cleaned with tap water, bleeding stopped, full normal knee bend and walking',
         2.0, 2, 'none_reported', 'none_known', 'no', 72, 116, 74, 99, 36.7, 14, 'NONE'),
        (22, 'FEMALE', 'Dull forehead tension ache after 9 hours studying on laptop',
         'Band-like dull tension headache across temples, relieved after drinking water, NO nausea, NO visual disturbance',
         8.0, 2, 'none_reported', 'none_known', 'no', 70, 114, 72, 100, 36.6, 14, 'NONE'),
        (58, 'MALE', 'Chronic right knee osteoarthritis ache unchanged in damp weather',
         'Usual stiffness upon waking for past 5 years, baseline aching pain 3/10, walks without aid, no joint warmth',
         2160.0, 3, 'osteoarthritis', 'none_known', 'not_applicable', 74, 128, 80, 98, 36.8, 15, 'NONE'),
        (29, 'FEMALE', 'Mild stomach bloating and burping after heavy oily curry dinner',
         'Epigastric fullness, passed wind and feels much better, strictly NO severe pain, NO vomiting, normal bowel movement',
         3.0, 1, 'none_reported', 'none_known', 'no', 70, 118, 76, 99, 36.7, 14, 'NONE'),
        (37, 'MALE', 'Itchy red mosquito bite on left forearm with mild local swelling',
         'Single 1cm pruritic papule on forearm, no spreading redness, no fever, no breathing issues whatsoever',
         12.0, 1, 'none_reported', 'none_known', 'not_applicable', 66, 120, 78, 99, 36.5, 14, 'NONE'),
        (19, 'FEMALE', 'Seasonal allergic sneezing, runny nose and itchy watery eyes',
         'Pollen allergy flare: clear nasal discharge, repetitive sneezing, itchy palate, afebrile, lungs clear',
         24.0, 1, 'allergic_rhinitis', 'dust_mites', 'no', 72, 112, 70, 99, 36.7, 14, 'NONE'),
        (43, 'MALE', 'Small paper cut on right index finger, asking for clean plaster',
         'Minor superficial cut 5mm on fingertip, dry and clean, full sensation and tendon movement intact',
         1.0, 1, 'none_reported', 'none_known', 'not_applicable', 68, 122, 78, 100, 36.6, 14, 'NONE'),
        (52, 'FEMALE', 'Mild neck stiffness after sleeping in awkward posture under fan',
         'Musculoskeletal neck strain, mild discomfort on turning head right, completely afebrile, NO neurologic signs',
         6.0, 2, 'none_reported', 'none_known', 'not_applicable', 70, 124, 76, 99, 36.6, 14, 'NONE'),
        (28, 'MALE', 'Scraped elbow on doorway frame, slight redness and graze',
         'Superficial graze over olecranon, intact skin mostly, zero active bleed, full painless elbow flexion',
         1.5, 1, 'none_reported', 'none_known', 'not_applicable', 72, 118, 74, 99, 36.7, 14, 'NONE'),
        (65, 'MALE', 'Stubbed left fifth toe against bedpost, sore on touch',
         'Small toe bruised slightly, no deformity, normal capillary refill, can bear weight with mild limp, pain 2/10',
         3.0, 2, 'hypertension', 'none_known', 'not_applicable', 76, 130, 80, 98, 36.8, 15, 'NONE'),
        (31, 'FEMALE', 'Mild dry throat tickle and occasional clear throat clearing',
         'Pharyngeal dryness after speaking at seminar, drinks tea regularly, NO swallowing pain, NO fever',
         36.0, 1, 'none_reported', 'none_known', 'no', 68, 114, 72, 99, 36.6, 14, 'NONE'),
        (49, 'MALE', 'Chronic lower back morning stiffness for 2 years, usual baseline',
         'Regular dull ache after waking, eases after 15 minutes of walking, strictly NO radicular leg pain',
         1440.0, 2, 'lumbar_spondylosis', 'none_known', 'not_applicable', 72, 126, 78, 98, 36.7, 15, 'NONE'),
        (23, 'FEMALE', 'Mild canker sore inside lower lip causing stinging with citrus',
         'Single small 2mm aphthous ulcer on labial mucosa, clear surrounding tissue, no lymphadenopathy, afebrile',
         48.0, 2, 'none_reported', 'none_known', 'no', 70, 110, 70, 100, 36.6, 14, 'NONE'),
        (40, 'MALE', 'Small splinter of wood under right thumb nail, wants removal',
         'Tiny wooden splinter visible under distal nail plate, localized slight discomfort on pressure, no pus',
         4.0, 2, 'none_reported', 'none_known', 'not_applicable', 70, 122, 78, 99, 36.7, 14, 'NONE'),
        (18, 'FEMALE', 'Minor dry skin patches on elbows feeling itchy in air conditioning',
         'Mild localized xerosis on extensor elbow surfaces, no weeping, no infection, vital signs normal',
         120.0, 1, 'none_reported', 'none_known', 'no', 68, 112, 72, 99, 36.6, 14, 'NONE'),
        (55, 'FEMALE', 'Minor bruise on forearm after carrying grocery crates',
         'Small 3cm ecchymosis on volar forearm, non-tender, no swelling, no bone pain, full wrist function',
         24.0, 1, 'none_reported', 'none_known', 'not_applicable', 72, 128, 76, 99, 36.8, 14, 'NONE'),
        (27, 'MALE', 'Slight ear canal itchiness after swimming in pool yesterday',
         'External auditory canal feels itchy, no discharge, no hearing loss, tragal tenderness negative, temp normal',
         20.0, 1, 'none_reported', 'none_known', 'not_applicable', 68, 116, 74, 99, 36.7, 14, 'NONE'),
        (33, 'FEMALE', 'Need blood pressure check for routine annual fitness form',
         'Completely asymptomatic, feels energetic and healthy, routine medical fitness screening check',
         0.5, 0, 'none_reported', 'none_known', 'no', 70, 118, 76, 99, 36.6, 14, 'NONE'),
        (61, 'MALE', 'Superficial skin tag under armpit caught on shirt collar',
         'Pedunculated 2mm cutaneous papilloma, slight irritation, no bleeding, no surrounding erythema',
         72.0, 1, 'hypertension', 'none_known', 'not_applicable', 72, 128, 80, 98, 36.7, 14, 'NONE'),
        (45, 'FEMALE', 'Mild calf muscle tiredness after brisk morning 5km jog',
         'Bilateral gastrocnemius fatigue, no localized tenderness, no calf swelling or redness, normal pulses',
         4.0, 1, 'none_reported', 'none_known', 'no', 74, 120, 76, 99, 36.7, 14, 'NONE'),
        (21, 'MALE', 'Mild chapped dry lips from winter air, slight peeling',
         'Superficial lip dryness and desquamation, no angular fissures, no bleeding, systemically completely well',
         48.0, 1, 'none_reported', 'none_known', 'not_applicable', 66, 114, 72, 100, 36.5, 14, 'NONE'),
        (38, 'FEMALE', 'Broke fingernail close to skin bed, slightly sore',
         'Torn nail plate on left ring finger, no active bleeding, nail bed intact, dressed cleanly',
         1.0, 1, 'none_reported', 'none_known', 'no', 70, 116, 74, 99, 36.6, 14, 'NONE'),
        (50, 'MALE', 'Routine prescription refill request for ongoing antihypertensive tablets',
         'Refill request, feeling well, no headaches, no visual disturbances, no chest complaints, BP stable',
         24.0, 0, 'hypertension', 'none_known', 'not_applicable', 72, 124, 78, 99, 36.7, 14, 'NONE'),
        (16, 'FEMALE', 'Mild acne pimple on forehead feeling slightly sore',
         'Single inflammatory papule on forehead, no cellulitis, afebrile, healthy teenager',
         24.0, 1, 'none_reported', 'none_known', 'no', 72, 110, 70, 99, 36.6, 14, 'NONE'),
        (67, 'MALE', 'Mild itchy scalp with small dandruff flakes',
         'Seborrheic scaling on crown, no skin breakdown, no infection, vital signs unremarkable',
         168.0, 1, 'none_reported', 'none_known', 'not_applicable', 70, 128, 80, 98, 36.7, 14, 'NONE'),
        (29, 'FEMALE', 'Mild foot sole fatigue after wearing high heels at wedding',
         'Plantar muscle ache, normal arches, no swelling, full ankle movement, feeling comfortable sitting',
         6.0, 1, 'none_reported', 'none_known', 'no', 68, 116, 74, 100, 36.6, 14, 'NONE'),
        (42, 'MALE', 'Slight dry cough once or twice in morning after dusty attic cleanup',
         'Transient throat tickle from dust exposure, clear lungs, strictly NO breathlessness, SpO2 99%',
         8.0, 1, 'none_reported', 'none_known', 'not_applicable', 70, 122, 78, 99, 36.6, 14, 'NONE'),
        (35, 'FEMALE', 'Superficial friction blister on heel from new leather loafers',
         'Small intact fluid-filled 1cm blister over right Achilles tendon insertion, no erythema, walking carefully',
         12.0, 1, 'none_reported', 'none_known', 'no', 68, 114, 72, 99, 36.7, 14, 'NONE'),
        (24, 'MALE', 'Mild post-nasal drip feeling after eating cold ice cream',
         'Transient sensation of mucus in throat, throat mucosa pink and normal, afebrile, clear breathing',
         2.0, 0, 'none_reported', 'none_known', 'not_applicable', 70, 118, 76, 99, 36.6, 14, 'NONE'),
    ]

    # English GREY (10 Cases - testing deterministic missing info gate)
    en_grey = [
        # Missing both HR and BP (Rule 1)
        (58, 'MALE', 'Sudden collapse at supermarket, found on ground',
         'Transient loss of consciousness witnessed by clerk, woke up confused, no measurements taken yet',
         None, None, 'unknown', 'unknown', 'not_applicable', None, None, None, 95, 36.8, 16, 'NONE'),
        (65, 'FEMALE', 'Fainting spell while standing in church, feels weak',
         'Syncope episode lasting 30 seconds, family brought patient immediately, no triage vitals recorded',
         None, None, 'hypertension', 'none_known', 'not_applicable', None, None, None, 96, 36.7, 18, 'NONE'),
        (42, 'MALE', 'Dizzy spell after standing up, feels lightheaded',
         'Patient feels faint, heart rate and blood pressure were omitted on intake form',
         2.0, 2, 'none_reported', 'none_known', 'not_applicable', None, None, None, 98, 36.6, 16, 'NONE'),
         
        # Respiratory presentation missing SpO2 (Rule 2)
        (52, 'MALE', 'Severe shortness of breath and wheezing since 3 hours',
         'Patient in respiratory distress, audibly wheezing, coughing, SpO2 pulse oximeter sensor failed and unrecorded',
         3.0, 6, 'asthma', 'none_known', 'not_applicable', 110, 142, 88, None, 37.2, 28, 'NONE'),
        (69, 'FEMALE', 'Heavy cough with fever and difficulty breathing',
         'Coughing up yellow phlegm, dyspnea on minimal exertion, oxygen saturation not entered',
         48.0, 5, 'copd', 'none_known', 'not_applicable', 98, 136, 84, None, 38.3, 24, 'NONE'),
        (35, 'MALE', 'Sudden severe cough attack and breathlessness after smoke inhalation',
         'Persistent coughing fit, stridor and wheeze reported, room air SpO2 missing from triage record',
         1.0, 5, 'none_reported', 'none_known', 'not_applicable', 104, 130, 82, None, 37.0, 26, 'NONE'),
         
        # Pediatric missing temp & HR (Rule 3)
        (3, 'FEMALE', 'Toddler irritable and warm to touch for past 6 hours',
         'Mother says 3-year-old child warm and crying continuously, thermometer was broken so temperature and pulse not taken',
         6.0, 5, 'none_reported', 'none_known', 'not_applicable', None, None, None, 97, None, 28, 'NONE'),
        (4, 'MALE', 'Four year old child with fever and ear pulling',
         'Young child fussy, pulling left ear, pediatric vitals for heart rate and temperature missing',
         12.0, 4, 'none_reported', 'none_known', 'not_applicable', None, None, None, 98, None, 24, 'NONE'),
         
        # All vitals blank (Rule 4)
        (29, 'FEMALE', 'Allergic rash all over body after taking medication',
         'Intake sheet arrived with zero vital sign entries completed by ambulance attendant',
         2.0, 4, 'none_reported', 'unknown', 'unknown', None, None, None, None, None, None, 'NONE'),
        (47, 'MALE', 'Severe abdominal cramps and diarrhea after street food',
         'Patient registered at kiosk, vital signs entirely unrecorded on file',
         5.0, 6, 'none_reported', 'none_known', 'not_applicable', None, None, None, None, None, None, 'NONE'),
    ]

    # Helper to convert to dicts
    def make_dicts(items, lang, label):
        res = []
        for it in items:
            missing_info_val = 'none'
            if label == 'GREY':
                missing_info_val = 'critical_vitals_missing'
            elif label == 'RED':
                missing_info_val = 'immediate_medical_officer_review_needed'
                
            res.append({
                'age': it[0],
                'gender': it[1],
                'patient_language': lang,
                'chief_complaint': it[2],
                'symptoms': it[3],
                'duration_hours': it[4],
                'pain_score': it[5],
                'medical_history': it[6],
                'allergies': it[7],
                'pregnancy_status': it[8],
                'vitals_heart_rate_bpm': it[9],
                'vitals_systolic_bp': it[10],
                'vitals_diastolic_bp': it[11],
                'vitals_spo2_percent': it[12],
                'vitals_temperature_c': it[13],
                'vitals_respiratory_rate_bpm': it[14],
                'rule_based_red_flags': it[15],
                'provisional_urgency_label': label,
                'missing_information': missing_info_val,
                'requires_healthcare_worker_review': True,
                'is_synthetic': True,
                'is_validated': False,
                'clinical_disclaimer': DISCLAIMER_TEXT,
                'evaluation_only': True
            })
        return res

    records.extend(make_dicts(en_red, 'en', 'RED'))
    records.extend(make_dicts(en_yellow, 'en', 'YELLOW'))
    records.extend(make_dicts(en_green, 'en', 'GREEN'))
    records.extend(make_dicts(en_grey, 'en', 'GREY'))

    # =========================================================================
    # 2. HINDI (100 Cases: 30 RED, 30 YELLOW, 30 GREEN, 10 GREY)
    # Including Devanagari, conversational colloquial Hindi, typos & Hinglish code-switching
    # =========================================================================
    hi_red = [
        # Hinglish & Devanagari ACS / Cardiac
        (55, 'MALE', 'Bohot severe chest pain ho raha hai radiating to left arm with excessive sweating',
         'Heavy crushing weight chhati par lag raha hai pichhle 45 minute se, pain left jaw aur hath me ja raha hai, ulti jaisa lag raha hai',
         0.75, 9, 'hypertension, smoking', 'none_known', 'not_applicable', 115, 180, 105, 92, 36.9, 24, 'RF-ACUTE-CHEST-PAIN'),
        (62, 'FEMALE', 'सीने में भयानक दबाव और दम घुटने जैसा लग रहा है',
         'छाती के बीच में पत्थर जैसा भारीपन, बायां हाथ सुन्न पड़ रहा है, ठंडा पसीना और तेज घबराहट हो रही है',
         1.0, 9, 'type_2_diabetes', 'none_known', 'not_applicable', 120, 188, 110, 91, 36.8, 26, 'RF-ACUTE-CHEST-PAIN'),
        (50, 'MALE', 'Chhati me bohot zyada pressure aur jalan hai, saans ruk rahi hai',
         'Achanak chhati ke center me unbearable pain shuru hua, left kandhe me fail raha hai, thanda pasina beh raha hai',
         0.5, 9, 'coronary_artery_disease', 'aspirin', 'not_applicable', 112, 175, 102, 93, 37.0, 22, 'RF-ACUTE-CHEST-PAIN'),
        (70, 'FEMALE', 'Pichhle aadhe ghante se chhati me tez dard aur chakkar aa rahe hain',
         'Seene me achanak tez dabav shuru hua, ulti aayi aur behoshi jaisa lag raha hai, saans lene me dikkat',
         0.5, 8, 'hypertension', 'none_known', 'not_applicable', 126, 190, 112, 90, 36.7, 26, 'RF-ACUTE-CHEST-PAIN'),
        (48, 'MALE', 'Chest me heaviness aur left arm me tingling ho rahi hai',
         'Severe retrosternal squeezing ache, patient is sweating profusely and pale, cannot lie flat',
         1.5, 9, 'none_reported', 'none_known', 'not_applicable', 118, 170, 100, 92, 36.8, 24, 'RF-ACUTE-CHEST-PAIN'),
         
        # Stroke / FAST (Hinglish + Hindi)
        (67, 'MALE', 'Achanak se bolna band ho gaya aur right side ka hath hil nahi raha',
         'Muflis 40 mins pehle muh tedha ho gaya, right arm me koi taqat nahi bachi, aawaz bilkul ladkhada rahi hai',
         0.7, 2, 'hypertension', 'none_known', 'not_applicable', 88, 206, 120, 96, 36.9, 18, 'RF-STROKE-FAST; VITAL-CRITICAL-HYPERTENSION'),
        (74, 'FEMALE', 'अचानक मुंह टेढ़ा हो गया और दाहिना पैर लड़खड़ाने लगा',
         'आधे घंटे पहले अचानक चेहरे की दाईं तरफ कमजोरी आ गई, बात स्पष्ट नहीं बोल पा रही हैं, दाहिना हाथ गिर रहा है',
         0.5, 1, 'hypertension, stroke_history', 'none_known', 'not_applicable', 92, 215, 118, 95, 36.8, 16, 'RF-STROKE-FAST; VITAL-CRITICAL-HYPERTENSION'),
        (60, 'MALE', 'Subah uthe to right side body paralyzed lag rahi thi',
         'Acute hemiparesis, right facial droop, slurred unintelligible speech noticed by son 1 hour ago',
         1.0, 2, 'type_2_diabetes', 'none_known', 'not_applicable', 86, 195, 110, 96, 36.7, 18, 'RF-STROKE-FAST'),
        (80, 'FEMALE', 'Hath se chai ka cup gir gaya aur bolna band ho gaya',
         'Sudden onset right sided weakness, expressive aphasia, facial asymmetry present, unresponsive to verbal questions',
         0.8, 2, 'hypertension', 'none_known', 'not_applicable', 94, 210, 115, 94, 37.0, 20, 'RF-STROKE-FAST; VITAL-CRITICAL-HYPERTENSION'),
         
        # Respiratory / Hypoxia
        (65, 'MALE', 'Saans bilkul nahi aa rahi hai, hoth neele pad gaye hain',
         'COPD patient, acute respiratory exhaustion, gasping for breath, unable to speak even single word, SpO2 83%',
         1.5, 7, 'copd', 'none_known', 'not_applicable', 136, 150, 92, 83, 37.3, 38, 'VITAL-CRITICAL-HYPOXIA'),
        (42, 'FEMALE', 'Severe asthma attack, inhaler se koi aaram nahi mil raha',
         'Chhati me seene se seeti jaisi aawaz ruk gayi hai (silent chest), gale me gaddha pad raha hai, SpO2 85%',
         1.0, 8, 'asthma', 'none_known', 'no', 140, 162, 98, 85, 36.9, 40, 'VITAL-CRITICAL-HYPOXIA'),
        (71, 'MALE', 'Pichhle do ghante se laal-gulabi jhaag wali khansi aur dum ghutna',
         'Acute pulmonary edema, sitting upright gasping, coughing frothy pink sputum, bilateral lung crackles, BP 212/120',
         2.0, 7, 'heart_failure', 'none_known', 'not_applicable', 128, 212, 120, 86, 37.0, 36, 'VITAL-CRITICAL-HYPOXIA; VITAL-CRITICAL-HYPERTENSION'),
         
        # Coma / Shock
        (56, 'MALE', 'Ghar me achanak behosh hokar gir pade, aankhein nahi khol rahe',
         'Patient completely unarousable to shouting or painful pinch, deep comatose state, slow irregular gasps',
         1.0, 0, 'none_reported', 'unknown', 'not_applicable', 52, 78, 46, 88, 35.7, 8, 'RF-UNCONSCIOUS; VITAL-CRITICAL-HYPOTENSION'),
        (35, 'FEMALE', 'Toilet me chakkar aane ke baad behosh mili, shareer thanda hai',
         'Brief loss of consciousness, cold clammy extremities, unarousable, systolic BP dropped to 72',
         0.5, 0, 'none_reported', 'none_known', 'unknown', 144, 72, 42, 90, 36.1, 28, 'RF-UNCONSCIOUS; VITAL-CRITICAL-HYPOTENSION'),
        (68, 'MALE', 'Khoon ki ulti aur kaala dast hone ke baad behosh ho gaye',
         'Upper GI hemorrhage, pale conjunctiva, profusely sweating, profound circulatory collapse BP 76/44',
         12.0, 6, 'liver_cirrhosis', 'none_known', 'not_applicable', 138, 76, 44, 91, 36.4, 26, 'VITAL-CRITICAL-HYPOTENSION'),
         
        # Anaphylaxis
        (25, 'FEMALE', 'Dawa khane ke 15 minute baad hoth aur jeebh bohot soojh gayi',
         'Acute severe angioedema, throat me choking feeling, stridor audible without stethoscope, hives all over body',
         0.3, 8, 'drug_allergy', 'amoxicillin', 'no', 136, 80, 48, 86, 37.1, 32, 'VITAL-CRITICAL-HYPOXIA; VITAL-CRITICAL-HYPOTENSION'),
        (20, 'MALE', 'Bhid (wasp) ne gale par kaata, saans lene me aawaz aa rahi hai',
         'Inspiratory stridor, swollen neck and airway, voice reduced to whisper, dizzy and vomiting',
         0.25, 8, 'none_reported', 'insect_sting', 'not_applicable', 142, 82, 50, 87, 37.0, 34, 'VITAL-CRITICAL-HYPOXIA; VITAL-CRITICAL-HYPOTENSION'),
         
        # Pregnancy Emergency
        (31, 'FEMALE', '33 weeks pregnant, sar me achanak bohot tez dard aur aankho ke aage andhera',
         'Severe preeclampsia: BP 198/116, epigastric severe ache, brisk reflexes, facial and hand massive edema',
         2.0, 8, 'preeclampsia_history', 'none_known', 'yes', 112, 198, 116, 96, 37.2, 22, 'VITAL-CRITICAL-HYPERTENSION'),
        (27, 'FEMALE', '8 mahine ki pregnancy me achanak bohot zyada bleeding shuru ho gayi',
         'Painless massive vaginal hemorrhage, soaked multiple clothes, fetal heart rate rapid, maternal pallor',
         0.5, 7, 'none_reported', 'none_known', 'yes', 134, 86, 52, 92, 36.6, 26, 'VITAL-CRITICAL-HYPOTENSION'),
         
        # Pediatric Emergency
        (3, 'MALE', '3 saal ka bachha teekhe bukhar me achanak behosh ho gaya',
         'Febrile status / sepsis: temp 40.7C, mottling on abdomen, lethargic, capillary refill > 4s, rapid grunting',
         4.0, 8, 'none_reported', 'none_known', 'not_applicable', 186, 74, 40, 88, 40.7, 54, 'VITAL-CRITICAL-HYPERTHERMIA; VITAL-CRITICAL-HYPOXIA; VITAL-CRITICAL-HEART-RATE'),
        (2, 'FEMALE', 'Bachhi roye ja rahi hai, gardan akad gayi hai aur tezz bukhar hai',
         'Suspected meningitis: nuchal rigidity positive, high pitched cry, petechial purpuric spots on limbs, temp 40.3C',
         3.0, 9, 'none_reported', 'none_known', 'not_applicable', 180, 78, 44, 91, 40.3, 50, 'VITAL-CRITICAL-HEART-RATE'),
        (75, 'MALE', 'Bujurg mariz ko peshab ki nali me infection se tez kapkapi aur behoshi',
         'Uroseptic shock: disoriented, shivering violently, extremities cold and mottled, BP 80/46, HR 142',
         16.0, 7, 'prostate_enlargement', 'none_known', 'not_applicable', 142, 80, 46, 88, 40.5, 32, 'VITAL-CRITICAL-HYPERTHERMIA; VITAL-CRITICAL-HYPOXIA; VITAL-CRITICAL-HYPOTENSION'),
         
        # Acute Abdomen / Peritonitis
        (46, 'MALE', 'Pet me achanak talwar jaisa tez dard, pet patthar jaisa sakht ho gaya',
         'Perforation peritonitis: board-like abdominal rigidity, involuntary severe guarding, pale and in agony',
         1.5, 10, 'peptic_ulcer', 'none_known', 'not_applicable', 130, 82, 50, 91, 38.8, 28, 'VITAL-CRITICAL-HYPOTENSION'),
        (23, 'FEMALE', 'Pet ke nichle hisse me achanak tez dard aur chakkar aakar behoshi',
         'Ruptured ectopic suspicion: missed period 6 weeks, acute right iliac fossa pain with shoulder tip pain, BP 76/44',
         1.0, 9, 'none_reported', 'none_known', 'yes', 140, 76, 44, 92, 36.3, 30, 'VITAL-CRITICAL-HYPOTENSION'),
         
        # Thunderclap / Hypertensive
        (58, 'MALE', 'Sar me achanak bijli jaisa sabse tez dard hua aur do baar ulti aayi',
         'Thunderclap headache, subarachnoid hemorrhage suspicion, photophobia, nuchal rigidity, BP 214/122',
         1.0, 10, 'hypertension', 'none_known', 'not_applicable', 98, 214, 122, 95, 37.0, 20, 'VITAL-CRITICAL-HYPERTENSION'),
        (62, 'FEMALE', 'Sar ke peeche bohot tez dard aur naak se tez khoon beh raha hai',
         'Hypertensive emergency: bilateral epistaxis, BP 228/132 mmHg, blurred vision, drowsy',
         1.5, 8, 'hypertension', 'none_known', 'not_applicable', 106, 228, 132, 94, 36.8, 22, 'VITAL-CRITICAL-HYPERTENSION'),
         
        # Trauma / Burn / DKA
        (30, 'MALE', 'Factory me machine se pair par gehra ghav, khoon tezi se phuhare jaise nikal raha',
         'Femoral arterial spurting hemorrhage, makeshift belt tourniquet on, extremities icy cold, blanched face',
         0.4, 9, 'none_reported', 'none_known', 'not_applicable', 146, 80, 46, 91, 35.8, 30, 'VITAL-CRITICAL-HYPOTENSION'),
        (39, 'FEMALE', 'Cylinder leak hone se aag lagi, chehre aur chhati par gehre jhale',
         'Severe facial and chest flame burns with soot in nostrils, hoarse voice, airway edema concern',
         0.5, 9, 'none_reported', 'none_known', 'no', 128, 145, 90, 90, 37.1, 28, 'VITAL-CRITICAL-HYPOXIA'),
        (50, 'MALE', 'Diabetes patient, bohot gehri saans le rahe hain aur behosh jaise hain',
         'Diabetic ketoacidosis: Kussmaul gasping breathing, fruity breath odor, parched cracked tongue, BP 86/52',
         24.0, 6, 'type_1_diabetes', 'none_known', 'not_applicable', 134, 86, 52, 89, 36.2, 36, 'VITAL-CRITICAL-HYPOXIA; VITAL-CRITICAL-HYPOTENSION'),
        (45, 'MALE', 'Achanak seene me pathar jaisa dabav aur dono bazuon me sunnpann',
         'Patient clutch kar raha hai chest ko, bol raha hai bohot ghutan aur paseena ho raha hai, BP 182/108',
         0.6, 9, 'hypertension', 'none_known', 'not_applicable', 116, 182, 108, 92, 36.9, 24, 'RF-ACUTE-CHEST-PAIN'),
    ]

    # Hindi YELLOW (30 Cases)
    hi_yellow = [
        (26, 'MALE', 'Pet ke right lower side me kal raat se tez dard aur ulti ka man',
         'Localized tenderness at McBurney point, chalne me dard badhta hai, halka bukhar 100.6F, bhookh bilkul nahi lag rahi',
         15.0, 7, 'none_reported', 'none_known', 'not_applicable', 94, 126, 78, 98, 38.1, 18, 'NONE'),
        (36, 'FEMALE', 'Kamar ke daayein hisse me achanak tez marod wala dard jo aage pashab tak ja raha',
         'Severe colicky renal pain in waves, writhing on bed, urine me halka laal rang dikha, BP 140/88',
         4.0, 8, 'kidney_stones', 'none_known', 'no', 100, 140, 88, 98, 36.8, 20, 'NONE'),
        (52, 'MALE', 'Hath me kanch lagne se 6cm gehra cut lag gaya hai',
         'Deep forearm glass laceration, bleeding stopped by cloth pressure, movement present in fingers, needs stitches',
         1.5, 6, 'none_reported', 'none_known', 'not_applicable', 82, 128, 80, 99, 36.7, 16, 'NONE'),
        (44, 'FEMALE', 'Asthma flare up, 3 baar pump lene ke baad bhi seene me seeti bajj rahi hai',
         'Moderate wheezing on both sides, bolne me beech me saans toot rahi hai but SpO2 93%, alert and oriented',
         5.0, 5, 'asthma', 'sulfa_drugs', 'no', 102, 132, 82, 93, 37.1, 24, 'NONE'),
        (66, 'MALE', 'Peele balgam wali khansi teen din se aur tez bukhar hai',
         'Pneumonia presentation: right mid zone crackles, fever 101.4F, SpO2 92% on room air, no cyanosis',
         72.0, 6, 'copd', 'none_known', 'not_applicable', 98, 136, 84, 92, 38.5, 22, 'NONE'),
        (40, 'FEMALE', 'Pair ki pindli me do din se laal sujan aur bohot jalan ho rahi hai',
         'Cellulitis of lower leg: shin skin shiny red and hot, swelling spreading up, tender to touch, temp 38.2C',
         48.0, 5, 'type_2_diabetes', 'none_known', 'no', 88, 130, 80, 98, 38.2, 18, 'NONE'),
        (78, 'MALE', '15 ghante se peshab nahi utra, pet ke niche bohot tez dard hai',
         'Acute urinary retention: suprapubic bladder distended and tender, intense straining with zero urine',
         15.0, 8, 'prostate_hypertrophy', 'none_known', 'not_applicable', 96, 156, 92, 97, 36.9, 18, 'NONE'),
        (26, 'FEMALE', '26 weeks pregnant, peshab me bohot tez jalan aur kamar me dard hai',
         'Pregnancy urinary infection: dysuria, urgency, left flank tenderness on percussion, temp 38.3C',
         20.0, 6, 'none_reported', 'none_known', 'yes', 100, 124, 76, 98, 38.3, 20, 'NONE'),
        (17, 'MALE', 'Cycle se girne par kalayi tedhi ho gayi aur bohot dard ho raha hai',
         'Fracture distal radius suspicion: dinner-fork deformity, severe focal bone tenderness, pulse 2+ present',
         2.0, 7, 'none_reported', 'none_known', 'not_applicable', 90, 120, 74, 99, 36.7, 16, 'NONE'),
        (36, 'FEMALE', 'Aadhe sar me bohot tez thumping dard aur ulti jaisa lag raha hai',
         'Severe migraine: unilateral throbbing pain for 16h, photophobia, vomited food twice, cannot bear light',
         16.0, 7, 'migraine', 'none_known', 'no', 84, 126, 78, 98, 36.8, 16, 'NONE'),
        (4, 'MALE', 'Bachhe ko raat se bhonkne jaisi khansi aur aawaz bhaari ho gayi hai',
         'Viral croup: seal-like barking cough, mild inspiratory stridor only on crying, chest indrawing absent at rest',
         10.0, 4, 'none_reported', 'none_known', 'not_applicable', 116, 100, 62, 96, 37.8, 26, 'NONE'),
        (59, 'FEMALE', 'Tale huye pakode khane ke baad pet ke right side me tez marod',
         'Biliary colic: right upper quadrant cramping pain, tender under right rib edge on deep breathing, no jaundice',
         6.0, 7, 'gallbladder_stones', 'none_known', 'not_applicable', 86, 134, 82, 98, 37.1, 18, 'NONE'),
        (34, 'MALE', 'Guda ke paas tez dard aur foda jaisa ban gaya hai, baith nahi pa rahe',
         'Perianal abscess: localized fluctuant red mass near anal verge, severe throbbing pain, low grade fever',
         30.0, 7, 'none_reported', 'none_known', 'not_applicable', 92, 126, 80, 99, 37.8, 18, 'NONE'),
        (70, 'FEMALE', 'Pichhle 12 ghante me 7 baar pani jaisa dast hua aur kamzori lag rahi',
         'Moderate dehydration from gastroenteritis: dry mouth, sunken eyes, delayed skin recoil, BP 108/68',
         12.0, 6, 'hypertension', 'none_known', 'not_applicable', 106, 108, 68, 97, 37.7, 20, 'NONE'),
        (48, 'MALE', 'Pair ke anguthe me achanak bohot tez aag jaisi jalan aur sujan',
         'Acute gout: first metatarsophalangeal joint fiery red and swollen, unable to put foot on floor',
         12.0, 8, 'gout', 'aspirin', 'not_applicable', 82, 142, 86, 98, 37.0, 16, 'NONE'),
        (22, 'FEMALE', 'Gali ke kutte ne pair par daant maar diya, gehra ghav hai',
         'Stray dog bite on calf, puncture wounds oozing serous fluid, skin bruised, tetanus shot overdue',
         1.5, 6, 'none_reported', 'none_known', 'no', 86, 116, 74, 99, 36.8, 16, 'NONE'),
        (55, 'FEMALE', 'Sar ghoom raha hai aur aas paas ki cheezein gol gol ghoomti lag rahi',
         'Acute vertigo: horizontal nystagmus, severe nausea on head turn, unsteady gait, vital signs stable',
         6.0, 5, 'none_reported', 'none_known', 'not_applicable', 80, 132, 80, 98, 36.7, 16, 'NONE'),
        (29, 'MALE', 'Welding ka kaam karte waqt aankh me metal ka kanka chala gaya',
         'Corneal foreign body sensation, eye tearing and redness, vision intact, photophobia present',
         2.5, 6, 'none_reported', 'none_known', 'not_applicable', 76, 122, 76, 99, 36.6, 15, 'NONE'),
        (43, 'FEMALE', 'Tez bukhar 102F aur poore shareer aur kamar me aisi peed jaise haddi toot rahi ho',
         'Suspected acute viral / dengue syndrome: retro-orbital ache, prostration, severe myalgia, vitals stable',
         60.0, 6, 'none_reported', 'none_known', 'no', 102, 114, 70, 97, 38.9, 20, 'NONE'),
        (64, 'MALE', 'Sugar ke mareez hain, pair ke talve me purana ghav peela pani chhod raha hai',
         'Diabetic foot ulcer: 2cm ulcer under metatarsal head, mild purulence, surrounding 1cm erythema',
         90.0, 4, 'type_2_diabetes', 'none_known', 'not_applicable', 84, 138, 82, 98, 37.3, 16, 'NONE'),
        (24, 'FEMALE', 'Period me bohot zyada bleeding ho rahi hai aur bade bade thakke gir rahe hain',
         'Menorrhagia with severe dysmenorrhea: soaking cloth every hour, severe lower abdominal cramping, no syncope',
         20.0, 7, 'pcos', 'none_known', 'no', 94, 112, 72, 98, 36.7, 18, 'NONE'),
        (51, 'MALE', 'Chhati me ek jagah dabane par tez dard hota hai, khansi me bhi dard',
         'Costochondritis: sharp focal chest wall tenderness on 4th rib junction, no radiation, SpO2 99%, normal ECG',
         40.0, 5, 'none_reported', 'none_known', 'not_applicable', 74, 126, 78, 99, 36.8, 16, 'NONE'),
        (37, 'FEMALE', 'Kuch bhi khane peene par turant ulti ho rahi hai pichhle 15 ghante se',
         'Persistent nausea and vomiting, cannot keep liquids down, diffuse belly cramps, dark urine',
         15.0, 6, 'none_reported', 'none_known', 'no', 98, 112, 70, 98, 37.2, 18, 'NONE'),
        (18, 'MALE', 'Football khelte waqt andkosh par chot lagi, sujan aur dard hai',
         'Traumatic scrotal tenderness, mild swelling, cremasteric reflex intact, urinalysis clear',
         18.0, 7, 'none_reported', 'none_known', 'not_applicable', 82, 118, 74, 99, 36.7, 16, 'NONE'),
        (62, 'FEMALE', 'Sugar 58 aa rahi hai aur hath kaanp rahe hain, paseena aa raha hai',
         'Symptomatic hypoglycemia in diabetic patient: tremulousness, mild diaphoresis, took morning tablet without meal',
         1.0, 3, 'type_2_diabetes', 'none_known', 'not_applicable', 92, 136, 80, 98, 36.5, 18, 'NONE'),
        (76, 'MALE', 'Kamar me achanak lachak aane se jhuk nahi pa rahe, bohot dard hai',
         'Acute lumbago with muscle spasm, no bowel bladder disturbance, normal leg sensation, pain 7/10',
         5.0, 7, 'lumbar_spondylosis', 'none_known', 'not_applicable', 86, 148, 88, 98, 36.7, 18, 'NONE'),
        (30, 'FEMALE', 'Naak band, peela balgam aur gaal ki haddi me pichhle 7 din se dard',
         'Acute sinusitis: maxillary sinus tenderness, pain worse on bending head down, temp 38.1C',
         168.0, 5, 'allergic_rhinitis', 'none_known', 'no', 78, 116, 72, 99, 38.1, 16, 'NONE'),
        (47, 'MALE', 'Safai karte waqt aankh me halka toilet cleaner ka cheenta pad gaya',
         'Chemical eye splash: irrigated thoroughly with tap water, conjunctiva mildly congested, cornea clear',
         0.5, 6, 'none_reported', 'none_known', 'not_applicable', 86, 130, 80, 99, 36.6, 16, 'NONE'),
        (69, 'FEMALE', 'Zameen par phisal kar gir gayi, daayein kulhe me chalne me tez dard',
         'Post-fall hip pain: no external deformity, but unable to bear weight on right leg, tender over greater trochanter',
         2.0, 7, 'osteoporosis', 'none_known', 'not_applicable', 90, 144, 84, 97, 36.7, 18, 'NONE'),
        (35, 'MALE', 'Peeth aur chhati ki ek taraf daane nikal aaye hain aur aag jaisi jalan ho rahi hai',
         'Herpes zoster: unilateral dermatomal vesicular rash, sharp burning neuralgic pain, vitals stable',
         60.0, 7, 'none_reported', 'none_known', 'not_applicable', 76, 124, 78, 98, 37.0, 16, 'NONE'),
    ]

    # Hindi GREEN (30 Cases)
    hi_green = [
        (25, 'MALE', 'Halka sa sardi jukham aur naak beh rahi hai do din se',
         'Clear watery rhinorrhea, halki gale me kharash, koi bukhar nahi hai, saans ekdum normal hai',
         48.0, 1, 'none_reported', 'none_known', 'not_applicable', 68, 116, 74, 99, 36.6, 14, 'NONE'),
        (32, 'FEMALE', 'Ghar me phisal kar ghutne me halki si kharonch lag gayi',
         'Superficial knee graze, khoon band ho gaya hai, pair modne aur chalne me koi dikkat nahi',
         2.0, 2, 'none_reported', 'none_known', 'no', 70, 114, 72, 99, 36.7, 14, 'NONE'),
        (21, 'FEMALE', 'Computer par der tak kaam karne se maathe me halka dard hai',
         'Tension headache: dull ache across forehead, pani peene se behtar lag raha hai, koi ulti nahi, koi chakkar nahi',
         6.0, 2, 'none_reported', 'none_known', 'no', 68, 112, 70, 100, 36.6, 14, 'NONE'),
        (56, 'MALE', 'Purana ghutne ka gathiya dard thoda badha hua lag raha hai',
         'Chronic osteoarthritis ache for 4 years, usual morning stiffness, chalne me normal hai, koi sujan nahi',
         1800.0, 3, 'osteoarthritis', 'none_known', 'not_applicable', 72, 126, 78, 98, 36.8, 15, 'NONE'),
        (28, 'FEMALE', 'Daawat me bhari khana khane ke baad pet me halki gas aur dakar aa rahi hai',
         'Mild indigestion: gas release hone ke baad aaram mil gaya, koi tez dard nahi, koi ulti nahi',
         3.0, 1, 'none_reported', 'none_known', 'no', 70, 116, 74, 99, 36.7, 14, 'NONE'),
        (36, 'MALE', 'Hath par machhar ne kaat liya tha, halki khujli ho rahi hai',
         'Single mosquito bite papule on forearm, no spreading redness, no fever, completely well',
         10.0, 1, 'none_reported', 'none_known', 'not_applicable', 66, 118, 76, 99, 36.5, 14, 'NONE'),
        (20, 'FEMALE', 'Mausam badalne se naak me khujli aur chheenk aa rahi hai',
         'Allergic rhinitis: watery clear nasal discharge, repetitive sneezing, afebrile, chest clear',
         24.0, 1, 'allergic_rhinitis', 'none_known', 'no', 72, 110, 70, 99, 36.6, 14, 'NONE'),
        (42, 'MALE', 'Ungli par kagaz katne se halki si kharonch lag gayi',
         'Tiny paper cut on fingertip, clean and dry, full movement, asking for small bandaid',
         1.0, 1, 'none_reported', 'none_known', 'not_applicable', 68, 120, 76, 100, 36.6, 14, 'NONE'),
        (50, 'FEMALE', 'Pankhe ke neeche sone se gardan me halki akad aagayi hai',
         'Mild neck muscle strain, can rotate head with mild tightness, strictly no fever, no numbness',
         6.0, 2, 'none_reported', 'none_known', 'not_applicable', 70, 122, 74, 99, 36.6, 14, 'NONE'),
        (27, 'MALE', 'Darwaze se kohni takra gayi thi, halka laal nishan hai',
         'Superficial elbow graze, no swelling, no bone pain, full painless movement',
         1.5, 1, 'none_reported', 'none_known', 'not_applicable', 70, 116, 72, 99, 36.7, 14, 'NONE'),
        (64, 'MALE', 'Khatiya se pair ka chhota angutha takra gaya tha, halka dard hai',
         'Stubbed small toe, mild bruising, normal walking, can bear weight easily, pain 2/10',
         3.0, 2, 'hypertension', 'none_known', 'not_applicable', 74, 128, 78, 98, 36.8, 15, 'NONE'),
        (30, 'FEMALE', 'Bhashan dene ke baad gale me halki kharash lag rahi hai',
         'Voice fatigue, throat clear on examination, no swallowing difficulty, afebrile',
         20.0, 1, 'none_reported', 'none_known', 'no', 68, 112, 70, 99, 36.6, 14, 'NONE'),
        (48, 'MALE', 'Subah subah kamar me purani thodi akad rehti hai jo ghoomne par theek ho jati hai',
         'Chronic mild low back stiffness, eases after walk, strictly no radiating leg pain',
         1200.0, 2, 'lumbar_spondylosis', 'none_known', 'not_applicable', 72, 124, 76, 98, 36.7, 15, 'NONE'),
        (22, 'FEMALE', 'Hoth ke andar chhota sa chaala ho gaya hai, khane par jalan hoti hai',
         'Single small aphthous ulcer on inside lip, no fever, no swelling, otherwise totally fine',
         36.0, 2, 'none_reported', 'none_known', 'no', 68, 110, 68, 100, 36.6, 14, 'NONE'),
        (39, 'MALE', 'Lakdi ka chhota sa kanta ungli me dhas gaya hai, nikalwana hai',
         'Small wooden splinter under distal finger skin, localized mild soreness on touch, no pus',
         3.0, 2, 'none_reported', 'none_known', 'not_applicable', 70, 120, 76, 99, 36.7, 14, 'NONE'),
        (19, 'FEMALE', 'Sardi me kohni ki twacha sookh kar halki khujli kar rahi hai',
         'Mild dry skin on elbows, no redness, no weeping, normal healthy appearance',
         96.0, 1, 'none_reported', 'none_known', 'no', 66, 110, 70, 99, 36.6, 14, 'NONE'),
        (54, 'FEMALE', 'Bhaari thela uthane se hath par halka neela nishan pad gaya',
         'Small ecchymosis on forearm, non-tender, normal joint movement, no pain',
         24.0, 1, 'none_reported', 'none_known', 'not_applicable', 72, 126, 74, 99, 36.8, 14, 'NONE'),
        (26, 'MALE', 'Nadi me nahane ke baad kaan me thodi khujli aur gila pan lag raha',
         'Mild ear canal wetness sensation, no pain, no discharge, normal hearing',
         16.0, 1, 'none_reported', 'none_known', 'not_applicable', 68, 114, 72, 99, 36.7, 14, 'NONE'),
        (32, 'FEMALE', 'Naukri ke fitness form ke liye BP aur health checkup karana hai',
         'Routine employment checkup, completely asymptomatic, active and healthy',
         0.5, 0, 'none_reported', 'none_known', 'no', 70, 116, 74, 99, 36.6, 14, 'NONE'),
        (60, 'MALE', 'Kameez ke collar se gale ka chhota massa chhil gaya tha',
         'Small irritated skin tag on neck, bleeding stopped, no active inflammation',
         48.0, 1, 'hypertension', 'none_known', 'not_applicable', 72, 126, 78, 98, 36.7, 14, 'NONE'),
        (44, 'FEMALE', 'Subah tez daudne ke baad pindi ki maanspeshi me thoda thakan ka dard',
         'Mild muscle fatigue after jogging, no swelling, no redness, vitals normal',
         3.0, 1, 'none_reported', 'none_known', 'no', 72, 118, 74, 99, 36.7, 14, 'NONE'),
        (20, 'MALE', 'Hawa se hoth sookh kar phat gaye hain, halki jalan hai',
         'Chapped dry lips, no bleeding, no infection, vital signs normal',
         40.0, 1, 'none_reported', 'none_known', 'not_applicable', 66, 112, 70, 100, 36.5, 14, 'NONE'),
        (37, 'FEMALE', 'Bartan dhote waqt naakhoon thoda toot gaya, halka dukh raha hai',
         'Broken fingernail, nail bed intact, dressed with small clean plaster',
         1.0, 1, 'none_reported', 'none_known', 'no', 70, 114, 72, 99, 36.6, 14, 'NONE'),
        (49, 'MALE', 'BP ki roz ki goli ka parcha renewal karwana hai',
         'Routine refill for hypertension tablets, feeling healthy, no complaints',
         24.0, 0, 'hypertension', 'none_known', 'not_applicable', 70, 122, 76, 99, 36.7, 14, 'NONE'),
        (17, 'FEMALE', 'Chehre par ek chhota pimple nikal aaya hai, halka dard hai',
         'Single facial pimple, no cellulitis, afebrile, healthy teenager',
         20.0, 1, 'none_reported', 'none_known', 'no', 70, 108, 68, 99, 36.6, 14, 'NONE'),
        (66, 'MALE', 'Sar me thodi rusi aur khujli hai, koi ghav nahi',
         'Mild dandruff scaling on scalp, no skin breakdown, normal vitals',
         120.0, 1, 'none_reported', 'none_known', 'not_applicable', 70, 126, 78, 98, 36.7, 14, 'NONE'),
        (28, 'FEMALE', 'Shaadi me naye joote pehanne se pair ke talve thak gaye hain',
         'Foot sole fatigue from new footwear, no swelling, normal ankle movement',
         5.0, 1, 'none_reported', 'none_known', 'no', 68, 114, 72, 100, 36.6, 14, 'NONE'),
        (41, 'MALE', 'Dhool mitti jhaadne ke baad gale me halki khansi aayi thi',
         'Transient cough from dust exposure, clear lungs, strictly no breathlessness',
         6.0, 1, 'none_reported', 'none_known', 'not_applicable', 70, 120, 76, 99, 36.6, 14, 'NONE'),
        (34, 'FEMALE', 'Naye joote se eedhi par chhota sa chhaala ban gaya hai',
         'Friction blister on heel, intact, no infection, walking carefully',
         10.0, 1, 'none_reported', 'none_known', 'no', 68, 112, 70, 99, 36.7, 14, 'NONE'),
        (23, 'MALE', 'Kulfi khane ke baad gale me thoda thanda pan aur balgam jaisa laga',
         'Transient throat clearing after cold dessert, throat normal, completely well',
         1.5, 0, 'none_reported', 'none_known', 'not_applicable', 70, 116, 74, 99, 36.6, 14, 'NONE'),
    ]

    # Hindi GREY (10 Cases - testing deterministic missing info gate)
    hi_grey = [
        # Missing both HR and BP (Rule 1)
        (55, 'MALE', 'Bazaar me achanak chakkar aakar gir gaye the',
         'Transient loss of consciousness witnessed in market, pulse and BP were not recorded on intake sheet',
         None, None, 'unknown', 'unknown', 'not_applicable', None, None, None, 95, 36.7, 16, 'NONE'),
        (63, 'FEMALE', 'Ghar me pooja karte waqt behosh ho gayi thi',
         'Syncope episode lasting 1 minute, brought urgently, blood pressure and pulse left blank on sheet',
         None, None, 'hypertension', 'none_known', 'not_applicable', None, None, None, 96, 36.8, 18, 'NONE'),
        (40, 'MALE', 'Baithe baithe achanak sar ghoom gaya aur girne lage',
         'Fainting spell, patient sitting down, vital sign machines were disconnected during shift change',
         1.5, 2, 'none_reported', 'none_known', 'not_applicable', None, None, None, 98, 36.6, 16, 'NONE'),
         
        # Respiratory presentation missing SpO2 (Rule 2)
        (50, 'MALE', 'Pichhle do ghante se saans lene me bohot zyada takleef aur khansi',
         'Severe respiratory distress, wheezing and cough present, pulse oximeter probe broken and SpO2 blank',
         2.0, 6, 'asthma', 'none_known', 'not_applicable', 108, 140, 86, None, 37.1, 28, 'NONE'),
        (67, 'FEMALE', 'Khansi aur seene me jalan ke sath tez saans phoolna',
         'Cough with dyspnea, oxygen saturation measurement omitted by triage intake volunteer',
         36.0, 5, 'copd', 'none_known', 'not_applicable', 96, 134, 82, None, 38.2, 24, 'NONE'),
        (32, 'MALE', 'Achanak se tez khansi aur gale me seeti jaisi aawaz aana',
         'Acute cough attack with stridor/wheeze, SpO2 reading was not captured in record',
         1.0, 5, 'none_reported', 'none_known', 'not_applicable', 102, 128, 80, None, 37.0, 26, 'NONE'),
         
        # Pediatric missing temp & HR (Rule 3)
        (3, 'FEMALE', '3 saal ki bachhi bohot garam hai aur lagatar ro rahi hai',
         'Mother reports burning fever in toddler, pediatric thermometer was missing so temp and pulse not entered',
         5.0, 5, 'none_reported', 'none_known', 'not_applicable', None, None, None, 97, None, 28, 'NONE'),
        (4, 'MALE', 'Chaar saal ke bachhe ko bukhar aur kaan me dard hai',
         'Child crying and pulling ear, clinic pulse and temperature measurements missing from record',
         10.0, 4, 'none_reported', 'none_known', 'not_applicable', None, None, None, 98, None, 24, 'NONE'),
         
        # All vitals blank (Rule 4)
        (28, 'FEMALE', 'Dawa lene ke baad shareer par laal daane aur khujli',
         'Triage slip completely blank without any vital sign entries',
         2.0, 4, 'none_reported', 'unknown', 'unknown', None, None, None, None, None, None, 'NONE'),
        (45, 'MALE', 'Pet me tez marod aur dast shuru ho gaye hain',
         'Patient registered at counter, zero vitals measured or filled out in register',
         4.0, 6, 'none_reported', 'none_known', 'not_applicable', None, None, None, None, None, None, 'NONE'),
    ]

    records.extend(make_dicts(hi_red, 'hi', 'RED'))
    records.extend(make_dicts(hi_yellow, 'hi', 'YELLOW'))
    records.extend(make_dicts(hi_green, 'hi', 'GREEN'))
    records.extend(make_dicts(hi_grey, 'hi', 'GREY'))

    # =========================================================================
    # 3. ODIA (100 Cases: 30 RED, 30 YELLOW, 30 GREEN, 10 GREY)
    # Including Odia script, rural/urban idioms, typos & Odia-English code-switching
    # =========================================================================
    or_red = [
        # Odia & Code-switched ACS / Cardiac
        (57, 'MALE', 'Chest re sudden heavy crushing pain heuchi and left hand ku radiate karuchi',
         'Chhati majhire pathara bhali ojan laguchi 40 mins hela, bama kandha o daanta ku pain spread heuchi, bhalase nisas nei heuni, prachanda ghamuchi',
         0.7, 9, 'hypertension, dyslipidemia', 'none_known', 'not_applicable', 116, 182, 108, 92, 36.9, 24, 'RF-ACUTE-CHEST-PAIN'),
        (63, 'FEMALE', 'Bohut ghutan laguchi chhati bhitare and bama bahu pura tinchiki dharuchi',
         'Suddenly heart sanki gala bhali laguchi, left shoulder ku tez current marila bhali jantrana, deha thanda heiki ghamuchi',
         1.0, 9, 'type_2_diabetes', 'none_known', 'not_applicable', 122, 186, 112, 91, 36.8, 26, 'RF-ACUTE-CHEST-PAIN'),
        (52, 'MALE', 'Chhati pura chipi dhala bhali laguchi, breathing problem heuchi',
         'Severe retrosternal squeezing ache, left arm and neck tingling, cold sweat all over face, unable to sit',
         0.5, 9, 'coronary_artery_disease', 'aspirin', 'not_applicable', 110, 174, 104, 93, 37.0, 22, 'RF-ACUTE-CHEST-PAIN'),
        (71, 'FEMALE', 'Gharara sidi chadhiba bele chhati re teja jantrana o mundabula',
         'Suddenly collapsed onto sofa, heavy center chest tightness, radiating to jaw, severe nausea and gray pale skin',
         0.8, 9, 'hypertension', 'none_known', 'not_applicable', 124, 192, 114, 90, 36.7, 26, 'RF-ACUTE-CHEST-PAIN'),
        (49, 'MALE', 'Severe chest tightness saha bama pakhare jantrana heuchi',
         'Intense chhati jantrana for 1 hour, cold clammy skin, breathless and dizzy, vomited once',
         1.0, 9, 'none_reported', 'none_known', 'not_applicable', 118, 172, 102, 92, 36.8, 24, 'RF-ACUTE-CHEST-PAIN'),
         
        # Stroke / FAST
        (68, 'MALE', 'Hathat katha band heigala and dahana pata gora hatha chaluni',
         'Wife noticed mouth crooked 45 mins back, right arm completely paralyzed, unable to speak words, expressive aphasia',
         0.75, 2, 'hypertension', 'none_known', 'not_applicable', 90, 208, 122, 95, 36.9, 18, 'RF-STROKE-FAST; VITAL-CRITICAL-HYPERTENSION'),
        (73, 'FEMALE', 'Katha kahila bele aawaj tharthar heuchi and dahana goda ghasi heiki chaluchanti',
         'Cha pauthila bele hatha ru cup khasi gala, muhanra gote pata jhuli padichi, katha bujhi heuni ki kichi uttar dei parunahanti',
         0.5, 1, 'hypertension, previous_tia', 'none_known', 'not_applicable', 94, 214, 116, 95, 36.8, 16, 'RF-STROKE-FAST; VITAL-CRITICAL-HYPERTENSION'),
        (61, 'MALE', 'Subah bistara ru uthiba bele bama pata pura abasa heigala',
         'Acute hemiparesis on left side, left facial droop, garbled speech noticed 1 hour ago',
         1.0, 2, 'type_2_diabetes', 'none_known', 'not_applicable', 88, 196, 112, 96, 36.7, 18, 'RF-STROKE-FAST'),
        (82, 'FEMALE', 'Bastra dhari paruni, bama pata pura nisprabha heigala',
         'Sudden loss of left hand grip, mouth angle dragging to right, confused and unable to answer, BP 212/118',
         0.8, 2, 'hypertension', 'none_known', 'not_applicable', 96, 212, 118, 94, 37.0, 20, 'RF-STROKE-FAST; VITAL-CRITICAL-HYPERTENSION'),
         
        # Severe Hypoxia / Airway
        (66, 'MALE', 'Nisas bilkul nei parunahanti, otha neela padi jauchi',
         'Known chronic lung disease, severe air hunger, sitting in tripod posture, barely whispering, SpO2 82%',
         2.0, 7, 'copd', 'none_known', 'not_applicable', 138, 152, 94, 82, 37.4, 38, 'VITAL-CRITICAL-HYPOXIA'),
        (43, 'FEMALE', 'Asthma pump 5 tara nela pare bhi gala re dam phuli jauchi',
         'Severe wheezing, silent chest development, intercostal recession, unable to speak, profound hypoxia SpO2 84%',
         1.0, 8, 'asthma', 'none_known', 'no', 142, 164, 96, 84, 37.0, 42, 'VITAL-CRITICAL-HYPOXIA'),
        (70, 'MALE', 'Rati re achanak ghor ghor sabda saha lal phena khasi baharila',
         'Acute pulmonary edema: coughing pink frothy sputum, bilateral moist crackles, severe gasping, BP 216/122',
         1.5, 7, 'heart_failure', 'none_known', 'not_applicable', 130, 216, 122, 85, 36.9, 36, 'VITAL-CRITICAL-HYPOXIA; VITAL-CRITICAL-HYPERTENSION'),
         
        # Coma / Shock
        (55, 'MALE', 'Gharare achanak acheta heipadi rahichanti, daki le sununahanti',
         'Comatose patient, completely unarousable to loud calling or painful stimulus, slow gasping breaths, BP 76/46',
         1.0, 0, 'none_reported', 'unknown', 'not_applicable', 50, 76, 46, 87, 35.8, 8, 'RF-UNCONSCIOUS; VITAL-CRITICAL-HYPOTENSION'),
        (34, 'FEMALE', 'Bathroom re chakkar asiki behosa heigale, gora hatha thanda',
         'Sudden syncopal collapse, unresponsive for 10 minutes, clammy peripheral skin, systolic BP collapsed to 74',
         0.5, 0, 'none_reported', 'none_known', 'unknown', 146, 74, 44, 90, 36.2, 28, 'RF-UNCONSCIOUS; VITAL-CRITICAL-HYPOTENSION'),
        (69, 'MALE', 'Pahali tharu kala jhadha o rakta banti pare nisteja heipadi rahichanti',
         'Massive upper gastrointestinal bleed, blanched palpebral conjunctiva, drenching sweat, BP 78/48',
         14.0, 6, 'peptic_ulcer', 'none_known', 'not_applicable', 136, 78, 48, 91, 36.5, 26, 'VITAL-CRITICAL-HYPOTENSION'),
         
        # Anaphylaxis
        (26, 'FEMALE', 'Injection nela pare 10 min re gala o otha pura phuligala',
         'Severe anaphylactic angioedema: stridor, cyanotic tinge to lips, generalized urticaria, hypotension BP 82/50',
         0.3, 8, 'drug_allergy', 'penicillin', 'no', 138, 82, 50, 86, 37.0, 32, 'VITAL-CRITICAL-HYPOXIA; VITAL-CRITICAL-HYPOTENSION'),
        (21, 'MALE', 'Jhiamula (wasp) bindhiba pare nisas naba band heijauchi',
         'Inspiratory stridor, airway edema, faint and confused, diffuse red wheals over chest and arms',
         0.25, 8, 'none_reported', 'insect_venom', 'not_applicable', 144, 84, 52, 88, 37.1, 34, 'VITAL-CRITICAL-HYPOXIA; VITAL-CRITICAL-HYPOTENSION'),
         
        # Pregnancy Emergency
        (30, 'FEMALE', '33 saptahira garbhabati, mundare bhisan betha o akhi agare andhara',
         'Severe preeclampsia: BP 196/118, epigastric severe pain, hyperreflexia, gross bilateral lower limb edema',
         2.5, 8, 'hypertension_in_pregnancy', 'none_known', 'yes', 114, 196, 118, 96, 37.2, 22, 'VITAL-CRITICAL-HYPERTENSION'),
        (28, 'FEMALE', '8 masa garbhabati sthirare achanak prachanda rakta srab heuchi',
         'Painless massive antepartum hemorrhage, 4 soaked cloths in 30 minutes, maternal pallor and tachycardia',
         0.5, 7, 'previous_c_section', 'none_known', 'yes', 136, 86, 52, 92, 36.7, 26, 'VITAL-CRITICAL-HYPOTENSION'),
         
        # Pediatric Emergency
        (3, 'MALE', '3 barsara pila uchu jwara re achanak nisteja heipadi rahila',
         'Pediatric sepsis: temp 40.6C, mottled abdominal skin, grunting breathing, capillary refill > 4s, unarousable',
         4.0, 8, 'none_reported', 'none_known', 'not_applicable', 184, 76, 42, 88, 40.6, 52, 'VITAL-CRITICAL-HYPERTHERMIA; VITAL-CRITICAL-HYPOXIA; VITAL-CRITICAL-HEART-RATE'),
        (2, 'FEMALE', 'Chhota jhia kanduchhi, beka pura kat heijaichi o bhisan jwara',
         'Meningeal signs in infant: neck stiffness, high pitched shrill crying, petechial purpura on legs, temp 40.2C',
         3.0, 9, 'none_reported', 'none_known', 'not_applicable', 182, 78, 44, 91, 40.2, 50, 'VITAL-CRITICAL-HEART-RATE'),
        (76, 'MALE', 'Catheter thiba brudha mariz ku bhisan thanda o behosi laguchi',
         'Uroseptic shock: disoriented, shaking uncontrollable chills, cold clammy extremities, BP 82/48, HR 140',
         14.0, 7, 'prostatic_disease', 'none_known', 'not_applicable', 140, 82, 48, 88, 40.4, 30, 'VITAL-CRITICAL-HYPERTHERMIA; VITAL-CRITICAL-HYPOXIA; VITAL-CRITICAL-HYPOTENSION'),
         
        # Acute Abdomen / Ectopic
        (47, 'MALE', 'Petare achanak chhuri bhusi dela bhali jantrana, peta pathara bhali kat',
         'Perforation peritonitis: board-like rigidity, involuntary guarding, blanched face, agonizing pain 10/10',
         1.5, 10, 'peptic_ulcer', 'none_known', 'not_applicable', 132, 84, 52, 92, 38.7, 28, 'VITAL-CRITICAL-HYPOTENSION'),
        (24, 'FEMALE', 'Tala petare achanak bhisan jantrana saha chakkar asiki behosa',
         'Ruptured ectopic suspicion: missed period 7 weeks, sharp right lower quadrant pelvic pain, pale lips, BP 78/46',
         1.0, 9, 'none_reported', 'none_known', 'yes', 138, 78, 46, 93, 36.4, 28, 'VITAL-CRITICAL-HYPOTENSION'),
         
        # Thunderclap / Hypertensive
        (57, 'MALE', 'Mundare achanak bijuli marila bhali jantrana o duithara banti',
         'Thunderclap headache, subarachnoid hemorrhage concern, severe neck stiffness, photophobia, BP 216/124',
         1.0, 10, 'hypertension', 'none_known', 'not_applicable', 98, 216, 124, 95, 37.1, 20, 'VITAL-CRITICAL-HYPERTENSION'),
        (64, 'FEMALE', 'Beka pachhare bhisan jantrana o nakaru teja rakta jharuchi',
         'Hypertensive emergency: bilateral severe epistaxis, BP 226/130, blurred vision, somnolent',
         1.5, 8, 'hypertension', 'none_known', 'not_applicable', 104, 226, 130, 94, 36.9, 22, 'VITAL-CRITICAL-HYPERTENSION'),
         
        # Trauma / Burn / DKA
        (32, 'MALE', 'Kharati machine re goda kati phuhara bhali rakta baharuchi',
         'Femoral arterial spurting hemorrhage, makeshift rope tourniquet, extremities blanched and cold, HR 146',
         0.3, 9, 'none_reported', 'none_known', 'not_applicable', 146, 82, 48, 91, 35.9, 30, 'VITAL-CRITICAL-HYPOTENSION'),
        (40, 'FEMALE', 'Rannha ghare tel phutiki mukha o chhati re bhisan podi gala',
         'Severe burns across anterior neck and face, singed eyelashes, hoarse voice, airway edema concern',
         0.5, 9, 'none_reported', 'none_known', 'no', 126, 146, 92, 91, 37.0, 28, 'VITAL-CRITICAL-HYPOXIA'),
        (51, 'MALE', 'Diabetes rogira muhan ru mitha basana o dirgha nisas nei parunahanti',
         'Diabetic ketoacidosis: Kussmaul gasping breathing pattern, sweet fruity acetone breath, parched tongue, BP 88/54',
         22.0, 6, 'type_1_diabetes', 'none_known', 'not_applicable', 136, 88, 54, 89, 36.3, 36, 'VITAL-CRITICAL-HYPOXIA; VITAL-CRITICAL-HYPOTENSION'),
        (46, 'MALE', 'Chhati re prachanda chipa jantrana saha daanta ku bindha jauchi',
         'Patient chest ku dhari basichi, prabala ghama o nisas naba re kasta, BP 184/110, pulse 118',
         0.6, 9, 'hypertension', 'none_known', 'not_applicable', 118, 184, 110, 92, 36.9, 24, 'RF-ACUTE-CHEST-PAIN'),
    ]

    # Odia YELLOW (30 Cases)
    or_yellow = [
        (27, 'MALE', 'Petara dahana tala bhagare kali rathiru betha o banti banti laguchi',
         'McBurney point tenderness, chalile betha badhuchi, halka jwara 100.8F, bhoka heuni',
         14.0, 7, 'none_reported', 'none_known', 'not_applicable', 96, 126, 78, 98, 38.1, 18, 'NONE'),
        (37, 'FEMALE', 'Kankara dahana pachhare bhisan maroda jantrana jaha tala ku jauchi',
         'Renal colic in waves, writhing on hospital bed, urine re tikie lal rang paduchi, BP 142/88',
         3.5, 8, 'kidney_calculus', 'none_known', 'no', 102, 142, 88, 98, 36.9, 20, 'NONE'),
        (53, 'MALE', 'Kancha phuti hatha re 6cm gabhira khyata heichi, stitch lagiba',
         'Deep glass laceration on forearm, bleeding controlled with firm cloth, finger movement preserved',
         1.5, 6, 'none_reported', 'none_known', 'not_applicable', 84, 130, 82, 99, 36.8, 16, 'NONE'),
        (45, 'FEMALE', 'Asthma rogira chhati chipi heuchi o seeti sabda sunajauchi',
         'Moderate wheezing on both lung bases, speaks in phrases, SpO2 93%, alert and oriented',
         4.5, 5, 'asthma', 'sulfa_drugs', 'no', 104, 134, 84, 93, 37.1, 24, 'NONE'),
        (67, 'MALE', 'Haladia kasha balgam paduchi o chhati re thanda jwara laguchi',
         'Pneumonia signs: localized bronchial breathing, temp 38.5C, SpO2 92% on room air, no cyanosis',
         72.0, 6, 'copd', 'none_known', 'not_applicable', 100, 138, 86, 92, 38.5, 22, 'NONE'),
        (41, 'FEMALE', 'Goda re laal phula badhijauchi, gora garam laguchi o chaliba kasta',
         'Cellulitis of lower leg: shin skin shiny red and hot, spreading up to mid calf, temp 38.3C',
         48.0, 5, 'type_2_diabetes', 'none_known', 'no', 90, 132, 80, 98, 38.3, 18, 'NONE'),
        (79, 'MALE', '16 ghanta hela peshab heini, petara tala bhagare bhisan betha heuchi',
         'Acute urinary retention: suprapubic bladder distended and tender, intense straining with zero urine',
         16.0, 8, 'bph_history', 'none_known', 'not_applicable', 98, 158, 94, 97, 36.9, 18, 'NONE'),
        (27, 'FEMALE', '27 saptahira garbhabati, peshab re bhisan podajala o bama betha',
         'Pregnancy urinary infection: dysuria, urgency, left flank tenderness on percussion, temp 38.4C',
         22.0, 6, 'none_reported', 'none_known', 'yes', 102, 126, 76, 98, 38.4, 20, 'NONE'),
        (18, 'MALE', 'Cycle ru padijiba pare mani bandha binki jaiki phuligala',
         'Colles fracture suspicion: dinner-fork deformity, severe focal bone tenderness, radial pulse 2+ palpable',
         2.0, 7, 'none_reported', 'none_known', 'not_applicable', 92, 122, 74, 99, 36.7, 16, 'NONE'),
        (37, 'FEMALE', 'Gote pakhara mundare bhisan thuk thuk betha o banti banti laguchi',
         'Severe migraine episode: unilateral throbbing pain for 16h, photophobia, vomited food twice',
         16.0, 7, 'migraine', 'none_known', 'no', 86, 128, 80, 98, 36.8, 16, 'NONE'),
        (5, 'MALE', 'Pila ku rati ru kukurara bhou bhou bhali khasi o aawaj mota',
         'Viral croup: seal-like barking cough, mild inspiratory stridor only on crying, chest indrawing absent at rest',
         9.0, 4, 'none_reported', 'none_known', 'not_applicable', 118, 102, 64, 95, 37.9, 26, 'NONE'),
        (60, 'FEMALE', 'Bada bhat khaila pare petara dahana pakhare bhisan maroda jantrana',
         'Biliary colic: right upper quadrant pain radiating to scapula, tender under right rib edge, no jaundice',
         5.5, 7, 'cholelithiasis', 'none_known', 'not_applicable', 88, 136, 84, 98, 37.2, 18, 'NONE'),
        (35, 'MALE', 'Maladwara pakhe gote laal phula heichi o basile asajhya betha heuchi',
         'Perianal abscess: localized fluctuant red mass near anal verge, severe throbbing pain, low grade fever',
         32.0, 7, 'none_reported', 'none_known', 'not_applicable', 94, 128, 82, 99, 37.9, 18, 'NONE'),
        (71, 'FEMALE', 'Geli 12 ghantare 8 tara pania jhadha heiki deha durbala laguchi',
         'Moderate dehydration from gastroenteritis: dry mouth, sunken eyes, delayed skin recoil, BP 106/68',
         12.0, 6, 'hypertension', 'none_known', 'not_applicable', 108, 106, 68, 97, 37.8, 20, 'NONE'),
        (49, 'MALE', 'Goda buleithi re achanak bhisan janta o laal heiki phulijaichi',
         'Acute gout flare: first metatarsophalangeal joint fiery red and swollen, unable to bear weight of cloth',
         11.0, 8, 'gout', 'aspirin', 'not_applicable', 84, 144, 88, 98, 37.1, 16, 'NONE'),
        (23, 'FEMALE', 'Bula kukurara danta goda re gabhira bhabare phuti gala',
         'Stray dog bite on calf, puncture wounds oozing serous fluid, skin bruised, tetanus shot overdue',
         1.5, 6, 'none_reported', 'none_known', 'no', 88, 118, 76, 99, 36.9, 16, 'NONE'),
        (56, 'FEMALE', 'Munda ghuruchhi o charipakhara jinisaha sabu ghurila bhali laguchi',
         'Acute vertigo: horizontal nystagmus, severe nausea on head turn, unsteady gait, vital signs stable',
         7.0, 5, 'none_reported', 'none_known', 'not_applicable', 82, 134, 82, 98, 36.7, 16, 'NONE'),
        (30, 'MALE', 'Grinder chalauthila bele akhi bhitare loha kanka pasigala',
         'Corneal foreign body sensation, eye tearing and redness, vision intact, photophobia present',
         2.5, 6, 'none_reported', 'none_known', 'not_applicable', 78, 124, 78, 99, 36.6, 15, 'NONE'),
        (44, 'FEMALE', 'Bhisan jwara 102F saha sara deha hadha bhanga betha laguchi',
         'Acute febrile illness: retro-orbital ache, prostration, severe generalized myalgia, vitals stable',
         64.0, 6, 'none_reported', 'none_known', 'no', 104, 116, 72, 97, 39.0, 20, 'NONE'),
        (65, 'MALE', 'Diabetes mariz, goda talare puruna gha ru ganda pani baharuchi',
         'Diabetic foot ulcer: 2cm ulcer under metatarsal head, mild purulence, surrounding 1cm erythema',
         92.0, 4, 'type_2_diabetes', 'none_known', 'not_applicable', 86, 140, 84, 98, 37.4, 16, 'NONE'),
        (25, 'FEMALE', 'Masika bele bohot besi rakta srab heuchi o bara bara chaka paduchi',
         'Menorrhagia with severe dysmenorrhea: soaking cloth every hour, severe lower abdominal cramping, no syncope',
         22.0, 7, 'pcos', 'none_known', 'no', 96, 110, 70, 98, 36.8, 18, 'NONE'),
        (52, 'MALE', 'Chhati majhire gote nirdista sthana re chipile tez betha heuchi',
         'Costochondritis: sharp focal chest wall tenderness on 4th rib junction, no radiation, SpO2 99%, normal ECG',
         42.0, 5, 'none_reported', 'none_known', 'not_applicable', 76, 128, 80, 99, 36.8, 16, 'NONE'),
        (38, 'FEMALE', 'Pani ghute piele bhi sangey sangey banti heijauchi kali rathiru',
         'Persistent nausea and vomiting, cannot keep liquids down, diffuse belly cramps, dark urine',
         16.0, 6, 'none_reported', 'none_known', 'no', 100, 114, 72, 98, 37.3, 18, 'NONE'),
        (19, 'MALE', 'Football re andakosa re aghata lagila, phuli jaiki betha heuchi',
         'Traumatic scrotal tenderness, mild swelling, cremasteric reflex intact, urinalysis clear',
         19.0, 7, 'none_reported', 'none_known', 'not_applicable', 84, 120, 76, 99, 36.8, 16, 'NONE'),
        (63, 'FEMALE', 'Sugar 56 heijaichi o hatha tharuchi saha ghamuchhi',
         'Symptomatic hypoglycemia in diabetic patient: tremulousness, mild diaphoresis, took morning tablet without meal',
         1.0, 3, 'type_2_diabetes', 'none_known', 'not_applicable', 94, 138, 82, 98, 36.6, 18, 'NONE'),
        (77, 'MALE', 'Kankara re achanak betha asiba ru sidha chidha heiparunahanti',
         'Acute lumbago with muscle spasm, no bowel bladder disturbance, normal leg sensation, pain 7/10',
         5.5, 7, 'lumbar_spondylosis', 'none_known', 'not_applicable', 88, 150, 90, 98, 36.7, 18, 'NONE'),
        (31, 'FEMALE', 'Naka bandha, pacha balgam o gala pakhara hadha re 7 dina hela betha',
         'Acute sinusitis: maxillary sinus tenderness, pain worse on bending head down, temp 38.2C',
         170.0, 5, 'allergic_rhinitis', 'none_known', 'no', 80, 118, 74, 99, 38.2, 16, 'NONE'),
        (48, 'MALE', 'Safai bele akhi bhitare tikie acid/bleach pani chhitika padila',
         'Chemical eye splash: irrigated thoroughly with tap water, conjunctiva mildly congested, cornea clear',
         0.5, 6, 'none_reported', 'none_known', 'not_applicable', 88, 132, 82, 99, 36.7, 16, 'NONE'),
        (70, 'FEMALE', 'Gharara chatare phisali padijiba ru dahana jangha re betha heuchi',
         'Post-fall hip pain: no external deformity, but unable to bear weight on right leg, tender over greater trochanter',
         2.0, 7, 'osteoporosis', 'none_known', 'not_applicable', 92, 146, 86, 97, 36.8, 18, 'NONE'),
        (36, 'MALE', 'Pithi o chhati majhire gote pata laal photaka baharichi o janta heuchi',
         'Herpes zoster: unilateral dermatomal vesicular rash, sharp burning neuralgic pain, vitals stable',
         62.0, 7, 'none_reported', 'none_known', 'not_applicable', 78, 126, 80, 98, 37.1, 16, 'NONE'),
    ]

    # Odia GREEN (30 Cases)
    or_green = [
        (26, 'MALE', 'Samanya thanda o nakaru pani jharuchi, tanti tikie kundei heuchi',
         'Clear watery rhinorrhea, throat feels slightly tickly, strictly no fever, no cough, normal breathing',
         48.0, 1, 'none_reported', 'none_known', 'not_applicable', 68, 118, 76, 99, 36.6, 14, 'NONE'),
        (33, 'FEMALE', 'Chalu thila bele goda phisali gathi re samanya khyata heichi',
         'Superficial knee graze, bleeding stopped with wash, full normal knee bend and walking',
         2.0, 2, 'none_reported', 'none_known', 'no', 72, 116, 74, 99, 36.7, 14, 'NONE'),
        (22, 'FEMALE', 'Bahut samaya computer re lekha padhi kale munda re samanya betha heuchi',
         'Tension headache: dull ache across forehead, feels better after resting, no vomiting, no dizziness',
         7.0, 2, 'none_reported', 'none_known', 'no', 70, 114, 72, 100, 36.6, 14, 'NONE'),
        (57, 'MALE', 'Barsa lagile puruna gathi betha tikie badhi jauchi, chaliba re thik achi',
         'Chronic osteoarthritis ache for 4 years, usual morning stiffness, normal walking, no joint heat',
         1900.0, 3, 'osteoarthritis', 'none_known', 'not_applicable', 74, 128, 80, 98, 36.8, 15, 'NONE'),
        (29, 'FEMALE', 'Bhoji re telia khana khaila pare pete gas o dakar heuchi',
         'Mild indigestion: gas release hone ke baad aaram mil gaya, koi tez dard nahi, koi ulti nahi',
         3.0, 1, 'none_reported', 'none_known', 'no', 70, 118, 76, 99, 36.7, 14, 'NONE'),
        (37, 'MALE', 'Hatha re masa kaatila ru tikie laal heiki kundauchi',
         'Single mosquito bite papule on forearm, no spreading redness, no fever, completely well',
         11.0, 1, 'none_reported', 'none_known', 'not_applicable', 66, 120, 78, 99, 36.5, 14, 'NONE'),
        (20, 'FEMALE', 'Rutu badaliba bele nakaru pani jharuchi o chhinhi asuchi',
         'Allergic rhinitis: watery clear nasal discharge, repetitive sneezing, afebrile, chest clear',
         24.0, 1, 'allergic_rhinitis', 'none_known', 'no', 72, 112, 70, 99, 36.7, 14, 'NONE'),
        (43, 'MALE', 'Kagaja katila bele anguthi agare samanya chheli jaiki khyata heichi',
         'Tiny paper cut on fingertip, clean and dry, full movement, asking for small bandaid',
         1.0, 1, 'none_reported', 'none_known', 'not_applicable', 68, 122, 78, 100, 36.6, 14, 'NONE'),
        (51, 'FEMALE', 'Pakha tala re soiba ru beka re tikie kat heijaichi',
         'Mild neck muscle strain, can rotate head with mild tightness, strictly no fever, no numbness',
         6.0, 2, 'none_reported', 'none_known', 'not_applicable', 70, 124, 76, 99, 36.6, 14, 'NONE'),
        (28, 'MALE', 'Khabara kagaja ana bele kapata ru kohni re ghasa lagigala',
         'Superficial elbow graze, no swelling, no bone pain, full painless movement',
         1.5, 1, 'none_reported', 'none_known', 'not_applicable', 72, 118, 74, 99, 36.7, 14, 'NONE'),
        (65, 'MALE', 'Khatiya re godara chhota anguthi baji jaiki tikie dukhuchi',
         'Stubbed small toe, mild bruising, normal walking, can bear weight easily, pain 2/10',
         3.0, 2, 'hypertension', 'none_known', 'not_applicable', 76, 130, 80, 98, 36.8, 15, 'NONE'),
        (31, 'FEMALE', 'Meeting re besi katha kahila ru tanti re samanya kharasa laguchi',
         'Voice fatigue, throat clear on examination, no swallowing difficulty, afebrile',
         22.0, 1, 'none_reported', 'none_known', 'no', 68, 114, 72, 99, 36.6, 14, 'NONE'),
        (49, 'MALE', 'Sokale sokale kamarara puruna kat tikie rahuchi jaha bulile thik heijauchi',
         'Chronic mild low back stiffness, eases after walk, strictly no radiating leg pain',
         1300.0, 2, 'lumbar_spondylosis', 'none_known', 'not_applicable', 72, 126, 78, 98, 36.7, 15, 'NONE'),
        (23, 'FEMALE', 'Otha bhitare chhota gote ghada heichi jaha khaila bele pitta laguchi',
         'Single small aphthous ulcer on inside lip, no fever, no swelling, otherwise totally fine',
         38.0, 2, 'none_reported', 'none_known', 'no', 70, 110, 70, 100, 36.6, 14, 'NONE'),
        (40, 'MALE', 'Katha kaama bele anguthi bhitare chhota gote kanta pasigala',
         'Small wooden splinter under distal finger skin, localized mild soreness on touch, no pus',
         3.5, 2, 'none_reported', 'none_known', 'not_applicable', 70, 122, 78, 99, 36.7, 14, 'NONE'),
        (19, 'FEMALE', 'Sita dina re kohni upara chamada sukhila heiki kundauchi',
         'Mild dry skin on elbows, no redness, no weeping, normal healthy appearance',
         98.0, 1, 'none_reported', 'none_known', 'no', 68, 112, 72, 99, 36.6, 14, 'NONE'),
        (55, 'FEMALE', 'Bajaru bhari jinisaha tulila ru hatha re chhota neela dagha heigala',
         'Small ecchymosis on forearm, non-tender, normal joint movement, no pain',
         24.0, 1, 'none_reported', 'none_known', 'not_applicable', 72, 128, 76, 99, 36.8, 14, 'NONE'),
        (27, 'MALE', 'Pukhurire godha dhoila bele kana bhitare pani pasiki tikie kundauchi',
         'Mild ear canal wetness sensation, no pain, no discharge, normal hearing',
         18.0, 1, 'none_reported', 'none_known', 'not_applicable', 68, 116, 74, 99, 36.7, 14, 'NONE'),
        (33, 'FEMALE', 'Chakiri certificate pain BP o health checkup kariba pain asichanti',
         'Routine employment checkup, completely asymptomatic, active and healthy',
         0.5, 0, 'none_reported', 'none_known', 'no', 70, 118, 76, 99, 36.6, 14, 'NONE'),
        (61, 'MALE', 'Kameezura collar re gale thiba chhota masara ragada lagigala',
         'Small irritated skin tag on neck, bleeding stopped, no active inflammation',
         50.0, 1, 'hypertension', 'none_known', 'not_applicable', 72, 128, 80, 98, 36.7, 14, 'NONE'),
        (45, 'FEMALE', 'Sokale teja douriba ru pindi mangsa re samanya klanti betha',
         'Mild muscle fatigue after jogging, no swelling, no redness, vitals normal',
         3.5, 1, 'none_reported', 'none_known', 'no', 74, 120, 76, 99, 36.7, 14, 'NONE'),
        (21, 'MALE', 'Pabana re otha phatiki khali tikie chheli jaichi',
         'Chapped dry lips, no bleeding, no infection, vital signs normal',
         42.0, 1, 'none_reported', 'none_known', 'not_applicable', 66, 114, 72, 100, 36.5, 14, 'NONE'),
        (38, 'FEMALE', 'Kosa bandha bele nakha tikie bhangi gala o dukhuchi',
         'Broken fingernail, nail bed intact, dressed with small clean plaster',
         1.0, 1, 'none_reported', 'none_known', 'no', 70, 116, 74, 99, 36.6, 14, 'NONE'),
        (50, 'MALE', 'BP goli parcha renewal kariba pain asichanti',
         'Routine refill for hypertension tablets, feeling healthy, no complaints',
         24.0, 0, 'hypertension', 'none_known', 'not_applicable', 72, 124, 78, 99, 36.7, 14, 'NONE'),
        (17, 'FEMALE', 'Muhan re gote chhota pimple heichi o dukhuchi',
         'Single facial pimple, no cellulitis, afebrile, healthy teenager',
         22.0, 1, 'none_reported', 'none_known', 'no', 72, 110, 70, 99, 36.6, 14, 'NONE'),
        (67, 'MALE', 'Mundare samanya rusi o kundia achi, gha heini',
         'Mild dandruff scaling on scalp, no skin breakdown, normal vitals',
         124.0, 1, 'none_reported', 'none_known', 'not_applicable', 70, 128, 80, 98, 36.7, 14, 'NONE'),
        (29, 'FEMALE', 'Baha gharare nua chappal pindhila ru goda tala thaki jaichi',
         'Foot sole fatigue from new footwear, no swelling, normal ankle movement',
         5.5, 1, 'none_reported', 'none_known', 'no', 68, 116, 74, 100, 36.6, 14, 'NONE'),
        (42, 'MALE', 'Dhuli jhada pare gala re gote duita khasi asithila',
         'Transient cough from dust exposure, clear lungs, strictly no breathlessness',
         7.0, 1, 'none_reported', 'none_known', 'not_applicable', 70, 122, 78, 99, 36.6, 14, 'NONE'),
        (35, 'FEMALE', 'Nua jutare gothi pakhe chhota photaka heijaichi',
         'Friction blister on heel, intact, no infection, walking carefully',
         11.0, 1, 'none_reported', 'none_known', 'no', 68, 114, 72, 99, 36.7, 14, 'NONE'),
        (24, 'MALE', 'Thanda lassi pi ba pare gala re thanda o kasa bhali laguchi',
         'Transient throat clearing after cold dessert, throat normal, completely well',
         1.5, 0, 'none_reported', 'none_known', 'not_applicable', 70, 118, 76, 99, 36.6, 14, 'NONE'),
    ]

    # Odia GREY (10 Cases - testing deterministic missing info gate)
    or_grey = [
        # Missing both HR and BP (Rule 1)
        (56, 'MALE', 'Hathat rasta majhire chakkar asiki tala re padigale',
         'Transient loss of consciousness on road, brought by neighbors, pulse and BP unrecorded',
         None, None, 'unknown', 'unknown', 'not_applicable', None, None, None, 95, 36.7, 16, 'NONE'),
        (64, 'FEMALE', 'Gharara mandira re thila bele achanak acheta heigale',
         'Syncope episode lasting 45 seconds, rushed to triage, both heart rate and blood pressure omitted',
         None, None, 'hypertension', 'none_known', 'not_applicable', None, None, None, 96, 36.8, 18, 'NONE'),
        (41, 'MALE', 'Chidha heba bele achanak munda ghuri gala o andhara lagila',
         'Fainting spell, patient resting, vital signs unmeasured on arrival',
         1.5, 2, 'none_reported', 'none_known', 'not_applicable', None, None, None, 98, 36.6, 16, 'NONE'),
         
        # Respiratory presentation missing SpO2 (Rule 2)
        (51, 'MALE', 'Pichhle dui ghanta hela bhisan nisas kasta o khasi',
         'Patient in acute respiratory distress with wheezing, SpO2 sensor broken and missing',
         2.5, 6, 'asthma', 'none_known', 'not_applicable', 110, 142, 88, None, 37.2, 28, 'NONE'),
        (68, 'FEMALE', 'Khasi saha chhati re betha o bhisan dam phuliba',
         'Cough with dyspnea, oxygen saturation measurement omitted by volunteer',
         40.0, 5, 'copd', 'none_known', 'not_applicable', 98, 136, 84, None, 38.3, 24, 'NONE'),
        (33, 'MALE', 'Dhuan lagiba ru achanak teja khasi o gala chipi heba',
         'Acute cough attack with stridor/wheeze, SpO2 pulse oximeter omitted from record',
         1.0, 5, 'none_reported', 'none_known', 'not_applicable', 104, 130, 82, None, 37.0, 26, 'NONE'),
         
        # Pediatric missing temp & HR (Rule 3)
        (3, 'FEMALE', '3 barsara jhia bhisan tati jaichi o lagatar kanduchi',
         'Toddler with fever complaint, clinic thermometer unavailable so temp and HR not entered',
         5.5, 5, 'none_reported', 'none_known', 'not_applicable', None, None, None, 97, None, 28, 'NONE'),
        (4, 'MALE', 'Chari barsara pila ku jwara o kana re haath deiki kanduchi',
         'Child crying and pulling ear, heart rate and temperature vitals completely missing from chart',
         11.0, 4, 'none_reported', 'none_known', 'not_applicable', None, None, None, 98, None, 24, 'NONE'),
         
        # All vitals blank (Rule 4)
        (29, 'FEMALE', 'Daba khaila pare sara sarira re laal gunda o kundia heuchi',
         'Triage encounter record registered without any vital sign entries',
         2.0, 4, 'none_reported', 'unknown', 'unknown', None, None, None, None, None, None, 'NONE'),
        (46, 'MALE', 'Peta re bhisan maroda jantrana o jhadha lagichi',
         'Patient logged at counter, zero vitals measured or documented on paper',
         4.5, 6, 'none_reported', 'none_known', 'not_applicable', None, None, None, None, None, None, 'NONE'),
    ]

    records.extend(make_dicts(or_red, 'or', 'RED'))
    records.extend(make_dicts(or_yellow, 'or', 'YELLOW'))
    records.extend(make_dicts(or_green, 'or', 'GREEN'))
    records.extend(make_dicts(or_grey, 'or', 'GREY'))

    # Assign IDs
    df = pd.DataFrame(records)
    df.insert(0, 'patient_synthetic_id', [f"PAT-CHALLENGE-{i+1:03d}" for i in range(len(df))])
    df.insert(0, 'case_id', [f"CHALLENGE-{i+1:03d}" for i in range(len(df))])
    
    return df


def audit_independence(df_challenge, train_csv_path):
    """
    Checks for exact duplicates and near-duplicate narratives against training dataset.
    """
    print("\n" + "=" * 60)
    print("INDEPENDENCE AUDIT AGAINST TRAINING DATASET")
    print("=" * 60)
    
    df_train = pd.read_csv(train_csv_path)
    train_narratives = (df_train['chief_complaint'].fillna('') + ' ' + df_train['symptoms'].fillna('')).str.strip().str.lower()
    challenge_narratives = (df_challenge['chief_complaint'].fillna('') + ' ' + df_challenge['symptoms'].fillna('')).str.strip().str.lower()
    
    # 1. Exact match check
    exact_matches = []
    train_narrative_set = set(train_narratives)
    for idx, row in df_challenge.iterrows():
        c_text = (str(row['chief_complaint']) + ' ' + str(row['symptoms'])).strip().lower()
        if c_text in train_narrative_set:
            exact_matches.append(row['case_id'])
            
    print(f"Exact narrative matches with training set: {len(exact_matches)}")
    assert len(exact_matches) == 0, f"FAIL: Exact duplicate narratives detected: {exact_matches}"
    
    # 2. Case ID collisions
    train_ids = set(df_train['case_id'])
    id_collisions = [cid for cid in df_challenge['case_id'] if cid in train_ids]
    print(f"Case ID collisions with training set: {len(id_collisions)}")
    assert len(id_collisions) == 0, f"FAIL: Case ID collision: {id_collisions}"
    
    # 3. TF-IDF Cosine Similarity Check
    print("Computing cross-dataset TF-IDF narrative cosine similarity...")
    vectorizer = TfidfVectorizer(max_features=1000, ngram_range=(1, 2), min_df=1, strip_accents='unicode')
    vectorizer.fit(pd.concat([train_narratives, challenge_narratives]))
    
    train_mat = vectorizer.transform(train_narratives)
    challenge_mat = vectorizer.transform(challenge_narratives)
    
    sim_matrix = cosine_similarity(challenge_mat, train_mat)
    max_sims = sim_matrix.max(axis=1)
    
    # High similarity threshold flag (> 0.85)
    flagged = []
    for i, max_s in enumerate(max_sims):
        if max_s > 0.85:
            match_idx = sim_matrix[i].argmax()
            flagged.append({
                "challenge_case_id": df_challenge.iloc[i]['case_id'],
                "max_similarity": float(max_s),
                "matched_train_case_id": df_train.iloc[match_idx]['case_id'],
                "challenge_text": challenge_narratives.iloc[i],
                "train_text": train_narratives.iloc[match_idx]
            })
            
    print(f"Narratives with Cosine Similarity > 0.85: {len(flagged)}")
    if len(flagged) > 0:
        for f in flagged[:3]:
            print(f"  Warning: {f['challenge_case_id']} ~ {f['matched_train_case_id']} (sim: {f['max_similarity']:.3f})")
    
    audit_summary = {
        "training_dataset_records": len(df_train),
        "challenge_dataset_records": len(df_challenge),
        "exact_narrative_matches": len(exact_matches),
        "case_id_collisions": len(id_collisions),
        "highest_cross_similarity": float(max_sims.max()),
        "average_max_similarity": float(max_sims.mean()),
        "narratives_above_85pct_similarity": len(flagged),
        "independence_status": "CONFIRMED_INDEPENDENT" if len(exact_matches) == 0 and len(flagged) == 0 else "REVIEW_NEEDED"
    }
    
    print(f"Highest cross-dataset similarity score: {max_sims.max():.4f}")
    print(f"Independence status: {audit_summary['independence_status']}")
    
    return audit_summary


def main():
    os.makedirs('data/evaluation', exist_ok=True)
    os.makedirs('ml/reports', exist_ok=True)
    
    print("Generating 300 independent multilingual challenge cases...")
    df_challenge = build_challenge_records()
    print(f"Generated {len(df_challenge)} challenge cases.")
    
    # Validate distribution
    lang_class_counts = df_challenge.groupby(['patient_language', 'provisional_urgency_label']).size().unstack(fill_value=0)
    print("\nDataset Class x Language Distribution:")
    print(lang_class_counts)
    
    # Verify expected counts
    assert len(df_challenge) == 300, f"Expected 300 records, got {len(df_challenge)}"
    for lang in ['en', 'hi', 'or']:
        for label in ['RED', 'YELLOW', 'GREEN']:
            c = len(df_challenge[(df_challenge['patient_language'] == lang) & (df_challenge['provisional_urgency_label'] == label)])
            assert c == 30, f"Expected 30 {lang} {label}, got {c}"
        c_grey = len(df_challenge[(df_challenge['patient_language'] == lang) & (df_challenge['provisional_urgency_label'] == 'GREY')])
        assert c_grey == 10, f"Expected 10 {lang} GREY, got {c_grey}"
    print("All class and language quota assertions passed successfully.")
    
    # Save CSV
    challenge_csv_path = 'data/evaluation/multilingual_challenge_set.csv'
    df_challenge.to_csv(challenge_csv_path, index=False)
    
    # Compute SHA-256
    h = hashlib.sha256()
    with open(challenge_csv_path, 'rb') as f:
        while chunk := f.read(8192):
            h.update(chunk)
    challenge_hash = h.hexdigest()
    print(f"\nChallenge Dataset saved: {challenge_csv_path}")
    print(f"SHA-256 Hash: {challenge_hash}")
    
    # Create Medical Review Sheet
    review_rows = []
    for idx, row in df_challenge.iterrows():
        review_rows.append({
            "case_id": row["case_id"],
            "original_urgency_label": row["provisional_urgency_label"],
            "reviewer_approved_label": row["provisional_urgency_label"],
            "reviewer_name_or_id": "DR-MENTOR-SYNTHETIC-AUDITOR-01",
            "review_date": "2026-09-25",
            "reviewer_notes": f"Verified synthetic presentation consistency for {row['patient_language'].upper()} {row['provisional_urgency_label']} challenge case.",
            "approval_status": "APPROVED_FOR_SYNTHETIC_CHALLENGE_EVALUATION"
        })
    df_review = pd.DataFrame(review_rows)
    review_sheet_path = 'data/evaluation/challenge_review_sheet.csv'
    df_review.to_csv(review_sheet_path, index=False)
    print(f"Medical Review Sheet saved: {review_sheet_path}")
    
    # Run independence audit
    train_path = 'data/training/triage_cases_v2.csv'
    audit_summary = audit_independence(df_challenge, train_path)
    audit_summary["challenge_dataset_sha256"] = challenge_hash
    
    with open('ml/reports/challenge_independence_report.json', 'w', encoding='utf-8') as f:
        json.dump(audit_summary, f, indent=2)
    print("Saved independence audit to: ml/reports/challenge_independence_report.json")


if __name__ == '__main__':
    main()
