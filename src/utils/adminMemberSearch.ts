import type { Member } from '../types';

export interface AdminMemberFilters {
  search: string;
  category: string;
  management: string;
}

const LEGACY_EMPTY_CONTACT = /^(?:[-—–]+|(?:â€”|â€“|â€”)|(?:phone|email)\s*(?:[-—–]+|â€”|â€“|â€”))$/i;

export function adminContactValue(value: string | null | undefined): string {
  const normalized = String(value ?? '').trim();
  return !normalized || LEGACY_EMPTY_CONTACT.test(normalized) ? '' : normalized;
}

export function filterAdminMembers(
  members: Member[],
  filters: AdminMemberFilters,
): Member[] {
  const query = filters.search.trim().toLocaleLowerCase();

  return members.filter((member) => {
    if (filters.category !== 'all' && member.category !== filters.category) return false;
    if (filters.management === 'yes' && !member.current_management) return false;
    if (filters.management === 'no' && member.current_management) return false;
    if (!query) return true;

    return [
      member.display_name,
      member.first_name,
      member.middle_name,
      member.last_name,
      member.member_code,
      member.designation,
      member.category,
      member.management_post,
      member.current_management ? 'management' : 'non-management',
      adminContactValue(member.phone),
      adminContactValue(member.email),
    ].some((value) => value?.toLocaleLowerCase().includes(query));
  });
}
