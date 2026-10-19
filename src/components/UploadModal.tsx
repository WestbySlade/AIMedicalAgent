import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  X,
  Download,
  ArrowRight,
  FileText,
  Sparkles,
} from 'lucide-react';
import { parseFile, convertRowsToRecords, generateTemplateCSV, ParsedFileData } from '../utils/fileParser';
import { ComplaintRecord } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecordsImported: (records: ComplaintRecord[], sourceName: string) => void;
  onLoadSample: (datasetId: string) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onRecordsImported,
  onLoadSample,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedFileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mapping state
  const [rawTextCol, setRawTextCol] = useState('');
  const [dateCol, setDateCol] = useState('');
  const [patientIdCol, setPatientIdCol] = useState('');
  const [channelCol, setChannelCol] = useState('');
  const [deptCol, setDeptCol] = useState('');
  const [locationCol, setLocationCol] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = async (selectedFile: File) => {
    setError(null);
    setLoading(true);
    setFile(selectedFile);

    try {
      const data = await parseFile(selectedFile);
      setParsedData(data);
      // Initialize mappings from auto-detection
      setRawTextCol(data.detectedMapping.rawText || data.headers[0] || '');
      setDateCol(data.detectedMapping.date || '');
      setPatientIdCol(data.detectedMapping.patientId || '');
      setChannelCol(data.detectedMapping.channel || '');
      setDeptCol(data.detectedMapping.departmentReported || '');
      setLocationCol(data.detectedMapping.location || '');
    } catch (err: any) {
      setError(err.message || 'Failed to parse file.');
      setFile(null);
      setParsedData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = () => {
    if (!parsedData || !rawTextCol) {
      setError('Please select which column contains the complaint or feedback text.');
      return;
    }

    const mapping = {
      rawText: rawTextCol,
      date: dateCol || undefined,
      patientId: patientIdCol || undefined,
      channel: channelCol || undefined,
      departmentReported: deptCol || undefined,
      location: locationCol || undefined,
    };

    const records = convertRowsToRecords(parsedData.rows, mapping);
    if (records.length === 0) {
      setError('No valid complaint records found with non-empty text.');
      return;
    }

    onRecordsImported(records, file?.name || 'Uploaded File');
    onClose();
  };

  const downloadCSVTemplate = () => {
    const csvContent = generateTemplateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'healthcare_complaints_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden transform transition-all">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-teal-500/20 text-teal-400 rounded-lg border border-teal-500/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold leading-6">Import Complaint Data</h3>
              <p className="text-xs text-slate-400">
                Upload CSV or Excel (.xlsx, .xls) containing patient complaints or portal messages
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2 text-red-800 text-xs">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!parsedData ? (
            <div>
              {/* Drag & Drop Area */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition ${
                  dragActive
                    ? 'border-teal-500 bg-teal-50/50'
                    : 'border-slate-300 hover:border-teal-500 hover:bg-slate-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="w-12 h-12 mx-auto mb-3 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
                  <UploadCloud className="w-6 h-6" />
                </div>

                <p className="text-sm font-semibold text-slate-800">
                  Click to browse or drag and drop your file here
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Supports CSV, Excel (.xlsx, .xls) files up to 50MB
                </p>

                {loading && (
                  <div className="mt-4 flex items-center justify-center space-x-2 text-teal-600 text-xs font-medium">
                    <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing file structure and headers...</span>
                  </div>
                )}
              </div>

              {/* Quick links & sample dataset */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <button
                  type="button"
                  onClick={downloadCSVTemplate}
                  className="flex items-center space-x-1.5 text-slate-600 hover:text-teal-700 font-medium"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Healthcare CSV Template</span>
                </button>

                <div className="flex items-center space-x-2">
                  <span className="text-slate-400">Or test right away:</span>
                  <button
                    type="button"
                    onClick={() => {
                      onLoadSample('diverse-mix');
                      onClose();
                    }}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 font-medium transition"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Load 8 Complex Cases</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* File Info Bar */}
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center space-x-2.5 text-xs text-slate-700">
                  <FileText className="w-4 h-4 text-teal-600" />
                  <div>
                    <span className="font-semibold text-slate-900">{file?.name}</span>
                    <span className="text-slate-500 ml-2">
                      ({parsedData.rows.length} records detected)
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setParsedData(null);
                    setFile(null);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-900 underline"
                >
                  Change file
                </button>
              </div>

              {/* Column Mapping Selector */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Confirm Column Mapping
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Complaint / Narrative Text <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={rawTextCol}
                      onChange={(e) => setRawTextCol(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      {parsedData.headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">
                      Patient / Case ID (Optional)
                    </label>
                    <select
                      value={patientIdCol}
                      onChange={(e) => setPatientIdCol(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">-- None / Auto-generate --</option>
                      {parsedData.headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">
                      Intake Channel / Source (Optional)
                    </label>
                    <select
                      value={channelCol}
                      onChange={(e) => setChannelCol(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">-- None / Default (Portal/Survey) --</option>
                      {parsedData.headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">
                      Reported Department / Unit (Optional)
                    </label>
                    <select
                      value={deptCol}
                      onChange={(e) => setDeptCol(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">-- None / Default --</option>
                      {parsedData.headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">
                      Date / Time Received (Optional)
                    </label>
                    <select
                      value={dateCol}
                      onChange={(e) => setDateCol(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">-- None / Default to Today --</option>
                      {parsedData.headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">
                      Facility / Clinic Location (Optional)
                    </label>
                    <select
                      value={locationCol}
                      onChange={(e) => setLocationCol(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">-- None --</option>
                      {parsedData.headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* First row sample preview */}
              {parsedData.rows.length > 0 && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                  <span className="font-semibold text-slate-700 block mb-1">Sample Row Preview:</span>
                  <p className="text-slate-600 italic line-clamp-2">
                    "{parsedData.rows[0][rawTextCol] || 'No text in selected column'}"
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-500 text-white shadow-sm transition"
                >
                  <span>Import & Start Triage</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
