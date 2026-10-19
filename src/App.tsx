import React, { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { ComplaintTable } from './components/ComplaintTable';
import { TriageInspectorModal } from './components/TriageInspectorModal';
import { UploadModal } from './components/UploadModal';
import { SingleTriageForm } from './components/SingleTriageForm';
import { AnalyticsView } from './components/AnalyticsView';
import { SAMPLE_DATASETS } from './data/sampleComplaints';
import { triageSingleComplaint, triageBatchComplaints, checkServerHealth } from './services/triageApi';
import { ComplaintRecord, SeverityLevel, RecommendedDepartment } from './types';
import { Sparkles, FileSpreadsheet, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [records, setRecords] = useState<ComplaintRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'triage' | 'adhoc' | 'analytics'>('triage');
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintRecord | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<{ status: string; hasApiKey: boolean; model: string }>({
    status: 'checking',
    hasApiKey: false,
    model: 'gemini-3.8-flash',
  });

  // Check health on mount
  useEffect(() => {
    checkServerHealth().then((res) => {
      setServerStatus(res);
    });
  }, []);

  // Preload initial dataset with pre-triaged clinical records
  useEffect(() => {
    const initialSample = SAMPLE_DATASETS[0];
    setRecords(initialSample.data);
  }, []);

  // Load a chosen sample dataset
  const handleLoadSample = useCallback((datasetId: string) => {
    const dataset = SAMPLE_DATASETS.find((d) => d.id === datasetId) || SAMPLE_DATASETS[0];
    setRecords(dataset.data);
    setActiveTab('triage');
    setStatusNotice(`Loaded "${dataset.name}" with complete 6-step triage assessment.`);
    setTimeout(() => setStatusNotice(null), 4000);
  }, []);

  // Handle uploaded CSV / Excel records
  const handleRecordsImported = useCallback((imported: ComplaintRecord[], sourceName: string) => {
    setRecords((prev) => [...imported, ...prev]);
    setActiveTab('triage');
    setStatusNotice(`Imported ${imported.length} records from ${sourceName}. Click "Triage All Pending" to process.`);
    setTimeout(() => setStatusNotice(null), 5000);
  }, []);

  // Triage single record
  const handleTriageSingle = useCallback(async (record: ComplaintRecord) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === record.id ? { ...r, status: 'triaging' as const } : r))
    );

    try {
      const res = await triageSingleComplaint(record.rawText, {
        channel: record.channel,
        department: record.departmentReported,
        date: record.date,
        location: record.location,
      });

      setRecords((prev) =>
        prev.map((r) =>
          r.id === record.id ? { ...r, status: 'triaged' as const, triage: res.triage } : r
        )
      );

      // If this record is currently open in modal, update it
      setSelectedComplaint((prev) =>
        prev?.id === record.id ? { ...prev, triage: res.triage, status: 'triaged' } : prev
      );

      if (res.warning) {
        setStatusNotice(res.warning);
        setTimeout(() => setStatusNotice(null), 4000);
      }
    } catch (err: any) {
      setRecords((prev) =>
        prev.map((r) => (r.id === record.id ? { ...r, status: 'error' as const, error: err.message } : r))
      );
    }
  }, []);

  // Triage batch of records
  const handleTriageBatch = useCallback(async (toTriage: ComplaintRecord[]) => {
    if (toTriage.length === 0) return;

    setIsBatchProcessing(true);
    setBatchProgress({ current: 0, total: toTriage.length });

    try {
      const batchItems = toTriage.map((r) => ({
        id: r.id,
        rawText: r.rawText,
        channel: r.channel,
        departmentReported: r.departmentReported,
        location: r.location,
      }));

      const res = await triageBatchComplaints(batchItems);
      const mapResults = new Map(res.results.map((item) => [item.id, item.triage]));

      setRecords((prev) =>
        prev.map((r) => {
          const triage = mapResults.get(r.id);
          if (triage) {
            return { ...r, status: 'triaged' as const, triage };
          }
          return r;
        })
      );

      setStatusNotice(`Successfully triaged ${toTriage.length} complaints.`);
      setTimeout(() => setStatusNotice(null), 4000);
    } catch (err: any) {
      console.error('Batch triage failed:', err);
      setStatusNotice('Error occurred during batch triage. Please retry.');
      setTimeout(() => setStatusNotice(null), 5000);
    } finally {
      setIsBatchProcessing(false);
    }
  }, []);

  // Save human clinician sign-off
  const handleSaveSignoff = useCallback(
    (
      id: string,
      signoff: {
        reviewed: boolean;
        reviewerName: string;
        reviewDate: string;
        adjustedSeverity?: SeverityLevel;
        adjustedDepartment?: RecommendedDepartment;
        notes: string;
      }
    ) => {
      setRecords((prev) =>
        prev.map((r) => (r.id === id ? { ...r, humanSignoff: signoff } : r))
      );
      setSelectedComplaint((prev) =>
        prev?.id === id ? { ...prev, humanSignoff: signoff } : prev
      );
      setStatusNotice('Human reviewer sign-off saved and documented.');
      setTimeout(() => setStatusNotice(null), 3000);
    },
    []
  );

  // Add ad-hoc triaged record
  const handleAdHocCompleted = useCallback((record: ComplaintRecord) => {
    setRecords((prev) => [record, ...prev]);
    setStatusNotice('Live complaint triaged and queued for oversight.');
    setTimeout(() => setStatusNotice(null), 3000);
  }, []);

  // Export all triaged records to CSV with full Step 1-6 columns
  const handleExportCSV = useCallback(() => {
    const rows = records.map((r) => ({
      Complaint_ID: r.id,
      Date: r.date || '',
      Patient_MRN: r.patientId || '',
      Channel: r.channel || '',
      Department_Reported: r.departmentReported || '',
      Location: r.location || '',
      Raw_Complaint: r.rawText,
      Triage_Status: r.status,
      // Step 1
      Primary_Category: r.triage?.complaintCategory || '',
      Secondary_Categories: r.triage?.secondaryCategories?.join(', ') || '',
      // Step 2
      Severity_Level: r.humanSignoff?.adjustedSeverity || r.triage?.severityLevel || '',
      Severity_Justification: r.triage?.severityJustification || '',
      // Step 3
      Risk_Flags: r.triage?.riskFlags?.map((rf) => `${rf.type} (${rf.explanation})`).join('; ') || '',
      // Step 4
      Recommended_Department: r.humanSignoff?.adjustedDepartment || r.triage?.recommendedDepartment || '',
      Escalation_Priority: r.triage?.escalationPriority || '',
      // Step 5
      Human_Review_Requirement: r.triage?.humanReviewStatus || '',
      Human_Reviewed: r.humanSignoff?.reviewed ? 'YES' : 'NO',
      Reviewer_Name: r.humanSignoff?.reviewerName || '',
      Reviewer_Notes: r.humanSignoff?.notes || '',
      // Step 6
      Executive_Summary: r.triage?.executiveSummary || '',
    }));

    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `healthcare_complaints_triage_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [records]);

  const handleResetData = () => {
    if (confirm('Are you sure you want to clear all complaints? You can reload sample data anytime.')) {
      setRecords([]);
    }
  };

  const triagedCount = records.filter((r) => r.status === 'triaged' && r.triage).length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800 font-sans antialiased">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenAdHoc={() => setActiveTab('adhoc')}
        onLoadSample={handleLoadSample}
        onExportCSV={handleExportCSV}
        onReset={handleResetData}
        totalComplaints={records.length}
        triagedCount={triagedCount}
        hasApiKey={serverStatus.hasApiKey}
      />

      {/* Temporary Toast / Status Notice */}
      {statusNotice && (
        <div className="bg-teal-700 text-white text-xs py-2 px-4 text-center font-medium shadow-md transition animate-in fade-in">
          {statusNotice}
        </div>
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Metric KPI Cards on Triage Queue */}
        {activeTab === 'triage' && (
          <>
            <MetricCards records={records} />

            {/* Zero State if no records */}
            {records.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-xl mx-auto shadow-sm space-y-4 my-8">
                <div className="w-16 h-16 mx-auto bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Complaint Queue Empty</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Upload your healthcare organization's CSV or Excel complaint dataset, or load our pre-configured clinical sample.
                  </p>
                </div>
                <div className="flex items-center justify-center space-x-3 pt-2">
                  <button
                    onClick={() => setIsUploadOpen(true)}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Import CSV / Excel</span>
                  </button>
                  <button
                    onClick={() => handleLoadSample('diverse-mix')}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-teal-300 text-xs font-semibold rounded-lg shadow-sm transition"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Load 8 Complex Cases</span>
                  </button>
                </div>
              </div>
            ) : (
              <ComplaintTable
                records={records}
                onSelectComplaint={(r) => setSelectedComplaint(r)}
                onTriageRecord={handleTriageSingle}
                onTriageBatch={handleTriageBatch}
                isBatchProcessing={isBatchProcessing}
                batchProgress={batchProgress}
                onExportCSV={handleExportCSV}
              />
            )}
          </>
        )}

        {/* Ad-Hoc / Live Single Triage Form */}
        {activeTab === 'adhoc' && (
          <SingleTriageForm onTriageCompleted={handleAdHocCompleted} />
        )}

        {/* Analytics & Risk Intelligence View */}
        {activeTab === 'analytics' && (
          <AnalyticsView
            records={records}
            onSelectComplaint={(r) => setSelectedComplaint(r)}
          />
        )}
      </main>

      {/* 6-Step Triage Inspector & Sign-Off Modal */}
      <TriageInspectorModal
        complaint={selectedComplaint}
        isOpen={Boolean(selectedComplaint)}
        onClose={() => setSelectedComplaint(null)}
        onSaveSignoff={handleSaveSignoff}
        onReTriage={handleTriageSingle}
      />

      {/* CSV / Excel Ingestion Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onRecordsImported={handleRecordsImported}
        onLoadSample={handleLoadSample}
      />
    </div>
  );
}
