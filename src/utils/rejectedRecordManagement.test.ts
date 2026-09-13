import test from 'node:test';
import assert from 'node:assert/strict';
import { applyRejectionResults, canRetryRejection } from './rejectedRecordManagement.ts';
import type { ManagedRejection } from '../api/rejectedRecords';

const row = (id: string, correctionStatus = 'open'): ManagedRejection => ({
  id, correctionStatus, rejectionReason: 'First Name is required', correctedData: {}, createdAt: '',
  importRecord: { rowNumber: 2, recordKey: id, sourceData: {}, targetEntityId: null, batch: { entityType: 'members', originalFilename: 'members.xlsx' } },
});

test('successful dismiss/delete/import immediately remove rows from the open view', () => {
  const records = [row('dismiss'), row('delete'), row('import'), row('untouched')];
  const updated = applyRejectionResults(records, [
    { id: 'dismiss', outcome: 'dismissed', record: row('dismiss', 'dismissed') },
    { id: 'delete', outcome: 'deleted', record: null },
    { id: 'import', outcome: 'imported', record: row('import', 'resolved') },
  ], 'open');
  assert.deepEqual(updated.map(r => r.id), ['untouched']);
});

test('partial retry failures retain rows and show new validation reasons', () => {
  const failed = { ...row('failed'), rejectionReason: 'Date of Birth must be YYYY-MM-DD' };
  const updated = applyRejectionResults([row('failed'), row('error')], [
    { id: 'failed', outcome: 'failed', record: failed }, { id: 'error', outcome: 'error' },
  ], 'open');
  assert.equal(updated.length, 2);
  assert.equal(updated[0].rejectionReason, failed.rejectionReason);
  assert.equal(updated[1].rejectionReason, 'First Name is required');
});

test('resolved/dismissed and all views retain successful status updates', () => {
  const result = { id: 'one', outcome: 'dismissed', record: row('one', 'dismissed') };
  assert.equal(applyRejectionResults([row('one')], [result], 'closed')[0].correctionStatus, 'dismissed');
  assert.equal(applyRejectionResults([row('one')], [result], 'all').length, 1);
});

test('retry eligibility includes legacy dismissal and excludes imported/unsupported rows', () => {
  const legacy = row('legacy', 'resolved');
  assert.equal(canRetryRejection(legacy), true);
  legacy.importRecord.targetEntityId = 'member-1';
  assert.equal(canRetryRejection(legacy), false);
  const unsupported = row('old'); unsupported.importRecord.batch.entityType = 'unknown';
  assert.equal(canRetryRejection(unsupported), false);
});
