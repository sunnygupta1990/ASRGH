import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Award,
  Check,
  X,
  Upload,
  Download,
  Filter,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Member } from '../../types';
import { downloadTemplate } from '../../utils/excelEngine';

export const AdminMembers: React.FC<{ onNavigateTab: (tab: string) => void }> = ({ onNavigateTab }) => {
  const { members, addMember, updateMember, deleteMember, archiveMember } = useApp();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [managementFilter, setManagementFilter] = useState('all');

  const [isEditing, setIsEditing] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const [formData, setFormData] = useState<Partial<Member>>({
    member_code: '',
    first_name: '',
    last_name: '',
    display_name: '',
    category: 'Life Member',
    designation: 'Community Member',
    current_management: false,
    management_post: '',
    phone: '',
    email: '',
    address: '',
    city: 'New Delhi',
    state: 'Delhi',
    bio: '',
    visibility: {
      phone_public: false,
      email_public: false,
      address_public: false,
      photo_public: true,
      designation_public: true,
    },
    status: 'active',
  });

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      if (categoryFilter !== 'all' && m.category !== categoryFilter) return false;
      if (managementFilter === 'yes' && !m.current_management) return false;
      if (managementFilter === 'no' && m.current_management) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          m.display_name.toLowerCase().includes(q) ||
          m.member_code.toLowerCase().includes(q) ||
          m.designation.toLowerCase().includes(q) ||
          (m.phone && m.phone.includes(q))
        );
      }
      return true;
    });
  }, [members, search, categoryFilter, managementFilter]);

  const handleOpenAdd = () => {
    const nextCode = `MEM-${String(members.length + 1).padStart(4, '0')}`;
    setFormData({
      member_code: nextCode,
      first_name: '',
      last_name: '',
      display_name: '',
      category: 'Life Member',
      designation: 'Community Member',
      current_management: false,
      management_post: '',
      phone: '',
      email: '',
      city: 'New Delhi',
      state: 'Delhi',
      display_order: members.length + 1,
      visibility: {
        phone_public: false,
        email_public: false,
        address_public: false,
        photo_public: true,
        designation_public: true,
      },
      status: 'active',
      joined_date: new Date().toISOString().split('T')[0],
      photo_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=600',
    });
    setSelectedMember(null);
    setIsEditing(true);
  };

  const handleOpenEdit = (m: Member) => {
    setSelectedMember(m);
    setFormData({ ...m });
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name?.trim() || !formData.member_code?.trim()) return;

    const displayName =
      formData.display_name?.trim() ||
      `${formData.first_name || ''} ${formData.last_name || ''}`.trim();

    try {
      if (selectedMember) {
        await updateMember(selectedMember.id, {
          ...formData,
          display_name: displayName,
        });
      } else {
        await addMember({
          ...formData,
          id: `mem-${Date.now()}`,
          display_name: displayName,
          display_order: formData.display_order || members.length + 1,
          visibility: formData.visibility || {
            phone_public: false,
            email_public: false,
            address_public: false,
            photo_public: true,
            designation_public: true,
          },
          status: formData.status || 'active',
        } as Member);
      }
      setIsEditing(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to save member');
    }
  };

  const toggleVisibilityField = (m: Member, field: keyof Member['visibility']) => {
    updateMember(m.id, {
      visibility: {
        ...m.visibility,
        [field]: !m.visibility[field],
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-900" />
            <span>Members Directory Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage {members.length} total community records, privacy toggles, and executive posts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadTemplate('members')}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
            title="Download Excel Template"
          >
            <Download className="w-4 h-4" />
            <span>Excel Template</span>
          </button>
          <button
            onClick={() => onNavigateTab('import')}
            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 border border-emerald-200 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Import Excel</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by code, name, designation, phone..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-900"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold outline-none"
          >
            <option value="all">All Categories</option>
            <option value="Patron">Patron</option>
            <option value="Life Member">Life Member</option>
            <option value="General">General</option>
            <option value="Youth Wing">Youth Wing</option>
          </select>

          <select
            value={managementFilter}
            onChange={(e) => setManagementFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold outline-none"
          >
            <option value="all">All Management Status</option>
            <option value="yes">Management Only</option>
            <option value="no">General Members</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Code</th>
                <th className="p-3.5">Member Details</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Management Post</th>
                <th className="p-3.5">Public Visibility</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-slate-800">{m.member_code}</td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={m.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
                        alt={m.display_name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <div className="font-bold text-slate-900">{m.display_name}</div>
                        <div className="text-[11px] text-slate-500">{m.designation} â€¢ {m.city}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                      {m.category}
                    </span>
                  </td>
                  <td className="p-3.5">
                    {m.current_management ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        {m.management_post || 'Officer'}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">â€”</span>
                    )}
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleVisibilityField(m, 'phone_public')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          m.visibility?.phone_public
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}
                        title="Toggle phone visibility"
                      >
                        Phone {m.visibility?.phone_public ? 'âœ“' : 'âœ—'}
                      </button>
                      <button
                        onClick={() => toggleVisibilityField(m, 'email_public')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          m.visibility?.email_public
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}
                        title="Toggle email visibility"
                      >
                        Email {m.visibility?.email_public ? 'âœ“' : 'âœ—'}
                      </button>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        m.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(m)}
                        className="p-1.5 text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit member"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Permanently delete member ${m.display_name}?`)) {
                            void deleteMember(m.id).catch((error) => {
                              alert(error instanceof Error ? error.message : 'Unable to delete member');
                            });
                          }
                        }}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base">
                {selectedMember ? 'Edit Member Record' : 'Add New Member'}
              </h3>
              <button onClick={() => setIsEditing(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Member Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.member_code || ''}
                    onChange={(e) => setFormData({ ...formData, member_code: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.first_name || ''}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={formData.last_name || ''}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Display Name (Salutation)</label>
                  <input
                    type="text"
                    value={formData.display_name || ''}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    placeholder="e.g. Shri Rajesh Sharma"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category || 'Life Member'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="Patron">Patron</option>
                    <option value="Life Member">Life Member</option>
                    <option value="General">General</option>
                    <option value="Youth Wing">Youth Wing</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    value={formData.designation || ''}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="e.g. Senior Industrialist"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Photo URL</label>
                  <input
                    type="text"
                    value={formData.photo_url || ''}
                    onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Membership Status
                </label>
                <select
                  value={formData.status || 'active'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as Member['status'],
                    })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              {/* Management Post checkbox */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.current_management || false}
                    onChange={(e) => setFormData({ ...formData, current_management: e.target.checked })}
                    className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                  />
                  <span className="font-bold text-amber-900">Current Management / Executive Member</span>
                </label>
                {formData.current_management && (
                  <div>
                    <label className="block font-bold text-amber-900 mb-1">Management Post / Role Title</label>
                    <input
                      type="text"
                      value={formData.management_post || ''}
                      onChange={(e) => setFormData({ ...formData, management_post: e.target.value })}
                      placeholder="e.g. President, General Secretary, Treasurer"
                      className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="member@asrgh.com"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city || ''}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state || ''}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Brief Bio / Community Service</label>
                <textarea
                  rows={2}
                  value={formData.bio || ''}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Details regarding service, career background, etc."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              {/* Public Visibility Flags */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-bold text-slate-700 block">Public Visibility Controls</span>
                <div className="flex flex-wrap gap-4 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.visibility?.phone_public || false}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          visibility: {
                            ...(formData.visibility as any),
                            phone_public: e.target.checked,
                          },
                        })
                      }
                    />
                    <span>Show Phone Number Publicly</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.visibility?.email_public || false}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          visibility: {
                            ...(formData.visibility as any),
                            email_public: e.target.checked,
                          },
                        })
                      }
                    />
                    <span>Show Email Publicly</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Member Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

