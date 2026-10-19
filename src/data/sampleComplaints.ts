import { ComplaintRecord } from '../types';

export const SAMPLE_DATASETS: {
  id: string;
  name: string;
  description: string;
  data: Omit<ComplaintRecord, 'status' | 'triage'>[];
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
      },
      {
        id: 'CMP-2026-082',
        date: '2026-10-18',
        patientId: 'PT-33041',
        channel: 'Patient Portal',
        departmentReported: 'Inpatient Pharmacy / Oncology',
        location: 'Cancer Care Pavilion',
        rawText: 'At discharge yesterday afternoon, the nurse handed me a prescription bottle labeled Methotrexate 15mg with instructions saying "Take 3 tablets twice daily" instead of once weekly. Luckily I am a retired RN and noticed this is a lethal dosing schedule for rheumatoid arthritis. When I called the pharmacy desk, the technician laughed and said "oops, doctor made a typo, just take one". This is completely unacceptable negligence that could kill someone.',
      },
      {
        id: 'CMP-2026-083',
        date: '2026-10-17',
        patientId: 'PT-11294',
        channel: 'Discharge Survey',
        departmentReported: 'Obstetrics & Gynecology',
        location: 'Women & Infants Center',
        rawText: 'During my labor and delivery, I repeatedly expressed severe 10/10 pelvic pain and dizziness. The attending doctor told the nurse "she is just exaggerating, these Hispanic patients always act dramatic" within hearing distance of my husband and me. They withheld epidural assessment for 4 hours until the shift change doctor discovered an amniotic fluid complication. I felt racially profiled and humiliated.',
      },
      {
        id: 'CMP-2026-084',
        date: '2026-10-16',
        patientId: 'PT-77218',
        channel: 'Patient Portal Feedback',
        departmentReported: 'Health Informatics / Portal',
        location: 'Virtual Health System',
        rawText: 'When I logged into my MyChart patient portal yesterday from my laptop, the dashboard displayed another patient\'s complete clinical chart (Mr. Robert H., DOB 04/12/1958) including his HIV status, psychiatric progress notes, and home address. I could see all his appointments and test results. I have screenshots showing this breach.',
      },
      {
        id: 'CMP-2026-085',
        date: '2026-10-15',
        patientId: 'PT-50912',
        channel: 'Billing Dispute Form',
        departmentReported: 'Revenue Cycle & Billing',
        location: 'Outpatient Surgical Pavilion',
        rawText: 'I received a surprise bill for $4,250 for an "out-of-network assistant surgeon" during my planned knee arthroscopy. Before the surgery, I obtained pre-authorization in writing confirming that all participating surgical personnel at this hospital were in-network. This violates the No Surprises Act federal law. Your collections department has been calling me twice a day threatening my credit score.',
      },
      {
        id: 'CMP-2026-086',
        date: '2026-10-14',
        patientId: 'PT-66421',
        channel: 'Clinic Kiosk Survey',
        departmentReported: 'Orthopedics & Sports Medicine',
        location: 'North Subspecialty Clinic',
        rawText: 'I am a wheelchair user and had an 11:00 AM appointment. The electronic door opener at the clinic main entrance was broken with no sign. Once inside, the exam room was so crammed with equipment that my wheelchair could not turn around. When I asked for an accessible transfer table, the staff told me they don\'t have one and that I would have to be examined sitting in my chair with no dignity.',
      },
      {
        id: 'CMP-2026-087',
        date: '2026-10-13',
        patientId: 'PT-44109',
        channel: 'Google Online Review',
        departmentReported: 'Pediatrics Clinic',
        location: 'Metro Plaza Health',
        rawText: 'The waiting room wait was 45 minutes past our appointment time, and the waiting room was overcrowded with broken toys. Dr. Evans was kind once we got in, but parking cost $18 for one hour and the validation machine was out of order. Receptionist seemed overwhelmed.',
      },
      {
        id: 'CMP-2026-088',
        date: '2026-10-12',
        patientId: 'PT-88931',
        channel: 'Patient Portal Message',
        departmentReported: 'Cardiovascular Ambulatory',
        location: 'Heart & Vascular Institute',
        rawText: 'I have tried for 3 weeks to refill my Carvedilol prescription through the portal refill button. Every time I click submit, the app says "Gateway 504 Timeout". I called the triage phone line and left 4 voicemails with the cardiac triage nurse over 10 days, but nobody calls back. I am now out of my blood pressure medication and feeling lightheaded.',
      }
    ]
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
      },
      {
        id: 'CMP-2026-102',
        date: '2026-10-18',
        patientId: 'PT-99125',
        channel: 'Written Attorney Notice / Grievance',
        departmentReported: 'Surgical Services',
        location: 'Operating Suites',
        rawText: 'Formal grievance on behalf of patient undergoing right knee replacement on October 10. The surgical site marking was smudged and the surgical team initiated incision on the left knee before noticing the error during the time-out protocol verification.',
      },
      {
        id: 'CMP-2026-103',
        date: '2026-10-17',
        patientId: 'PT-99130',
        channel: 'Staff Incident / Portal Referral',
        departmentReported: 'Psychiatric Emergency Assessment',
        location: 'Behavioral Health Crisis Center',
        rawText: 'Patient presented voluntarily expressing acute suicidal ideation with a plan. After 40 minutes unsupervised in the hallway alcove, patient eloped from the facility without discharge clearance because the security badge reader on exit door 3 was taped open.',
      }
    ]
  }
];
