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
import { prepareProfilePhoto, profilePhotoPreviewUrl } from '../../utils/profilePhoto';
import {
  createManagementAssignmentApi,
  createManagementPositionApi,
  createManagementTermApi,
  deleteManagementAssignmentApi,
  deleteManagementPositionApi,
  deleteManagementTermApi,
  fetchManagementApi,
  updateManagementAssignmentApi,
  updateManagementPositionApi,
  updateManagementTermApi,
} from '../../api/adminPortal';
import { deleteMemberProfilePhoto, uploadMemberProfilePhoto } from '../../api/members';
import { filterAdminMembers } from '../../utils/adminMemberSearch';
import { categoryFromMemberCode, MEMBER_CATEGORIES } from '../../utils/memberClassification';

export const AdminMembers: React.FC<{ onNavigateTab: (tab: string) => void }> = ({ onNavigateTab }) => {
  const { members, addMember, updateMember, deleteMember, archiveMember, refreshMembersFromApi } = useApp();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [managementFilter, setManagementFilter] = useState('all');

  const [isEditing, setIsEditing] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [management, setManagement] = useState<{ positions: Array<{ id: string; code: string; name: string; isActive: boolean }>; terms: Array<{ id: string; name: string; startDate: string; endDate?: string; status: string }>; assignments: Array<{ id: string; memberId: string; positionId: string; termId: string }> }>({ positions: [], terms: [], assignments: [] });
  const [assignmentId, setAssignmentId] = useState('');
  const [positionId, setPositionId] = useState('');
  const [termId, setTermId] = useState('');
  const [assignManagement, setAssignManagement] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [removeProfilePhoto, setRemoveProfilePhoto] = useState(false);
  const [newPosition, setNewPosition] = useState({ code: '', name: '' });
  const [newTerm, setNewTerm] = useState({ name: '', startDate: '', endDate: '' });
  const reloadManagement = async () => { const data = await fetchManagementApi(); setManagement(data as typeof management); };
  React.useEffect(() => { void reloadManagement(); }, []);

  const [formData, setFormData] = useState<Partial<Member>>({
    member_code: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    display_name: '',
    category: 'Ordinary',
    designation: 'Ordinary',
    current_management: false,
    management_post: '',
    phone: '',
    email: '',
    address: '',
    address_line_2: '',
    postal_code: '',
    country: 'India',
    gender: '',
    date_of_birth: '',
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
    return filterAdminMembers(members, {
      search,
      category: categoryFilter,
      management: managementFilter,
    });
  }, [members, search, categoryFilter, managementFilter]);

  const resetProfilePhotoState = () => {
    if (profilePhotoPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(profilePhotoPreview);
    }
    setProfilePhotoFile(null);
    setProfilePhotoPreview(null);
    setRemoveProfilePhoto(false);
  };

  const handleProfilePhotoChange = async (file: File | undefined) => {
    if (!file) return;

    try {
      const prepared = await prepareProfilePhoto(file);
      if (profilePhotoPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(profilePhotoPreview);
      }
      setProfilePhotoFile(prepared);
      setProfilePhotoPreview(profilePhotoPreviewUrl(prepared));
      setRemoveProfilePhoto(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to process profile photo');
    }
  };

  const handleOpenAdd = () => {
    const nextCode = `MEM-${String(members.length + 1).padStart(4, '0')}`;
    setFormData({
      member_code: nextCode,
      first_name: '',
      middle_name: '',
      last_name: '',
      display_name: '',
      category: categoryFromMemberCode(nextCode),
      designation: categoryFromMemberCode(nextCode),
      current_management: false,
      management_post: '',
      phone: '',
      email: '',
      city: 'New Delhi',
      state: 'Delhi',
      country: 'India',
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
      photo_url: undefined,
    });
    setSelectedMember(null);
    resetProfilePhotoState();
    setAssignmentId('');
    setPositionId('');
    setTermId('');
    setAssignManagement(false);
    setIsEditing(true);
  };

  const handleOpenEdit = (m: Member) => {
    setSelectedMember(m);
    setFormData({ ...m });
    setProfilePhotoFile(null);
    setProfilePhotoPreview(m.photo_url ?? null);
    setRemoveProfilePhoto(false);
    const assignment = m.management_assignments?.[0];
    setAssignmentId(assignment?.id ?? '');
    setPositionId(assignment?.position_id ?? '');
    setTermId(assignment?.term_id ?? '');
    setAssignManagement(Boolean(assignment));
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSaving || !formData.first_name?.trim() || !formData.member_code?.trim()) {
      return;
    }

    const displayName =
      formData.display_name?.trim() ||
      `${formData.first_name || ''} ${formData.last_name || ''}`.trim();
    const category = categoryFromMemberCode(formData.member_code);

    setIsSaving(true);

    try {
      let savedMemberId: string;
      if (selectedMember) {
        await updateMember(selectedMember.id, {
          ...formData,
          display_name: displayName,
          category,
          designation: category,
        });
        savedMemberId = selectedMember.id;
      } else {
        const saved = await addMember({
          ...formData,
          id: `mem-${Date.now()}`,
          display_name: displayName,
          category,
          designation: category,
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
        savedMemberId = saved.id;
      }
      if (profilePhotoFile) {
        await uploadMemberProfilePhoto(savedMemberId, profilePhotoFile);
      } else if (removeProfilePhoto && selectedMember) {
        await deleteMemberProfilePhoto(savedMemberId);
      }

      if (assignManagement) {
        if (!positionId || !termId) {
          throw new Error('Select both a management position and a management term, or turn off management assignment.');
        }

        if (assignmentId) {
          await updateManagementAssignmentApi(assignmentId, {
            memberId: savedMemberId,
            positionId,
            termId,
          });
        } else {
          await createManagementAssignmentApi({
            memberId: savedMemberId,
            positionId,
            termId,
          });
        }
      } else if (assignmentId) {
        await deleteManagementAssignmentApi(assignmentId);
      }
      await reloadManagement();
      await refreshMembersFromApi();
      resetProfilePhotoState();
      setIsEditing(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to save member');
    } finally {
      setIsSaving(false);
    }
  };

  const addPosition = async () => { try { await createManagementPositionApi(newPosition); setNewPosition({ code: '', name: '' }); await reloadManagement(); } catch (error) { alert(error instanceof Error ? error.message : 'Unable to create management position'); } };
  const addTerm = async () => { try { await createManagementTermApi({ ...newTerm, endDate: newTerm.endDate || null }); setNewTerm({ name: '', startDate: '', endDate: '' }); await reloadManagement(); } catch (error) { alert(error instanceof Error ? error.message : 'Unable to create management term'); } };

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="bg-white p-4 rounded-2xl border border-slate-200 text-xs space-y-3">
          <h3 className="font-bold text-slate-900">Management Positions</h3>
          <div className="flex gap-2"><input value={newPosition.code} onChange={(e) => setNewPosition({ ...newPosition, code: e.target.value })} placeholder="Code" className="min-w-0 flex-1 p-2 border rounded-lg" /><input value={newPosition.name} onChange={(e) => setNewPosition({ ...newPosition, name: e.target.value })} placeholder="Position name" className="min-w-0 flex-1 p-2 border rounded-lg" /><button type="button" disabled={!newPosition.code.trim() || !newPosition.name.trim()} onClick={() => void addPosition()} className="px-3 bg-blue-900 text-white rounded-lg disabled:opacity-50">Add</button></div>
          <div className="space-y-1">{management.positions.map((position) => <div key={position.id} className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-lg"><span>{position.code} — {position.name}</span><span className="flex gap-1"><button type="button" onClick={async () => { const name = window.prompt('Position name', position.name); if (name?.trim()) { await updateManagementPositionApi(position.id, { name }); await reloadManagement(); } }} className="text-blue-700">Edit</button><button type="button" onClick={async () => { if (confirm(`Delete position ${position.name}?`)) { try { await deleteManagementPositionApi(position.id); await reloadManagement(); } catch (error) { alert(error instanceof Error ? error.message : 'Unable to delete position'); } } }} className="text-red-700">Delete</button></span></div>)}</div>
        </section>
        <section className="bg-white p-4 rounded-2xl border border-slate-200 text-xs space-y-3">
          <h3 className="font-bold text-slate-900">Management Terms</h3>
          <div className="grid grid-cols-2 gap-2"><input value={newTerm.name} onChange={(e) => setNewTerm({ ...newTerm, name: e.target.value })} placeholder="Term name" className="p-2 border rounded-lg" /><input type="date" value={newTerm.startDate} onChange={(e) => setNewTerm({ ...newTerm, startDate: e.target.value })} className="p-2 border rounded-lg" /><input type="date" value={newTerm.endDate} onChange={(e) => setNewTerm({ ...newTerm, endDate: e.target.value })} className="p-2 border rounded-lg" /><button type="button" disabled={!newTerm.name.trim() || !newTerm.startDate} onClick={() => void addTerm()} className="px-3 bg-blue-900 text-white rounded-lg disabled:opacity-50">Add Term</button></div>
          <div className="space-y-1">{management.terms.map((term) => <div key={term.id} className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-lg"><span>{term.name} ({term.startDate.slice(0,10)}{term.endDate ? ` – ${term.endDate.slice(0,10)}` : ''})</span><span className="flex gap-1"><button type="button" onClick={async () => { const name = window.prompt('Term name', term.name); if (name?.trim()) { await updateManagementTermApi(term.id, { name }); await reloadManagement(); } }} className="text-blue-700">Edit</button><button type="button" onClick={async () => { if (confirm(`Delete term ${term.name}?`)) { try { await deleteManagementTermApi(term.id); await reloadManagement(); } catch (error) { alert(error instanceof Error ? error.message : 'Unable to delete term'); } } }} className="text-red-700">Delete</button></span></div>)}</div>
        </section>
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
            {MEMBER_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>

          <select
            value={managementFilter}
            onChange={(e) => setManagementFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold outline-none"
          >
            <option value="all">All Management Status</option>
            <option value="yes">Management Only</option>
            <option value="no">Non-Management Members</option>
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
                      <span className="text-slate-400 text-[11px]">—</span>
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
              <button onClick={() => { resetProfilePhotoState(); setIsEditing(false); }} className="p-1 text-slate-400 hover:text-slate-700">
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
                    onChange={(e) => { const memberCode = e.target.value; const category = categoryFromMemberCode(memberCode); setFormData({ ...formData, member_code: memberCode, category, designation: category }); }}
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div><label className="block font-bold text-slate-700 mb-1">Middle Name</label><input type="text" value={formData.middle_name || ''} onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" /></div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={formData.gender || ''}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
                <div><label className="block font-bold text-slate-700 mb-1">Date of Birth</label><input type="date" value={formData.date_of_birth || ''} onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" /></div>
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
                    value={categoryFromMemberCode(formData.member_code)}
                    disabled
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    {MEMBER_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className="block font-bold text-slate-700 mb-1">Address Line 1</label><input type="text" value={formData.address || ''} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" /></div>
                <div><label className="block font-bold text-slate-700 mb-1">Address Line 2</label><input type="text" value={formData.address_line_2 || ''} onChange={(e) => setFormData({ ...formData, address_line_2: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" /></div>
                <div><label className="block font-bold text-slate-700 mb-1">Postal Code</label><input type="text" value={formData.postal_code || ''} onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" /></div>
                <div><label className="block font-bold text-slate-700 mb-1">Country</label><input type="text" value={formData.country || ''} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" /></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    value={categoryFromMemberCode(formData.member_code)}
                    readOnly
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Profile Photo</label>
                  <div className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-200 border border-slate-200 shrink-0">
                      {profilePhotoPreview ? (
                        <img
                          src={profilePhotoPreview}
                          alt="Profile preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px]">
                          No photo
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-lg font-semibold cursor-pointer hover:bg-slate-100">
                        <Upload className="w-3.5 h-3.5" />
                        {profilePhotoPreview ? 'Change Photo' : 'Upload Photo'}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="sr-only"
                          onChange={(event) => {
                            void handleProfilePhotoChange(event.target.files?.[0]);
                            event.currentTarget.value = '';
                          }}
                        />
                      </label>
                      {profilePhotoPreview && (
                        <button
                          type="button"
                          onClick={() => {
                            if (profilePhotoFile) {
                              if (profilePhotoPreview.startsWith('blob:')) {
                                URL.revokeObjectURL(profilePhotoPreview);
                              }
                              setProfilePhotoFile(null);
                              setProfilePhotoPreview(selectedMember?.photo_url ?? null);
                            } else {
                              setProfilePhotoPreview(null);
                              setRemoveProfilePhoto(true);
                            }
                          }}
                          className="ml-2 text-rose-600 font-semibold hover:underline"
                        >
                          Remove
                        </button>
                      )}
                      <p className="mt-1 text-[10px] text-slate-500">
                        JPG, PNG or WebP · max 2 MB · saved as 512×512 WebP
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Membership Status
                </label>
                {selectedMember ? (
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
                ) : (
                  <div className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-semibold text-slate-700">
                    Active
                    <span className="ml-2 font-normal text-slate-500">
                      New members are created as active.
                    </span>
                  </div>
                )}
              </div>
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
                <div>
                  <span className="font-bold text-amber-900 block">Management Assignment</span>
                  <p className="text-[11px] text-amber-800 mt-1">
                    Optional. Use this only when this member currently holds a management position.
                  </p>
                </div>

                <label className="flex items-center gap-2 text-slate-800 font-semibold">
                  <input
                    type="checkbox"
                    checked={assignManagement}
                    onChange={(e) => {
                      const enabled = e.target.checked;
                      setAssignManagement(enabled);
                      if (!enabled) {
                        setAssignmentId('');
                        setPositionId('');
                        setTermId('');
                      }
                    }}
                    className="h-4 w-4"
                  />
                  Assign this member to management
                </label>

                {assignManagement && (
                  <>
                    {selectedMember && selectedMember.management_assignments?.length ? (
                      <select
                        value={assignmentId}
                        onChange={(e) => {
                          const nextId = e.target.value;
                          const next = selectedMember.management_assignments?.find(
                            (assignment) => assignment.id === nextId,
                          );
                          setAssignmentId(nextId);
                          setPositionId(next?.position_id ?? '');
                          setTermId(next?.term_id ?? '');
                        }}
                        className="w-full p-2 bg-white border border-amber-300 rounded-lg"
                      >
                        <option value="">Create another assignment</option>
                        {selectedMember.management_assignments.map((assignment) => (
                          <option key={assignment.id} value={assignment.id}>
                            {assignment.position.name} — {assignment.term.name}
                          </option>
                        ))}
                      </select>
                    ) : null}

                    {management.positions.filter((position) => position.isActive).length === 0 ||
                    management.terms.length === 0 ? (
                      <div className="rounded-lg bg-white border border-amber-200 p-3 text-amber-900">
                        <p className="font-semibold">Management setup is incomplete.</p>
                        <p className="mt-1">
                          Create at least one active position and one management term before assigning this member.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(false);
                            onNavigateTab('management');
                          }}
                          className="mt-2 px-3 py-1.5 bg-blue-900 text-white rounded-lg font-semibold"
                        >
                          Manage Positions & Terms
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block font-semibold text-amber-900 mb-1">Management Position</label>
                          <select
                            value={positionId}
                            onChange={(e) => setPositionId(e.target.value)}
                            className="w-full p-2 bg-white border border-amber-300 rounded-lg"
                            required
                          >
                            <option value="">Select position</option>
                            {management.positions
                              .filter((position) => position.isActive)
                              .map((position) => (
                                <option key={position.id} value={position.id}>
                                  {position.name}
                                </option>
                              ))}
                          </select>
                        </div>

                        <div>
                          <label className="block font-semibold text-amber-900 mb-1">Management Term</label>
                          <select
                            value={termId}
                            onChange={(e) => setTermId(e.target.value)}
                            className="w-full p-2 bg-white border border-amber-300 rounded-lg"
                            required
                          >
                            <option value="">Select term</option>
                            {management.terms.map((term) => (
                              <option key={term.id} value={term.id}>
                                {term.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {!assignManagement && (
                  <p className="text-[11px] text-slate-600">
                    Leave this unchecked for an ordinary member. You can assign management later by editing the member.
                  </p>
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
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.visibility?.address_public || false}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          visibility: {
                            ...(formData.visibility as any),
                            address_public: e.target.checked,
                          },
                        })
                      }
                    />
                    <span>Show Address Publicly</span>
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
                  disabled={isSaving}
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving...' : 'Save Member Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
