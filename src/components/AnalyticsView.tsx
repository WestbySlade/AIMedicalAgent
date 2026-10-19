import React from 'react';
import {
  BarChart3,
  ShieldAlert,
  AlertTriangle,
  AlertOctagon,
  Building2,
  UserCheck,
  Zap,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';
import { ComplaintRecord } from '../types';

interface AnalyticsViewProps {
  records: ComplaintRecord[];
  onSelectComplaint: (record: ComplaintRecord) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ records, onSelectComplaint }) => {
  const triaged = records.filter((r) => r.status === 'triaged' && r.triage);

  if (triaged.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-2xl mx-auto shadow-sm">
        <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">No Triaged Data Available</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Please run triage on pending complaints or load one of our realistic sample datasets to view risk intelligence and department workload analytics.
        </p>
      </div>
    );
  }

  // Severity count
  const severityCounts: Record<string, number> = {
    'LEVEL 4 - Critical': 0,
    'LEVEL 3 - High': 0,
    'LEVEL 2 - Moderate': 0,
    'LEVEL 1 - Low': 0,
  };

  // Human review count
  const humanReviewCounts: Record<string, number> = {
    'Human Review Required': 0,
    'Human Review Recommended': 0,
    'AI Review Only': 0,
  };

  // Department counts
  const deptCounts: Record<string, number> = {};

  // Risk counts
  const riskCounts: Record<string, number> = {};

  // Priority counts
  const priorityCounts: Record<string, number> = {
    Immediate: 0,
    Priority: 0,
    Routine: 0,
  };

  triaged.forEach((r) => {
    const t = r.triage!;
    if (t.severityLevel in severityCounts) {
      severityCounts[t.severityLevel]++;
    }
    if (t.humanReviewStatus in humanReviewCounts) {
      humanReviewCounts[t.humanReviewStatus]++;
    }
    deptCounts[t.recommendedDepartment] = (deptCounts[t.recommendedDepartment] || 0) + 1;
    if (t.escalationPriority in priorityCounts) {
      priorityCounts[t.escalationPriority]++;
    }
    t.riskFlags?.forEach((rf) => {
      riskCounts[rf.type] = (riskCounts[rf.type] || 0) + 1;
    });
  });

  const sortedRisks = Object.entries(riskCounts).sort((a, b) => b[1] - a[1]);
  const sortedDepts = Object.entries(deptCounts).sort((a, b) => b[1] - a[1]);

  const urgentComplaints = triaged.filter(
    (r) =>
      r.triage?.severityLevel === 'LEVEL 4 - Critical' ||
      r.triage?.escalationPriority === 'Immediate'
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-lg text-white">Risk Intelligence & Governance Dashboard</span>
            <span className="text-xs px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
              Live Aggregate
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated cross-departmental incident distribution, sentinel risk prevalence, and oversight compliance metrics.
          </p>
        </div>

        <div className="flex items-center space-x-4 text-xs font-medium">
          <div className="bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase">Triaged Volume</span>
            <span className="text-lg font-bold text-teal-300">{triaged.length} records</span>
          </div>
          <div className="bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase">Immediate Escalations</span>
            <span className="text-lg font-bold text-rose-400">{priorityCounts.Immediate} cases</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Severity Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Severity Distribution
            </span>
            <AlertOctagon className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3 text-xs">
            {/* Level 4 */}
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-red-700">Level 4 - Critical</span>
                <span className="text-red-900">{severityCounts['LEVEL 4 - Critical']}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-red-600 h-2 rounded-full"
                  style={{ width: `${(severityCounts['LEVEL 4 - Critical'] / triaged.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Level 3 */}
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-amber-700">Level 3 - High</span>
                <span className="text-amber-900">{severityCounts['LEVEL 3 - High']}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-2 rounded-full"
                  style={{ width: `${(severityCounts['LEVEL 3 - High'] / triaged.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Level 2 */}
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-sky-700">Level 2 - Moderate</span>
                <span className="text-sky-900">{severityCounts['LEVEL 2 - Moderate']}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-sky-600 h-2 rounded-full"
                  style={{ width: `${(severityCounts['LEVEL 2 - Moderate'] / triaged.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Level 1 */}
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-teal-700">Level 1 - Low</span>
                <span className="text-teal-900">{severityCounts['LEVEL 1 - Low']}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-teal-500 h-2 rounded-full"
                  style={{ width: `${(severityCounts['LEVEL 1 - Low'] / triaged.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Human Oversight Enforcement */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Human Review Requirement
            </span>
            <UserCheck className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex justify-between font-bold text-red-900 mb-0.5">
                <span>Human Review Required</span>
                <span>{humanReviewCounts['Human Review Required']} cases</span>
              </div>
              <p className="text-[11px] text-red-700">
                Triggered for patient safety, civil rights bias, HIPAA privacy, or legal risks.
              </p>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex justify-between font-bold text-amber-900 mb-0.5">
                <span>Human Review Recommended</span>
                <span>{humanReviewCounts['Human Review Recommended']} cases</span>
              </div>
              <p className="text-[11px] text-amber-700">
                Complex service recovery, disputed billing, or clinical coordination.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex justify-between font-bold text-slate-800 mb-0.5">
                <span>AI Review Only</span>
                <span>{humanReviewCounts['AI Review Only']} cases</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Routine feedback, simple wait time comments, or IT system tickets.
              </p>
            </div>
          </div>
        </div>

        {/* Priority SLA Queues */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Escalation Priority Tiers
            </span>
            <Zap className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-rose-50 border border-rose-200 rounded-xl">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
                <span className="font-bold text-rose-950">Immediate Escalation</span>
              </div>
              <span className="font-extrabold text-rose-800 text-sm">{priorityCounts.Immediate}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="font-bold text-amber-950">Priority Escalation</span>
              </div>
              <span className="font-extrabold text-amber-800 text-sm">{priorityCounts.Priority}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span className="font-bold text-slate-800">Routine Escalation</span>
              </div>
              <span className="font-extrabold text-slate-700 text-sm">{priorityCounts.Routine}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Categories & Routing Department Queues */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Identified Risk Categories */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Prevalent Clinical & Operational Risks
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {sortedRisks.length > 0 ? (
              sortedRisks.map(([riskType, count]) => (
                <div key={riskType} className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">{riskType}</span>
                  <div className="flex items-center space-x-2 w-1/2 justify-end">
                    <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-red-500 h-1.5 rounded-full"
                        style={{ width: `${(count / triaged.length) * 100}%` }}
                      />
                    </div>
                    <span className="font-bold text-slate-900 w-5 text-right">{count}</span>
                  </div>
                </div>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">No specific risk flags recorded.</span>
            )}
          </div>
        </div>

        {/* Department Workloads */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Target Department Routing Queues
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {sortedDepts.map(([dept, count]) => (
              <div key={dept} className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700 truncate pr-2">{dept}</span>
                <div className="flex items-center space-x-2 w-1/2 justify-end shrink-0">
                  <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full"
                      style={{ width: `${(count / triaged.length) * 100}%` }}
                    />
                  </div>
                  <span className="font-bold text-slate-900 w-5 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Urgent Clinical Incident Attention List */}
      {urgentComplaints.length > 0 && (
        <div className="bg-white rounded-2xl border border-red-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-red-100">
            <div className="flex items-center space-x-2">
              <AlertOctagon className="w-4 h-4 text-red-600" />
              <span className="text-xs font-bold text-red-900 uppercase tracking-wider">
                Urgent Sentinel Attention List ({urgentComplaints.length} cases)
              </span>
            </div>
            <span className="text-[11px] text-red-600 font-semibold">Immediate Action Required</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {urgentComplaints.map((c) => (
              <div
                key={c.id}
                onClick={() => onSelectComplaint(c)}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 cursor-pointer p-2 rounded-lg transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-slate-900">{c.id}</span>
                    <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold text-[10px]">
                      {c.triage?.severityLevel}
                    </span>
                    <span className="text-slate-500 font-medium">
                      Route: {c.triage?.recommendedDepartment}
                    </span>
                  </div>
                  <p className="text-slate-600 line-clamp-1 italic">"{c.rawText}"</p>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-1 rounded border border-rose-200">
                    {c.triage?.escalationPriority}
                  </span>
                  <span className="text-xs text-teal-700 font-medium hover:underline">
                    View 6-Step Triage →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
