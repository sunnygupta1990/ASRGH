import React, { useState, useMemo } from 'react';
import {
  Mail,
  Search,
  CheckCircle2,
  Clock,
  UserCheck,
  MessageSquare,
  AlertCircle,
  X,
  Phone,
  Calendar,
  Send,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ContactSubmission, ContactStatus } from '../../types';

export const AdminContacts: React.FC = () => {
  const { contactSubmissions, updateContactStatus, employees } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSub, setSelectedSub] = useState<ContactSubmission | null>(null);

  // Resolution / assignment form
  const [assignedEmployeeId, setAssignedEmployeeId] = useState('');
  const [resolutionStatus, setResolutionStatus] = useState<ContactStatus>('new');
  const [adminNotes, setAdminNotes] = useState('');

  const filteredSubs = useMemo(() => {
    return contactSubmissions.filter((sub) => {
      if (statusFilter !== 'all' && sub.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          sub.name.toLowerCase().includes(q) ||
          sub.email.toLowerCase().includes(q) ||
          sub.phone.includes(q) ||
          sub.subject.toLowerCase().includes(q) ||
          sub.submission_code.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [contactSubmissions, search, statusFilter]);

  const handleOpenDetail = (sub: ContactSubmission) => {
    setSelectedSub(sub);
    setAssignedEmployeeId(sub.assigned_to_employee_id || '');
    setResolutionStatus(sub.status);
    setAdminNotes(sub.admin_notes || '');
  };

  const handleSaveUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;

    const assignedEmp = employees.find((emp) => emp.id === assignedEmployeeId);
    const assignedName = assignedEmp ? assignedEmp.full_name : undefined;

    updateContactStatus(selectedSub.id, resolutionStatus, assignedName, adminNotes);
    setSelectedSub(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Mail className="w-5 h-5 text-rose-600" />
            <span>Public Inquiries & Helpdesk Tickets</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Review incoming questions from community members, assign volunteers, and track issue resolution.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
          <span>Total Inquiries:</span>
          <span className="font-bold text-slate-900">{contactSubmissions.length}</span>
          <span className="text-slate-300">|</span>
          <span className="text-rose-600">
            {contactSubmissions.filter((c) => c.status === 'new').length} New
          </span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search inquiries by sender name, phone, email, subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-hidden focus:border-rose-600"
          >
            <option value="all">All Ticket Statuses</option>
            <option value="new">New Inquiries</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Inquiries Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Ticket Code & Name</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Subject & Message</th>
                <th className="py-3 px-4">Assigned To</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No inquiries found.
                  </td>
                </tr>
              ) : (
                filteredSubs.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-slate-900 text-sm block">{sub.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{sub.submission_code}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 font-medium">{sub.email}</div>
                      <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{sub.phone}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <span className="font-semibold text-slate-900 block truncate">{sub.subject}</span>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{sub.message}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      {sub.assigned_to_name ? (
                        <div className="flex items-center gap-1 font-semibold text-blue-900">
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>{sub.assigned_to_name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          sub.status === 'new'
                            ? 'bg-rose-100 text-rose-800'
                            : sub.status === 'in_progress'
                            ? 'bg-amber-100 text-amber-800'
                            : sub.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenDetail(sub)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-xs transition-colors"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Management Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Mail className="w-5 h-5 text-rose-600" />
                  <span>Manage Inquiry Ticket</span>
                </h3>
                <span className="text-xs text-slate-500 font-mono">{selectedSub.submission_code}</span>
              </div>
              <button
                onClick={() => setSelectedSub(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inquirer Details Box */}
            <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{selectedSub.name}</span>
                <span className="text-slate-400">{selectedSub.created_at}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-600 font-medium">
                <div>
                  Email: <span className="text-slate-900 font-bold">{selectedSub.email}</span>
                </div>
                <div>
                  Phone: <span className="text-slate-900 font-bold">{selectedSub.phone}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-800">Subject: {selectedSub.subject}</span>
                <p className="text-slate-700 mt-1 whitespace-pre-wrap bg-white p-3 rounded-lg border border-slate-100">
                  {selectedSub.message}
                </p>
              </div>
            </div>

            {/* Management Form */}
            <form onSubmit={handleSaveUpdate} className="space-y-4 mt-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assign To Officer</label>
                  <select
                    value={assignedEmployeeId}
                    onChange={(e) => setAssignedEmployeeId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="">-- Select Community Officer --</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.full_name} ({emp.designation})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ticket Resolution Status</label>
                  <select
                    value={resolutionStatus}
                    onChange={(e) => setResolutionStatus(e.target.value as ContactStatus)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900"
                  >
                    <option value="new">New (Unreviewed)</option>
                    <option value="assigned">Assigned</option>
                    <option value="in_progress">In Progress / Contacted</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed / Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Internal Notes & Action Taken</label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Record callback date, phone discussion summary, or steps taken..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedSub(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-2xs"
                >
                  Save Ticket Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
