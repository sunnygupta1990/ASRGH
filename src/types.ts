export type RecordStatus = 'active' | 'archived' | 'deleted';
export type EmployeeStatus = 'active' | 'suspended' | 'archived';
export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
export type AnnouncementStatus = 'draft' | 'scheduled' | 'published' | 'archived';
export type ContactStatus = 'new' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
export type RejectionStatus = 'rejected' | 'corrected' | 're_uploaded' | 'resolved';
export type ImportStatus = 'uploaded' | 'validating' | 'validated' | 'partially_accepted' | 'completed' | 'failed';
export type SocialWorkType = 'Ongoing Initiative' | 'Individual Project';
export type MemberCategory = 'General' | 'Patron' | 'Life Member' | 'Youth Wing' | 'Honorary' | string;
export type ContactSubmissionCategory =
  | 'General Inquiry'
  | 'Membership Application'
  | 'Social Welfare Assistance'
  | 'Event Registration'
  | 'Donation & Philanthropy'
  | 'Feedback & Suggestion'
  | string;

export interface MemberVisibility {
  phone_public: boolean;
  email_public: boolean;
  address_public: boolean;
  photo_public: boolean;
  designation_public: boolean;
}

export interface Member {
  id: string;
  member_code: string; // e.g. MEM-0001
  first_name: string;
  last_name: string;
  display_name: string;
  category: string; // e.g. 'General', 'Patron', 'Life Member', 'Youth Wing'
  designation: string;
  photo_url?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  current_management: boolean;
  management_post?: string; // e.g. 'President', 'General Secretary', 'Treasurer', 'Vice President'
  display_order: number;
  visibility: MemberVisibility;
  status: RecordStatus;
  joined_date?: string;
  bio?: string;
}

export interface SocialWorkCategory {
  id: string;
  name: string;
  description?: string;
  icon_name?: string;
  display_order: number;
  status: RecordStatus;
}

export interface SocialWorkActivity {
  id: string;
  activity_code: string; // e.g. SW-0001
  category_id: string;
  category_name: string;
  title: string;
  description: string;
  type: SocialWorkType;
  start_date?: string;
  end_date?: string;
  location?: string;
  status: RecordStatus;
  featured: boolean;
  display_order: number;
  photos: string[];
  beneficiaries_count?: number;
}

export interface EventPhoto {
  id: string;
  photo_url: string;
  thumbnail_url?: string;
  caption?: string;
  display_order: number;
  uploaded_at: string;
}

export interface Event {
  id: string;
  event_code: string; // e.g. EVT-2026-0001
  title: string;
  description: string;
  social_work_activity_id?: string;
  social_work_activity_title?: string;
  category: string;
  event_date: string; // YYYY-MM-DD
  start_time?: string; // HH:MM
  end_time?: string; // HH:MM
  location: string;
  address?: string;
  google_maps_url?: string;
  status: EventStatus;
  featured: boolean;
  countdown_enabled: boolean;
  display_status: RecordStatus;
  album_code?: string;
  album_name?: string;
  photos: EventPhoto[];
}

export interface Announcement {
  id: string;
  announcement_code: string; // e.g. ANN-2026-001
  title: string;
  content: string;
  important: boolean;
  featured: boolean;
  publish_date: string;
  expiry_date?: string;
  status: AnnouncementStatus;
}

export interface NotificationRecord {
  id: string;
  title: string;
  message: string;
  destination_type: 'general' | 'announcement' | 'event' | 'social_work';
  destination_id?: string;
  sender_name: string;
  sent_at: string;
  targeted_devices: number;
  status: 'sent' | 'failed' | 'scheduled';
}

export interface ContactSubmission {
  id: string;
  submission_code: string; // e.g. CON-2026-001
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  category?: string;
  status: ContactStatus;
  assigned_to_employee_id?: string;
  assigned_to_name?: string;
  admin_notes?: string;
  created_at: string;
  resolved_at?: string;
}

export interface Milestone {
  id: string;
  milestone_code: string;
  title: string;
  year: string;
  date?: string;
  description: string;
  photo_url?: string;
  display_order: number;
  status: RecordStatus;
}

export interface Achievement {
  id: string;
  achievement_code: string;
  title: string;
  year: string;
  description: string;
  photo_url?: string;
  display_order: number;
  status: RecordStatus;
}

export interface OrganizationSettings {
  organization_name: string;
  tagline: string;
  legal_name: string;
  primary_email: string;
  primary_phone: string;
  whatsapp_number: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  google_maps_url: string;
  office_hours: string;
  show_phone: boolean;
  show_email: boolean;
  show_whatsapp: boolean;
  show_address: boolean;
  show_office_hours: boolean;
  show_map: boolean;
}

export interface SocialLink {
  id: string;
  platform_name: string;
  url: string;
  icon_key: string;
  display_order: number;
  is_enabled: boolean;
}

export interface StatisticItem {
  id: string;
  metric_key: string;
  label: string;
  value: number;
  suffix?: string;
  is_overridden: boolean;
  calculated_value: number;
  description: string;
}

export interface UserPermission {
  module: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_import: boolean;
  can_archive: boolean;
  can_delete: boolean; // Only Super Admin or explicit delete permission
}

export interface Role {
  id: string;
  role_name: string;
  description: string;
  is_system_role: boolean;
  permissions: Record<string, UserPermission>;
}

export interface Employee {
  id: string;
  employee_code: string;
  full_name: string;
  email: string;
  phone: string;
  designation: string;
  role_id: string;
  role_name: string;
  status: EmployeeStatus;
  last_login_at?: string;
  permission_overrides?: Record<string, Partial<UserPermission>>;
}

export interface AuditLog {
  id: string;
  actor_name: string;
  actor_role: string;
  action: string;
  module: string;
  entity_id?: string;
  details: string;
  timestamp: string;
}

export interface RejectedRecord {
  id: string;
  batch_id: string;
  module: string;
  row_number: number;
  record_reference: string;
  raw_data: Record<string, string>;
  error_message: string;
  suggested_fix?: string;
  rejected_at: string;
  status: RejectionStatus;
}

export interface ImportBatch {
  id: string;
  batch_code: string;
  module_name: string;
  file_name: string;
  total_rows: number;
  passed_rows: number;
  failed_rows: number;
  warning_rows: number;
  uploaded_by: string;
  uploaded_at: string;
  status: ImportStatus;
}

export type TextScale = 'normal' | 'large' | 'xlarge';
export type AppLanguage = 'en' | 'hi';
