// frontend/src/api/publicContent.ts

import { fetchPublicEvents } from './events';
import { fetchPublicMembers } from './members';

export async function fetchPublicContent() {
  const [events, members] = await Promise.all([
    fetchPublicEvents(),
    fetchPublicMembers(),
  ]);

  return {
    events,
    members,
  };
}
