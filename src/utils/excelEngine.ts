import * as XLSX from 'xlsx';
import { Member, Event, SocialWorkActivity, Announcement, Milestone, Achievement, RejectedRecord } from '../types';

export interface ValidationResult<T> {
  passed: T[];
  failed: {
    rowNumber: number;
    reference: string;
    rawData: Record<string, string>;
    error: string;
    suggestedFix?: string;
  }[];
  warnings: {
    rowNumber: number;
    reference: string;
    warning: string;
  }[];
  structuralError?: string;
}

// Module template column definitions
export const TEMPLATE_SPECS = {
  members: {
    title: 'Members Import Template',
    filename: 'members_import.xlsx',
    columns: [
      'Member Code',
      'First Name',
      'Middle Name',
      'Last Name',
      'Display Name',
      'Gender',
      'Date of Birth',
      'Member Category',
      'Designation',
      'Phone',
      'Email',
      'Address Line 1',
      'Address Line 2',
      'City',
      'State',
      'Postal Code',
      'Country',
      'Status',
      'Joined Date',
      'Notes',
      'Metadata JSON',
      'Custom Fields JSON'
    ],
    sampleRows: [
      {
        'Member Code': 'MEM-0009',
        'First Name': 'Deepak',
        'Middle Name': '',
        'Last Name': 'Garg',
        'Display Name': 'Shri Deepak Garg',
        'Gender': 'Male',
        'Date of Birth': '1985-04-20',
        'Member Category': 'General',
        'Designation': 'Community Member',
        'Phone': '+91 98111 99887',
        'Email': 'deepak.garg@example.com',
        'Address Line 1': 'Community Housing',
        'Address Line 2': 'Sector 14',
        'City': 'New Delhi',
        'State': 'Delhi',
        'Postal Code': '110085',
        'Country': 'India',
        'Status': 'Active',
        'Joined Date': '2026-01-15',
        'Notes': '',
        'Metadata JSON': '{}',
        'Custom Fields JSON': '{}'
      }
    ]
  },
  events: {
    title: 'Events Import Template',
    filename: 'events_import.xlsx',
    columns: [
      'Event Code',
      'Event Title',
      'Summary',
      'Description',
      'Event Date',
      'Start Time',
      'End Time',
      'Category',
      'Social Work Activity Code',
      'Location',
      'Address',
      'Google Maps URL',
      'Event Status',
      'Featured',
      'Countdown Enabled',
      'Display Status'
      ,'Published Date','Metadata JSON','Custom Fields JSON'
    ],
    sampleRows: [
      {
        'Event Code': 'EVT-2026-0005',
        'Event Title': 'Winter Cloth Collection Drive',
        'Description': 'Community collection center for warm blankets and jackets.',
        'Event Date': '2026-11-15',
        'Start Time': '10:00',
        'End Time': '17:00',
        'Category': 'Social Work',
        'Social Work Activity Code': 'SW-0004',
        'Location': 'Community Bhawan Courtyard',
        'Address': 'Plot 42, Sector 14, New Delhi',
        'Google Maps URL': 'https://maps.google.com/?q=New+Delhi',
        'Event Status': 'Upcoming',
        'Featured': 'Yes',
        'Countdown Enabled': 'Yes',
        'Display Status': 'Active'
      }
    ]
  },
  social_work: {
    title: 'Social Work Activities Template',
    filename: 'social_work_import.xlsx',
    columns: [
      'Activity Code',
      'Social Work Category',
      'Title',
      'Summary',
      'Description',
      'Activity Type',
      'Start Date',
      'End Date',
      'Location',
      'Beneficiaries Count',
      'Featured',
      'Display Order',
      'Status'
      ,'Published Date','Metadata JSON','Custom Fields JSON'
    ],
    sampleRows: [
      {
        'Activity Code': 'SW-0005',
        'Social Work Category': 'Senior Citizen Support',
        'Title': 'Vridha Kalyan: Senior Citizen Wellness Program',
        'Description': 'Regular health screenings and community gatherings for elders.',
        'Activity Type': 'Ongoing Initiative',
        'Start Date': '2026-03-01',
        'End Date': '',
        'Location': 'Community Bhawan, New Delhi',
        'Beneficiaries Count': 450,
        'Featured': 'Yes',
        'Display Order': 5,
        'Status': 'Active'
      }
    ]
  },
  announcements: {
    title: 'Announcements Import Template',
    filename: 'announcements_import.xlsx',
    columns: [
      'Announcement Code',
      'Title',
      'Summary',
      'Content',
      'Important',
      'Featured',
      'Publish Date',
      'Expiry Date',
      'Status'
      ,'Metadata JSON','Custom Fields JSON'
    ],
    sampleRows: [
      {
        'Announcement Code': 'ANN-2026-004',
        'Title': 'Diwali Milan Samaroh 2026 Invitation',
        'Content': 'All community members and families are cordially invited to celebrate Diwali with traditional sweets and cultural performances.',
        'Important': 'Yes',
        'Featured': 'Yes',
        'Publish Date': '2026-10-15',
        'Expiry Date': '2026-11-05',
        'Status': 'Draft'
      }
    ]
  },
  milestones: {
    title: 'Milestones Import Template',
    filename: 'milestones_import.xlsx',
    columns: [
      'Milestone Code',
      'Year',
      'Title',
      'Description',
      'Display Order',
      'Status'
    ],
    sampleRows: [
      {
        'Milestone Code': 'MS-2020',
        'Year': '2020',
        'Title': 'COVID-19 Community Relief Fund',
        'Description': 'Disbursed food grain packages and oxygen concentrators to 5,000+ families.',
        'Display Order': 6,
        'Status': 'Active'
      }
    ]
  },
  achievements: {
    title: 'Achievements Import Template',
    filename: 'achievements_import.xlsx',
    columns: [
      'Achievement Code',
      'Year',
      'Title',
      'Description',
      'Display Order',
      'Status'
    ],
    sampleRows: [
      {
        'Achievement Code': 'ACH-004',
        'Year': '2025',
        'Title': 'Best Community Trust Award 2025',
        'Description': 'Conferred by Delhi Social Welfare Council for transparency and outreach.',
        'Display Order': 4,
        'Status': 'Active'
      }
    ]
  }
};

