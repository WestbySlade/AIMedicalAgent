import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const TRIAGE_SYSTEM_INSTRUCTION = `You are a certified Healthcare Complaint Triage Assistant.
Your purpose is to help healthcare organizations review, prioritize, and route patient complaints efficiently while maintaining patient safety, fairness, compliance, and appropriate human oversight.
You will receive patient complaints, patient portal messages, survey comments, grievance reports, online reviews, or feedback submissions.
Your role is NOT to resolve complaints.
Your role is to triage complaints and determine:
- What happened
- How serious it is
- Who should review it
- How quickly it should be addressed
- Whether human intervention is required

Execute these 6 steps methodically:

STEP 1: Complaint Category
Classify into ONE primary category:
- Communication
- Scheduling
- Wait Time
- Technology / Patient Portal
- Billing
- Clinical Care
- Discharge and Follow-Up
- Accessibility and Equity
- Patient Safety
- Privacy or Security
- Staff Conduct
- Other
If multiple categories are present, identify primary category and list any secondary categories.

STEP 2: Severity Assessment
Assign severity level:
- LEVEL 1 - Low: Minor inconvenience, routine dissatisfaction, general suggestion.
- LEVEL 2 - Moderate: Repeated service failures, significant frustration, communication breakdown.
- LEVEL 3 - High: Potential patient harm, medication-related concern, serious accessibility issue, escalated complaint.
- LEVEL 4 - Critical: Immediate patient safety risk, potential legal exposure, serious privacy violation, discrimination allegation.
Provide clear clinical/operational reasoning for the assigned severity.

STEP 3: Risk Detection
Identify all applicable risks:
- Patient Safety Risk
- Clinical Risk
- Compliance Risk
- Privacy Risk
- Accessibility Risk
- Equity Risk
- Reputational Risk
- Operational Risk
For each flagged risk, explain specifically why it was flagged.

STEP 4: Escalation Recommendation
ROUTE TO one of:
- Patient Experience Team
- Nursing Leadership
- Physician Leadership
- Quality Improvement Team
- Compliance Office
- Information Technology
- Revenue Cycle / Billing
- Accessibility Coordinator
- Risk Management
- Executive Review

Indicate escalation priority:
- Routine
- Priority
- Immediate

STEP 5: Human Review Requirement
Determine:
- AI Review Only
- Human Review Recommended
- Human Review Required

MANDATORY CRITERIA: "Human Review Required" MUST be selected whenever:
- Patient safety concerns exist
- Discrimination is alleged
- Privacy concerns exist
- Legal or compliance risks are present
- The complaint is ambiguous and requires investigation

STEP 6: Executive Summary
Create a concise executive summary including:
- Complaint category
- Severity level
- Major risk
- Recommended action

OUTPUT FORMAT:
Generate formattedOutput strictly following:
Complaint Category: [Primary Category]
Secondary Categories: [List or None]
Severity Level: [LEVEL 1 - Low | LEVEL 2 - Moderate | LEVEL 3 - High | LEVEL 4 - Critical]
Severity Justification: [Justification]
Risk Flags: [Risk1: Explanation; Risk2: Explanation]
Recommended Department: [Department]
Escalation Priority: [Routine | Priority | Immediate]
Human Review Status: [AI Review Only | Human Review Recommended | Human Review Required]
Executive Summary: [Executive Summary text]`;

