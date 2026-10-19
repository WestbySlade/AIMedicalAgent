import React from 'react';
import {
  ShieldAlert,
  FileSpreadsheet,
  PlusCircle,
  Download,
  RotateCcw,
  Sparkles,
  Layers,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'triage' | 'adhoc' | 'analytics';
  setActiveTab: (tab: 'triage' | 'adhoc' | 'analytics') => void;
  onOpenUpload: () => void;
  onOpenAdHoc: () => void;
  onLoadSample: (datasetId: string) => void;
  onExportCSV: () => void;
  onReset: () => void;
  totalComplaints: number;
  triagedCount: number;
  hasApiKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenUpload,
  onOpenAdHoc,
  onLoadSample,
  onExportCSV,
  onReset,
  totalComplaints,
  triagedCount,
  hasApiKey,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Navigation Row */}
        <div className="py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80">
          {/* Logo & Clinical Title */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-400/30 flex items-center justify-center text-teal-400 shadow-inner">
              <ShieldAlert className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-white">
                  ClinicalTriage AI
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Complaint Triage Agent
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block">
                Healthcare Complaint Review • Severity Assessment • Escalation Routing • Human Oversight
              </p>
            </div>
          </div>

          {/* Top Actions: Sample Data, Import, Export, Reset */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Load Sample Dropdown */}
            <div className="relative group">
              <button
                type="button"
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-sm transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Sample Datasets</span>
              </button>
              <div className="absolute right-0 mt-1 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 hidden group-hover:block z-50 text-xs">
                <div className="px-3.5 py-1.5 font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                  Clinical Pre-Configured Streams
                </div>
                <button
                  type="button"
                  onClick={() => onLoadSample('diverse-mix')}
                  className="w-full text-left px-3.5 py-2.5 text-slate-200 hover:bg-slate-700 hover:text-white flex flex-col transition"
                >
                  <span className="font-semibold text-white">Hospital Grievance & Portal Stream</span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    8 cases: acute STEMI, medication error, racial profiling, HIPAA breach, billing
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onLoadSample('safety-sentinel')}
                  className="w-full text-left px-3.5 py-2.5 text-slate-200 hover:bg-slate-700 hover:text-white flex flex-col border-t border-slate-700/60 transition"
                >
                  <span className="font-semibold text-rose-400">High-Risk Sentinel & Regulatory Escalations</span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    3 critical cases: wrong-site surgery, anaphylaxis error, suicidal elopement
                  </span>
                </button>
              </div>
            </div>

            {/* Import CSV / Excel */}
            <button
              onClick={onOpenUpload}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 shadow transition"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Import CSV / Excel</span>
            </button>

            {/* Export CSV */}
            {totalComplaints > 0 && (
              <button
                onClick={onExportCSV}
                title="Export Triaged Complaints to CSV"
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </button>
            )}

            {/* Reset */}
            {totalComplaints > 0 && (
              <button
                onClick={onReset}
                title="Reset queue"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 border border-slate-700 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Sub-bar: Navigation Tabs & Safety Guardrail Banner */}
        <div className="py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Tabs */}
          <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700/70">
            <button
              onClick={() => setActiveTab('triage')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg font-semibold transition ${
                activeTab === 'triage'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Triage Queue</span>
              {totalComplaints > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[11px] bg-slate-900 text-teal-300 font-mono">
                  {triagedCount}/{totalComplaints}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('adhoc')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg font-semibold transition ${
                activeTab === 'adhoc'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Live Triage</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg font-semibold transition ${
                activeTab === 'analytics'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Risk Intelligence</span>
            </button>
          </div>

          {/* Compliance & Engine Status */}
          <div className="flex items-center space-x-3 text-[11px]">
            <span className="flex items-center text-teal-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Human Oversight Mandate Active
            </span>
            <span className="text-slate-600">•</span>
            <div className="flex items-center space-x-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300 font-medium">
                Engine: Gemini 3.8 Flash + Safety Rules
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
