import React, { useState } from 'react';
import {
  Settings,
  Building,
  Phone,
  Mail,
  MapPin,
  Globe,
  Share2,
  TrendingUp,
  Shield,
  RotateCcw,
  CheckCircle2,
  Save,
  Users,
  Eye,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { OrganizationSettings, SocialLink, StatisticItem } from '../../types';

export const AdminSettings: React.FC = () => {
  const {
    settings,
    updateSettings,
    socialLinks,
    updateSocialLinks,
    statistics,
    updateStatistic,
    employees,
    roles,
    updateAdminUser,
    hasPermission,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'general' | 'stats' | 'social' | 'rbac' | 'system'>('general');
  const [formData, setFormData] = useState<OrganizationSettings>({ ...settings });
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await updateSettings(formData);
      setSuccessMsg('Organization settings updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Unable to save organization settings.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-900" />
            <span>Organization & Portal Settings</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure contact info, homepage metric counters, social media links, roles, and system maintenance.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-700">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'general' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            General & Contact
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'stats' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Metric Counters
          </button>
          <button
            onClick={() => setActiveTab('social')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'social' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Social Links
          </button>
          <button
            onClick={() => setActiveTab('rbac')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'rbac' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Admin Roles
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'system' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            System & Demo
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">{errorMsg}</div>}

      {/* Tab 1: General & Contact Settings */}
      {activeTab === 'general' && (
        <form onSubmit={handleSaveGeneral} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Organization Display Name</label>
              <input
                type="text"
                value={formData.organization_name}
                onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tagline / Motto</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Primary Email</label>
              <input
                type="email"
                value={formData.primary_email}
                onChange={(e) => setFormData({ ...formData, primary_email: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Primary Phone</label>
              <input
                type="text"
                value={formData.primary_phone}
                onChange={(e) => setFormData({ ...formData, primary_phone: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">WhatsApp Helpline</label>
              <input
                type="text"
                value={formData.whatsapp_number}
                onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Address Line 1</label>
              <input
                type="text"
                value={formData.address_line_1}
                onChange={(e) => setFormData({ ...formData, address_line_1: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Address Line 2 (Landmark)</label>
              <input
                type="text"
                value={formData.address_line_2}
                onChange={(e) => setFormData({ ...formData, address_line_2: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">State / Province</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">PIN / Postal Code</label>
              <input
                type="text"
                value={formData.postal_code}
                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Google Maps Embed / Location URL</label>
            <input
              type="text"
              value={formData.google_maps_url}
              onChange={(e) => setFormData({ ...formData, google_maps_url: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
            />
          </div>

          {/* Visibility Toggles for Public Pages */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <span className="font-bold text-slate-800 block text-xs">Public Contact Visibility Switches:</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { key: 'show_phone', label: 'Display Phone Number' },
                { key: 'show_email', label: 'Display Email Address' },
                { key: 'show_whatsapp', label: 'Display WhatsApp Chat' },
                { key: 'show_address', label: 'Display Physical Address' },
                { key: 'show_office_hours', label: 'Display Office Timings' },
                { key: 'show_map', label: 'Show Google Maps Widget' },
              ].map((toggle) => (
                <label key={toggle.key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(formData as any)[toggle.key]}
                    onChange={(e) => setFormData({ ...formData, [toggle.key]: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-900 focus:ring-blue-900 border-slate-300"
                  />
                  <span className="font-medium text-slate-700">{toggle.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-2xs"
            >
              <Save className="w-4 h-4" />
              <span>Save Organization Settings</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Metric Counters & Statistical Overrides */}
      {activeTab === 'stats' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6 text-xs">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Key Metrics & Impact Statistics</h3>
            <p className="text-slate-500 mt-0.5">
              These statistics display prominently on the public homepage. You can use dynamic auto-calculated values or set custom manual numbers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {statistics.map((st) => (
              <div key={st.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{st.label}</span>
                  <span className="text-[10px] text-slate-400 font-mono">Key: {st.metric_key}</span>
                </div>
                <p className="text-slate-500 text-[11px]">{st.description}</p>

                <div className="grid grid-cols-2 gap-3 items-end">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Display Value</label>
                    <input
                      type="number"
                      value={st.value}
                      onChange={async (e) => { try { await updateStatistic(st.id, Number(e.target.value), true); } catch (error) { setErrorMsg(error instanceof Error ? error.message : 'Unable to save statistic.'); } }}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer pb-2">
                      <input
                        type="checkbox"
                        checked={st.is_overridden}
                        onChange={async (e) => { try { await updateStatistic(st.id, st.value, e.target.checked); } catch (error) { setErrorMsg(error instanceof Error ? error.message : 'Unable to save statistic.'); } }}
                        className="w-4 h-4 rounded text-blue-900"
                      />
                      <span className="font-medium text-slate-700">Manual Override</span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Social Media Links */}
      {activeTab === 'social' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-xs">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Community Social Media Handles</h3>
            <p className="text-slate-500 mt-0.5">
              URLs configured here populate the header and footer social links across the website.
            </p>
          </div>

          <div className="space-y-3">
            {socialLinks.map((link, idx) => (
              <div key={link.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                <span className="w-28 font-bold text-slate-900">{link.platform_name}</span>
                <input
                  type="text"
                  value={link.url}
                  onChange={async (e) => {
                    const updated = socialLinks.map((item, itemIndex) => itemIndex === idx ? { ...item, url: e.target.value } : item);
                    try { await updateSocialLinks(updated); } catch (error) { setErrorMsg(error instanceof Error ? error.message : 'Unable to save social link.'); }
                  }}
                  className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
                />
                <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={link.is_enabled}
                    onChange={async (e) => {
                      const updated = socialLinks.map((item, itemIndex) => itemIndex === idx ? { ...item, is_enabled: e.target.checked } : item);
                      try { await updateSocialLinks(updated); } catch (error) { setErrorMsg(error instanceof Error ? error.message : 'Unable to save social link.'); }
                    }}
                    className="w-4 h-4 rounded text-blue-900"
                  />
                  <span className="text-slate-700 font-medium">Visible</span>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Roles & Employees */}
      {activeTab === 'rbac' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6 text-xs">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Administrative Roles & Staff Access</h3>
            <p className="text-slate-500 mt-0.5">
              Configured roles and employee user accounts with module-specific permissions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {employees.map((emp) => (
              <div key={emp.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{emp.full_name}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900">
                    {emp.role_name}
                  </span>
                </div>
                <div className="text-slate-600">
                  <div>Designation: {emp.designation}</div>
                  <div>Email: {emp.email} | Phone: {emp.phone}</div>
                </div>
                {hasPermission('admin_users.write') && hasPermission('roles.manage') && (
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <select value={emp.status} onChange={async (event) => { try { await updateAdminUser(emp.id, { status: event.target.value }); } catch (error) { alert(error instanceof Error ? error.message : 'Unable to update admin status.'); } }} className="px-2 py-1.5 border border-slate-200 rounded-lg">
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="archived">Archived</option>
                    </select>
                    <select value={emp.role_ids?.[0] ?? ''} onChange={async (event) => { try { await updateAdminUser(emp.id, { roleIds: [event.target.value] }); } catch (error) { alert(error instanceof Error ? error.message : 'Unable to update admin role.'); } }} className="px-2 py-1.5 border border-slate-200 rounded-lg">
                      {roles.map((role) => <option key={role.id} value={role.id}>{role.role_name}</option>)}
                    </select>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: System information */}
      {activeTab === 'system' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6 text-xs">
          <div>
            <h3 className="font-bold text-slate-900 text-base">System Maintenance</h3>
            <p className="text-slate-500 mt-0.5">
              Administrative records are stored authoritatively by the backend. Destructive database maintenance is intentionally unavailable in the browser.
            </p>
          </div>

        </div>
      )}
    </div>
  );
};
