import React, { useState } from 'react';
import {
  Search,
  Filter,
  AlertOctagon,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  CheckSquare,
  Square,
  UserCheck,
  Building2,
  Clock,
  Download,
  Check,
  LayoutGrid,
  List,
  Eye,
  ArrowRight,
} from 'lucide-react';
import { ComplaintRecord, SeverityLevel, HumanReviewRequirement } from '../types';

interface ComplaintTableProps {
  records: ComplaintRecord[];
  onSelectComplaint: (record: ComplaintRecord) => void;
  onTriageRecord: (record: ComplaintRecord) => void;
  onTriageBatch: (records: ComplaintRecord[]) => void;
  isBatchProcessing: boolean;
  batchProgress: { current: number; total: number };
  onExportCSV: () => void;
}

export const ComplaintTable: React.FC<ComplaintTableProps> = ({
  records,
  onSelectComplaint,
  onTriageRecord,
  onTriageBatch,
  isBatchProcessing,
  batchProgress,
  onExportCSV,
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [humanReviewFilter, setHumanReviewFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filter logic
  const filteredRecords = records.filter((r) => {
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchText = r.rawText.toLowerCase().includes(q);
      const matchId = r.id.toLowerCase().includes(q);
      const matchPatient = r.patientId?.toLowerCase().includes(q);
      const matchDept = r.departmentReported?.toLowerCase().includes(q);
      const matchCategory = r.triage?.complaintCategory.toLowerCase().includes(q);
      const matchSummary = r.triage?.executiveSummary.toLowerCase().includes(q);
      if (!matchText && !matchId && !matchPatient && !matchDept && !matchCategory && !matchSummary) {
        return false;
      }
    }

    if (severityFilter !== 'all') {
      const sev = r.humanSignoff?.adjustedSeverity || r.triage?.severityLevel;
      if (sev !== severityFilter) return false;
    }

    if (humanReviewFilter !== 'all') {
      if (r.triage?.humanReviewStatus !== humanReviewFilter) return false;
    }

    if (priorityFilter !== 'all') {
      if (r.triage?.escalationPriority !== priorityFilter) return false;
    }

    if (departmentFilter !== 'all') {
      const dept = r.humanSignoff?.adjustedDepartment || r.triage?.recommendedDepartment;
      if (dept !== departmentFilter) return false;
    }

    if (statusFilter !== 'all') {
      if (r.status !== statusFilter) return false;
    }

    return true;
  });

  const pendingRecords = records.filter((r) => r.status === 'pending');

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredRecords.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredRecords.map((r) => r.id)));
    }
  };

  const toggleSelectRecord = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleTriageSelected = () => {
    const toTriage = records.filter((r) => selectedIds.has(r.id) && r.status === 'pending');
    if (toTriage.length > 0) {
      onTriageBatch(toTriage);
    }
  };

  const getSeverityBadge = (level?: SeverityLevel) => {
    switch (level) {
      case 'LEVEL 4 - Critical':
        return 'bg-red-100 text-red-900 border border-red-300 font-bold';
      case 'LEVEL 3 - High':
        return 'bg-amber-100 text-amber-900 border border-amber-300 font-semibold';
      case 'LEVEL 2 - Moderate':
        return 'bg-sky-100 text-sky-900 border border-sky-300';
      case 'LEVEL 1 - Low':
        return 'bg-teal-100 text-teal-900 border border-teal-300';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  const getPriorityBadge = (p?: string) => {
    if (p === 'Immediate') return 'bg-rose-600 text-white font-bold animate-pulse';
    if (p === 'Priority') return 'bg-amber-500 text-slate-950 font-semibold';
    return 'bg-slate-100 text-slate-700';
  };

  const getHumanReviewBadge = (status?: HumanReviewRequirement) => {
    if (status === 'Human Review Required') {
      return 'bg-red-50 text-red-800 border border-red-200 font-semibold';
    }
    if (status === 'Human Review Recommended') {
      return 'bg-amber-50 text-amber-800 border border-amber-200';
    }
    return 'bg-slate-50 text-slate-600 border border-slate-200';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
      {/* Search, Filter & Action Bar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/80 space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search narrative, MRN, ID, category, or summary..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Right Controls: View Switcher + Triage Actions */}
          <div className="flex items-center flex-wrap gap-2">
            {/* View Switcher Toggle */}
            <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg border border-slate-300 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Table View"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition ${
                  viewMode === 'cards'
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Card View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cards</span>
              </button>
            </div>

            {/* Batch Triage Action */}
            {pendingRecords.length > 0 && (
              <button
                onClick={() => onTriageBatch(pendingRecords)}
                disabled={isBatchProcessing}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm transition"
              >
                {isBatchProcessing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>
                      Triaging ({batchProgress.current}/{batchProgress.total})...
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Triage All Pending ({pendingRecords.length})</span>
                  </>
                )}
              </button>
            )}

            {selectedIds.size > 0 && (
              <button
                onClick={handleTriageSelected}
                disabled={isBatchProcessing}
                className="flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition"
              >
                <span>Triage Selected ({selectedIds.size})</span>
              </button>
            )}

            <button
              onClick={onExportCSV}
              title="Download CSV"
              className="flex items-center space-x-1 px-2.5 py-1.5 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
          <div className="flex items-center space-x-1 text-slate-500 mr-1 font-semibold">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter By:</span>
          </div>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-2.5 py-1 bg-white border border-slate-300 rounded-md text-slate-700 focus:ring-2 focus:ring-teal-500 font-medium"
          >
            <option value="all">All Severities</option>
            <option value="LEVEL 4 - Critical">Level 4 - Critical</option>
            <option value="LEVEL 3 - High">Level 3 - High</option>
            <option value="LEVEL 2 - Moderate">Level 2 - Moderate</option>
            <option value="LEVEL 1 - Low">Level 1 - Low</option>
          </select>

          {/* Human Review Filter */}
          <select
            value={humanReviewFilter}
            onChange={(e) => setHumanReviewFilter(e.target.value)}
            className="px-2.5 py-1 bg-white border border-slate-300 rounded-md text-slate-700 focus:ring-2 focus:ring-teal-500 font-medium"
          >
            <option value="all">All Oversight</option>
            <option value="Human Review Required">Human Review Required</option>
            <option value="Human Review Recommended">Human Review Recommended</option>
            <option value="AI Review Only">AI Review Only</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1 bg-white border border-slate-300 rounded-md text-slate-700 focus:ring-2 focus:ring-teal-500 font-medium"
          >
            <option value="all">All Priorities</option>
            <option value="Immediate">Immediate Priority</option>
            <option value="Priority">Priority Tier</option>
            <option value="Routine">Routine Tier</option>
          </select>

          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-2.5 py-1 bg-white border border-slate-300 rounded-md text-slate-700 focus:ring-2 focus:ring-teal-500 font-medium max-w-[180px]"
          >
            <option value="all">All Target Depts</option>
            <option value="Risk Management">Risk Management</option>
            <option value="Executive Review">Executive Review</option>
            <option value="Physician Leadership">Physician Leadership</option>
            <option value="Nursing Leadership">Nursing Leadership</option>
            <option value="Compliance Office">Compliance Office</option>
            <option value="Patient Experience Team">Patient Experience Team</option>
            <option value="Revenue Cycle / Billing">Revenue Cycle / Billing</option>
            <option value="Accessibility Coordinator">Accessibility Coordinator</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Quality Improvement Team">Quality Improvement Team</option>
          </select>

          {/* Reset Filters button */}
          {(severityFilter !== 'all' ||
            humanReviewFilter !== 'all' ||
            priorityFilter !== 'all' ||
            departmentFilter !== 'all' ||
            searchTerm) && (
            <button
              onClick={() => {
                setSeverityFilter('all');
                setHumanReviewFilter('all');
                setPriorityFilter('all');
                setDepartmentFilter('all');
                setSearchTerm('');
              }}
              className="text-xs text-teal-700 hover:text-teal-900 font-semibold underline ml-1"
            >
              Clear Filters
            </button>
          )}

          <span className="ml-auto text-slate-500 text-[11px] font-medium">
            Showing {filteredRecords.length} of {records.length} complaints
          </span>
        </div>
      </div>

      {/* View Mode 1: Table View (Guaranteed non-squished with min-width horizontal scroll) */}
      {viewMode === 'table' ? (
        <div className="overflow-x-auto w-full">
          <table className="min-w-[1050px] w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3 w-10 text-center">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="text-slate-500 hover:text-slate-800"
                  >
                    {selectedIds.size === filteredRecords.length && filteredRecords.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-teal-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-3 w-32">Complaint / ID</th>
                <th className="py-3 px-3 min-w-[280px]">Patient Narrative</th>
                <th className="py-3 px-3 w-36">Category (Step 1)</th>
                <th className="py-3 px-3 w-36">Severity (Step 2)</th>
                <th className="py-3 px-3 w-44">Route To (Step 4)</th>
                <th className="py-3 px-3 w-24">Priority</th>
                <th className="py-3 px-3 w-44">Oversight (Step 5)</th>
                <th className="py-3 px-3 w-28 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold text-slate-700">No matching complaint records</p>
                    <p className="text-xs text-slate-400 mt-1">Try clearing your search query or filters.</p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => {
                  const isSelected = selectedIds.has(record.id);
                  const t = record.triage;
                  const isSignedOff = record.humanSignoff?.reviewed;
                  const currentSeverity = record.humanSignoff?.adjustedSeverity || t?.severityLevel;
                  const currentDept = record.humanSignoff?.adjustedDepartment || t?.recommendedDepartment;

                  return (
                    <tr
                      key={record.id}
                      className={`hover:bg-teal-50/40 transition group ${
                        isSelected ? 'bg-teal-50/60' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleSelectRecord(record.id)}
                          className="text-slate-500"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-teal-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300 group-hover:text-slate-400" />
                          )}
                        </button>
                      </td>

                      {/* ID & Date */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900">{record.id}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {record.patientId ? `MRN: ${record.patientId}` : record.date}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                          {record.channel || 'Intake'}
                        </div>
                      </td>

                      {/* Narrative */}
                      <td className="py-3 px-3">
                        <p
                          onClick={() => onSelectComplaint(record)}
                          className="text-slate-800 line-clamp-2 cursor-pointer hover:text-teal-700 transition leading-relaxed"
                        >
                          "{record.rawText}"
                        </p>
                        {t?.riskFlags && t.riskFlags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {t.riskFlags.slice(0, 2).map((rf, i) => (
                              <span
                                key={i}
                                className="px-1.5 py-0.2 rounded text-[10px] bg-red-50 text-red-800 border border-red-200 font-medium"
                              >
                                {rf.type}
                              </span>
                            ))}
                            {t.riskFlags.length > 2 && (
                              <span className="text-[10px] text-slate-400 font-medium">
                                +{t.riskFlags.length - 2} more
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3">
                        {t ? (
                          <div>
                            <span className="font-bold text-slate-900 block leading-tight">
                              {t.complaintCategory}
                            </span>
                            {t.secondaryCategories && t.secondaryCategories.length > 0 && (
                              <span className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                                {t.secondaryCategories[0]}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Pending</span>
                        )}
                      </td>

                      {/* Severity */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {t ? (
                          <span
                            className={`inline-block px-2.5 py-1 rounded text-[11px] ${getSeverityBadge(
                              currentSeverity
                            )}`}
                          >
                            {currentSeverity}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Pending</span>
                        )}
                      </td>

                      {/* Department */}
                      <td className="py-3 px-3">
                        {t ? (
                          <div className="font-bold text-blue-900 leading-tight">
                            {currentDept}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Pending</span>
                        )}
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {t ? (
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] ${getPriorityBadge(
                              t.escalationPriority
                            )}`}
                          >
                            {t.escalationPriority}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">-</span>
                        )}
                      </td>

                      {/* Oversight */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {t ? (
                          <div className="space-y-1">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] ${getHumanReviewBadge(
                                t.humanReviewStatus
                              )}`}
                            >
                              {t.humanReviewStatus}
                            </span>
                            {isSignedOff && (
                              <div className="flex items-center text-[10px] text-emerald-700 font-bold">
                                <Check className="w-3 h-3 mr-0.5 text-emerald-600" />
                                <span>Clinician Approved</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Pending</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        {t ? (
                          <button
                            onClick={() => onSelectComplaint(record)}
                            className="px-2.5 py-1 text-xs font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 shadow-xs transition"
                          >
                            View 6 Steps →
                          </button>
                        ) : (
                          <button
                            onClick={() => onTriageRecord(record)}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-lg shadow-sm transition"
                          >
                            Triage Now
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* View Mode 2: Card Grid View (Ideal for reading complete narratives without squishing) */
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecords.map((record) => {
            const t = record.triage;
            const currentSeverity = record.humanSignoff?.adjustedSeverity || t?.severityLevel;
            const currentDept = record.humanSignoff?.adjustedDepartment || t?.recommendedDepartment;

            return (
              <div
                key={record.id}
                onClick={() => onSelectComplaint(record)}
                className="bg-slate-50/60 border border-slate-200 hover:border-teal-500 hover:shadow-md rounded-xl p-4 cursor-pointer transition flex flex-col justify-between space-y-3 group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-xs bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800">
                        {record.id}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {record.channel}
                      </span>
                    </div>
                    {t && (
                      <span className={`px-2 py-0.5 rounded text-[11px] ${getSeverityBadge(currentSeverity)}`}>
                        {currentSeverity}
                      </span>
                    )}
                  </div>

                  {/* Patient Narrative */}
                  <p className="text-xs text-slate-800 mt-2.5 line-clamp-3 leading-relaxed">
                    "{record.rawText}"
                  </p>
                </div>

                {t ? (
                  <div className="pt-2 border-t border-slate-200/80 space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">Category:</span>
                        <span className="font-bold text-slate-900">{t.complaintCategory}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">Route To:</span>
                        <span className="font-bold text-blue-900">{currentDept}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${getHumanReviewBadge(t.humanReviewStatus)}`}>
                        {t.humanReviewStatus}
                      </span>
                      <span className="text-teal-700 font-semibold group-hover:underline flex items-center space-x-1">
                        <span>Inspect Full 6 Steps</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                    <span className="text-xs text-slate-400 italic">Pending Triage</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTriageRecord(record);
                      }}
                      className="px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg shadow-sm"
                    >
                      Triage Now
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
