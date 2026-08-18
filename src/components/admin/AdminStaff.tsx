import React, { useEffect, useMemo, useState } from 'react';
import {
  Check,
  Edit3,
  KeyRound,
  Lock,
  Plus,
  RotateCcw,
  Trash2,
  UserPlus,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  createStaffApi,
  deleteStaffApi,
  fetchStaffApi,
  releaseStaffApi,
  resetStaffPasswordApi,
  updateStaffApi,
} from '../../api/adminPortal';
import type {
  StaffAccess,
  StaffInput,
  StaffRecord,
} from '../../api/adminPortal';

const EMPTY_ACCESS: StaffAccess = {
  members: false,
  events: false,
  circular: false,
  helpdesk: false,
  notifications: false,
  socialWelfare: false,
};

const ACCESS_LABELS: Array<{ key: keyof StaffAccess; label: string }> = [
  { key: 'members', label: 'Members' },
  { key: 'events', label: 'Events' },
  { key: 'circular', label: 'Circular' },
  { key: 'helpdesk', label: 'Helpdesk' },
  { key: 'notifications', label: 'Notification' },
  { key: 'socialWelfare', label: 'Social Welfare Program' },
];

interface FormState {
  employeeId: string;
  displayName: string;
  email: string;
  password: string;
  dateOfBirth: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  designation: string;
  access: StaffAccess;
}

const EMPTY_FORM: FormState = {
  employeeId: '',
  displayName: '',
  email: '',
  password: '',
  dateOfBirth: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  country: 'India',
  designation: '',
  access: EMPTY_ACCESS,
};

function toForm(staff: StaffRecord): FormState {
  return {
    employeeId: staff.employeeId,
    displayName: staff.displayName,
    email: staff.email,
    password: '',
    dateOfBirth: staff.dateOfBirth?.slice(0, 10) ?? '',
    phone: staff.phone ?? '',
    addressLine1: staff.addressLine1 ?? '',
    addressLine2: staff.addressLine2 ?? '',
    city: staff.city ?? '',
    state: staff.state ?? '',
    country: staff.country ?? 'India',
    designation: staff.designation ?? '',
    access: { ...EMPTY_ACCESS, ...staff.access },
  };
}

function statusLabel(status: StaffRecord['status']) {
  if (status === 'blocked') return 'Blocked';
  if (status === 'suspended') return 'Disabled';
  if (status === 'archived') return 'Deleted';
  return 'Active';
}

