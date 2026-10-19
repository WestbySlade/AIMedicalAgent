import React, { useState } from 'react';
import {
  Send,
  Sparkles,
  RotateCcw,
  AlertTriangle,
  Building2,
  Clock,
  UserCheck,
  Copy,
  Check,
  FileText,
  AlertOctagon,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { triageSingleComplaint } from '../services/triageApi';
import { ComplaintRecord, TriageResult } from '../types';

interface SingleTriageFormProps {
  onTriageCompleted: (record: ComplaintRecord) => void;
}

const PRESET_EXAMPLES = [
  {
    title: 'Medication Dosing Hazard (Level 3 - High)',
    channel: 'Patient Portal',
    department: 'Outpatient Pharmacy',
    location: 'Pavilion North',
    text: 'My doctor told me to take 5mg of Prednisone, but the pharmacy bottle says 50mg tablets with directions to take four pills a day. I took two yesterday and started having severe tremors, palpitations, and my blood sugar skyrocketed to 420. The pharmacist said "just break them in half". This is dangerous malpractice.',
  },
  {
    title: 'Civil Rights / Discriminatory Care Allegation (Level 4 - Critical)',
    channel: 'Formal Grievance Hotline',
    department: 'Labor & Delivery',
    location: 'Metropolitan Women’s Center',
    text: 'During active labor, the nursing supervisor dismissed my wife’s distress calls for 3 hours, openly remarking to staff that "these Black mothers always exaggerate pain tolerance". She developed chorioamnionitis and needed an emergency C-section. We demand a formal civil rights investigation.',
  },
  {
    title: 'Wrong-Patient PHI Portal Exposure (Level 4 - Critical)',
    channel: 'Patient Portal Bug Report',
    department: 'Health Informatics',
    location: 'System-wide Portal',
    text: 'When I logged in to check my MRI results, I was given administrative access to see Mr. Kenneth G’s complete psychiatric evaluations, social security number, and clinical notes from his substance abuse treatment program. I took timestamped photos.',
  },
  {
    title: 'Routine Wait Time Dissatisfaction (Level 1 - Low)',
    channel: 'Survey Comment',
    department: 'Dermatology Clinic',
    location: 'Westside Medical Plaza',
    text: 'Appointment was scheduled for 2:15 PM and I was not called back into the exam room until 2:55 PM. The doctor was very pleasant and thorough, but the waiting room magazines were from 2021 and the water cooler was empty.',
  },
];

export const SingleTriageForm: React.FC<SingleTriageFormProps> = ({ onTriageCompleted }) => {
  const [complaintText, setComplaintText] = useState('');
  const [channel, setChannel] = useState('Patient Portal');
  const [department, setDepartment] = useState('General Medicine');
  const [location, setLocation] = useState('Main Medical Pavilion');
  const [patientId, setPatientId] = useState('PT-' + Math.floor(10000 + Math.random() * 90000));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintText.trim()) {
      setError('Please provide the complaint or feedback narrative.');
      return;
    }

    setLoading(true);
    setError(null);
    setTriageResult(null);

    try {
      const res = await triageSingleComplaint(complaintText, {
        channel,
        department,
        location,
      });

      setTriageResult(res.triage);

      const record: ComplaintRecord = {
        id: 'CMP-' + Math.floor(1000 + Math.random() * 9000),
        date: new Date().toISOString().split('T')[0],
        patientId,
        channel,
        departmentReported: department,
        location,
        rawText: complaintText,
        status: 'triaged',
        triage: res.triage,
      };

      onTriageCompleted(record);
    } catch (err: any) {
      setError(err.message || 'Triage analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPreset = (preset: typeof PRESET_EXAMPLES[0]) => {
    setComplaintText(preset.text);
    setChannel(preset.channel);
    setDepartment(preset.department);
    setLocation(preset.location);
    setError(null);
    setTriageResult(null);
  };

  const handleCopyFormatted = () => {
    if (!triageResult?.formattedOutput) return;
    navigator.clipboard.writeText(triageResult.formattedOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Intro banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Live Ad-Hoc Complaint Triage</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Paste or draft any patient portal message, grievance report, or survey response for instantaneous 6-step clinical triage.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs text-slate-400 self-center mr-1">Load scenario:</span>
            {PRESET_EXAMPLES.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 rounded-lg border border-slate-200 transition"
              >
                {p.title.split(' (')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form Column */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Complaint / Narrative Text <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={7}
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
                placeholder="Enter complete patient complaint, portal grievance, or survey feedback here..."
                className="w-full p-3 text-xs leading-relaxed border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Intake Channel</label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Patient Portal">Patient Portal</option>
                  <option value="Formal Grievance Hotline">Formal Grievance Hotline</option>
                  <option value="Discharge Survey">Discharge Survey</option>
                  <option value="Online Review">Online Review</option>
                  <option value="Emergency Intake">Emergency Intake</option>
                  <option value="Billing Help Desk">Billing Help Desk</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Reported Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Facility / Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Patient Identifier / MRN</label>
                <input
                  type="text"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setComplaintText('');
                  setTriageResult(null);
                  setError(null);
                }}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center space-x-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md hover:shadow transition disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Executing 6-Step Triage...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run AI Triage Agent</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Results Column */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          {!triageResult && !loading && (
            <div className="h-full flex flex-col items-center justify-center py-16 text-center text-slate-400">
              <FileText className="w-12 h-12 text-slate-300 mb-3" />
              <h3 className="text-sm font-semibold text-slate-700">Awaiting Complaint Input</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Select a scenario preset above or type a patient complaint on the left, then click "Run AI Triage Agent".
              </p>
            </div>
          )}

          {loading && (
            <div className="h-full flex flex-col items-center justify-center py-16 text-center">
              <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mb-4" />
              <h3 className="text-sm font-bold text-slate-800">Assessing Clinical Safety & Severity</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Evaluating steps: Category classification, Severity reasoning, Risk detection flags, Escalation routing, and Human Review determination...
              </p>
            </div>
          )}

          {triageResult && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-sm text-slate-900">Triage Complete</span>
                  <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 text-[11px] font-semibold">
                    Added to Queue
                  </span>
                </div>
                <button
                  onClick={handleCopyFormatted}
                  className="flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold bg-slate-900 text-teal-300 hover:text-white rounded-lg transition"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied Output</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Output</span>
                    </>
                  )}
                </button>
              </div>

              {/* 4 Metric Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Category</span>
                  <span className="font-bold text-slate-800 truncate block">
                    {triageResult.complaintCategory}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Severity</span>
                  <span className="font-bold text-slate-900 truncate block">
                    {triageResult.severityLevel}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Route To</span>
                  <span className="font-bold text-slate-800 truncate block">
                    {triageResult.recommendedDepartment}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Human Review</span>
                  <span className="font-bold text-indigo-700 truncate block">
                    {triageResult.humanReviewStatus}
                  </span>
                </div>
              </div>

              {/* Risk Flags */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Identified Risk Flags
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {triageResult.riskFlags.map((risk, idx) => (
                    <div key={idx} className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs">
                      <span className="font-bold text-red-800 block">{risk.type}</span>
                      <span className="text-red-950/80">{risk.explanation}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Executive Summary */}
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-xs">
                <span className="font-bold text-teal-900 block mb-1">Executive Summary</span>
                <p className="text-teal-950 leading-relaxed">{triageResult.executiveSummary}</p>
              </div>

              {/* Formatted Output */}
              <div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  OUTPUT FORMAT Standard View
                </span>
                <pre className="text-xs font-mono text-slate-200 bg-slate-900 p-3 rounded-lg leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {triageResult.formattedOutput}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
