// src/api/customFields.ts

export function getCustomField<T>(
  record: { customFields?: Record<string, unknown> | null },
  key: string,
  fallback: T,
): T {
  const value = record.customFields?.[key];

  return (
    value === undefined || value === null
      ? fallback
      : (value as T)
  );
}