/**
 * Generate and trigger download of an official Excel template
 */
export function downloadTemplate(moduleKey: keyof typeof TEMPLATE_SPECS) {
  const spec = TEMPLATE_SPECS[moduleKey];
  if (!spec) return;

  const ws = XLSX.utils.json_to_sheet(spec.sampleRows, { header: spec.columns });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template');
  XLSX.writeFile(wb, spec.filename);
}

/**
 * Export rejected records as an Excel spreadsheet with clear error diagnostics
 */
export function exportRejectedRecordsToExcel(rejectedRecords: RejectedRecord[], moduleName: string) {
  const exportRows = rejectedRecords.map((rec) => ({
    'Batch ID': rec.batch_id,
    'Original Row': rec.row_number,
    'Record Reference': rec.record_reference,
    'Error Reason': rec.error_message,
    'Suggested Fix': rec.suggested_fix || 'Review required fields and correct invalid formats',
    'Rejected At': rec.rejected_at,
    ...rec.raw_data,
  }));

  const ws = XLSX.utils.json_to_sheet(exportRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Rejected Records');
  XLSX.writeFile(wb, `${moduleName}_rejected_records_${Date.now()}.xlsx`);
}

/**
 * Parse uploaded Excel or CSV buffer or File object
 */
export async function parseExcelFile(input: ArrayBuffer | File): Promise<Record<string, string>[]> {
  let buffer: ArrayBuffer;
  if (input instanceof File) {
    buffer = await input.arrayBuffer();
  } else {
    buffer = input;
  }

  const wb = XLSX.read(buffer, {
    type: 'array',
    cellDates: true,
  });
  const firstSheetName = wb.SheetNames[0];
  const ws = wb.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
    defval: '',
    raw: true,
  });

  const dateColumns = new Set([
    'Date of Birth',
    'Joined Date',
    'Joined On',
    'Event Date',
    'Start Date',
    'End Date',
    'Publish Date',
    'Expiry Date',
    'Published Date',
  ]);
  const date1904 = wb.Workbook?.WBProps?.date1904 === true;

  const pad = (value: number) => String(value).padStart(2, '0');

  const excelDateToIso = (serial: number): string | null => {
    const parsed = XLSX.SSF.parse_date_code(serial, { date1904 });
    if (!parsed || !parsed.y || !parsed.m || !parsed.d) return null;
    return `${parsed.y}-${pad(parsed.m)}-${pad(parsed.d)}`;
  };

  const normalizeDate = (value: unknown): string => {
    if (value === null || value === undefined || value === '') return '';

    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return excelDateToIso(value) ?? String(value).trim();
    }

    const text = String(value).trim();
    if (!text) return '';

    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
      return text;
    }

    return text;
  };

  return rows.map((row) => {
    const normalized: Record<string, string> = {};

    for (const [rawKey, rawValue] of Object.entries(row)) {
      const key = rawKey.trim();
      normalized[key] = dateColumns.has(key)
        ? normalizeDate(rawValue)
        : String(rawValue ?? '').trim();
    }

    return normalized;
  });
}

