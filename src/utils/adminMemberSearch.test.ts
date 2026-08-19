import test from 'node:test';
import assert from 'node:assert/strict';
import { filterAdminMembers } from './adminMemberSearch.ts';
import type { Member } from '../types.ts';

const member = (overrides: Partial<Member>): Member => ({
  id: '1', member_code: 'MEM-0001', first_name: 'Tushal', last_name: 'Singhal',
  display_name: 'Sh. Tushal Singhal', category: 'Life Member', designation: 'Life Member',
  current_management: false, display_order: 1, status: 'active',
  visibility: { phone_public: false, email_public: false, address_public: false, photo_public: true, designation_public: true },
  ...overrides,
});

const members = [
  member({}),
  member({ id: '2', member_code: 'T-0099', first_name: 'Asha', last_name: 'Gupta', display_name: 'Asha Gupta', category: 'Trustee', designation: 'Trustee', current_management: true, phone: '9876543210' }),
];

const search = (value: string) => filterAdminMembers(members, { search: value, category: 'all', management: 'all' });

test('searching tush finds Sh. Tushal Singhal case-insensitively', () => {
  assert.deepEqual(search('tush').map((item) => item.display_name), ['Sh. Tushal Singhal']);
  assert.deepEqual(search('TuSH').map((item) => item.display_name), ['Sh. Tushal Singhal']);
});

test('member-code and designation searches still work', () => {
  assert.deepEqual(search('T-0099').map((item) => item.id), ['2']);
  assert.deepEqual(search('trustee').map((item) => item.id), ['2']);
});

test('category and management filters still compose with search', () => {
  assert.deepEqual(filterAdminMembers(members, { search: 'asha', category: 'Trustee', management: 'yes' }).map((item) => item.id), ['2']);
  assert.equal(filterAdminMembers(members, { search: 'asha', category: 'Life Member', management: 'all' }).length, 0);
  assert.equal(filterAdminMembers(members, { search: '', category: 'all', management: 'no' }).length, 1);
});
