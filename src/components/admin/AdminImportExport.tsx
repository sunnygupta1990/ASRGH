import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  FileText,
  Trash2,
  Check,
  Filter,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  downloadTemplate,
  parseExcelFile,
  validateImportData,
  ModuleValidationConfig,
} from '../../utils/excelEngine';
import { RejectedRecord } from '../../types';
import { exportAdminDataApi } from '../../api/adminPortal';

export const AdminImportExport: React.FC<{ onNavigateTab: (tab: string) => void }> = ({ onNavigateTab }) => {
  const {
    members,
    events,
    socialWorkActivities,
    announcements,
    importBatches,
    rejectedRecords,
    resolveRejectedRecord,
    commitImport,
  } = useApp();

  const [selectedModule, setSelectedModule] = useState<'members' | 'events' | 'social_work' | 'announcements'>('members');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [validationResult, setValidationResult] = useState<{
    total: number;
    validRows: any[];
    invalidRows: RejectedRecord[];
  } | null>(null);

  const [filterRejectionModule, setFilterRejectionModule] = useState<string>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelected = async (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      alert('Please upload a valid Excel spreadsheet (.xlsx, .xls) or .csv file.');
      return;
    }
    setSelectedFile(file);
    setIsProcessing(true);

    try {
      // 1. Parse Excel into raw json rows
      const rawRows = await parseExcelFile(file);
      setRawRows(rawRows);
      const batchId = `BATCH-${Date.now().toString().slice(-6)}`;

      // 2. Validate against system schema and unique constraints
      const result = validateImportData(
        selectedModule,
        rawRows,
        batchId,
        {
          members,
          events,
          socialWorkActivities,
          announcements,
        }
      );

      setValidationResult(result);
    } catch (err: any) {
      alert(`Error reading spreadsheet: ${err.message}`);
      setSelectedFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCommitImport = async () => {
    if (!validationResult || !selectedFile) return;

    setIsProcessing(true);
    try {
      const result = await commitImport(selectedModule, selectedFile.name, rawRows);
      alert(`Import committed: ${result.accepted} accepted, ${result.rejected} rejected.`);
      setSelectedFile(null);
      setRawRows([]);
      setValidationResult(null);
      return;
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to commit import.');
      return;
    } finally {
      setIsProcessing(false);
    }

  };

  const filteredRejections = rejectedRecords.filter((r) => {
    if (filterRejectionModule !== 'all' && r.module !== filterRejectionModule) return false;
    return true;
  });

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const exported = await exportAdminDataApi(selectedModule);
      const bytes = Uint8Array.from(atob(exported.contentBase64), (char) => char.charCodeAt(0));
      const blob = new Blob([bytes], { type: exported.mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = exported.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to export data.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <span>Excel Data Import Engine & Migration Hub</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Bulk onboard hundreds of member profiles, event calendars, welfare programs, and historical archives.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 disabled:opacity-60 text-blue-900 border border-blue-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
          >
            {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>Export authoritative data</span>
          </button>
          <button
            onClick={() => downloadTemplate(selectedModule)}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            <span>Download {selectedModule.toUpperCase()} Template</span>
          </button>
        </div>
      </div>

      {/* Module Selector & Drag-Drop Uploader */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            1. Select Target Dataset Module
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'members', label: 'Member Directory', desc: 'Addresses, phones & roles' },
              { id: 'events', label: 'Events & Functions', desc: 'Dates, locations & agendas' },
              { id: 'social_work', label: 'Social Work', desc: 'Initiatives & beneficiaries' },
              { id: 'announcements', label: 'Notices & Circulars', desc: 'Publish dates & alerts' },
            ].map((m) => (
              <div
                key={m.id}
                onClick={() => {
                  setSelectedModule(m.id as any);
                  setSelectedFile(null);
                  setValidationResult(null);
                }}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedModule === m.id
                    ? 'border-blue-900 bg-blue-50/70 shadow-xs'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="font-bold text-slate-900 text-xs">{m.label}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{m.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Drop Zone */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            2. Upload Completed Excel Spreadsheet
          </label>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-blue-800 hover:bg-blue-50/20 rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={(e) => e.target.files?.[0] && handleFileSelected(e.target.files[0])}
              className="hidden"
            />
            <div className="p-3 bg-blue-100/60 rounded-full text-blue-900">
              <UploadCloud className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">
                {selectedFile ? selectedFile.name : 'Click to select or drag and drop spreadsheet'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">Supports Microsoft Excel (.xlsx, .xls) and CSV</p>
            </div>
          </div>
        </div>

        {/* Validation Summary */}
        {isProcessing && (
          <div className="p-6 bg-slate-50 rounded-xl text-center flex items-center justify-center gap-2 text-xs font-bold text-slate-700">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-900" />
            <span>Parsing spreadsheet rows, verifying columns, and checking unique constraints...</span>
          </div>
        )}

        {validationResult && !isProcessing && (
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">Pre-Import Validation Breakdown</h4>
              <div className="flex items-center gap-3 text-xs font-bold">
                <span className="text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> {validationResult.validRows.length} Valid
                </span>
                <span className="text-rose-600 flex items-center gap-1">
                  <XCircle className="w-4 h-4" /> {validationResult.invalidRows.length} Rejected
                </span>
              </div>
            </div>

            {/* If validation errors occurred, show reasons */}
            {validationResult.invalidRows.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto p-3 bg-rose-50/50 rounded-xl border border-rose-200 text-xs">
                <span className="font-bold text-rose-900 block text-[11px]">
                  Failed Rows (Will not be imported until resolved):
                </span>
                {validationResult.invalidRows.slice(0, 5).map((err, i) => (
                  <div key={i} className="text-rose-800 text-[11px] flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>
                      <strong>Row {err.row_number}:</strong> {err.error_message} ({err.suggested_fix})
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setValidationResult(null);
                }}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Discard
              </button>
              <button
                onClick={handleCommitImport}
                disabled={validationResult.validRows.length === 0}
                className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-2xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Commit & Import {validationResult.validRows.length} Records</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Rejected Records Queue & Resolution */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Rejected Records & Validation Error Log</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Rows from previous Excel uploads that failed validation. Resolve or purge them once addressed.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterRejectionModule}
              onChange={(e) => setFilterRejectionModule(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-xl"
            >
              <option value="all">All Modules</option>
              <option value="members">Members</option>
              <option value="events">Events</option>
              <option value="social_work">Social Work</option>
              <option value="announcements">Announcements</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Module & Reference</th>
                <th className="py-3 px-4">Row #</th>
                <th className="py-3 px-4">Reason / Error</th>
                <th className="py-3 px-4">Suggested Fix</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRejections.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No rejected records pending resolution. All datasets are clean!
                  </td>
                </tr>
              ) : (
                filteredRejections.map((rej) => (
                  <tr key={rej.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <span className="px-2 py-0.5 rounded bg-slate-100 uppercase text-[9px] mr-2">
                        {rej.module}
                      </span>
                      {rej.record_reference}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">Row {rej.row_number}</td>
                    <td className="py-3.5 px-4 text-rose-700 font-medium">{rej.error_message}</td>
                    <td className="py-3.5 px-4 text-slate-600">{rej.suggested_fix || 'Check field formatting'}</td>
                    <td className="py-3.5 px-4 text-[10px] text-slate-400">{rej.rejected_at}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => void resolveRejectedRecord(rej.id).catch((error) => alert(error instanceof Error ? error.message : 'Unable to resolve rejected record.'))}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg text-xs transition-colors"
                      >
                        Dismiss
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Past Import Batches History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <span>Audit Trail: Past Excel Migration Batches</span>
          </h4>
          <span className="text-[10px] text-slate-500">{importBatches.length} Batches Processed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Batch Code & File</th>
                <th className="py-3 px-4">Target Module</th>
                <th className="py-3 px-4">Rows (Total / Passed / Failed)</th>
                <th className="py-3 px-4">Uploaded By</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {importBatches.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 block">{b.file_name}</span>
                    <span className="font-mono text-[10px] text-slate-400">{b.batch_code}</span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800 uppercase text-[10px]">
                    {b.module_name}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900">{b.total_rows}</span> /{' '}
                    <span className="font-bold text-emerald-700">{b.passed_rows}</span> /{' '}
                    <span className="font-bold text-rose-600">{b.failed_rows}</span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">{b.uploaded_by}</td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[10px]">{b.uploaded_at}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        b.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
