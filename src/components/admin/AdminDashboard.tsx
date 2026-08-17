import React from 'react';
import {
  Users,
  Calendar,
  HeartHandshake,
  Bell,
  Mail,
  UploadCloud,
  ShieldCheck,
  TrendingUp,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminDashboard: React.FC<{ onNavigateTab: (tab: string) => void }> = ({ onNavigateTab }) => {
  const {
    members,
    events,
    socialWorkActivities,
    announcements,
    contactSubmissions,
    auditLogs,
    rejectedRecords,
    currentUser,
    dashboardData,
  } = useApp();

  const activeMembers = dashboardData?.counts.members ?? 0;
  const upcomingEvents = dashboardData?.counts.events ?? 0;
  const activeSocialWork = dashboardData?.counts.socialWork ?? 0;
  const newInquiries = dashboardData?.counts.contacts ?? 0;

  const quickStats = [
    {
      title: 'Total Active Members',
      val: activeMembers,
      sub: `${members.filter((m) => m.current_management).length} Management Officers`,
      icon: <Users className="w-5 h-5 text-blue-600" />,
      tab: 'members',
      bg: 'bg-blue-50 border-blue-200',
    },
    {
      title: 'Active Social Programs',
      val: activeSocialWork,
      sub: 'Education & Health Initiatives',
      icon: <HeartHandshake className="w-5 h-5 text-emerald-600" />,
      tab: 'social_work',
      bg: 'bg-emerald-50 border-emerald-200',
    },
    {
      title: 'Upcoming Events',
      val: upcomingEvents,
      sub: `${events.length} Total Events Scheduled`,
      icon: <Calendar className="w-5 h-5 text-amber-600" />,
      tab: 'events',
      bg: 'bg-amber-50 border-amber-200',
    },
    {
      title: 'Pending Inquiries',
      val: newInquiries,
      sub: `${contactSubmissions.length} Total Submissions`,
      icon: <Mail className="w-5 h-5 text-rose-600" />,
      tab: 'contacts',
      bg: 'bg-rose-50 border-rose-200',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
              {currentUser.role_name}
            </span>
            <span className="text-xs text-slate-400">Authenticated Session</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome, {currentUser.full_name}
          </h2>
          <p className="text-sm text-slate-300 max-w-xl">
            This administrative console manages all community data, Excel imports, member directories, public circulars, and audit logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigateTab('import')}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-colors"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Excel Data Import</span>
          </button>
          <button
            onClick={() => onNavigateTab('notifications')}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs flex items-center gap-2 border border-white/20 transition-colors"
          >
            <Bell className="w-4 h-4 text-amber-400" />
            <span>Send Notification</span>
          </button>
        </div>
      </div>

      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {quickStats.map((item, idx) => (
          <div
            key={idx}
            onClick={() => onNavigateTab(item.tab)}
            className={`${item.bg} border rounded-2xl p-5 shadow-2xs hover:shadow-md cursor-pointer transition-all flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{item.title}</span>
              <div className="p-2 bg-white rounded-xl shadow-2xs">{item.icon}</div>
            </div>
            <div>
              <span className="text-3xl font-black text-slate-900">{item.val}</span>
              <p className="text-xs text-slate-600 mt-1">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Rejected Records Attention Banner if any exist */}
      {rejectedRecords.filter((r) => r.status === 'rejected').length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <h4 className="font-bold text-amber-900 text-sm">
                {rejectedRecords.filter((r) => r.status === 'rejected').length} Import Records Need Attention
              </h4>
              <p className="text-xs text-amber-700">
                Excel rows failed validation (duplicates or missing mandatory fields). Review and correct them in the Import engine.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('import')}
            className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl text-xs transition-colors shrink-0"
          >
            View Rejections
          </button>
        </div>
      )}

      {/* Two Column Layout: Recent System Activity & Pending Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Audit Logs */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Recent Audit Logs & Activity</span>
            </h3>
            <button
              onClick={() => onNavigateTab('audit')}
              className="text-xs font-bold text-blue-900 hover:underline"
            >
              View Full Log
            </button>
          </div>

          <div className="space-y-3">
            {auditLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{log.action}</span>
                  <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                </div>
                <p className="text-slate-600">{log.details}</p>
                <div className="text-[10px] text-slate-400 font-medium">
                  By: {log.actor_name} ({log.actor_role})
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Inquiries */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-500" />
              <span>Latest Inquiries</span>
            </h3>
            <button
              onClick={() => onNavigateTab('contacts')}
              className="text-xs font-bold text-blue-900 hover:underline"
            >
              Manage Inquiries
            </button>
          </div>

          <div className="space-y-3">
            {contactSubmissions.slice(0, 4).map((sub) => (
              <div
                key={sub.id}
                onClick={() => onNavigateTab('contacts')}
                className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-100 text-xs space-y-1.5 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{sub.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      sub.status === 'new'
                        ? 'bg-rose-100 text-rose-800'
                        : sub.status === 'in_progress'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {sub.status}
                  </span>
                </div>
                <p className="text-slate-700 font-medium">{sub.subject}</p>
                <p className="text-slate-500 line-clamp-1">{sub.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
