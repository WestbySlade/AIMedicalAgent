import React, { useState } from 'react';
import {
  X,
  AlertOctagon,
  AlertTriangle,
  ShieldCheck,
  UserCheck,
  Building2,
  Clock,
  FileText,
  Copy,
  Check,
  Printer,
  ChevronRight,
  Edit3,
  BadgeAlert,
  HelpCircle,
  ExternalLink,
  MessageSquare,
  ShieldAlert,
} from 'lucide-react';
import {
  ComplaintRecord,
  SeverityLevel,
  RecommendedDepartment,
  HumanReviewRequirement,
} from '../types';

interface TriageInspectorModalProps {
  complaint: ComplaintRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveSignoff?: (
    id: string,
    signoff: {
      reviewed: boolean;
      reviewerName: string;
      reviewDate: string;
      adjustedSeverity?: SeverityLevel;
      adjustedDepartment?: RecommendedDepartment;
      notes: string;
    }
  ) => void;
  onReTriage?: (complaint: ComplaintRecord) => void;
}

export const TriageInspectorModal: React.FC<TriageInspectorModalProps> = ({
  complaint,
  isOpen,
  onClose,
  onSaveSignoff,
  onReTriage,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSigningOff, setIsSigningOff] = useState(false);
  const [reviewerName, setReviewerName] = useState(
    complaint?.humanSignoff?.reviewerName || 'Dr. Eleanor Vance, MD (Chief Medical Officer)'
  );
  const [reviewNotes, setReviewNotes] = useState(complaint?.humanSignoff?.notes || '');
  const [adjustedSeverity, setAdjustedSeverity] = useState<SeverityLevel | undefined>(
    complaint?.humanSignoff?.adjustedSeverity || complaint?.triage?.severityLevel
  );
  const [adjustedDepartment, setAdjustedDepartment] = useState<RecommendedDepartment | undefined>(
    complaint?.humanSignoff?.adjustedDepartment || complaint?.triage?.recommendedDepartment
  );

  if (!isOpen || !complaint) return null;

  const { triage } = complaint;

  const handleCopyFormatted = () => {
    if (!triage?.formattedOutput) return;
    navigator.clipboard.writeText(triage.formattedOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSignOffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSaveSignoff) return;
    onSaveSignoff(complaint.id, {
      reviewed: true,
      reviewerName,
      reviewDate: new Date().toISOString(),
      adjustedSeverity: adjustedSeverity !== triage?.severityLevel ? adjustedSeverity : undefined,
      adjustedDepartment: adjustedDepartment !== triage?.recommendedDepartment ? adjustedDepartment : undefined,
      notes: reviewNotes,
    });
    setIsSigningOff(false);
  };

  const getSeverityBadge = (level?: SeverityLevel) => {
    switch (level) {
      case 'LEVEL 4 - Critical':
        return {
          bg: 'bg-red-600 text-white',
          border: 'border-red-700',
          badge: 'bg-red-100 text-red-800 border-red-300',
          icon: AlertOctagon,
          label: 'Critical • Level 4',
        };
      case 'LEVEL 3 - High':
        return {
          bg: 'bg-amber-500 text-white',
          border: 'border-amber-600',
          badge: 'bg-amber-100 text-amber-900 border-amber-300',
          icon: AlertTriangle,
          label: 'High • Level 3',
        };
      case 'LEVEL 2 - Moderate':
        return {
          bg: 'bg-sky-600 text-white',
          border: 'border-sky-700',
          badge: 'bg-sky-100 text-sky-800 border-sky-300',
          icon: ShieldAlert,
          label: 'Moderate • Level 2',
        };
      case 'LEVEL 1 - Low':
      default:
        return {
          bg: 'bg-teal-600 text-white',
          border: 'border-teal-700',
          badge: 'bg-teal-100 text-teal-800 border-teal-300',
          icon: ShieldCheck,
          label: 'Low • Level 1',
        };
    }
  };

  const getPriorityBadge = (p?: string) => {
    if (p === 'Immediate') {
      return 'bg-rose-600 text-white animate-pulse';
    }
    if (p === 'Priority') {
      return 'bg-amber-500 text-slate-950 font-semibold';
    }
    return 'bg-slate-200 text-slate-800';
  };

  const getHumanReviewBadge = (status?: HumanReviewRequirement) => {
    if (status === 'Human Review Required') {
      return {
        bg: 'bg-red-50 text-red-800 border-red-300',
        dot: 'bg-red-600',
        text: 'Mandatory Human Review Required',
      };
    }
    if (status === 'Human Review Recommended') {
      return {
        bg: 'bg-amber-50 text-amber-800 border-amber-300',
        dot: 'bg-amber-500',
        text: 'Human Review Recommended',
      };
    }
    return {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      dot: 'bg-emerald-500',
      text: 'AI Review Only',
    };
  };

  const currentSeverity = complaint.humanSignoff?.adjustedSeverity || triage?.severityLevel;
  const currentDept = complaint.humanSignoff?.adjustedDepartment || triage?.recommendedDepartment;
  const sevConfig = getSeverityBadge(currentSeverity);
  const humanReviewConfig = getHumanReviewBadge(triage?.humanReviewStatus);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-xs px-2 py-1 rounded bg-slate-800 text-teal-300 border border-slate-700">
              {complaint.id}
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">Clinical Triage Assessment</h3>
                {complaint.humanSignoff?.reviewed && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <Check className="w-3 h-3 mr-1" />
                    Human Review Completed
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {complaint.date || 'Recent'} • {complaint.channel || 'Intake Portal'} • {complaint.departmentReported || 'Department Unspecified'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              title="Print clinical review summary"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Patient Complaint Raw Narrative Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
              <span className="flex items-center space-x-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                <span className="uppercase tracking-wider">Patient Narrative / Complaint Submission</span>
              </span>
              {complaint.patientId && (
                <span className="font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                  MRN: {complaint.patientId}
                </span>
              )}
            </div>
            <p className="text-slate-800 text-sm leading-relaxed font-sans bg-white p-3.5 rounded-lg border border-slate-200/80 shadow-inner">
              "{complaint.rawText}"
            </p>
          </div>

          {/* If not yet triaged */}
          {!triage ? (
            <div className="text-center py-8 bg-slate-50 border border-slate-200 rounded-xl p-6">
              <BadgeAlert className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-slate-800">Pending Triage Execution</h4>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                This complaint is in the ingestion queue and has not yet been processed by the 6-step triage agent.
              </p>
              {onReTriage && (
                <button
                  onClick={() => onReTriage(complaint)}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg shadow transition"
                >
                  Run 6-Step Triage Now
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Top Triage Banner (Severity + Priority + Route + Human Review) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Severity Card */}
                <div className={`p-3.5 rounded-xl border ${sevConfig.border} ${sevConfig.badge} shadow-sm`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider">STEP 2: Severity</span>
                    <sevConfig.icon className="w-4 h-4" />
                  </div>
                  <div className="text-sm font-bold">{currentSeverity}</div>
                  <div className="text-[11px] opacity-80 mt-1 line-clamp-1">
                    {triage.severityJustification}
                  </div>
                </div>

                {/* Routing Department */}
                <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/70 text-blue-900 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                      STEP 4: Route To
                    </span>
                    <Building2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-sm font-bold">{currentDept}</div>
                  <div className="text-[11px] text-blue-700 mt-1">Escalated Department</div>
                </div>

                {/* Escalation Priority */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      Escalation Priority
                    </span>
                    <Clock className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold ${getPriorityBadge(triage.escalationPriority)}`}>
                      {triage.escalationPriority}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">SLA response tier</div>
                </div>

                {/* Human Review Status */}
                <div className={`p-3.5 rounded-xl border ${humanReviewConfig.bg} shadow-sm`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider">STEP 5: Human Review</span>
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div className="flex items-center space-x-1.5 text-xs font-bold">
                    <span className={`w-2 h-2 rounded-full ${humanReviewConfig.dot}`} />
                    <span>{triage.humanReviewStatus}</span>
                  </div>
                  <div className="text-[11px] opacity-85 mt-1 line-clamp-1">
                    {triage.humanReviewReason || 'Oversight protocol evaluation'}
                  </div>
                </div>
              </div>

              {/* STEP 1 & STEP 2 Detailed breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* STEP 1: Categories */}
                <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      STEP 1: Complaint Category
                    </span>
                    <span className="text-[11px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-medium">
                      Primary Classification
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-slate-500 block mb-1">Primary Category:</span>
                      <span className="inline-block px-3 py-1 bg-slate-900 text-teal-300 font-semibold text-xs rounded-lg shadow-sm">
                        {triage.complaintCategory}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs text-slate-500 block mb-1">Secondary Categories:</span>
                      {triage.secondaryCategories && triage.secondaryCategories.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {triage.secondaryCategories.map((cat, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded border border-slate-200 font-medium"
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">None identified</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* STEP 2: Severity Justification */}
                <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      STEP 2: Severity Justification
                    </span>
                    <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      Clinical Risk Grading
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-800">Assigned Level:</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${sevConfig.bg}`}>
                        {currentSeverity}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                      {triage.severityJustification}
                    </p>
                  </div>
                </div>
              </div>

              {/* STEP 3: Risk Detection Flags */}
              <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      STEP 3: Risk Detection
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.2 bg-red-100 text-red-800 rounded-full">
                      {triage.riskFlags?.length || 0} Flags Identified
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Patient Safety • Clinical • Compliance • Privacy • Equity
                  </span>
                </div>

                {triage.riskFlags && triage.riskFlags.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {triage.riskFlags.map((risk, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-red-50/60 border border-red-200 rounded-lg text-xs"
                      >
                        <div className="flex items-center space-x-1.5 text-red-900 font-bold mb-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                          <span>{risk.type}</span>
                        </div>
                        <p className="text-red-950/80 leading-snug">{risk.explanation}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic p-2 bg-slate-50 rounded">
                    No acute clinical or regulatory risk flags identified for this complaint.
                  </p>
                )}
              </div>

              {/* STEP 6: Executive Summary */}
              <div className="border border-teal-200 rounded-xl p-4 bg-teal-50/40 shadow-sm">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-teal-100">
                  <span className="text-xs font-bold text-teal-900 uppercase tracking-wider">
                    STEP 6: Executive Summary
                  </span>
                  <span className="text-[11px] font-semibold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                    Leadership Triage Memo
                  </span>
                </div>
                <p className="text-xs text-teal-950 font-medium leading-relaxed">
                  {triage.executiveSummary}
                </p>
              </div>

              {/* Exact Requested Output Format Display & Copy */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-900 text-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-teal-400" />
                    <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                      OUTPUT FORMAT (Standardized Triage Protocol)
                    </span>
                  </div>
                  <button
                    onClick={handleCopyFormatted}
                    className="flex items-center space-x-1 px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-teal-300 hover:text-white rounded border border-slate-700 transition"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Output</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed overflow-x-auto bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                  {triage.formattedOutput}
                </pre>
              </div>

              {/* Clinical Supervisor Oversight & Sign-Off Section */}
              <div className="border border-slate-300 rounded-xl p-4 bg-slate-50 shadow-sm">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
                  <div className="flex items-center space-x-2">
                    <UserCheck className="w-4 h-4 text-slate-700" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Human Reviewer Sign-Off & Clinical Oversight
                    </span>
                  </div>
                  {complaint.humanSignoff?.reviewed ? (
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                      Approved by {complaint.humanSignoff.reviewerName} on{' '}
                      {new Date(complaint.humanSignoff.reviewDate).toLocaleDateString()}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsSigningOff(!isSigningOff)}
                      className="flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded bg-teal-600 hover:bg-teal-500 text-white transition"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>{isSigningOff ? 'Cancel Sign-Off' : 'Perform Human Review'}</span>
                    </button>
                  )}
                </div>

                {/* Show existing sign-off details if present */}
                {complaint.humanSignoff?.reviewed && !isSigningOff && (
                  <div className="space-y-2 text-xs">
                    {complaint.humanSignoff.adjustedSeverity && (
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-500">Overridden Severity:</span>
                        <span className="font-semibold text-red-700">
                          {complaint.humanSignoff.adjustedSeverity}
                        </span>
                      </div>
                    )}
                    {complaint.humanSignoff.adjustedDepartment && (
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-500">Re-routed Department:</span>
                        <span className="font-semibold text-blue-700">
                          {complaint.humanSignoff.adjustedDepartment}
                        </span>
                      </div>
                    )}
                    {complaint.humanSignoff.notes && (
                      <div className="bg-white p-2.5 rounded border border-slate-200 text-slate-800">
                        <span className="font-semibold block mb-0.5 text-slate-600">Reviewer Notes:</span>
                        {complaint.humanSignoff.notes}
                      </div>
                    )}
                    <button
                      onClick={() => setIsSigningOff(true)}
                      className="text-xs text-teal-700 hover:underline pt-1"
                    >
                      Edit sign-off or notes
                    </button>
                  </div>
                )}

                {/* Sign-off Form */}
                {isSigningOff && (
                  <form onSubmit={handleSignOffSubmit} className="space-y-3 pt-2 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">
                          Reviewer Name & Credential
                        </label>
                        <input
                          type="text"
                          required
                          value={reviewerName}
                          onChange={(e) => setReviewerName(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-teal-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-medium mb-1">
                          Override Severity (Optional)
                        </label>
                        <select
                          value={adjustedSeverity}
                          onChange={(e) => setAdjustedSeverity(e.target.value as SeverityLevel)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-teal-500"
                        >
                          <option value="LEVEL 1 - Low">LEVEL 1 - Low</option>
                          <option value="LEVEL 2 - Moderate">LEVEL 2 - Moderate</option>
                          <option value="LEVEL 3 - High">LEVEL 3 - High</option>
                          <option value="LEVEL 4 - Critical">LEVEL 4 - Critical</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-medium mb-1">
                          Re-Route Department (Optional)
                        </label>
                        <select
                          value={adjustedDepartment}
                          onChange={(e) => setAdjustedDepartment(e.target.value as RecommendedDepartment)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-teal-500"
                        >
                          <option value="Patient Experience Team">Patient Experience Team</option>
                          <option value="Nursing Leadership">Nursing Leadership</option>
                          <option value="Physician Leadership">Physician Leadership</option>
                          <option value="Quality Improvement Team">Quality Improvement Team</option>
                          <option value="Compliance Office">Compliance Office</option>
                          <option value="Information Technology">Information Technology</option>
                          <option value="Revenue Cycle / Billing">Revenue Cycle / Billing</option>
                          <option value="Accessibility Coordinator">Accessibility Coordinator</option>
                          <option value="Risk Management">Risk Management</option>
                          <option value="Executive Review">Executive Review</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Clinical & Administrative Review Notes
                      </label>
                      <textarea
                        rows={2}
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder="Document investigation outcome, root cause notes, or direct patient contact..."
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div className="flex items-center justify-end space-x-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsSigningOff(false)}
                        className="px-3 py-1.5 text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Confirm Human Sign-Off</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 shrink-0">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-700">Triage Agent Directive:</span>
            <span>Identify what happened, severity, routing, priority, and human review threshold.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