/**
 * Validate Members Import
 */
export function validateMembersImport(
  rawRows: Record<string, string>[],
  existingMembers: Member[]
): ValidationResult<Member> {
  const passed: Member[] = [];
  const failed: ValidationResult<Member>['failed'] = [];
  const warnings: ValidationResult<Member>['warnings'] = [];

  const existingCodes = new Set(existingMembers.map((m) => m.member_code.toUpperCase()));
  const batchCodes = new Set<string>();

  rawRows.forEach((row, idx) => {
    const rowNumber = idx + 2; // Header is row 1
    const code = (row['Member Code'] || '').trim();
    const firstName = (row['First Name'] || '').trim();
    const lastName = (row['Last Name'] || '').trim();
    const displayName = (row['Display Name'] || `${firstName} ${lastName}`).trim();
    const category = (row['Member Category'] || 'General').trim();
    const designation = (row['Designation'] || 'Member').trim();
    const isMgmt = (row['Current Management'] || 'No').toLowerCase() === 'yes';
    const mgmtPost = (row['Management Post'] || '').trim();
    const phone = (row['Phone'] || '').trim();
    const email = (row['Email'] || '').trim();
    const city = (row['City'] || 'New Delhi').trim();
    const state = (row['State'] || 'Delhi').trim();
    const status = (row['Status'] || 'Active').toLowerCase() === 'archived' ? 'archived' : 'active';

    if (!code) {
      failed.push({
        rowNumber,
        reference: `Row-${rowNumber}`,
        rawData: row,
        error: 'Missing required field: "Member Code" is mandatory.',
        suggestedFix: 'Provide a valid unique code like MEM-0010',
      });
      return;
    }

    if (existingCodes.has(code.toUpperCase()) || batchCodes.has(code.toUpperCase())) {
      failed.push({
        rowNumber,
        reference: code,
        rawData: row,
        error: `Hard Duplicate Error: Member Code "${code}" already exists in system or batch.`,
        suggestedFix: 'Assign a new unused Member Code',
      });
      return;
    }

    if (!firstName) {
      failed.push({
        rowNumber,
        reference: code,
        rawData: row,
        error: 'Missing required field: "First Name" is mandatory.',
        suggestedFix: 'Enter member first name',
      });
      return;
    }

    if (isMgmt && !mgmtPost) {
      warnings.push({
        rowNumber,
        reference: code,
        warning: 'Current Management is "Yes" but no Management Post specified (e.g. Executive Member).',
      });
    }

    batchCodes.add(code.toUpperCase());

    const newMember: Member = {
      id: `mem-${Date.now()}-${idx}`,
      member_code: code,
      first_name: firstName,
      last_name: lastName,
      display_name: displayName,
      category,
      designation,
      current_management: isMgmt,
      management_post: mgmtPost || (isMgmt ? 'Executive Member' : undefined),
      phone: phone || undefined,
      email: email || undefined,
      city,
      state,
      display_order: existingMembers.length + passed.length + 1,
      visibility: {
        phone_public: false,
        email_public: false,
        address_public: false,
        photo_public: true,
        designation_public: true,
      },
      status: status as 'active' | 'archived',
      joined_date: new Date().toISOString().split('T')[0],
      photo_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=600',
    };

    passed.push(newMember);
  });

  return { passed, failed, warnings };
}

/**
 * Validate Events Import
 */
