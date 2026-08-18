// frontend/src/api/adminPortal.ts

import {
  Announcement,
  AuditLog,
  ContactSubmission,
  Employee,
  ImportBatch,
  Milestone,
  NotificationRecord,
  OrganizationSettings,
  Role,
  SocialLink,
  SocialWorkActivity,
  SocialWorkCategory,
  StatisticItem,
} from '../types';
import { apiRequest } from './client';

export interface AdminPortalState {
  organization: Record<string, unknown> | null;
  websiteSetting: Record<string, unknown> | null;
  members: unknown[];
  events: unknown[];
  socialWorkCategories: unknown[];
  socialWorkActivities: unknown[];
  announcements: unknown[];
  contacts: unknown[];
  notifications: unknown[];
  auditLogs: unknown[];
  employees: unknown[];
  roles: unknown[];
  importBatches: unknown[];
  rejectedRecords: unknown[];
  dataExports: unknown[];
  adminUiState: {
    settings?: OrganizationSettings;
    socialLinks?: SocialLink[];
    statistics?: StatisticItem[];
    milestones?: Milestone[];
    achievements?: unknown[];
    [key: string]: unknown;
  };
}

interface StateResponse {
  success: true;
  data: AdminPortalState;
}

export async function fetchAdminPortalState(): Promise<AdminPortalState> {
  const response = await apiRequest<StateResponse>('/api/admin/portal/state');
  return response.data;
}

export async function createSocialWorkActivityApi(
  activity: Record<string, unknown>,
): Promise<unknown> {
  const response = await apiRequest<{ success: true; data: unknown }>(
    '/api/admin/portal/social-work',
    {
      method: 'POST',
      body: JSON.stringify(activity),
    },
  );
  return response.data;
}

export async function updateSocialWorkActivityApi(
  id: string,
  activity: Record<string, unknown>,
): Promise<unknown> {
  const response = await apiRequest<{ success: true; data: unknown }>(
    `/api/admin/portal/social-work/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(activity),
    },
  );
  return response.data;
}

export async function archiveSocialWorkActivityApi(
  id: string,
): Promise<unknown> {
  const response = await apiRequest<{ success: true; data: unknown }>(
    `/api/admin/portal/social-work/${id}/archive`,
    { method: 'PATCH' },
  );
  return response.data;
}

export async function deleteSocialWorkActivityApi(id: string): Promise<void> {
  await apiRequest(`/api/admin/portal/social-work/${id}`, {
    method: 'DELETE',
  });
}

export async function createAnnouncementApi(
  announcement: Record<string, unknown>,
): Promise<unknown> {
  const response = await apiRequest<{ success: true; data: unknown }>(
    '/api/admin/portal/announcements',
    {
      method: 'POST',
      body: JSON.stringify(announcement),
    },
  );
  return response.data;
}

export async function updateAnnouncementApi(
  id: string,
  announcement: Record<string, unknown>,
): Promise<unknown> {
  const response = await apiRequest<{ success: true; data: unknown }>(
    `/api/admin/portal/announcements/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(announcement),
    },
  );
  return response.data;
}

export async function archiveAnnouncementApi(id: string): Promise<unknown> {
  const response = await apiRequest<{ success: true; data: unknown }>(
    `/api/admin/portal/announcements/${id}/archive`,
    { method: 'PATCH' },
  );
  return response.data;
}

export async function deleteAnnouncementApi(id: string): Promise<void> {
  await apiRequest(`/api/admin/portal/announcements/${id}`, {
    method: 'DELETE',
  });
}