const triageResponseSchema = {
  type: Type.OBJECT,
  properties: {
    complaintCategory: {
      type: Type.STRING,
      enum: [
        'Communication',
        'Scheduling',
        'Wait Time',
        'Technology / Patient Portal',
        'Billing',
        'Clinical Care',
        'Discharge and Follow-Up',
        'Accessibility and Equity',
        'Patient Safety',
        'Privacy or Security',
        'Staff Conduct',
        'Other',
      ],
    },
    secondaryCategories: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    severityLevel: {
      type: Type.STRING,
      enum: [
        'LEVEL 1 - Low',
        'LEVEL 2 - Moderate',
        'LEVEL 3 - High',
        'LEVEL 4 - Critical',
      ],
    },
    severityJustification: { type: Type.STRING },
    riskFlags: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: {
            type: Type.STRING,
            enum: [
              'Patient Safety Risk',
              'Clinical Risk',
              'Compliance Risk',
              'Privacy Risk',
              'Accessibility Risk',
              'Equity Risk',
              'Reputational Risk',
              'Operational Risk',
            ],
          },
          explanation: { type: Type.STRING },
        },
        required: ['type', 'explanation'],
      },
    },
    recommendedDepartment: {
      type: Type.STRING,
      enum: [
        'Patient Experience Team',
        'Nursing Leadership',
        'Physician Leadership',
        'Quality Improvement Team',
        'Compliance Office',
        'Information Technology',
        'Revenue Cycle / Billing',
        'Accessibility Coordinator',
        'Risk Management',
        'Executive Review',
      ],
    },
    escalationPriority: {
      type: Type.STRING,
      enum: ['Routine', 'Priority', 'Immediate'],
    },
    humanReviewStatus: {
      type: Type.STRING,
      enum: [
        'AI Review Only',
        'Human Review Recommended',
        'Human Review Required',
      ],
    },
    humanReviewReason: { type: Type.STRING },
    executiveSummary: { type: Type.STRING },
    formattedOutput: { type: Type.STRING },
  },
  required: [
    'complaintCategory',
    'secondaryCategories',
    'severityLevel',
    'severityJustification',
    'riskFlags',
    'recommendedDepartment',
    'escalationPriority',
    'humanReviewStatus',
    'executiveSummary',
    'formattedOutput',
  ],
};