export const AdminStaff: React.FC = () => {
  const { hasPermission } = useApp();
  const [staff, setStaff] = useState<StaffRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<StaffRecord | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const canWrite = hasPermission('admin_users.write');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setStaff(await fetchStaffApi());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to load staff');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const activeCount = useMemo(
    () => staff.filter((item) => item.status === 'active').length,
    [staff],
  );
  const blockedCount = useMemo(
    () => staff.filter((item) => item.status === 'blocked').length,
    [staff],
  );

  const openCreate = () => {
    setEditing(null);
    setIsFormOpen(true);
    setForm({ ...EMPTY_FORM, access: { ...EMPTY_ACCESS } });
    setError('');
  };

  const openEdit = (item: StaffRecord) => {
    setEditing(item);
    setIsFormOpen(true);
    setForm(toForm(item));
    setError('');
  };

  const closeForm = () => {
    if (!saving) {
      setEditing(null);
      setIsFormOpen(false);
      setForm(EMPTY_FORM);
    }
  };

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const toggleAccess = (key: keyof StaffAccess) => {
    setForm((current) => ({
      ...current,
      access: {
        ...current.access,
        [key]: !current.access[key],
      },
    }));
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (!editing && !form.password) {
        throw new Error('Password is required for a new staff account');
      }

      const payload: StaffInput = {
        employeeId: form.employeeId.trim(),
        displayName: form.displayName.trim(),
        email: form.email.trim(),
        password: form.password || undefined,
        dateOfBirth: form.dateOfBirth || null,
        phone: form.phone.trim() || null,
        addressLine1: form.addressLine1.trim() || null,
        addressLine2: form.addressLine2.trim() || null,
        city: form.city.trim() || null,
        state: form.state.trim() || null,
        country: form.country.trim() || null,
        designation: form.designation.trim() || null,
        access: form.access,
      };

      if (editing) {
        await updateStaffApi(editing.id, payload);
      } else {
        await createStaffApi(payload);
      }

      closeForm();
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to save staff');
    } finally {
      setSaving(false);
    }
  };

  const release = async (item: StaffRecord) => {
    if (!window.confirm(`Release ${item.employeeId} and allow login again?`)) return;

    try {
      await releaseStaffApi(item.id);
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to release account');
    }
  };

  const toggleDisabled = async (item: StaffRecord) => {
    const nextStatus = item.status === 'suspended' ? 'active' : 'suspended';

    try {
      await updateStaffApi(item.id, { status: nextStatus });
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to update status');
    }
  };

  const resetPassword = async (item: StaffRecord) => {
    const password = window.prompt(
      `New password for ${item.employeeId} (minimum 8 characters)`,
    );

    if (!password) return;

    try {
      await resetStaffPasswordApi(item.id, password);
      await load();
      window.alert('Password reset successfully.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to reset password');
    }
  };

  const remove = async (item: StaffRecord) => {
    if (
      !window.confirm(
        `Delete staff account ${item.employeeId}? The account will be disabled and retained for audit.`,
      )
    ) {
      return;
    }

    try {
      await deleteStaffApi(item.id);
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to delete staff');
    }
  };

  if (!hasPermission('admin_users.read')) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm font-semibold text-rose-700">
        You do not have permission to manage staff.
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Administration
          </p>
          <h1 className="mt-1 text-2xl font-black text-slate-900">Staff Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Create staff accounts and control their module access.
          </p>
        </div>

        {canWrite && (
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-900"
          >
            <Plus className="h-4 w-4" />
            Add Staff
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold text-slate-500">Total Staff</p>
          <p className="mt-1 text-2xl font-black text-slate-900">{staff.length}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs font-semibold text-emerald-700">Active</p>
          <p className="mt-1 text-2xl font-black text-emerald-900">{activeCount}</p>
        </div>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <p className="text-xs font-semibold text-rose-700">Blocked</p>
          <p className="mt-1 text-2xl font-black text-rose-900">{blockedCount}</p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading staff...</div>
        ) : staff.length === 0 ? (
          <div className="p-10 text-center">
            <UserPlus className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 font-bold text-slate-700">No staff accounts yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Staff</th>
                  <th className="px-4 py-3">Employee ID</th>
                  <th className="px-4 py-3">Access</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Last Login</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staff.map((item) => (
                  <tr key={item.id} className="align-top">
                    <td className="px-4 py-4">
                      <div className="font-bold text-slate-900">{item.displayName}</div>
                      <div className="text-xs text-slate-500">{item.email}</div>
                      {item.designation && (
                        <div className="mt-1 text-xs text-slate-400">{item.designation}</div>
                      )}
                    </td>
                    <td className="px-4 py-4 font-mono font-bold text-slate-700">
                      {item.employeeId}
                    </td>
                    <td className="max-w-xs px-4 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {ACCESS_LABELS.filter(({ key }) => item.access[key]).map(({ key, label }) => (
                          <span
                            key={key}
                            className="rounded-full bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-800"
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                          item.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : item.status === 'blocked'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {statusLabel(item.status)}
                      </span>
                      {item.status === 'blocked' && (
                        <>
                          <div className="mt-1 text-[11px] text-rose-600">
                            {item.failedLoginAttempts} failed attempts
                          </div>
                          {item.lastFailedLoginAt && (
                            <div className="text-[10px] text-slate-400">
                              {new Date(item.lastFailedLoginAt).toLocaleString()}
                            </div>
                          )}
                        </>
                      )}                    </td>
                    <td className="px-4 py-4 text-xs text-slate-500">
                      {item.lastLoginAt
                        ? new Date(item.lastLoginAt).toLocaleString()
                        : 'Never'}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {item.status === 'blocked' && (
                          <button
                            type="button"
                            onClick={() => void release(item)}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-700"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Release
                          </button>
                        )}
                        {canWrite && (
                          <>
                            <button
                              type="button"
                              onClick={() => openEdit(item)}
                              className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
                              title="Edit staff"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => void resetPassword(item)}
                              className="rounded-lg bg-amber-50 p-2 text-amber-700"
                              title="Reset password"
                            >
                              <KeyRound className="h-4 w-4" />
                            </button>
                            {item.status !== 'blocked' && (
                              <button
                                type="button"
                                onClick={() => void toggleDisabled(item)}
                                className="rounded-lg bg-slate-100 p-2 text-slate-600"
                                title={item.status === 'suspended' ? 'Activate staff' : 'Disable staff'}
                              >
                                <Lock className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => void remove(item)}
                              className="rounded-lg bg-rose-50 p-2 text-rose-700"
                              title="Delete staff"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4">
          <form
            onSubmit={save}
            className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <div>
                <h2 className="font-black text-slate-900">
                  {editing ? 'Edit Staff' : 'Add Staff'}
                </h2>
                <p className="text-xs text-slate-500">
                  Employee ID is used for staff login.
                </p>
              </div>
              <button type="button" onClick={closeForm} className="rounded-lg p-2 text-slate-500">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ['employeeId', 'Employee ID', 'text', true],
                  ['displayName', 'Name', 'text', true],
                  ['email', 'Email', 'email', true],
                  ['designation', 'Designation', 'text', false],
                  ['phone', 'Phone', 'tel', false],
                  ['dateOfBirth', 'Date of Birth', 'date', false],
                ].map(([key, label, type, required]) => (
                  <label key={key as string} className="block">
                    <span className="mb-1.5 block text-xs font-bold text-slate-700">
                      {label as string}
                    </span>
                    <input
                      type={type as string}
                      required={Boolean(required)}
                      value={form[key as keyof FormState] as string}
                      onChange={(event) =>
                        updateField(key as keyof FormState, event.target.value as never)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-800 focus:bg-white"
                    />
                  </label>
                ))}

                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-xs font-bold text-slate-700">
                    {editing ? 'New Password (optional)' : 'Password'}
                  </span>
                  <input
                    type="password"
                    required={!editing}
                    minLength={8}
                    value={form.password}
                    onChange={(event) => updateField('password', event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-800 focus:bg-white"
                    placeholder="Minimum 8 characters"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ['addressLine1', 'Address Line 1'],
                  ['addressLine2', 'Address Line 2'],
                  ['city', 'City'],
                  ['state', 'State'],
                  ['country', 'Country'],
                ].map(([key, label]) => (
                  <label key={key} className="block">
                    <span className="mb-1.5 block text-xs font-bold text-slate-700">{label}</span>
                    <input
                      value={form[key as keyof FormState] as string}
                      onChange={(event) =>
                        updateField(key as keyof FormState, event.target.value as never)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-800 focus:bg-white"
                    />
                  </label>
                ))}
              </div>

              <div>
                <div className="mb-2 text-sm font-black text-slate-800">Access</div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {ACCESS_LABELS.map(({ key, label }) => (
                    <label
                      key={key}
                      className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={form.access[key]}
                        onChange={() => toggleAccess(key)}
                        className="sr-only"
                      />
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                          form.access[key]
                            ? 'border-blue-900 bg-blue-900 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {form.access[key] && <Check className="h-3.5 w-3.5" />}
                      </span>
                      <span className="text-sm font-semibold text-slate-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-200 bg-white px-6 py-4">
              <button
                type="button"
                onClick={closeForm}
                className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-blue-950 px-5 py-2.5 text-sm font-black text-white disabled:opacity-50"
              >
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Staff'}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
};
