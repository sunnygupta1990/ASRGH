import type { AppLanguage, Member, MemberCategory } from '../types';

const copy = {
  en: {
    badge: 'Verified Community Directory', title: 'Members Directory', subtitle: 'Connect with registered community members across all membership categories.',
    searchPlaceholder: 'Search by member code, name, designation, city, or native place...', clear: 'Clear', filterLabel: 'Filter by Member Category', all: 'All', alphabetJump: 'A-Z Jump:',
    noRecords: 'No member records found.', noRecordsHint: 'Try another name, keyword, or clear your filters.', resetFilters: 'Reset Filters', management: 'Management', viewProfile: 'View Full Profile',
    native: 'Native', residing: 'Residing', aboutMember: 'About Member', memberId: 'Member Registration ID:', membershipStatus: 'Membership Status:', nativePlace: 'Native Place (Mool Niwas):', currentCity: 'Current City:', address: 'Address:', memberSince: 'Member Since:', contactDetails: 'Contact Details', phonePrivate: 'Phone is marked private by member', closeProfile: 'Close Profile', loadError: 'Unable to load public events and members',
  },
  hi: {
    badge: 'सत्यापित सामुदायिक सदस्य सूची', title: 'सदस्य निर्देशिका', subtitle: 'सभी सदस्यता श्रेणियों के पंजीकृत सामुदायिक सदस्यों से जुड़ें।',
    searchPlaceholder: 'सदस्य कोड, नाम, पदनाम, शहर या मूल निवास से खोजें...', clear: 'साफ़ करें', filterLabel: 'सदस्य श्रेणी से फ़िल्टर करें', all: 'सभी', alphabetJump: 'अक्षर चुनें:',
    noRecords: 'कोई सदस्य रिकॉर्ड नहीं मिला।', noRecordsHint: 'दूसरा नाम या शब्द खोजें अथवा फ़िल्टर हटाएँ।', resetFilters: 'फ़िल्टर रीसेट करें', management: 'प्रबंधन', viewProfile: 'पूरा परिचय देखें',
    native: 'मूल निवास', residing: 'निवास', aboutMember: 'सदस्य परिचय', memberId: 'सदस्य पंजीकरण आईडी:', membershipStatus: 'सदस्यता स्थिति:', nativePlace: 'मूल निवास:', currentCity: 'वर्तमान शहर:', address: 'पता:', memberSince: 'सदस्यता आरंभ:', contactDetails: 'संपर्क विवरण', phonePrivate: 'सदस्य ने फ़ोन नंबर निजी रखा है', closeProfile: 'परिचय बंद करें', loadError: 'सार्वजनिक कार्यक्रम और सदस्य लोड नहीं हो सके',
  },
} as const;

export function membersDirectoryCopy(language: AppLanguage) {
  return copy[language];
}

const categoryLabels: Record<AppLanguage, Record<MemberCategory, string>> = {
  en: { Trustee: 'Trustee', 'Life Member': 'Life Member', Ordinary: 'Ordinary' },
  hi: { Trustee: 'न्यासी', 'Life Member': 'आजीवन सदस्य', Ordinary: 'साधारण सदस्य' },
};

export function memberCategoryLabel(category: MemberCategory, language: AppLanguage): string {
  return categoryLabels[language][category];
}

export function matchesPublicMemberSearch(member: Member, searchQuery: string): boolean {
  const query = searchQuery.trim().toLocaleLowerCase();
  if (!query) return true;
  return [member.member_code, member.display_name, member.first_name, member.middle_name, member.last_name, member.designation, member.category, member.city, member.native_place, member.management_post]
    .some((value) => value?.toLocaleLowerCase().includes(query));
}
