import type { Member } from '../types';

export interface AdminMemberFilters {
  search: string;
  category: string;
  management: string;
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
      member.phone,
    ].some((value) => value?.toLocaleLowerCase().includes(query));
  });
}
