import { apiRequest } from './client';

export interface ManagedRejection {
  id: string;
  correctionStatus: string;
  rejectionReason: string;
  correctedData: Record<string, string>;
  createdAt: string;
  importRecord: {
    rowNumber: number;
    recordKey: string;
    sourceData: Record<string, string>;
    targetEntityId: string | null;
    batch: { entityType: string; originalFilename: string };
  };
}
export type RejectionAction = 'save' | 'retry' | 'dismiss' | 'delete';
export interface RejectionResult { id: string; outcome: string; record?: ManagedRejection | null; message?: string }
const base = '/api/admin/operations/rejected-records';
export async function fetchRejections(status: string, module: string, page: number) {
  return (await apiRequest<{ data: { records: ManagedRejection[]; total: number } }>(`${base}?${new URLSearchParams({ status, module, page: String(page) })}`)).data;
}
export async function actOnRejections(action: RejectionAction, ids: string[], correctedData?: Record<string, string>) {
  return (await apiRequest<{ data: { results: RejectionResult[] } }>(`${base}/actions`, { method: 'POST', body: JSON.stringify({ action, ids, correctedData }) })).data.results;
}
export async function clearRejections(module: string) {
  return (await apiRequest<{ data: { count: number } }>(`${base}/clear`, { method: 'POST', body: JSON.stringify({ module }) })).data;
}
