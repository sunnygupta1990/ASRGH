import React, { useState, useMemo } from 'react';
import {
  HeartHandshake,
  Plus,
  Search,
  Edit2,
  Trash2,
  Users,
  Image as ImageIcon,
  Check,
  X,
  Sparkles,
  Download,
  Upload,
  Layers,
  MapPin,
  Calendar,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SocialWorkActivity, SocialWorkType } from '../../types';
import { downloadTemplate } from '../../utils/excelEngine';

export const AdminSocialWork: React.FC<{ onNavigateTab: (tab: string) => void }> = ({ onNavigateTab }) => {
  const {
    socialWorkActivities,
    socialWorkCategories,
    addSocialWorkActivity,
    updateSocialWorkActivity,
    deleteSocialWorkActivity,
    archiveSocialWorkActivity,
    addSocialWorkCategory,
    updateSocialWorkCategory,
    deleteSocialWorkCategory,
    openLightbox,
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCatId, setSelectedCatId] = useState('all');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<SocialWorkActivity | null>(null);

  // Photo manager modal
  const [photoManagingAct, setPhotoManagingAct] = useState<SocialWorkActivity | null>(null);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');

  const [formData, setFormData] = useState<Partial<SocialWorkActivity>>({
    activity_code: '',
    category_id: '',
    category_name: '',
    title: '',
    summary: '',
    description: '',
    type: 'Ongoing Initiative',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    location: '',
    status: 'active',
    featured: true,
    display_order: 1,
    beneficiaries_count: 500,
    photos: [],
  });

  const filteredActivities = useMemo(() => {
    return socialWorkActivities.filter((act) => {
      if (selectedCatId !== 'all' && act.category_id !== selectedCatId) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          act.title.toLowerCase().includes(q) ||
          act.activity_code.toLowerCase().includes(q) ||
          act.category_name.toLowerCase().includes(q) ||
          (act.location && act.location.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [socialWorkActivities, search, selectedCatId]);

  const handleOpenAdd = () => {
    const defaultCat = socialWorkCategories[0] || { id: 'cat-1', name: 'Education Support' };
    const nextCode = `SW-${String(socialWorkActivities.length + 1).padStart(4, '0')}`;
    setFormData({
      activity_code: nextCode,
      category_id: defaultCat.id,
      category_name: defaultCat.name,
      title: '',
      summary: '',
      description: '',
      type: 'Ongoing Initiative',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      location: 'National / Pan-India',
      status: 'active',
      featured: true,
      display_order: socialWorkActivities.length + 1,
      beneficiaries_count: 250,
      photos: [
        'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=1200',
      ],
    });
    setSelectedActivity(null);
    setIsEditing(true);
  };

  const handleOpenEdit = (act: SocialWorkActivity) => {
    setSelectedActivity(act);
    setFormData({ ...act });
    setIsEditing(true);
  };

  const handleCategoryChange = (catId: string) => {
    const cat = socialWorkCategories.find((c) => c.id === catId);
    setFormData({
      ...formData,
      category_id: catId,
      category_name: cat ? cat.name : 'General',
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.category_id) {
      alert('Please fill in required fields (Title and Category).');
      return;
    }

    if (selectedActivity) {
      try { await updateSocialWorkActivity(selectedActivity.id, formData); } catch (error) { alert(error instanceof Error ? error.message : 'Unable to update activity.'); return; }
    } else {
      const newAct: SocialWorkActivity = {
        id: `sw-${Date.now()}`,
        activity_code: formData.activity_code || `SW-${Date.now()}`,
        category_id: formData.category_id || 'cat-1',
        category_name: formData.category_name || 'Community Welfare',
        title: formData.title || '',
        description: formData.description || '',
        type: (formData.type as SocialWorkType) || 'Ongoing Initiative',
        start_date: formData.start_date,
        end_date: formData.end_date,
        location: formData.location || 'Pan-India',
        status: formData.status || 'active',
        featured: formData.featured || false,
        display_order: formData.display_order || socialWorkActivities.length + 1,
        photos: formData.photos || [],
        beneficiaries_count: Number(formData.beneficiaries_count) || 0,
      };
      try { await addSocialWorkActivity(newAct); } catch (error) { alert(error instanceof Error ? error.message : 'Unable to create activity.'); return; }
    }
    setIsEditing(false);
  };

  const handleAddPhotoToAct = async () => {
    if (!photoManagingAct || !newPhotoUrl.trim()) return;
    const updatedPhotos = [...(photoManagingAct.photos || []), newPhotoUrl.trim()];
    await updateSocialWorkActivity(photoManagingAct.id, { photos: updatedPhotos });
    setPhotoManagingAct({ ...photoManagingAct, photos: updatedPhotos });
    setNewPhotoUrl('');
  };

  const handleRemovePhotoFromAct = async (photoIndex: number) => {
    if (!photoManagingAct) return;
    const updatedPhotos = (photoManagingAct.photos || []).filter((_, idx) => idx !== photoIndex);
    await updateSocialWorkActivity(photoManagingAct.id, { photos: updatedPhotos });
    setPhotoManagingAct({ ...photoManagingAct, photos: updatedPhotos });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-emerald-600" />
            <span>Social Work & Welfare Programs</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage philanthropic scholarships, medical assistance funds, ration drives, and elder care schemes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => downloadTemplate('social_work')}
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
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Program</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <input value={newCategoryName} onChange={(event) => setNewCategoryName(event.target.value)} placeholder="New social work category" className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs" />
          <button onClick={async () => { if (!newCategoryName.trim()) return; try { await addSocialWorkCategory({ name: newCategoryName.trim(), display_order: socialWorkCategories.length, status: 'active' }); setNewCategoryName(''); } catch (error) { alert(error instanceof Error ? error.message : 'Unable to create category.'); } }} className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold">Add Category</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {socialWorkCategories.map((category) => <span key={category.id} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-xs">
            {category.name}
            <button onClick={async () => { const name = prompt('Category name', category.name); if (!name?.trim()) return; try { await updateSocialWorkCategory(category.id, { name: name.trim() }); } catch (error) { alert(error instanceof Error ? error.message : 'Unable to update category.'); } }} className="text-blue-800 font-bold">Edit</button>
            <button onClick={async () => { if (!confirm(`Delete category "${category.name}"?`)) return; try { await deleteSocialWorkCategory(category.id); } catch (error) { alert(error instanceof Error ? error.message : 'Unable to delete category.'); } }} className="text-rose-700 font-bold">Delete</button>
          </span>)}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search programs by title, code, beneficiary..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCatId}
            onChange={(e) => setSelectedCatId(e.target.value)}
            className="px-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-hidden focus:border-emerald-600"
          >
            <option value="all">All Focus Categories</option>
            {socialWorkCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table of Activities */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Program & Code</th>
                <th className="py-3 px-4">Focus Category</th>
                <th className="py-3 px-4">Initiative Type</th>
                <th className="py-3 px-4">Beneficiaries</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Photos</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredActivities.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No social work programs found.
                  </td>
                </tr>
              ) : (
                filteredActivities.map((act) => (
                  <tr key={act.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-start gap-2.5">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                          {act.photos && act.photos[0] ? (
                            <img
                              src={act.photos[0]}
                              alt={act.title}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <HeartHandshake className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 text-sm">{act.title}</span>
                            {act.featured && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-100 text-emerald-800">
                                Featured
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">{act.activity_code}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 font-semibold text-[10px]">
                        {act.category_name}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">{act.type}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700">
                      {act.beneficiaries_count ? `${act.beneficiaries_count.toLocaleString()}+ Impacted` : 'Ongoing'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{act.location || 'Pan-India'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => setPhotoManagingAct(act)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                        <span>{act.photos?.length || 0}</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(act)}
                          title="Edit Program"
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-emerald-700 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete "${act.title}"?`)) {
                              void deleteSocialWorkActivity(act.id).catch((error) => alert(error instanceof Error ? error.message : 'Unable to delete activity.'));
                            }
                          }}
                          title="Delete Program"
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

      {/* Edit / Create Program Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-emerald-600" />
                <span>{selectedActivity ? 'Edit Social Program' : 'Create Social Program'}</span>
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
                  <label className="block font-bold text-slate-700 mb-1">Program Code</label>
                  <input
                    type="text"
                    value={formData.activity_code}
                    onChange={(e) => setFormData({ ...formData, activity_code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Focus Category</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium"
                    required
                  >
                    {socialWorkCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div><label className="block font-bold text-slate-700 mb-1">Summary</label><textarea rows={2} value={formData.summary || ''} onChange={(e) => setFormData({ ...formData, summary: e.target.value })} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800" /></div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Program Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Higher Education Merit Scholarship Scheme"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as SocialWorkType })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
                  >
                    <option value="Ongoing Initiative">Ongoing Initiative</option>
                    <option value="Individual Project">Individual Project</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Beneficiaries Impacted</label>
                  <input
                    type="number"
                    value={formData.beneficiaries_count}
                    onChange={(e) => setFormData({ ...formData, beneficiaries_count: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Location / Reach</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Delhi NCR / Pan-India"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Program Overview & Impact Details</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Explain eligibility, application process, mission statement, and impact metrics..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><label className="block font-bold text-slate-700 mb-1">Published Date</label><input type="date" value={formData.published_at?.slice(0,10) || ''} onChange={(e) => setFormData({ ...formData, published_at: e.target.value })} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl" /></div><div><label className="block font-bold text-slate-700 mb-1">Metadata JSON</label><textarea key={selectedActivity?.id ?? 'new'} defaultValue={JSON.stringify(formData.metadata ?? {}, null, 2)} onBlur={(e) => { try { setFormData({ ...formData, metadata: JSON.parse(e.target.value) }); } catch { alert('Metadata must be valid JSON.'); } }} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono" /></div></div>

              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  id="sw_featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-600 border-slate-300"
                />
                <label htmlFor="sw_featured" className="font-bold text-slate-700 cursor-pointer">
                  Feature this initiative prominently on public homepage
                </label>
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
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-2xs"
                >
                  {selectedActivity ? 'Update Program' : 'Save Program'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Program Photo Manager Modal */}
      {photoManagingAct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-emerald-700" />
                  <span>Program Gallery: {photoManagingAct.title}</span>
                </h3>
                <span className="text-xs text-slate-500 font-mono">{photoManagingAct.activity_code}</span>
              </div>
              <button
                onClick={() => setPhotoManagingAct(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Add Photo */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mt-4 space-y-3">
              <span className="text-xs font-bold text-slate-800">Add Image URL</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl"
                />
                <button
                  onClick={handleAddPhotoToAct}
                  disabled={!newPhotoUrl.trim()}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors shrink-0"
                >
                  Add Image
                </button>
              </div>
            </div>

            {/* Existing Photos */}
            <div className="mt-6 space-y-3">
              <span className="text-xs font-bold text-slate-700">
                Uploaded Images ({photoManagingAct.photos?.length || 0})
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(photoManagingAct.photos || []).map((imgUrl, idx) => (
                  <div key={idx} className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                    <img
                      src={imgUrl}
                      alt="Social work activity"
                      className="w-full h-28 object-cover cursor-pointer"
                      onClick={() =>
                        openLightbox(
                          (photoManagingAct.photos || []).map((url) => ({ url, title: photoManagingAct.title }))
                        )
                      }
                      referrerPolicy="no-referrer"
                    />
                    <button
                      onClick={() => handleRemovePhotoFromAct(idx)}
                      className="absolute top-1.5 right-1.5 p-1 bg-rose-600/90 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 mt-6 flex justify-end">
              <button
                onClick={() => setPhotoManagingAct(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
