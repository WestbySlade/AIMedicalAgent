import React from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  UserCheck,
  Zap,
  Layers,
  FileCheck2,
} from 'lucide-react';
import { ComplaintRecord, SeverityLevel } from '../types';

interface MetricCardsProps {
  records: ComplaintRecord[];
  onFilterSeverity?: (severity: SeverityLevel | 'all') => void;
  onFilterHumanReview?: (status: string | 'all') => void;
  onFilterPriority?: (priority: string | 'all') => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  records,
  onFilterSeverity,
  onFilterHumanReview,
  onFilterPriority,
}) => {
  const total = records.length;
  const triaged = records.filter((r) => r.status === 'triaged' && r.triage);
  const triagedCount = triaged.length;

  const criticalCount = triaged.filter(
    (r) => (r.humanSignoff?.adjustedSeverity || r.triage?.severityLevel) === 'LEVEL 4 - Critical'
  ).length;
  const highCount = triaged.filter(
    (r) => (r.humanSignoff?.adjustedSeverity || r.triage?.severityLevel) === 'LEVEL 3 - High'
  ).length;
  const moderateCount = triaged.filter(
    (r) => (r.humanSignoff?.adjustedSeverity || r.triage?.severityLevel) === 'LEVEL 2 - Moderate'
  ).length;
  const lowCount = triaged.filter(
    (r) => (r.humanSignoff?.adjustedSeverity || r.triage?.severityLevel) === 'LEVEL 1 - Low'
  ).length;

  const humanReviewReqCount = triaged.filter(
    (r) => r.triage?.humanReviewStatus === 'Human Review Required'
  ).length;

  const immediateCount = triaged.filter(
    (r) => r.triage?.escalationPriority === 'Immediate'
  ).length;

  const signedOffCount = records.filter((r) => r.humanSignoff?.reviewed).length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
      {/* Total Ingestion */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-sm hover:border-slate-300 transition flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Queue Total</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-slate-900">{total}</span>
            <span className="text-xs text-slate-500 font-medium">
              {triagedCount} triaged
            </span>
          </div>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
          <div
            className="bg-teal-600 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${total ? (triagedCount / total) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Level 4 Critical */}
      <div
        onClick={() => onFilterSeverity?.('LEVEL 4 - Critical')}
        className="bg-red-50/80 border border-red-200 rounded-xl p-3.5 shadow-sm cursor-pointer hover:bg-red-100 transition group flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between text-red-700 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Level 4 • Critical</span>
            <AlertOctagon className="w-4 h-4 text-red-600 group-hover:scale-110 transition" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-extrabold text-red-950">{criticalCount}</span>
            <span className="text-xs text-red-600 font-medium">urgent risks</span>
          </div>
        </div>
        <p className="text-[11px] text-red-700/90 mt-2 truncate font-medium">
          Patient safety / Legal / Bias
        </p>
      </div>

      {/* Level 3 High */}
      <div
        onClick={() => onFilterSeverity?.('LEVEL 3 - High')}
        className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 shadow-sm cursor-pointer hover:bg-amber-100 transition group flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between text-amber-800 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Level 3 • High</span>
            <AlertTriangle className="w-4 h-4 text-amber-600 group-hover:scale-110 transition" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-extrabold text-amber-950">{highCount}</span>
            <span className="text-xs text-amber-700 font-medium">clinical alerts</span>
          </div>
        </div>
        <p className="text-[11px] text-amber-800/90 mt-2 truncate font-medium">
          Meds / Potential harm / Access
        </p>
      </div>

      {/* Human Review Required */}
      <div
        onClick={() => onFilterHumanReview?.('Human Review Required')}
        className="bg-indigo-50/80 border border-indigo-200 rounded-xl p-3.5 shadow-sm cursor-pointer hover:bg-indigo-100 transition group flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between text-indigo-800 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Human Review</span>
            <UserCheck className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-extrabold text-indigo-950">{humanReviewReqCount}</span>
            <span className="text-xs text-indigo-600 font-medium">mandatory</span>
          </div>
        </div>
        <p className="text-[11px] text-indigo-800/90 mt-2 truncate font-medium">
          {signedOffCount} completed sign-offs
        </p>
      </div>

      {/* Immediate Escalation */}
      <div
        onClick={() => onFilterPriority?.('Immediate')}
        className="bg-rose-50/80 border border-rose-200 rounded-xl p-3.5 shadow-sm cursor-pointer hover:bg-rose-100 transition group flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between text-rose-800 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Immediate</span>
            <Zap className="w-4 h-4 text-rose-600 group-hover:scale-110 transition animate-pulse" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-extrabold text-rose-950">{immediateCount}</span>
            <span className="text-xs text-rose-600 font-medium">escalations</span>
          </div>
        </div>
        <p className="text-[11px] text-rose-800/90 mt-2 truncate font-medium">
          Direct to leadership / Risk
        </p>
      </div>

      {/* Low & Moderate */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-slate-600 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Low / Moderate</span>
            <FileCheck2 className="w-4 h-4 text-slate-500" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-extrabold text-slate-800">{lowCount + moderateCount}</span>
            <span className="text-xs text-slate-500 font-medium">routine cases</span>
          </div>
        </div>
        <p className="text-[11px] text-slate-500 mt-2 truncate font-medium">
          Experience & Billing queues
        </p>
      </div>
    </div>
  );
};
