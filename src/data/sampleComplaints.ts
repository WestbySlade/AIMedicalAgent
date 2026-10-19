import { ComplaintRecord, TriageResult } from '../types';

function createFormattedOutput(t: Omit<TriageResult, 'formattedOutput' | 'triagedAt'>): string {
  const risks = t.riskFlags.map((r) => `${r.type}: ${r.explanation}`).join('; ');
  return `Complaint Category: ${t.complaintCategory}
Secondary Categories: ${t.secondaryCategories.length > 0 ? t.secondaryCategories.join(', ') : 'None'}
Severity Level: ${t.severityLevel}
Severity Justification: ${t.severityJustification}
Risk Flags: ${risks || 'None'}
Recommended Department: ${t.recommendedDepartment}
Escalation Priority: ${t.escalationPriority}
Human Review Status: ${t.humanReviewStatus}
Executive Summary: ${t.executiveSummary}`;
}

export const SAMPLE_DATASETS: {
  id: string;
  name: string;
  description: string;
  data: ComplaintRecord[];
}[] = [
  {
    id: 'diverse-mix',
    name: 'Hospital Grievance & Portal Stream (Comprehensive Sample)',
    description: 'Mix of acute safety alerts, privacy incidents, clinical care, portal bugs, and billing disputes.',
    data: [
      {
        id: 'CMP-2026-081',
        date: '2026-10-18',
        patientId: 'PT-94812',
        channel: 'Grievance Hotline',
        departmentReported: 'Emergency Department',
        location: 'Main Medical Center - West Pavilion',
        rawText: 'My 74-year-old mother was brought in with severe chest tightness and left arm tingling. The triage nurse told us to wait in the lobby without taking vitals or an EKG. We waited 3 hours before she collapsed on the floor. Only then did the team rush in with a code cart. She had an acute anterior STEMI and had to undergo emergency angioplasty. Her records were left lying open on the registration desk where visitors were looking at them.',
        status: 'triaged',
        triage: {
          complaintCategory: 'Patient Safety',
          secondaryCategories: ['Clinical Care', 'Wait Time', 'Privacy or Security'],
          severityLevel: 'LEVEL 4 - Critical',
          severityJustification: 'Catastrophic triage failure: acute coronary syndrome patient left unmonitored for 3 hours without vitals or EKG, resulting in cardiac collapse and code activation. Open medical records also present HIPAA breach.',
          riskFlags: [
            {
              type: 'Patient Safety Risk',
              explanation: 'Failure to perform chest pain triage protocol led to preventable cardiac arrest in waiting room.',
            },
            {
              type: 'Clinical Risk',
              explanation: 'Acute anterior STEMI unmonitored; delayed reperfusion therapy.',
            },
            {
              type: 'Privacy Risk',
              explanation: 'Protected health records left visible to general public on registration counter.',
            },
            {
              type: 'Compliance Risk',
              explanation: 'Joint Commission and CMS sentinel event reporting thresholds triggered.',
            },
          ],
          recommendedDepartment: 'Risk Management',
          escalationPriority: 'Immediate',
          humanReviewStatus: 'Human Review Required',
          humanReviewReason: 'Sentinel patient safety event involving emergency resuscitation and HIPAA breach.',
          executiveSummary: 'Critical triage omission in emergency department resulting in patient cardiac collapse from acute STEMI after a 3-hour unmonitored delay. Immediate escalation to Risk Management, Physician Leadership, and Nursing Leadership required for sentinel event review.',
          triagedAt: '2026-10-18T14:30:00.000Z',
          formattedOutput: createFormattedOutput({
            complaintCategory: 'Patient Safety',
            secondaryCategories: ['Clinical Care', 'Wait Time', 'Privacy or Security'],
            severityLevel: 'LEVEL 4 - Critical',
            severityJustification: 'Catastrophic triage failure: acute coronary syndrome patient left unmonitored for 3 hours without vitals or EKG, resulting in cardiac collapse and code activation.',
            riskFlags: [
              {
                type: 'Patient Safety Risk',
                explanation: 'Failure to perform chest pain triage protocol led to preventable cardiac arrest in waiting room.',
              },
              {
                type: 'Clinical Risk',
                explanation: 'Acute anterior STEMI unmonitored; delayed reperfusion therapy.',
              },
            ],
            recommendedDepartment: 'Risk Management',
            escalationPriority: 'Immediate',
            humanReviewStatus: 'Human Review Required',
            executiveSummary: 'Critical triage omission resulting in cardiac collapse from STEMI. Immediate escalation to Risk Management required.',
          }),
        },
      },
      {
        id: 'CMP-2026-082',
        date: '2026-10-18',
        patientId: 'PT-33041',
        channel: 'Patient Portal',
        departmentReported: 'Inpatient Pharmacy / Oncology',
        location: 'Cancer Care Pavilion',
        rawText: 'At discharge yesterday afternoon, the nurse handed me a prescription bottle labeled Methotrexate 15mg with instructions saying "Take 3 tablets twice daily" instead of once weekly. Luckily I am a retired RN and noticed this is a lethal dosing schedule for rheumatoid arthritis. When I called the pharmacy desk, the technician laughed and said "oops, doctor made a typo, just take one". This is completely unacceptable negligence that could kill someone.',
        status: 'triaged',
        triage: {
          complaintCategory: 'Clinical Care',
          secondaryCategories: ['Patient Safety', 'Staff Conduct'],
          severityLevel: 'LEVEL 4 - Critical',
          severityJustification: 'Potentially fatal medication dosing error on weekly antimetabolite (Methotrexate). Dismissive staff response compounds clinical negligence risk.',
          riskFlags: [
            {
              type: 'Patient Safety Risk',
              explanation: 'Methotrexate daily dosing is a known high-alert medication hazard causing lethal toxicity.',
            },
            {
              type: 'Clinical Risk',
              explanation: 'Breakdown in discharge medication reconciliation and pharmacy verification protocols.',
            },
            {
              type: 'Reputational Risk',
              explanation: 'Flawed response from pharmacy staff regarding life-threatening error.',
            },
          ],
          recommendedDepartment: 'Physician Leadership',
          escalationPriority: 'Immediate',
          humanReviewStatus: 'Human Review Required',
          humanReviewReason: 'Near-miss sentinel medication safety incident requiring physician and pharmacy oversight.',
          executiveSummary: 'Critical medication error involving lethal dosing instructions on Methotrexate. Immediate escalation to Physician Leadership, Pharmacy Director, and Nursing Leadership for root-cause analysis.',
          triagedAt: '2026-10-18T16:15:00.000Z',
          formattedOutput: createFormattedOutput({
            complaintCategory: 'Clinical Care',
            secondaryCategories: ['Patient Safety', 'Staff Conduct'],
            severityLevel: 'LEVEL 4 - Critical',
            severityJustification: 'Potentially fatal medication dosing error on weekly antimetabolite (Methotrexate).',
            riskFlags: [
              {
                type: 'Patient Safety Risk',
                explanation: 'Methotrexate daily dosing is a known high-alert medication hazard causing lethal toxicity.',
              },
            ],
            recommendedDepartment: 'Physician Leadership',
            escalationPriority: 'Immediate',
            humanReviewStatus: 'Human Review Required',
            executiveSummary: 'Critical medication error involving lethal dosing instructions on Methotrexate. Immediate clinical escalation required.',
          }),
        },
      },
      {
        id: 'CMP-2026-083',
        date: '2026-10-17',
        patientId: 'PT-11294',
        channel: 'Discharge Survey',
        departmentReported: 'Obstetrics & Gynecology',
        location: 'Women & Infants Center',
        rawText: 'During my labor and delivery, I repeatedly expressed severe 10/10 pelvic pain and dizziness. The attending doctor told the nurse "she is just exaggerating, these Hispanic patients always act dramatic" within hearing distance of my husband and me. They withheld epidural assessment for 4 hours until the shift change doctor discovered an amniotic fluid complication. I felt racially profiled and humiliated.',
        status: 'triaged',
        triage: {
          complaintCategory: 'Accessibility and Equity',
          secondaryCategories: ['Clinical Care', 'Staff Conduct'],
          severityLevel: 'LEVEL 4 - Critical',
          severityJustification: 'Explicit allegation of discriminatory bias impacting clinical care, pain management, and obstetric outcome.',
          riskFlags: [
            {
              type: 'Equity Risk',
              explanation: 'Disparate treatment and racial profiling alleged during labor and delivery care.',
            },
            {
              type: 'Compliance Risk',
              explanation: 'Potential violation of Title VI Civil Rights and federal healthcare non-discrimination regulations.',
            },
            {
              type: 'Clinical Risk',
              explanation: 'Delayed diagnosis of amniotic fluid complication following pain dismissal.',
            },
          ],
          recommendedDepartment: 'Executive Review',
          escalationPriority: 'Immediate',
          humanReviewStatus: 'Human Review Required',
          humanReviewReason: 'Allegation of racial discrimination and compromised obstetric clinical care requires mandatory executive investigation.',
          executiveSummary: 'Critical discrimination grievance alleging racial bias resulted in withheld pain relief and delayed treatment of an obstetric complication. Immediate escalation to Executive Review, Chief Medical Officer, and Diversity/Civil Rights Office.',
          triagedAt: '2026-10-17T11:20:00.000Z',
          formattedOutput: createFormattedOutput({
            complaintCategory: 'Accessibility and Equity',
            secondaryCategories: ['Clinical Care', 'Staff Conduct'],
            severityLevel: 'LEVEL 4 - Critical',
            severityJustification: 'Explicit allegation of discriminatory bias impacting clinical care, pain management, and obstetric outcome.',
            riskFlags: [
              {
                type: 'Equity Risk',
                explanation: 'Disparate treatment and racial profiling alleged during labor and delivery care.',
              },
              {
                type: 'Compliance Risk',
                explanation: 'Potential violation of Title VI Civil Rights and non-discrimination mandates.',
              },
            ],
            recommendedDepartment: 'Executive Review',
            escalationPriority: 'Immediate',
            humanReviewStatus: 'Human Review Required',
            executiveSummary: 'Critical discrimination grievance alleging racial bias resulted in withheld care. Escalated to Executive Review.',
          }),
        },
      },
      {
        id: 'CMP-2026-084',
        date: '2026-10-16',
        patientId: 'PT-77218',
        channel: 'Patient Portal Feedback',
        departmentReported: 'Health Informatics / Portal',
        location: 'Virtual Health System',
        rawText: 'When I logged into my MyChart patient portal yesterday from my laptop, the dashboard displayed another patient\'s complete clinical chart (Mr. Robert H., DOB 04/12/1958) including his HIV status, psychiatric progress notes, and home address. I could see all his appointments and test results. I have screenshots showing this breach.',
        status: 'triaged',
        triage: {
          complaintCategory: 'Privacy or Security',
          secondaryCategories: ['Technology / Patient Portal'],
          severityLevel: 'LEVEL 4 - Critical',
          severityJustification: 'Catastrophic unauthorized disclosure of Protected Health Information (PHI) including highly sensitive HIV status and psychiatric documentation.',
          riskFlags: [
            {
              type: 'Privacy Risk',
              explanation: 'Direct exposure of third-party patient identity, diagnosis, and psychiatric evaluations.',
            },
            {
              type: 'Compliance Risk',
              explanation: 'Major HIPAA Privacy and Security Rule violation with mandatory HHS OCR reporting requirements.',
            },
            {
              type: 'Reputational Risk',
              explanation: 'Public exposure and regulatory penalties stemming from portal software vulnerability.',
            },
          ],
          recommendedDepartment: 'Compliance Office',
          escalationPriority: 'Immediate',
          humanReviewStatus: 'Human Review Required',
          humanReviewReason: 'Confirmed HIPAA breach involving sensitive diagnosis requires Privacy Officer review and incident response.',
          executiveSummary: 'Critical HIPAA privacy breach: portal misconfiguration exposed another patient\'s psychiatric notes and HIV status. Immediate escalation to Compliance Office and Information Security for incident containment and breach notification.',
          triagedAt: '2026-10-16T09:45:00.000Z',
          formattedOutput: createFormattedOutput({
            complaintCategory: 'Privacy or Security',
            secondaryCategories: ['Technology / Patient Portal'],
            severityLevel: 'LEVEL 4 - Critical',
            severityJustification: 'Catastrophic unauthorized disclosure of Protected Health Information (PHI).',
            riskFlags: [
              {
                type: 'Privacy Risk',
                explanation: 'Direct exposure of third-party patient identity, HIV status, and psychiatric records.',
              },
            ],
            recommendedDepartment: 'Compliance Office',
            escalationPriority: 'Immediate',
            humanReviewStatus: 'Human Review Required',
            executiveSummary: 'Critical HIPAA privacy breach exposing third-party chart. Route immediately to Compliance Office.',
          }),
        },
      },
      {
        id: 'CMP-2026-085',
        date: '2026-10-15',
        patientId: 'PT-50912',
        channel: 'Billing Dispute Form',
        departmentReported: 'Revenue Cycle & Billing',
        location: 'Outpatient Surgical Pavilion',
        rawText: 'I received a surprise bill for $4,250 for an "out-of-network assistant surgeon" during my planned knee arthroscopy. Before the surgery, I obtained pre-authorization in writing confirming that all participating surgical personnel at this hospital were in-network. This violates the No Surprises Act federal law. Your collections department has been calling me twice a day threatening my credit score.',
        status: 'triaged',
        triage: {
          complaintCategory: 'Billing',
          secondaryCategories: ['Communication'],
          severityLevel: 'LEVEL 2 - Moderate',
          severityJustification: 'Disputed balance billing for out-of-network surgical provider with written pre-authorization and aggressive collection outreach.',
          riskFlags: [
            {
              type: 'Compliance Risk',
              explanation: 'Potential violation of federal No Surprises Act balance billing protections.',
            },
            {
              type: 'Operational Risk',
              explanation: 'Disconnect between surgical pre-authorization records and third-party billing rosters.',
            },
          ],
          recommendedDepartment: 'Revenue Cycle / Billing',
          escalationPriority: 'Routine',
          humanReviewStatus: 'Human Review Recommended',
          humanReviewReason: 'Verification of billing codes against pre-authorization documentation required.',
          executiveSummary: 'Moderate billing dispute involving a $4,250 surprise assistant surgeon charge in violation of pre-authorization. Recommended action: Place immediate collections hold, review insurance pre-auth file, and re-adjudicate under No Surprises Act standards.',
          triagedAt: '2026-10-15T15:00:00.000Z',
          formattedOutput: createFormattedOutput({
            complaintCategory: 'Billing',
            secondaryCategories: ['Communication'],
            severityLevel: 'LEVEL 2 - Moderate',
            severityJustification: 'Disputed balance billing for out-of-network surgical provider despite pre-authorization.',
            riskFlags: [
              {
                type: 'Compliance Risk',
                explanation: 'Potential violation of federal No Surprises Act balance billing rules.',
              },
            ],
            recommendedDepartment: 'Revenue Cycle / Billing',
            escalationPriority: 'Routine',
            humanReviewStatus: 'Human Review Recommended',
            executiveSummary: 'Billing dispute involving $4,250 surprise bill. Place collections hold and re-adjudicate.',
          }),
        },
      },
      {
        id: 'CMP-2026-086',
        date: '2026-10-14',
        patientId: 'PT-66421',
        channel: 'Clinic Kiosk Survey',
        departmentReported: 'Orthopedics & Sports Medicine',
        location: 'North Subspecialty Clinic',
        rawText: 'I am a wheelchair user and had an 11:00 AM appointment. The electronic door opener at the clinic main entrance was broken with no sign. Once inside, the exam room was so crammed with equipment that my wheelchair could not turn around. When I asked for an accessible transfer table, the staff told me they don\'t have one and that I would have to be examined sitting in my chair with no dignity.',
        status: 'triaged',
        triage: {
          complaintCategory: 'Accessibility and Equity',
          secondaryCategories: ['Clinical Care'],
          severityLevel: 'LEVEL 3 - High',
          severityJustification: 'Physical accessibility barriers and lack of accessible examination equipment, compromising clinical exam quality and patient dignity.',
          riskFlags: [
            {
              type: 'Accessibility Risk',
              explanation: 'Inaccessible clinic entry and exam rooms preventing adequate physical examination.',
            },
            {
              type: 'Compliance Risk',
              explanation: 'Potential Americans with Disabilities Act (ADA) Title III compliance deficiency.',
            },
          ],
          recommendedDepartment: 'Accessibility Coordinator',
          escalationPriority: 'Priority',
          humanReviewStatus: 'Human Review Required',
          humanReviewReason: 'Serious accessibility barrier impacting patient care requires coordinator action.',
          executiveSummary: 'High-severity accessibility breakdown: broken automated doors, cramped exam space, and absence of an accessible transfer table. Priority escalation to Accessibility Coordinator and Facilities for equipment installation and ADA compliance audit.',
          triagedAt: '2026-10-14T13:40:00.000Z',
          formattedOutput: createFormattedOutput({
            complaintCategory: 'Accessibility and Equity',
            secondaryCategories: ['Clinical Care'],
            severityLevel: 'LEVEL 3 - High',
            severityJustification: 'Physical accessibility barriers and lack of accessible transfer table.',
            riskFlags: [
              {
                type: 'Accessibility Risk',
                explanation: 'Inaccessible entry and exam rooms preventing full examination.',
              },
            ],
            recommendedDepartment: 'Accessibility Coordinator',
            escalationPriority: 'Priority',
            humanReviewStatus: 'Human Review Required',
            executiveSummary: 'Accessibility breakdown at orthopedics clinic. Priority route to Accessibility Coordinator.',
          }),
        },
      },
      {
        id: 'CMP-2026-087',
        date: '2026-10-13',
        patientId: 'PT-44109',
        channel: 'Google Online Review',
        departmentReported: 'Pediatrics Clinic',
        location: 'Metro Plaza Health',
        rawText: 'The waiting room wait was 45 minutes past our appointment time, and the waiting room was overcrowded with broken toys. Dr. Evans was kind once we got in, but parking cost $18 for one hour and the validation machine was out of order. Receptionist seemed overwhelmed.',
        status: 'triaged',
        triage: {
          complaintCategory: 'Wait Time',
          secondaryCategories: ['Communication', 'Scheduling'],
          severityLevel: 'LEVEL 1 - Low',
          severityJustification: 'Routine waiting room congestion, delayed clinic flow, and parking validation machine malfunction. No clinical harm.',
          riskFlags: [
            {
              type: 'Operational Risk',
              explanation: 'Clinic schedule slippage and parking validation equipment failure.',
            },
          ],
          recommendedDepartment: 'Patient Experience Team',
          escalationPriority: 'Routine',
          humanReviewStatus: 'AI Review Only',
          humanReviewReason: 'Operational service feedback suitable for aggregate reporting.',
          executiveSummary: 'Routine dissatisfaction regarding a 45-minute wait time, worn waiting room toys, and an out-of-order parking validation machine. Routed to Patient Experience Team for facilities maintenance and front desk staffing review.',
          triagedAt: '2026-10-13T10:10:00.000Z',
          formattedOutput: createFormattedOutput({
            complaintCategory: 'Wait Time',
            secondaryCategories: ['Communication', 'Scheduling'],
            severityLevel: 'LEVEL 1 - Low',
            severityJustification: 'Routine waiting room congestion and parking machine malfunction.',
            riskFlags: [
              {
                type: 'Operational Risk',
                explanation: 'Clinic schedule slippage and parking equipment failure.',
              },
            ],
            recommendedDepartment: 'Patient Experience Team',
            escalationPriority: 'Routine',
            humanReviewStatus: 'AI Review Only',
            executiveSummary: 'Routine wait time and parking grievance. Route to Patient Experience Team.',
          }),
        },
      },
      {
        id: 'CMP-2026-088',
        date: '2026-10-12',
        patientId: 'PT-88931',
        channel: 'Patient Portal Message',
        departmentReported: 'Cardiovascular Ambulatory',
        location: 'Heart & Vascular Institute',
        rawText: 'I have tried for 3 weeks to refill my Carvedilol prescription through the portal refill button. Every time I click submit, the app says "Gateway 504 Timeout". I called the triage phone line and left 4 voicemails with the cardiac triage nurse over 10 days, but nobody calls back. I am now out of my blood pressure medication and feeling lightheaded.',
        status: 'triaged',
        triage: {
          complaintCategory: 'Technology / Patient Portal',
          secondaryCategories: ['Clinical Care', 'Communication'],
          severityLevel: 'LEVEL 3 - High',
          severityJustification: 'Chronic portal failure combined with unanswered nursing voicemails resulted in patient running out of essential cardiac medication (Carvedilol) and developing lightheadedness.',
          riskFlags: [
            {
              type: 'Clinical Risk',
              explanation: 'Discontinuation of essential antihypertensive medication with emergent symptomatic lightheadedness.',
            },
            {
              type: 'Operational Risk',
              explanation: 'Breakdown in ambulatory nursing voicemail triage callback protocols.',
            },
          ],
          recommendedDepartment: 'Nursing Leadership',
          escalationPriority: 'Priority',
          humanReviewStatus: 'Human Review Required',
          humanReviewReason: 'Patient actively unmedicated and symptomatic; urgent nursing and pharmacy intervention needed.',
          executiveSummary: 'High-severity service failure: portal 504 timeout and unanswered triage voicemails led to cardiac patient missing Carvedilol therapy and feeling lightheaded. Priority escalation to Nursing Leadership and Cardiology Clinic Manager for immediate prescription refill and clinical welfare check.',
          triagedAt: '2026-10-12T11:55:00.000Z',
          formattedOutput: createFormattedOutput({
            complaintCategory: 'Technology / Patient Portal',
            secondaryCategories: ['Clinical Care', 'Communication'],
            severityLevel: 'LEVEL 3 - High',
            severityJustification: 'Chronic portal timeout and unanswered nurse voicemails resulted in cardiac medication depletion.',
            riskFlags: [
              {
                type: 'Clinical Risk',
                explanation: 'Discontinuation of essential antihypertensive medication with emergent symptoms.',
              },
            ],
            recommendedDepartment: 'Nursing Leadership',
            escalationPriority: 'Priority',
            humanReviewStatus: 'Human Review Required',
            executiveSummary: 'Portal failure and unreturned calls led to missed blood pressure medication. Priority route to Nursing Leadership.',
          }),
        },
      },
    ],
  },
  {
    id: 'safety-sentinel',
    name: 'High-Risk Sentinel & Regulatory Escalations',
    description: 'High-severity safety cases needing immediate clinical routing and mandatory human oversight.',
    data: [
      {
        id: 'CMP-2026-101',
        date: '2026-10-19',
        patientId: 'PT-99120',
        channel: 'Grievance Hotline',
        departmentReported: 'Intensive Care Unit (ICU)',
        location: 'Tower 4 - ICU Stepdown',
        rawText: 'Post-op patient with known anaphylactic allergy to Penicillin prominently documented with a red wristband was administered Ampicillin IV by a float nurse who did not scan the medication barcode. Patient suffered laryngeal edema and required immediate epinephrine injection and re-intubation.',
        status: 'triaged',
        triage: {
          complaintCategory: 'Patient Safety',
          secondaryCategories: ['Clinical Care'],
          severityLevel: 'LEVEL 4 - Critical',
          severityJustification: 'Sentinel event: administration of contraindicated antibiotic to patient with known documented allergy, causing acute anaphylaxis, airway compromise, and emergency re-intubation.',
          riskFlags: [
            {
              type: 'Patient Safety Risk',
              explanation: 'Severe acute anaphylaxis and airway closure due to barcode scanning bypass.',
            },
            {
              type: 'Clinical Risk',
              explanation: 'Emergency resuscitation and ICU re-intubation required.',
            },
            {
              type: 'Compliance Risk',
              explanation: 'Joint Commission and CMS sentinel event reporting mandatory.',
            },
          ],
          recommendedDepartment: 'Risk Management',
          escalationPriority: 'Immediate',
          humanReviewStatus: 'Human Review Required',
          humanReviewReason: 'Life-threatening sentinel event with airway compromise.',
          executiveSummary: 'Critical sentinel event: administration of contraindicated IV Ampicillin to a Penicillin-allergic patient led to acute anaphylaxis and re-intubation. Immediate route to Risk Management, Physician Leadership, and Nursing Leadership for emergency safety root cause investigation.',
          triagedAt: '2026-10-19T08:00:00.000Z',
          formattedOutput: createFormattedOutput({
            complaintCategory: 'Patient Safety',
            secondaryCategories: ['Clinical Care'],
            severityLevel: 'LEVEL 4 - Critical',
            severityJustification: 'Sentinel event: contraindicated antibiotic administration causing acute anaphylaxis and re-intubation.',
            riskFlags: [
              {
                type: 'Patient Safety Risk',
                explanation: 'Acute anaphylaxis and airway closure due to barcode scanning bypass.',
              },
            ],
            recommendedDepartment: 'Risk Management',
            escalationPriority: 'Immediate',
            humanReviewStatus: 'Human Review Required',
            executiveSummary: 'Critical sentinel event involving contraindicated antibiotic. Route to Risk Management.',
          }),
        },
      },
      {
        id: 'CMP-2026-102',
        date: '2026-10-18',
        patientId: 'PT-99125',
        channel: 'Written Attorney Notice / Grievance',
        departmentReported: 'Surgical Services',
        location: 'Operating Suites',
        rawText: 'Formal grievance on behalf of patient undergoing right knee replacement on October 10. The surgical site marking was smudged and the surgical team initiated incision on the left knee before noticing the error during the time-out protocol verification.',
        status: 'triaged',
        triage: {
          complaintCategory: 'Patient Safety',
          secondaryCategories: ['Clinical Care'],
          severityLevel: 'LEVEL 4 - Critical',
          severityJustification: 'Wrong-site surgical incident: surgical incision initiated on incorrect limb due to failed site verification protocol.',
          riskFlags: [
            {
              type: 'Patient Safety Risk',
              explanation: 'Wrong-site surgical procedure initiated.',
            },
            {
              type: 'Compliance Risk',
              explanation: 'Never-event / Sentinel event requiring mandatory reporting to state health department and Joint Commission.',
            },
            {
              type: 'Reputational Risk',
              explanation: 'Direct attorney representation and severe institutional legal liability.',
            },
          ],
          recommendedDepartment: 'Risk Management',
          escalationPriority: 'Immediate',
          humanReviewStatus: 'Human Review Required',
          humanReviewReason: 'Wrong-site surgery never-event requires mandatory legal and clinical investigation.',
          executiveSummary: 'Critical sentinel event involving wrong-site surgical incision on wrong limb during arthroplasty. Immediate escalation to Risk Management, Chief Medical Officer, and Surgical Executive Committee.',
          triagedAt: '2026-10-18T10:00:00.000Z',
          formattedOutput: createFormattedOutput({
            complaintCategory: 'Patient Safety',
            secondaryCategories: ['Clinical Care'],
            severityLevel: 'LEVEL 4 - Critical',
            severityJustification: 'Wrong-site surgical incident on incorrect limb.',
            riskFlags: [
              {
                type: 'Patient Safety Risk',
                explanation: 'Wrong-site surgical procedure initiated.',
              },
            ],
            recommendedDepartment: 'Risk Management',
            escalationPriority: 'Immediate',
            humanReviewStatus: 'Human Review Required',
            executiveSummary: 'Wrong-site surgery sentinel event. Immediate route to Risk Management.',
          }),
        },
      },
      {
        id: 'CMP-2026-103',
        date: '2026-10-17',
        patientId: 'PT-99130',
        channel: 'Staff Incident / Portal Referral',
        departmentReported: 'Psychiatric Emergency Assessment',
        location: 'Behavioral Health Crisis Center',
        rawText: 'Patient presented voluntarily expressing acute suicidal ideation with a plan. After 40 minutes unsupervised in the hallway alcove, patient eloped from the facility without discharge clearance because the security badge reader on exit door 3 was taped open.',
        status: 'triaged',
        triage: {
          complaintCategory: 'Patient Safety',
          secondaryCategories: ['Clinical Care'],
          severityLevel: 'LEVEL 4 - Critical',
          severityJustification: 'Elopement of actively suicidal patient from acute psychiatric crisis unit due to compromised perimeter security badge reader.',
          riskFlags: [
            {
              type: 'Patient Safety Risk',
              explanation: 'Imminent risk of self-harm or suicide following unmonitored facility elopement.',
            },
            {
              type: 'Compliance Risk',
              explanation: 'Joint Commission National Patient Safety Goal (NPSG) breach regarding suicide prevention environmental safeguards.',
            },
            {
              type: 'Operational Risk',
              explanation: 'Tampered physical security door lock permitting unauthorized exit.',
            },
          ],
          recommendedDepartment: 'Risk Management',
          escalationPriority: 'Immediate',
          humanReviewStatus: 'Human Review Required',
          humanReviewReason: 'Acute psychiatric safety crisis and facility security compromise.',
          executiveSummary: 'Critical psychiatric patient safety event: actively suicidal patient eloped through a taped-open security door. Immediate escalation to Risk Management, Security, and Behavioral Health Leadership for emergency search protocol and physical security audit.',
          triagedAt: '2026-10-17T12:00:00.000Z',
          formattedOutput: createFormattedOutput({
            complaintCategory: 'Patient Safety',
            secondaryCategories: ['Clinical Care'],
            severityLevel: 'LEVEL 4 - Critical',
            severityJustification: 'Elopement of actively suicidal patient from psychiatric crisis unit.',
            riskFlags: [
              {
                type: 'Patient Safety Risk',
                explanation: 'Imminent risk of self-harm or suicide following facility elopement.',
              },
            ],
            recommendedDepartment: 'Risk Management',
            escalationPriority: 'Immediate',
            humanReviewStatus: 'Human Review Required',
            executiveSummary: 'Suicidal patient elopement due to compromised door. Immediate route to Risk Management.',
          }),
        },
      },
    ],
  },
];
