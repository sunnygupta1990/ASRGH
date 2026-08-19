import test from 'node:test';
import assert from 'node:assert/strict';
import { categoryFromMemberCode, compareMembersByCode, filterMembersByCategory } from './memberClassification.ts';
import type { Member } from '../types.ts';

const member = (code: string): Member => ({ id: code, member_code: code, first_name: code, last_name: '', display_name: code, category: categoryFromMemberCode(code), designation: categoryFromMemberCode(code), current_management: false, display_order: 0, status: 'active', visibility: { phone_public: false, email_public: false, address_public: false, photo_public: true, designation_public: true } });
const members = ['O-1', 'L-10', 'T-10', 'T-002', 'T-1', 'L-2'].map(member);

test('frontend classification and numeric-aware ordering match Member Code rules', () => {
  assert.equal(categoryFromMemberCode('t-1'), 'Trustee');
  assert.equal(categoryFromMemberCode('L-1'), 'Life Member');
  assert.equal(categoryFromMemberCode('ABC-1'), 'Ordinary');
  assert.deepEqual([...members].sort(compareMembersByCode).map((item) => item.member_code), ['T-1', 'T-002', 'T-10', 'L-2', 'L-10', 'O-1']);
});

test('All, Trustee, Life Member, and Ordinary filters return exact categories', () => {
  assert.equal(filterMembersByCategory(members, 'all').length, 6);
  assert.ok(filterMembersByCategory(members, 'Trustee').every((item) => item.category === 'Trustee'));
  assert.ok(filterMembersByCategory(members, 'Life Member').every((item) => item.category === 'Life Member'));
  assert.ok(filterMembersByCategory(members, 'Ordinary').every((item) => item.category === 'Ordinary'));
  assert.deepEqual(['Trustee', 'Life Member', 'Ordinary'].map((category) => filterMembersByCategory(members, category).length), [3, 2, 1]);
});