export function validateEventsImport(
  rawRows: Record<string, string>[],
  existingEvents: Event[]
): ValidationResult<Event> {
  const passed: Event[] = [];
  const failed: ValidationResult<Event>['failed'] = [];
  const warnings: ValidationResult<Event>['warnings'] = [];

  const existingCodes = new Set(existingEvents.map((e) => e.event_code.toUpperCase()));
  const batchCodes = new Set<string>();

  rawRows.forEach((row, idx) => {
    const rowNumber = idx + 2;
    const code = (row['Event Code'] || '').trim();
    const title = (row['Event Title'] || '').trim();
    const date = (row['Event Date'] || '').trim();
    const category = (row['Category'] || 'General').trim();
    const location = (row['Location'] || 'Community Bhawan').trim();
    const eventStatus = (row['Event Status'] || 'Upcoming').toLowerCase();
    const featured = (row['Featured'] || 'No').toLowerCase() === 'yes';
    const countdown = (row['Countdown Enabled'] || 'No').toLowerCase() === 'yes';

    if (!code) {
      failed.push({
        rowNumber,
        reference: `Row-${rowNumber}`,
        rawData: row,
        error: 'Missing required field: "Event Code" is mandatory.',
        suggestedFix: 'Provide code like EVT-2026-0005',
      });
      return;
    }

    if (existingCodes.has(code.toUpperCase()) || batchCodes.has(code.toUpperCase())) {
      failed.push({
        rowNumber,
        reference: code,
        rawData: row,
        error: `Hard Duplicate Error: Event Code "${code}" already exists.`,
        suggestedFix: 'Use a unique event code',
      });
      return;
    }

    if (!title) {
      failed.push({
        rowNumber,
        reference: code,
        rawData: row,
        error: 'Missing required field: "Event Title" is mandatory.',
      });
      return;
    }

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      failed.push({
        rowNumber,
        reference: code,
        rawData: row,
        error: 'Invalid Date format: Must be YYYY-MM-DD (e.g. 2026-09-20).',
        suggestedFix: 'Format date as YYYY-MM-DD',
      });
      return;
    }

    batchCodes.add(code.toUpperCase());

    const newEvent: Event = {
      id: `evt-${Date.now()}-${idx}`,
      event_code: code,
      title,
      description: row['Description'] || '',
      category,
      event_date: date,
      start_time: row['Start Time'] || '10:00',
      end_time: row['End Time'] || '14:00',
      location,
      address: row['Address'] || 'New Delhi',
      google_maps_url: row['Google Maps URL'] || 'https://maps.google.com/?q=New+Delhi',
      status: (['upcoming', 'ongoing', 'completed', 'cancelled'].includes(eventStatus) ? eventStatus : 'upcoming') as any,
      featured,
      countdown_enabled: countdown,
      display_status: 'active',
      photos: [],
    };

    passed.push(newEvent);
  });

  return { passed, failed, warnings };
}

/**
 * Validate Announcements Import
 */
export function validateAnnouncementsImport(
  rawRows: Record<string, string>[],
  existingAnnouncements: Announcement[]
): ValidationResult<Announcement> {
  const passed: Announcement[] = [];
  const failed: ValidationResult<Announcement>['failed'] = [];
  const warnings: ValidationResult<Announcement>['warnings'] = [];

  const existingCodes = new Set(existingAnnouncements.map((a) => a.announcement_code.toUpperCase()));
  const batchCodes = new Set<string>();

  rawRows.forEach((row, idx) => {
    const rowNumber = idx + 2;
    const code = (row['Announcement Code'] || '').trim();
    const title = (row['Title'] || '').trim();
    const content = (row['Content'] || '').trim();
    const important = (row['Important'] || 'No').toLowerCase() === 'yes';
    const featured = (row['Featured'] || 'No').toLowerCase() === 'yes';
    const pubDate = (row['Publish Date'] || new Date().toISOString().split('T')[0]).trim();
    const status = (row['Status'] || 'published').toLowerCase();

    if (!code) {
      failed.push({
        rowNumber,
        reference: `Row-${rowNumber}`,
        rawData: row,
        error: 'Missing required field: "Announcement Code".',
      });
      return;
    }

    if (existingCodes.has(code.toUpperCase()) || batchCodes.has(code.toUpperCase())) {
      failed.push({
        rowNumber,
        reference: code,
        rawData: row,
        error: `Duplicate Announcement Code: "${code}".`,
      });
      return;
    }

    if (!title || !content) {
      failed.push({
        rowNumber,
        reference: code,
        rawData: row,
        error: 'Title and Content are both required.',
      });
      return;
    }

    batchCodes.add(code.toUpperCase());

    const newAnnouncement: Announcement = {
      id: `ann-${Date.now()}-${idx}`,
      announcement_code: code,
      title,
      content,
      important,
      featured,
      publish_date: pubDate,
      expiry_date: row['Expiry Date'] || undefined,
      status: (['draft', 'scheduled', 'published', 'archived'].includes(status) ? status : 'published') as any,
    };

    passed.push(newAnnouncement);
  });

  return { passed, failed, warnings };
}

