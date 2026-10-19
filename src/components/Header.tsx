import React from 'react';
import {
  ShieldAlert,
  FileSpreadsheet,
  PlusCircle,
  Activity,
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
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Clinical System Branding */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-400/30 flex items-center justify-center text-teal-400 shadow-inner">
              <ShieldAlert className="w-6 h-6 text-teal-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">ClinicalTriage AI</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Healthcare Triage Agent
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Clinical Risk Detection • Severity Scoring • Escalation Routing • Human Oversight
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center bg-slate-800/80 p-1 rounded-lg border border-slate-700/60 text-sm">
            <button
              onClick={() => setActiveTab('triage')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'triage'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Triage Queue</span>
              {totalComplaints > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-xs bg-slate-900 text-teal-300">
                  {triagedCount}/{totalComplaints}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('adhoc')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'adhoc'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Live Triage</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Risk Intelligence</span>
            </button>
          </div>

          {/* Top Actions: Upload CSV/Excel, Sample Data, Export */}
          <div className="flex items-center space-x-2">
            <div className="relative group">
              <button
                type="button"
                className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium rounded-md bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">Load Sample Data</span>
              </button>
              <div className="absolute right-0 mt-1 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-2 hidden group-hover:block z-50 text-xs">
                <div className="px-3 py-1 font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                  Realistic Clinical Datasets
                </div>
                <button
                  onClick={() => onLoadSample('diverse-mix')}
                  className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-700 hover:text-white flex flex-col"
                >
                  <span className="font-semibold text-white">Hospital Grievance & Portal Stream</span>
                  <span className="text-[11px] text-slate-400">8 complaints: acute STEMI, drug dosage, equity bias, HIPAA breach, billing</span>
                </button>
                <button
                  onClick={() => onLoadSample('safety-sentinel')}
                  className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-700 hover:text-white flex flex-col border-t border-slate-700/60"
                >
                  <span className="font-semibold text-rose-400">High-Risk Sentinel & Regulatory Escalations</span>
                  <span className="text-[11px] text-slate-400">3 high-severity cases: wrong-site surgery, anaphylaxis error, elopement</span>
                </button>
              </div>
            </div>

            <button
              onClick={onOpenUpload}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-teal-500 hover:bg-teal-400 text-slate-950 shadow transition"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Import CSV / Excel</span>
            </button>

            {totalComplaints > 0 && (
              <button
                onClick={onExportCSV}
                title="Export Triaged Complaints to CSV"
                className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
              >
                <Download className="w-4 h-4" />
              </button>
            )}

            {totalComplaints > 0 && (
              <button
                onClick={onReset}
                title="Clear current data"
                className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 border border-slate-700 transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Guardrail compliance ticker */}
        <div className="py-1 px-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center space-x-3">
            <span className="flex items-center text-teal-400 font-medium">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Mandatory Human Oversight Protocol Active
            </span>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="text-slate-400 hidden sm:inline">
              Mandatory review triggered on: Safety concerns, Discrimination, Privacy, Legal/Compliance, Ambiguity
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300 font-mono text-[10px]">
              Engine: {hasApiKey ? 'Gemini 3.8 Flash' : 'Clinical Rules Engine (Ready)'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