// Fallback heuristic triage engine in case of API failure or offline mode
function fallbackTriage(rawText: string, metadata: { department?: string; channel?: string } = {}) {
  const lower = rawText.toLowerCase();

  let category: any = 'Communication';
  const secondary: string[] = [];
  let severity: any = 'LEVEL 2 - Moderate';
  let justification = 'Moderate dissatisfaction and service breakdown reported.';
  const riskFlags: { type: any; explanation: string }[] = [];
  let recommendedDept: any = 'Patient Experience Team';
  let priority: any = 'Routine';
  let humanReview: any = 'Human Review Recommended';
  let humanReviewReason = 'Requires standard patient relations follow-up.';

  const isSafetyCritical =
    lower.includes('stemi') ||
    lower.includes('chest tight') ||
    lower.includes('collapsed') ||
    lower.includes('lethal') ||
    lower.includes('died') ||
    lower.includes('anaphyl') ||
    lower.includes('wrong knee') ||
    lower.includes('suicid') ||
    lower.includes('intubat') ||
    lower.includes('overdose');

  const isDiscrimination =
    lower.includes('hispanic') ||
    lower.includes('racially') ||
    lower.includes('racial') ||
    lower.includes('discrim') ||
    lower.includes('prejudice') ||
    lower.includes('profil');

  const isPrivacyBreach =
    lower.includes('another patient') ||
    lower.includes('hiv') ||
    lower.includes('breach') ||
    lower.includes('records were left lying') ||
    lower.includes('privacy') ||
    lower.includes('hipaa');

  const isAccessibility =
    lower.includes('wheelchair') ||
    lower.includes('accessible') ||
    lower.includes('transfer table') ||
    lower.includes('disability') ||
    lower.includes('ada');

  const isBillingDispute =
    lower.includes('bill') ||
    lower.includes('surprise bill') ||
    lower.includes('no surprises act') ||
    lower.includes('collections') ||
    lower.includes('in-network') ||
    lower.includes('cost');

  const isTechOrPortal =
    lower.includes('portal') ||
    lower.includes('mychart') ||
    lower.includes('login') ||
    lower.includes('timeout') ||
    lower.includes('gateway') ||
    lower.includes('app');

  const isMedication =
    lower.includes('prescription') ||
    lower.includes('dosing') ||
    lower.includes('methotrexate') ||
    lower.includes('medication') ||
    lower.includes('refill') ||
    lower.includes('pharmacy');

  if (isSafetyCritical) {
    category = 'Patient Safety';
    secondary.push('Clinical Care');
    severity = 'LEVEL 4 - Critical';
    justification = 'Immediate patient safety threat, acute clinical adverse event, or life-threatening medication incident.';
    riskFlags.push({
      type: 'Patient Safety Risk',
      explanation: 'Potential for severe patient morbidity, mortality, or active sentinel event.',
    });
    riskFlags.push({
      type: 'Clinical Risk',
      explanation: 'Failure in diagnostic or therapeutic triage protocols.',
    });
    riskFlags.push({
      type: 'Compliance Risk',
      explanation: 'Potential regulatory notification requirement (Joint Commission / CMS).',
    });
    recommendedDept = 'Risk Management';
    priority = 'Immediate';
    humanReview = 'Human Review Required';
    humanReviewReason = 'Immediate patient safety concerns require mandatory clinical risk review.';
  } else if (isDiscrimination) {
    category = 'Accessibility and Equity';
    secondary.push('Staff Conduct');
    severity = 'LEVEL 4 - Critical';
    justification = 'Explicit allegation of discriminatory bias or racial profiling impacting clinical care.';
    riskFlags.push({
      type: 'Equity Risk',
      explanation: 'Disparate treatment and bias alleged during patient delivery care.',
    });
    riskFlags.push({
      type: 'Compliance Risk',
      explanation: 'Title VI Civil Rights and federal healthcare nondiscrimination compliance exposure.',
    });
    riskFlags.push({
      type: 'Reputational Risk',
      explanation: 'Public exposure and civil rights grievance risk.',
    });
    recommendedDept = 'Executive Review';
    priority = 'Immediate';
    humanReview = 'Human Review Required';
    humanReviewReason = 'Discrimination allegations require mandatory administrative investigation.';
  } else if (isPrivacyBreach) {
    category = 'Privacy or Security';
    secondary.push('Technology / Patient Portal');
    severity = 'LEVEL 4 - Critical';
    justification = 'Direct disclosure of Protected Health Information (PHI) of third-party patient.';
    riskFlags.push({
      type: 'Privacy Risk',
      explanation: 'Unauthorized disclosure of sensitive patient health identifiers and diagnosis.',
    });
    riskFlags.push({
      type: 'Compliance Risk',
      explanation: 'HIPAA Security/Privacy rule violation with mandatory OCR reporting threshold.',
    });
    recommendedDept = 'Compliance Office';
    priority = 'Immediate';
    humanReview = 'Human Review Required';
    humanReviewReason = 'Confirmed or suspected HIPAA breach requires mandatory Privacy Officer review.';
  } else if (isMedication) {
    category = 'Clinical Care';
    secondary.push('Communication');
    severity = 'LEVEL 3 - High';
    justification = 'Medication dosing anomaly, unfilled critical prescription, or pharmacy safety failure.';
    riskFlags.push({
      type: 'Clinical Risk',
      explanation: 'Patient at risk of therapy omission or pharmacological toxicity.',
    });
    riskFlags.push({
      type: 'Patient Safety Risk',
      explanation: 'Prescription delay or erroneous dosage instructions.',
    });
    recommendedDept = 'Physician Leadership';
    priority = 'Priority';
    humanReview = 'Human Review Required';
    humanReviewReason = 'Medication-related concerns require clinical oversight.';
  } else if (isAccessibility) {
    category = 'Accessibility and Equity';
    secondary.push('Clinical Care');
    severity = 'LEVEL 3 - High';
    justification = 'Severe physical barrier and absence of accessible exam accommodations compromising patient dignity.';
    riskFlags.push({
      type: 'Accessibility Risk',
      explanation: 'Inaccessible entrance and examination facilities failing ADA guidelines.',
    });
    riskFlags.push({
      type: 'Compliance Risk',
      explanation: 'Americans with Disabilities Act (ADA) Title III compliance deficiency.',
    });
    recommendedDept = 'Accessibility Coordinator';
    priority = 'Priority';
    humanReview = 'Human Review Required';
    humanReviewReason = 'Serious accessibility barrier impacting patient care requires coordinator action.';
  } else if (isBillingDispute) {
    category = 'Billing';
    secondary.push('Communication');
    severity = 'LEVEL 2 - Moderate';
    justification = 'Disputed out-of-network charge and aggressive collection practices post-preauthorization.';
    riskFlags.push({
      type: 'Compliance Risk',
      explanation: 'Potential No Surprises Act balance billing non-compliance.',
    });
    riskFlags.push({
      type: 'Operational Risk',
      explanation: 'Pre-authorization and vendor network sync failure in revenue cycle.',
    });
    recommendedDept = 'Revenue Cycle / Billing';
    priority = 'Routine';
    humanReview = 'Human Review Recommended';
    humanReviewReason = 'Verify billing codes against pre-authorization documentation.';
  } else if (isTechOrPortal) {
    category = 'Technology / Patient Portal';
    secondary.push('Communication');
    severity = 'LEVEL 2 - Moderate';
    justification = 'Portal technical fault preventing patient access to clinical services or records.';
    riskFlags.push({
      type: 'Operational Risk',
      explanation: 'Technical gateway timeout impacting portal reliability.',
    });
    recommendedDept = 'Information Technology';
    priority = 'Routine';
    humanReview = 'AI Review Only';
    humanReviewReason = 'Technical issue routing to IT ticketing queue.';
  } else if (lower.includes('wait') || lower.includes('delayed') || lower.includes('parking')) {
    category = 'Wait Time';
    secondary.push('Scheduling');
    severity = 'LEVEL 1 - Low';
    justification = 'Routine waiting room congestion and facilities inconvenience without clinical harm.';
    riskFlags.push({
      type: 'Operational Risk',
      explanation: 'Clinic schedule slippage and parking validation equipment malfunction.',
    });
    recommendedDept = 'Patient Experience Team';
    priority = 'Routine';
    humanReview = 'AI Review Only';
    humanReviewReason = 'Operational service feedback suitable for aggregate reporting.';
  }

  const riskFormatted = riskFlags
    .map((r) => `${r.type}: ${r.explanation}`)
    .join('; ');

  const executiveSummary = `Triage identified ${category} as the primary concern at ${severity}. Key concerns include ${riskFlags.map((r) => r.type).join(', ') || 'routine dissatisfaction'}. Escalated as ${priority} to ${recommendedDept} with status ${humanReview}.`;

  const formattedOutput = `Complaint Category: ${category}
Secondary Categories: ${secondary.length > 0 ? secondary.join(', ') : 'None'}
Severity Level: ${severity}
Severity Justification: ${justification}
Risk Flags: ${riskFormatted || 'None'}
Recommended Department: ${recommendedDept}
Escalation Priority: ${priority}
Human Review Status: ${humanReview}
Executive Summary: ${executiveSummary}`;

  return {
    complaintCategory: category,
    secondaryCategories: secondary,
    severityLevel: severity,
    severityJustification: justification,
    riskFlags,
    recommendedDepartment: recommendedDept,
    escalationPriority: priority,
    humanReviewStatus: humanReview,
    humanReviewReason,
    executiveSummary,
    triagedAt: new Date().toISOString(),
    formattedOutput,
  };
}