/**
 * Validate Social Work Activities Import
 */
export function validateSocialWorkImport(
  rawRows: Record<string, string>[],
  existingActivities: SocialWorkActivity[]
): ValidationResult<SocialWorkActivity> {
  const passed: SocialWorkActivity[] = [];
  const failed: ValidationResult<SocialWorkActivity>['failed'] = [];
  const warnings: ValidationResult<SocialWorkActivity>['warnings'] = [];

  const existingCodes = new Set(existingActivities.map((s) => s.activity_code.toUpperCase()));
  const batchCodes = new Set<string>();

  rawRows.forEach((row, idx) => {
    const rowNumber = idx + 2;
    const code = (row['Activity Code'] || '').trim();
    const title = (row['Title'] || '').trim();
    const catName = (row['Social Work Category'] || 'General Welfare').trim();
    const type = (row['Activity Type'] || 'Ongoing Initiative').trim();
    const startDate = (row['Start Date'] || new Date().toISOString().split('T')[0]).trim();
    const location = (row['Location'] || 'Pan-India').trim();
    const beneficiaries = parseInt(row['Beneficiaries Count'] || '100', 10) || 100;
    const featured = (row['Featured'] || 'No').toLowerCase() === 'yes';
    const status = (row['Status'] || 'Active').toLowerCase() === 'archived' ? 'archived' : 'active';

    if (!code) {
      failed.push({
        rowNumber,
        reference: `Row-${rowNumber}`,
        rawData: row,
        error: 'Missing required field: "Activity Code".',
        suggestedFix: 'Provide unique code like SW-0005',
      });
      return;
    }

    if (existingCodes.has(code.toUpperCase()) || batchCodes.has(code.toUpperCase())) {
      failed.push({
        rowNumber,
        reference: code,
        rawData: row,
        error: `Duplicate Activity Code: "${code}".`,
      });
      return;
    }

    if (!title) {
      failed.push({
        rowNumber,
        reference: code,
        rawData: row,
        error: 'Missing required field: "Title".',
      });
      return;
    }

    batchCodes.add(code.toUpperCase());

    const newActivity: SocialWorkActivity = {
      id: `sw-${Date.now()}-${idx}`,
      activity_code: code,
      category_id: 'cat-1',
      category_name: catName,
      title,
      description: row['Description'] || '',
      type: (type === 'Individual Project' ? 'Individual Project' : 'Ongoing Initiative'),
      start_date: startDate,
      end_date: row['End Date'] || undefined,
      location,
      status: status as 'active' | 'archived',
      featured,
      display_order: existingActivities.length + passed.length + 1,
      photos: [
        'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=1200',
      ],
      beneficiaries_count: beneficiaries,
    };

    passed.push(newActivity);
  });

  return { passed, failed, warnings };
}

export interface ModuleValidationConfig {
  members: Member[];
  events: Event[];
  socialWorkActivities: SocialWorkActivity[];
  announcements: Announcement[];
}

/**
 * Universal validator wrapping module-specific validators
 */
export function validateImportData(
  moduleName: 'members' | 'events' | 'social_work' | 'announcements',
  rawRows: Record<string, string>[],
  batchId: string,
  config: ModuleValidationConfig
): {
  total: number;
  validRows: any[];
  invalidRows: RejectedRecord[];
} {
  let result: ValidationResult<any>;

  if (moduleName === 'members') {
    result = validateMembersImport(rawRows, config.members);
  } else if (moduleName === 'events') {
    result = validateEventsImport(rawRows, config.events);
  } else if (moduleName === 'social_work') {
    result = validateSocialWorkImport(rawRows, config.socialWorkActivities);
  } else {
    result = validateAnnouncementsImport(rawRows, config.announcements);
  }

  const invalidRows: RejectedRecord[] = result.failed.map((f) => ({
    id: `rej-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    batch_id: batchId,
    module: moduleName,
    row_number: f.rowNumber,
    record_reference: f.reference,
    raw_data: f.rawData,
    error_message: f.error,
    suggested_fix: f.suggestedFix,
    rejected_at: new Date().toLocaleString(),
    status: 'rejected',
  }));

  return {
    total: rawRows.length,
    validRows: result.passed,
    invalidRows,
  };
}
