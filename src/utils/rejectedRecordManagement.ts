import type { ManagedRejection, RejectionResult } from '../api/rejectedRecords';

export const rejectionModules = ['members', 'events', 'social_work', 'announcements'];
export function canRetryRejection(record: ManagedRejection) {
  return !record.importRecord.targetEntityId && rejectionModules.includes(record.importRecord.batch.entityType);
}
export function applyRejectionResults(records: ManagedRejection[], results: RejectionResult[], status: string) {
  return records.flatMap(record => {
    const result = results.find(item => item.id === record.id);
    if (!result || result.outcome === 'error') return [record];
    const updated = result.record;
    if (!updated) return [];
    const visible = status === 'all' || (status === 'open'
      ? updated.correctionStatus === 'open'
      : ['resolved', 'dismissed'].includes(updated.correctionStatus));
    return visible ? [updated] : [];
  });
}