export async function updateContactApi(
  id: string,
  data: {
    status?: string;
    assignedTo?: string | null;
    notes?: string;
  },
): Promise<unknown> {
  const response = await apiRequest<{ success: true; data: unknown }>(
    `/api/admin/portal/contacts/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    },
  );
  return response.data;
}

export async function createNotificationApi(
  data: Record<string, unknown>,
): Promise<unknown> {
  const response = await apiRequest<{ success: true; data: unknown }>(
    '/api/admin/portal/notifications',
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
  );
  return response.data;
}

export async function createSocialWorkCategoryApi(data: Record<string, unknown>): Promise<unknown> {
  const response = await apiRequest<{ success: true; data: unknown }>('/api/admin/operations/social-work/categories', { method: 'POST', body: JSON.stringify(data) });
  return response.data;
}

export async function updateSocialWorkCategoryApi(id: string, data: Record<string, unknown>): Promise<unknown> {
  const response = await apiRequest<{ success: true; data: unknown }>(`/api/admin/operations/social-work/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  return response.data;
}

export async function deleteSocialWorkCategoryApi(id: string): Promise<void> {
  await apiRequest(`/api/admin/operations/social-work/categories/${id}`, { method: 'DELETE' });
}

export async function updateNotificationApi(id: string, data: Record<string, unknown>): Promise<unknown> {
  const response = await apiRequest<{ success: true; data: unknown }>(`/api/admin/operations/notifications/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  return response.data;
}

export async function deleteNotificationApi(id: string): Promise<void> {
  await apiRequest(`/api/admin/operations/notifications/${id}`, { method: 'DELETE' });
}

export async function updateAdminUserApi(id: string, data: { status?: string; roleIds?: string[] }): Promise<unknown> {
  const response = await apiRequest<{ success: true; data: unknown }>(`/api/admin/operations/admin-users/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  return response.data;
}

export async function resolveRejectedRecordApi(id: string): Promise<void> {
  await apiRequest(`/api/admin/operations/rejected-records/${id}/resolve`, { method: 'PATCH' });
}

export async function commitImportApi(entityType: 'members' | 'events' | 'social_work' | 'announcements', filename: string, rows: Record<string, string>[]): Promise<{ accepted: number; rejected: number }> {
  const response = await apiRequest<{ success: true; data: { accepted: number; rejected: number } }>('/api/admin/operations/imports', { method: 'POST', body: JSON.stringify({ entityType, filename, rows }) });
  return response.data;
}

export async function exportAdminDataApi(entityType: 'members' | 'events' | 'social_work' | 'announcements'): Promise<{ filename: string; mimeType: string; contentBase64: string }> {
  return apiRequest<{ success: true; filename: string; mimeType: string; contentBase64: string }>(`/api/admin/operations/exports/${entityType}`);
}

export interface ManagementData { positions: Array<Record<string, unknown>>; terms: Array<Record<string, unknown>>; assignments: Array<Record<string, unknown>> }
export async function fetchManagementApi(): Promise<ManagementData> { const response = await apiRequest<{ success: true; data: ManagementData }>('/api/admin/management'); return response.data; }
export async function createManagementPositionApi(data: Record<string, unknown>) { return (await apiRequest<{ success: true; data: unknown }>('/api/admin/management/positions', { method: 'POST', body: JSON.stringify(data) })).data; }
export async function updateManagementPositionApi(id: string, data: Record<string, unknown>) { return (await apiRequest<{ success: true; data: unknown }>(`/api/admin/management/positions/${id}`, { method: 'PUT', body: JSON.stringify(data) })).data; }
export async function deleteManagementPositionApi(id: string) { await apiRequest(`/api/admin/management/positions/${id}`, { method: 'DELETE' }); }
export async function createManagementTermApi(data: Record<string, unknown>) { return (await apiRequest<{ success: true; data: unknown }>('/api/admin/management/terms', { method: 'POST', body: JSON.stringify(data) })).data; }
export async function updateManagementTermApi(id: string, data: Record<string, unknown>) { return (await apiRequest<{ success: true; data: unknown }>(`/api/admin/management/terms/${id}`, { method: 'PUT', body: JSON.stringify(data) })).data; }
export async function deleteManagementTermApi(id: string) { await apiRequest(`/api/admin/management/terms/${id}`, { method: 'DELETE' }); }
export async function createManagementAssignmentApi(data: Record<string, unknown>) { return (await apiRequest<{ success: true; data: unknown }>('/api/admin/management/assignments', { method: 'POST', body: JSON.stringify(data) })).data; }
export async function updateManagementAssignmentApi(id: string, data: Record<string, unknown>) { return (await apiRequest<{ success: true; data: unknown }>(`/api/admin/management/assignments/${id}`, { method: 'PUT', body: JSON.stringify(data) })).data; }
export async function deleteManagementAssignmentApi(id: string) { await apiRequest(`/api/admin/management/assignments/${id}`, { method: 'DELETE' }); }

export interface DashboardData { counts: { members: number; events: number; photos: number; socialWork: number; announcements: number; contacts: number; notifications: number; rejectedImports: number }; recentActivity: unknown[] }
export async function fetchDashboardApi(): Promise<DashboardData> {
  const response = await apiRequest<{ success: true; data: DashboardData }>('/api/admin/operations/dashboard');
  return response.data;
}

export async function updateSettingsBundleApi(data: { organization?: Record<string, unknown>; uiState?: Record<string, unknown>; websiteSetting?: Record<string, unknown> }): Promise<void> {
  await apiRequest('/api/admin/operations/settings', { method: 'PUT', body: JSON.stringify(data) });
}


export interface StaffAccess {
  members: boolean;
  events: boolean;
  circular: boolean;
  helpdesk: boolean;
  notifications: boolean;
  socialWelfare: boolean;
}

export interface StaffRecord {
  id: string;
  employeeId: string;
  displayName: string;
  email: string;
  phone?: string | null;
  dateOfBirth?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  designation?: string | null;
  status: 'active' | 'blocked' | 'suspended' | 'archived';
  failedLoginAttempts: number;
  lastFailedLoginAt?: string | null;
  blockedAt?: string | null;
  lastLoginAt?: string | null;
  createdAt: string;
  role?: { id: string; code: string; name: string } | null;
  permissions: string[];
  access: StaffAccess;
}

export interface StaffInput {
  employeeId: string;
  displayName: string;
  email: string;
  password?: string;
  dateOfBirth?: string | null;
  phone?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  designation?: string | null;
  status?: 'active' | 'suspended';
  access: StaffAccess;
}

export async function fetchStaffApi(): Promise<StaffRecord[]> {
  const response = await apiRequest<{ success: true; data: StaffRecord[] }>(
    '/api/admin/staff',
  );
  return response.data;
}

export async function createStaffApi(data: StaffInput): Promise<StaffRecord> {
  const response = await apiRequest<{ success: true; data: StaffRecord }>(
    '/api/admin/staff',
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
  );
  return response.data;
}

export async function updateStaffApi(
  id: string,
  data: Partial<StaffInput>,
): Promise<StaffRecord> {
  const response = await apiRequest<{ success: true; data: StaffRecord }>(
    `/api/admin/staff/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    },
  );
  return response.data;
}

export async function releaseStaffApi(id: string): Promise<StaffRecord> {
  const response = await apiRequest<{ success: true; data: StaffRecord }>(
    `/api/admin/staff/${id}/release`,
    {
      method: 'POST',
    },
  );
  return response.data;
}

export async function resetStaffPasswordApi(
  id: string,
  password: string,
): Promise<StaffRecord> {
  const response = await apiRequest<{ success: true; data: StaffRecord }>(
    `/api/admin/staff/${id}/reset-password`,
    {
      method: 'POST',
      body: JSON.stringify({ password }),
    },
  );
  return response.data;
}

export async function deleteStaffApi(id: string): Promise<void> {
  await apiRequest(`/api/admin/staff/${id}`, {
    method: 'DELETE',
  });
}