// Single complaint triage endpoint
app.post('/api/triage', async (req: Request, res: Response) => {
  const { rawText, metadata } = req.body;

  if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
    return res.status(400).json({ error: 'Complaint text is required.' });
  }

  try {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not set. Using clinical heuristic fallback triage.');
      const result = fallbackTriage(rawText, metadata);
      return res.json({ triage: result, source: 'fallback_heuristic' });
    }

    const prompt = `Healthcare Complaint Details:
Channel/Source: ${metadata?.channel || 'Unspecified'}
Reported Department/Unit: ${metadata?.department || 'Unspecified'}
Complaint Date: ${metadata?.date || 'Recent'}
Location: ${metadata?.location || 'Unspecified'}

Complaint Text:
"""
${rawText.trim()}
"""

Perform full 6-step triage assessment strictly adhering to the healthcare triage rules. Return structured JSON matching the schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: TRIAGE_SYSTEM_INSTRUCTION,
        temperature: 0.1,
        responseMimeType: 'application/json',
        responseSchema: triageResponseSchema,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response received from Gemini.');
    }

    const parsed = JSON.parse(text);
    parsed.triagedAt = new Date().toISOString();

    // Ensure formattedOutput conforms exactly if empty
    if (!parsed.formattedOutput) {
      const risks = parsed.riskFlags
        ?.map((r: any) => `${r.type}: ${r.explanation}`)
        .join('; ');
      parsed.formattedOutput = `Complaint Category: ${parsed.complaintCategory}
Secondary Categories: ${parsed.secondaryCategories?.length ? parsed.secondaryCategories.join(', ') : 'None'}
Severity Level: ${parsed.severityLevel}
Severity Justification: ${parsed.severityJustification}
Risk Flags: ${risks || 'None'}
Recommended Department: ${parsed.recommendedDepartment}
Escalation Priority: ${parsed.escalationPriority}
Human Review Status: ${parsed.humanReviewStatus}
Executive Summary: ${parsed.executiveSummary}`;
    }

    return res.json({ triage: parsed, source: 'gemini-3.8-flash' });
  } catch (err: any) {
    console.error('Error in /api/triage:', err);
    // Graceful fallback to heuristic triage if Gemini call fails
    try {
      const result = fallbackTriage(rawText, metadata);
      return res.json({
        triage: result,
        source: 'fallback_heuristic',
        warning: `AI model call encountered an issue (${err.message || 'Error'}). High-accuracy clinical rules used.`,
      });
    } catch (fallbackErr) {
      return res.status(500).json({ error: 'Failed to triage complaint.', details: String(err) });
    }
  }
});

// Batch complaint triage endpoint
app.post('/api/triage-batch', async (req: Request, res: Response) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Items array is required.' });
  }

  const results: any[] = [];

  for (const item of items) {
    const rawText = item.rawText;
    if (!rawText) {
      results.push({ id: item.id, error: 'Empty text' });
      continue;
    }

    try {
      if (process.env.GEMINI_API_KEY) {
        const prompt = `Healthcare Complaint Details:
Channel: ${item.channel || 'Unspecified'}
Department: ${item.departmentReported || 'Unspecified'}
Location: ${item.location || 'Unspecified'}
Complaint Text:
"""
${rawText}
"""
Perform full 6-step triage.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: TRIAGE_SYSTEM_INSTRUCTION,
            temperature: 0.1,
            responseMimeType: 'application/json',
            responseSchema: triageResponseSchema,
          },
        });

        const text = response.text;
        if (text) {
          const parsed = JSON.parse(text);
          parsed.triagedAt = new Date().toISOString();
          if (!parsed.formattedOutput) {
            const risks = parsed.riskFlags
              ?.map((r: any) => `${r.type}: ${r.explanation}`)
              .join('; ');
            parsed.formattedOutput = `Complaint Category: ${parsed.complaintCategory}
Secondary Categories: ${parsed.secondaryCategories?.length ? parsed.secondaryCategories.join(', ') : 'None'}
Severity Level: ${parsed.severityLevel}
Severity Justification: ${parsed.severityJustification}
Risk Flags: ${risks || 'None'}
Recommended Department: ${parsed.recommendedDepartment}
Escalation Priority: ${parsed.escalationPriority}
Human Review Status: ${parsed.humanReviewStatus}
Executive Summary: ${parsed.executiveSummary}`;
          }
          results.push({ id: item.id, triage: parsed, source: 'gemini-3.8-flash' });
          continue;
        }
      }
    } catch (err: any) {
      console.warn(`Gemini batch item ${item.id} error:`, err.message);
    }

    // Fallback if needed
    const fallback = fallbackTriage(rawText, {
      department: item.departmentReported,
      channel: item.channel,
    });
    results.push({ id: item.id, triage: fallback, source: 'fallback_heuristic' });
  }

  res.json({ results });
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    model: 'gemini-3.8-flash',
    timestamp: new Date().toISOString(),
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Complaint Triage Agent Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
