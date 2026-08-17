// frontend/src/api/publicContent.ts

import { fetchPublicEvents } from './events';
import { fetchPublicMembers } from './members';
import { apiRequest } from './client';

export async function fetchPublicContent() {
  const [events, members, settingsResponse] = await Promise.all([
    fetchPublicEvents(),
    fetchPublicMembers(),
    apiRequest<{ success: true; data: { organization: Record<string, unknown>; websiteSetting: Record<string, unknown> | null } }>('/api/public/settings'),
  ]);

  return {
    events,
    members,
    settings: settingsResponse.data,
  };
}

export async function submitPublicContact(data: Record<string, unknown>): Promise<unknown> {
  const response = await apiRequest<{ success: true; data: unknown }>('/api/public/contacts', { method: 'POST', body: JSON.stringify(data) });
  return response.data;
}
