import React, { useState, useMemo } from 'react';
import {
  Bell,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Calendar,
  X,
  FileText,
  Download,
  Upload,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Announcement, AnnouncementStatus } from '../../types';
import { downloadTemplate } from '../../utils/excelEngine';

export const AdminAnnouncements: React.FC<{ onNavigateTab: (tab: string) => void }> = ({ onNavigateTab }) => {
  const { announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement, archiveAnnouncement } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAnn, setSelectedAnn] = useState<Announcement | null>(null);

  const [formData, setFormData] = useState<Partial<Announcement>>({
    announcement_code: '',
    title: '',
    summary: '',
    content: '',
    important: false,
    featured: false,
    publish_date: new Date().toISOString().split('T')[0],
    expiry_date: '',
    status: 'published',
  });

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((ann) => {
      if (statusFilter !== 'all' && ann.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          ann.title.toLowerCase().includes(q) ||
          ann.announcement_code.toLowerCase().includes(q) ||
          ann.content.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [announcements, search, statusFilter]);

  const handleOpenAdd = () => {
    const nextCode = `ANN-${new Date().getFullYear()}-${String(announcements.length + 1).padStart(3, '0')}`;
    setFormData({
      announcement_code: nextCode,
      title: '',
      summary: '',
      content: '',
      important: false,
      featured: true,
      publish_date: new Date().toISOString().split('T')[0],
      expiry_date: '',
      status: 'published',
    });
    setSelectedAnn(null);
    setIsEditing(true);
  };

  const handleOpenEdit = (ann: Announcement) => {
    setSelectedAnn(ann);
    setFormData({ ...ann });
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      alert('Please fill in Announcement Title and Content.');
      return;
    }

    if (selectedAnn) {
      try { await updateAnnouncement(selectedAnn.id, formData); } catch (error) { alert(error instanceof Error ? error.message : 'Unable to update announcement.'); return; }
    } else {
      const newAnn: Announcement = {
        id: `ann-${Date.now()}`,
        announcement_code: formData.announcement_code || `ANN-${Date.now()}`,
          title: formData.title || '',
          summary: formData.summary,
        content: formData.content || '',
        important: formData.important || false,
        featured: formData.featured || false,
        publish_date: formData.publish_date || new Date().toISOString().split('T')[0],
        expiry_date: formData.expiry_date,
        status: (formData.status as AnnouncementStatus) || 'published',
      };
      try { await addAnnouncement(newAnn); } catch (error) { alert(error instanceof Error ? error.message : 'Unable to create announcement.'); return; }
    }
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-600" />
            <span>Notices, Circulars & Flash Announcements</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Broadcast important updates, executive meeting minutes, scholarship deadlines, and urgent flash alerts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => downloadTemplate('announcements')}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Template</span>
          </button>
          <button
            onClick={() => onNavigateTab('import')}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Import</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Post Circular</span>
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search circulars by keyword, code, subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-hidden focus:border-amber-600"
          >
            <option value="all">All Publish Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Announcements List / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Code & Circular Title</th>
                <th className="py-3 px-4">Publish Date</th>
                <th className="py-3 px-4">Flash Status</th>
                <th className="py-3 px-4">State</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAnnouncements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No announcements found.
                  </td>
                </tr>
              ) : (
                filteredAnnouncements.map((ann) => (
                  <tr key={ann.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{ann.title}</span>
                          {ann.important && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-100 text-rose-800 border border-rose-200">
                              FLASH BANNER
                            </span>
                          )}
                          {ann.featured && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800">
                              Featured
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{ann.content}</p>
                        <span className="text-[10px] text-slate-400 font-mono">{ann.announcement_code}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{ann.publish_date}</span>
                      </div>
                      {ann.expiry_date && (
                        <span className="text-[10px] text-slate-400">Expires: {ann.expiry_date}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={async () => { try { await updateAnnouncement(ann.id, { important: !ann.important }); } catch (error) { alert(error instanceof Error ? error.message : 'Unable to update announcement.'); } }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors ${
                          ann.important
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <AlertTriangle className="w-3 h-3" />
                        <span>{ann.important ? 'Active on Top Banner' : 'Set as Top Flash'}</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          ann.status === 'published'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ann.status === 'draft'
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ann.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(ann)}
                          title="Edit Notice"
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-amber-700 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete "${ann.title}"?`)) {
                              void deleteAnnouncement(ann.id).catch((error) => alert(error instanceof Error ? error.message : 'Unable to delete announcement.'));
                            }
                          }}
                          title="Delete Notice"
                          className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-600" />
                <span>{selectedAnn ? 'Edit Circular Notice' : 'Compose New Circular'}</span>
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Notice Code</label>
                  <input
                    type="text"
                    value={formData.announcement_code}
                    onChange={(e) => setFormData({ ...formData, announcement_code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Publish Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as AnnouncementStatus })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notice / Circular Subject</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Annual General Body Meeting 2026 Notification"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-bold"
                  required
                />
              </div>

              <div><label className="block font-bold text-slate-700 mb-1">Summary</label><textarea rows={2} value={formData.summary || ''} onChange={(e) => setFormData({ ...formData, summary: e.target.value })} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800" /></div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><label className="block font-bold text-slate-700 mb-1">Cover Media ID</label><input value={formData.cover_media_id || ''} onChange={(e) => setFormData({ ...formData, cover_media_id: e.target.value })} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono" /></div><div><label className="block font-bold text-slate-700 mb-1">Metadata JSON</label><textarea key={selectedAnn?.id ?? 'new'} defaultValue={JSON.stringify(formData.metadata ?? {}, null, 2)} onBlur={(e) => { try { setFormData({ ...formData, metadata: JSON.parse(e.target.value) }); } catch { alert('Metadata must be valid JSON.'); } }} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono" /></div></div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Publish Date</label>
                  <input
                    type="date"
                    value={formData.publish_date}
                    onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Expiry Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notice Content</label>
                <textarea
                  rows={5}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Provide complete circular text, agenda items, committee directives, and contact details..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
                  required
                />
              </div>

              {/* Toggles */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="ann_important"
                    checked={formData.important}
                    onChange={(e) => setFormData({ ...formData, important: e.target.checked })}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-600 border-slate-300"
                  />
                  <label htmlFor="ann_important" className="font-bold text-slate-800 cursor-pointer">
                    Urgent Alert: Show in Top Flash Banner across all public pages
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="ann_featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-600 border-slate-300"
                  />
                  <label htmlFor="ann_featured" className="font-bold text-slate-700 cursor-pointer">
                    Display in Featured Circulars section on Homepage
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-2xs"
                >
                  {selectedAnn ? 'Update Circular' : 'Publish Circular'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
