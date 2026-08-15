import React, { useState, useMemo } from 'react';
import {
  Clock,
  Search,
  ShieldCheck,
  Filter,
  User,
  Activity,
  Layers,
  Calendar,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminAuditLogs: React.FC = () => {
  const { auditLogs } = useApp();

  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (moduleFilter !== 'all' && log.module.toLowerCase() !== moduleFilter.toLowerCase()) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          log.action.toLowerCase().includes(q) ||
          log.actor_name.toLowerCase().includes(q) ||
          log.details.toLowerCase().includes(q) ||
          log.module.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [auditLogs, search, moduleFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-900" />
            <span>Audit Trail & System Security Logs</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable tracking log of administrative actions, data edits, Excel imports, and broadcasts.
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-600 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
          Total Recorded Actions: <strong className="text-slate-900">{auditLogs.length}</strong>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search audit logs by actor, action description, module..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="px-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-hidden focus:border-blue-900"
          >
            <option value="all">All Modules</option>
            <option value="Members">Members</option>
            <option value="Events">Events</option>
            <option value="Social Work">Social Work</option>
            <option value="Announcements">Announcements</option>
            <option value="Settings">Settings</option>
            <option value="Notifications">Notifications</option>
            <option value="Import Engine">Import Engine</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4 text-right">Actor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No audit records match your search filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[10px] text-slate-400 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">{log.action}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 font-semibold text-slate-800 text-[10px]">
                        {log.module}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{log.details}</td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span className="font-bold text-slate-900 block">{log.actor_name}</span>
                      <span className="text-[10px] text-slate-400">{log.actor_role}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
