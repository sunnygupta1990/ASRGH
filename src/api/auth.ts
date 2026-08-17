import { apiRequest } from './client';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  status?: string;
  lastLoginAt?: string | null;
  roleId?: string | null;
  roleName?: string;
  roles?: { id: string; name: string; isSystemRole: boolean }[];
  permissions?: string[];
  isSystemRole?: boolean;
}

interface LoginResponse {
  success: true;
  token: string;
  user: AuthUser;
}

interface MeResponse {
  success: true;
  user: AuthUser;
}

export async function loginAdmin(email: string, password: string): Promise<AuthUser> {
  const response = await apiRequest<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  localStorage.setItem('asrgh_admin_token', response.token);
  return response.user;
}

export async function getCurrentAdmin(): Promise<AuthUser> {
  const response = await apiRequest<MeResponse>('/api/admin/me');
  return response.user;
}

export function clearAdminSession(): void {
  localStorage.removeItem('asrgh_admin_token');
}

export function hasAdminToken(): boolean {
  return Boolean(localStorage.getItem('asrgh_admin_token'));
}
