import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { actOnRejections, clearRejections, fetchRejections, ManagedRejection, RejectionAction } from '../../api/rejectedRecords';
import { applyRejectionResults, canRetryRejection, rejectionModules } from '../../utils/rejectedRecordManagement';

const button = 'px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed';
const modules = rejectionModules;
export function RejectedRecordsManager({ refreshKey }: { refreshKey: unknown }) {
  const [records, setRecords] = useState<ManagedRejection[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [module, setModule] = useState('all');
  const [status, setStatus] = useState('open');
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editing, setEditing] = useState<ManagedRejection | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [newColumn, setNewColumn] = useState('');
  const sequence = useRef(0);
  const selectAll = useRef<HTMLInputElement>(null);
  const load = async () => {
    const request = ++sequence.current;
    setLoading(true); setError('');
    try {
      const result = await fetchRejections(status, module, page);
      if (request !== sequence.current) return;
      setRecords(result.records); setTotal(result.total); setSelected([]);
      if (!result.records.length && page > 1) setPage(Math.max(1, Math.ceil(result.total / 50)));
    } catch (e) { if (request === sequence.current) setError(e instanceof Error ? e.message : 'Unable to load rejected records.'); }
    finally { if (request === sequence.current) setLoading(false); }
  };
  useEffect(() => { void load(); return () => { sequence.current++; }; }, [status, module, page, refreshKey]);
  useEffect(() => { if (selectAll.current) selectAll.current.indeterminate = selected.length > 0 && selected.length < records.length; }, [selected, records]);
  const canRetry = canRetryRejection;
  const perform = async (action: RejectionAction, ids: string[], data?: Record<string, string>) => {
    if (!ids.length || busy) return;
    if (action === 'delete' && !window.confirm(`Permanently delete ${ids.length} rejected warning(s)? Uploaded row history and imported entities are retained.`)) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const results = await actOnRejections(action, ids, data);
      // Apply confirmed results before reloading so successful actions remain visible even if refresh fails.
      setRecords(current => applyRejectionResults(current, results, status));
      setSelected([]);
      const failures = results.filter(r => r.outcome === 'failed' || r.outcome === 'error');
      setNotice(`${results.length - failures.length} succeeded; ${failures.length} failed.${action === 'retry' ? ' Failed rows remain open with their latest reason.' : ''}`);
      const edited = results.find(r => r.id === editing?.id);
      if (edited?.record) setEditing(edited.outcome === 'imported' ? null : edited.record);
      if (edited?.outcome === 'deleted') setEditing(null);
      await load();
      if (failures.some(r => r.outcome === 'error')) setError(failures.find(r => r.message)?.message || 'Some actions failed. Refresh and retry.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to manage rejected records.'); }
    finally { setBusy(false); }
  };
  const clear = async () => {
    if (!window.confirm(`Permanently clear all resolved and dismissed warnings in ${module === 'all' ? 'all modules' : module}, including older pages? Uploaded row history and imported entities are retained.`)) return;
    setBusy(true); setError('');
    try {
      const result = await clearRejections(module);
      setRecords(current => current.filter(r => !['resolved', 'dismissed'].includes(r.correctionStatus)));
      setNotice(`${result.count} resolved/dismissed warnings cleared.`); setEditing(null); await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to clear warnings.'); }
    finally { setBusy(false); }
  };
  const locked = busy || loading;
  const retryIds = records.filter(r => selected.includes(r.id) && canRetry(r)).map(r => r.id);
  return <section className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden" aria-busy={locked}>
    <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
      <div><h3 className="font-bold text-slate-900 text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-600" />Rejected Records & Validation Error Log</h3>
        <p className="text-[11px] text-slate-500 mt-1">Review uploaded data, save corrections, and retry. Dismiss hides a warning without importing it.</p></div>
      <div className="flex gap-2">
        <select aria-label="Filter rejection module" className={button} disabled={locked} value={module} onChange={e => { setModule(e.target.value); setPage(1); }}><option value="all">All modules</option>{modules.map(m => <option key={m} value={m}>{m}</option>)}</select>
        <select aria-label="Filter rejection status" className={button} disabled={locked} value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}><option value="open">Open</option><option value="closed">Resolved / dismissed</option><option value="all">All statuses</option></select>
      </div>
    </div>
    <div className="p-4 flex flex-wrap items-center gap-2">
      <span className="text-xs text-slate-500">{selected.length} selected</span>
      <button className={button} disabled={locked || !retryIds.length} onClick={() => void perform('retry', retryIds)}>Retry selected ({retryIds.length})</button>
      <button className={button} disabled={locked || !selected.length} onClick={() => void perform('dismiss', selected)}>Dismiss selected</button>
      <button className={`${button} text-rose-700`} disabled={locked || !selected.length} onClick={() => void perform('delete', selected)}>Delete selected</button>
      <button className={`${button} text-rose-700`} disabled={locked} onClick={() => void clear()}>Clear resolved / dismissed</button>
      <button className={button} disabled={locked} onClick={() => void load()}>Refresh</button>
    </div>
    {notice && <p role="status" className="px-4 pb-3 text-xs text-blue-900">{notice}</p>}
    {error && <p role="alert" className="px-4 pb-3 text-xs text-rose-700">{error}</p>}
    {loading && <p role="status" className="p-4 text-xs text-slate-500">Loading rejected records…</p>}
    <div className="overflow-x-auto"><table className="w-full text-left text-xs text-slate-600">
      <thead className="bg-slate-50 text-slate-700"><tr>
        <th className="p-3"><input ref={selectAll} type="checkbox" aria-label="Select all visible records" disabled={locked || !records.length} checked={!!records.length && selected.length === records.length} onChange={e => setSelected(e.target.checked ? records.map(r => r.id) : [])} /></th>
        {['Module / file / reference', 'Row', 'Latest reason', 'Status', 'Actions'].map(h => <th className="p-3" key={h}>{h}</th>)}
      </tr></thead>
      <tbody className="divide-y divide-slate-100">
        {!loading && !error && !records.length && <tr><td colSpan={6} className="p-8 text-center text-slate-500">No rejected records match these filters.</td></tr>}
        {records.map(r => <tr key={r.id} className="hover:bg-slate-50">
          <td className="p-3"><input type="checkbox" aria-label={`Select row ${r.importRecord.rowNumber} ${r.importRecord.recordKey}`} disabled={locked} checked={selected.includes(r.id)} onChange={e => setSelected(current => e.target.checked ? [...current, r.id] : current.filter(id => id !== r.id))} /></td>
          <td className="p-3"><span className="font-bold text-slate-900">{r.importRecord.batch.entityType} · {r.importRecord.recordKey}</span><div className="text-[11px] text-slate-500">{r.importRecord.batch.originalFilename}</div></td>
          <td className="p-3">{r.importRecord.rowNumber}</td><td className="p-3 text-rose-700 max-w-sm break-words">{r.rejectionReason}</td><td className="p-3">{r.correctionStatus}</td>
          <td className="p-3"><div className="flex gap-2 flex-nowrap">
            <button className={button} disabled={locked} onClick={() => { setEditing(r); setDraft(Object.fromEntries(Object.entries({ ...r.importRecord.sourceData, ...r.correctedData }).map(([k, v]) => [k, String(v ?? '')]))); setNewColumn(''); }}>View / edit</button>
            <button className={button} disabled={locked || !canRetry(r)} onClick={() => void perform('retry', [r.id])}>Retry</button>
            <button className={button} disabled={locked || r.correctionStatus !== 'open'} onClick={() => void perform('dismiss', [r.id])}>Dismiss</button>
            <button className={`${button} text-rose-700`} disabled={locked} onClick={() => void perform('delete', [r.id])}>Delete</button>
          </div></td>
        </tr>)}
      </tbody></table></div>
    <div className="p-4 flex items-center justify-between text-xs text-slate-500"><span>{total} records · Page {page} of {Math.max(1, Math.ceil(total / 50))}</span><div className="flex gap-2"><button className={button} disabled={locked || page === 1} onClick={() => setPage(p => p - 1)}>Previous</button><button className={button} disabled={locked || page * 50 >= total} onClick={() => setPage(p => p + 1)}>Next</button></div></div>
    {editing && <div className="p-5 border-t border-slate-200 bg-slate-50">
      <div className="flex justify-between items-center"><h4 className="text-sm font-bold">Row {editing.importRecord.rowNumber} · {editing.importRecord.recordKey}</h4><button className={button} disabled={busy} onClick={() => setEditing(null)}>Close editor</button></div>
      <p className="text-xs text-rose-700 my-3">{editing.rejectionReason}</p>
      <details className="text-xs mb-4"><summary className="cursor-pointer font-bold">Original uploaded data</summary><pre className="p-3 overflow-auto max-h-60 whitespace-pre-wrap">{JSON.stringify(editing.importRecord.sourceData, null, 2)}</pre></details>
      {!canRetry(editing) && <p className="text-xs mb-3">This row is already imported or uses an unsupported legacy module. You can still remove its warning.</p>}
      <fieldset disabled={busy || !canRetry(editing)} className="space-y-4">
        <legend className="text-xs font-bold mb-2">Corrections (dates must use YYYY-MM-DD)</legend>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-auto">{Object.entries(draft).map(([column, value]) => <label key={column} className="text-xs font-semibold text-slate-700">{column}<textarea rows={2} className="block w-full mt-1 p-2 rounded-lg border border-slate-200 bg-white font-normal" value={value} onChange={e => setDraft(d => ({ ...d, [column]: e.target.value }))} /></label>)}</div>
        <div className="flex gap-2"><input className="p-2 border rounded-lg text-xs" aria-label="Missing column name" placeholder="Missing column, e.g. First Name" value={newColumn} onChange={e => setNewColumn(e.target.value)} /><button className={button} disabled={!newColumn.trim() || Object.hasOwn(draft, newColumn.trim())} onClick={() => { setDraft(d => ({ ...d, [newColumn.trim()]: '' })); setNewColumn(''); }}>Add field</button></div>
        <div className="flex gap-2"><button className={button} onClick={() => void perform('save', [editing.id], draft)}>Save corrections</button><button className={`${button} text-blue-900`} onClick={() => void perform('retry', [editing.id], draft)}>Save & retry import</button></div>
      </fieldset>
    </div>}
  </section>;
}
