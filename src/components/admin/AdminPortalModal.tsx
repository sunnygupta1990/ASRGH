import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Calendar,
  HeartHandshake,
  Bell,
  Image as ImageIcon,
  Mail,
  Send,
  UploadCloud,
  Settings,
  ShieldCheck,
  LogOut,
  X,
  Menu,
  ChevronRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminDashboard } from './AdminDashboard';
import { AdminMembers } from './AdminMembers';
import { AdminEvents } from './AdminEvents';
import { AdminSocialWork } from './AdminSocialWork';
import { AdminAnnouncements } from './AdminAnnouncements';
import { AdminGallery } from './AdminGallery';
import { AdminContacts } from './AdminContacts';
import { AdminNotifications } from './AdminNotifications';
import { AdminImportExport } from './AdminImportExport';
import { AdminSettings } from './AdminSettings';
import { AdminAuditLogs } from './AdminAuditLogs';
import { AdminLoginPanel } from './AdminLoginPanel';

export const AdminPortalModal: React.FC = () => {
  const {
    isAdminPortalOpen,
    setIsAdminPortalOpen,
    activeAdminTab,
    setActiveAdminTab,
    currentUser,
    isAuthenticated,
    authLoading,
    logoutAdminUser,
    settings,
  } = useApp();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  if (!isAdminPortalOpen) return null;
  if (!isAuthenticated || authLoading) return <AdminLoginPanel />;

  const navItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'members', label: 'Member Directory', icon: Users },
    { id: 'events', label: 'Events & Functions', icon: Calendar },
    { id: 'social_work', label: 'Social Welfare Programs', icon: HeartHandshake },
    { id: 'announcements', label: 'Circulars & Notices', icon: Bell },
    { id: 'gallery', label: 'Media & Gallery', icon: ImageIcon },
    { id: 'contacts', label: 'Inquiries & Helpdesk', icon: Mail },
    { id: 'notifications', label: 'Broadcast Notifications', icon: Send },
    { id: 'import', label: 'Excel Import Engine', icon: UploadCloud },
    { id: 'settings', label: 'Portal & Org Settings', icon: Settings },
    { id: 'audit', label: 'Security & Audit Logs', icon: ShieldCheck },
  ];

  const renderActiveTabContent = () => {
    switch (activeAdminTab) {
      case 'dashboard':
        return <AdminDashboard onNavigateTab={setActiveAdminTab} />;
      case 'members':
        return <AdminMembers onNavigateTab={setActiveAdminTab} />;
      case 'events':
        return <AdminEvents onNavigateTab={setActiveAdminTab} />;
      case 'social_work':
        return <AdminSocialWork onNavigateTab={setActiveAdminTab} />;
      case 'announcements':
        return <AdminAnnouncements onNavigateTab={setActiveAdminTab} />;
      case 'gallery':
        return <AdminGallery />;
      case 'contacts':
        return <AdminContacts />;
      case 'notifications':
        return <AdminNotifications />;
      case 'import':
        return <AdminImportExport onNavigateTab={setActiveAdminTab} />;
      case 'settings':
        return <AdminSettings />;
      case 'audit':
        return <AdminAuditLogs />;
      default:
        return <AdminDashboard onNavigateTab={setActiveAdminTab} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex flex-col">
      {/* Top Navbar */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 text-white flex items-center justify-between px-4 sm:px-6 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-black text-slate-950 text-sm shadow-md">
              A
            </div>
            <div>
              <div className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
                <span>ASRGH Admin</span>
                <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 text-[10px] font-mono rounded border border-amber-400/30">
                  ADMIN CONSOLE
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Aggarwal Sabha Rohini Group Housing
              </p>
            </div>
          </div>
        </div>

        {/* User Role Switcher & Exit */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-300">{currentUser.full_name}</span>
            <span className="text-amber-300 font-bold">({currentUser.role_name})</span>
          </div>

          <button
            onClick={logoutAdminUser}
            className="px-3.5 py-1.5 bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Admin Body (Sidebar + Content) */}
      <div className="flex-1 flex overflow-hidden bg-slate-100">
        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-16 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-300 ${
            isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="p-4 space-y-1 overflow-y-auto flex-1 text-xs">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-2">
              Management Modules
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeAdminTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveAdminTab(item.id);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-blue-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500 space-y-1">
            <div className="font-bold text-slate-700 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>RBAC Security Active</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Audit logging enabled. All database actions recorded.
            </p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{renderActiveTabContent()}</div>
        </main>
      </div>
    </div>
  );
};
