import test from 'node:test';
import assert from 'node:assert/strict';
import { matchesPublicMemberSearch, memberCategoryLabel, membersDirectoryCopy } from './membersDirectory.ts';
import { filterMembersByCategory } from './memberClassification.ts';
import type { Member } from '../types.ts';

const ajay: Member = {
  id: 'ajay', member_code: 'T-181', first_name: 'Ajay', last_name: '', display_name: 'Sh.AjayGarg', category: 'Trustee', designation: 'Trustee', city: 'New Delhi', native_place: 'Agra', current_management: false, display_order: 1, status: 'active', visibility: { phone_public: false, email_public: false, address_public: false, photo_public: true, designation_public: true },
};

test('Members Directory copy switches English to Hindi and back without changing names', () => {
  assert.equal(membersDirectoryCopy('en').title, 'Members Directory');
  assert.equal(membersDirectoryCopy('hi').title, 'सदस्य निर्देशिका');
  assert.equal(membersDirectoryCopy('en').title, 'Members Directory');
  assert.equal(ajay.display_name, 'Sh.AjayGarg');
  assert.equal(memberCategoryLabel('Trustee', 'hi'), 'न्यासी');
  assert.deepEqual(filterMembersByCategory([ajay], 'Trustee').map((member) => member.id), ['ajay']);
});

test('public member search matches exact, case-insensitive, and partial Member Codes', () => {
  for (const query of ['T-181', 't-181', 'T-18', '181', '  t-181  ']) {
    assert.equal(matchesPublicMemberSearch(ajay, query), true, query);
  }
});

test('existing name, designation, city, and native-place search remains available', () => {
  for (const query of ['ajay', 'Sh.AjayGarg', 'trustee', 'new delhi', 'agra']) {
    assert.equal(matchesPublicMemberSearch(ajay, query), true, query);
  }
});
