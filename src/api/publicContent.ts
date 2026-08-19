// frontend/src/api/publicContent.ts

import { apiRequest } from './client';
import { mapBackendEvent, type BackendEvent } from './events';
import { mapBackendMember, type BackendMember } from './members';

export async function fetchPublicContent() {
  const response = await apiRequest<{
    success: true;
    data: {
      events: BackendEvent[];
      members: BackendMember[];
      settings: { organization: Record<string, unknown>; websiteSetting: Record<string, unknown> | null };
      announcements: unknown[];
      socialWork: unknown[];
    };
  }>('/api/public/content');
  return {
    ...response.data,
    events: response.data.events.map(mapBackendEvent),
    members: response.data.members.map(mapBackendMember),
  };
}

export async function submitPublicContact(data: Record<string, unknown>): Promise<unknown> {
  const response = await apiRequest<{ success: true; data: unknown }>('/api/public/contacts', { method: 'POST', body: JSON.stringify(data) });
  return response.data;
}
