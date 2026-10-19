export type PrimaryCategory =
  | 'Communication'
  | 'Scheduling'
  | 'Wait Time'
  | 'Technology / Patient Portal'
  | 'Billing'
  | 'Clinical Care'
  | 'Discharge and Follow-Up'
  | 'Accessibility and Equity'
  | 'Patient Safety'
  | 'Privacy or Security'
  | 'Staff Conduct'
  | 'Other';

export type SeverityLevel =
  | 'LEVEL 1 - Low'
  | 'LEVEL 2 - Moderate'
  | 'LEVEL 3 - High'
  | 'LEVEL 4 - Critical';

export type RiskFlagType =
  | 'Patient Safety Risk'
  | 'Clinical Risk'
  | 'Compliance Risk'
  | 'Privacy Risk'
  | 'Accessibility Risk'
  | 'Equity Risk'
  | 'Reputational Risk'
  | 'Operational Risk';

export interface FlaggedRisk {
  type: RiskFlagType;
  explanation: string;
}

export type RecommendedDepartment =
  | 'Patient Experience Team'
  | 'Nursing Leadership'
  | 'Physician Leadership'
  | 'Quality Improvement Team'
  | 'Compliance Office'
  | 'Information Technology'
  | 'Revenue Cycle / Billing'
  | 'Accessibility Coordinator'
  | 'Risk Management'
  | 'Executive Review';

export type EscalationPriority = 'Routine' | 'Priority' | 'Immediate';

export type HumanReviewRequirement =
  | 'AI Review Only'
  | 'Human Review Recommended'
  | 'Human Review Required';

export interface TriageResult {
  complaintCategory: PrimaryCategory;
  secondaryCategories: string[];
  severityLevel: SeverityLevel;
  severityJustification: string;
  riskFlags: FlaggedRisk[];
  recommendedDepartment: RecommendedDepartment;
  escalationPriority: EscalationPriority;
  humanReviewStatus: HumanReviewRequirement;
  humanReviewReason?: string;
  executiveSummary: string;
  triagedAt: string;
  formattedOutput: string;
}

export interface ComplaintRecord {
  id: string;
  date?: string;
  patientId?: string;
  channel?: string;
  departmentReported?: string;
  location?: string;
  rawText: string;
  status: 'pending' | 'triaging' | 'triaged' | 'error';
  triage?: TriageResult;
  error?: string;
  humanSignoff?: {
    reviewed: boolean;
    reviewerName: string;
    reviewDate: string;
    adjustedSeverity?: SeverityLevel;
    adjustedDepartment?: RecommendedDepartment;
    notes: string;
  };
}

export interface TriageBatchStats {
  total: number;
  triaged: number;
  pending: number;
  criticalCount: number;
  highCount: number;
  moderateCount: number;
  lowCount: number;
  humanReviewRequiredCount: number;
  immediatePriorityCount: number;
  topRiskFlag: string;
}
