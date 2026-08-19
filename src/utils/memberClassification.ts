import type { Member, MemberCategory } from '../types';

export const MEMBER_CATEGORIES: MemberCategory[] = ['Trustee', 'Life Member', 'Ordinary'];

export function categoryFromMemberCode(memberCode: string | null | undefined): MemberCategory {
  const code = String(memberCode ?? '').trim().toUpperCase();
  if (code.startsWith('T')) return 'Trustee';
  if (code.startsWith('L')) return 'Life Member';
  return 'Ordinary';
}

const numericCodeCollator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });

export function compareMembersByCode(left: Member, right: Member): number {
  const rank = (code: string) => {
    const category = categoryFromMemberCode(code);
    return category === 'Trustee' ? 0 : category === 'Life Member' ? 1 : 2;
  };
  return rank(left.member_code) - rank(right.member_code)
    || numericCodeCollator.compare(left.member_code, right.member_code);
}

export function filterMembersByCategory(members: Member[], category: string): Member[] {
  return category === 'all' ? members : members.filter((member) => member.category === category);
}
