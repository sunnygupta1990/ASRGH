// ASRGH_V2_NODE/src/api/members.ts

import { Member } from '../types';
import { apiRequest } from './client';
import { getCustomField } from './customFields';
import { API_BASE_URL } from './config';
import { categoryFromMemberCode } from '../utils/memberClassification';

interface BackendManagementAssignment {
  id: string;
  memberId: string;
  positionId: string;
  termId: string;
  startDate?: string | null;
  endDate?: string | null;
  displayOrder: number;
  notes?: string | null;
  customFields?: Record<string, unknown>;
  current?: boolean;
  position: {
    id: string;
    code: string;
    name: string;
    displayOrder: number;
    description?: string | null;
    isActive: boolean;
    customFields?: Record<string, unknown>;
  };
  term: {
    id: string;
    name: string;
    startDate: string;
    endDate?: string | null;
    status: string;
    notes?: string | null;
    customFields?: Record<string, unknown>;
  };
}

export interface BackendMember {
  id: string;
  memberCode?: string | null;
  firstName: string;
  middleName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  phone?: string | null;
  email?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country: string;
  membershipStatus: string;
  joinedOn?: string | null;
  notes?: string | null;
  profileMediaId?: string | null;
  profileMedia?: {
    storageKey: string;
    isPublic?: boolean;
    deletedAt?: string | null;
  } | null;
  metadata?: Record<string, unknown> | null;
  customFields?: Record<string, unknown> | null;
  assignments?: BackendManagementAssignment[];
}

interface MemberListResponse {
  success: true;
  data: BackendMember[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

interface MemberResponse {
  success: true;
  data: BackendMember;
}

function mediaUrl(storageKey?: string | null): string | undefined {
  if (!storageKey) {
    return undefined;
  }

  if (
    storageKey.startsWith('http://') ||
    storageKey.startsWith('https://')
  ) {
    return storageKey;
  }

  return `${API_BASE_URL.replace(/\/$/, '')}/${storageKey.replace(/^\//, '')}`;
}

function isAssignmentCurrent(
  assignment: BackendManagementAssignment,
  now: Date,
): boolean {
  if (typeof assignment.current === 'boolean') {
    return assignment.current;
  }

  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const today = `${now.getFullYear()}-${month}-${day}`;
  const termStart = assignment.term.startDate.slice(0, 10);
  const termEnd = assignment.term.endDate?.slice(0, 10);
  const assignmentStart = assignment.startDate?.slice(0, 10);
  const assignmentEnd = assignment.endDate?.slice(0, 10);

  return (
    termStart <= today &&
    (!termEnd || termEnd >= today) &&
    (!assignmentStart || assignmentStart <= today) &&
    (!assignmentEnd || assignmentEnd >= today)
  );
}

function mapManagementAssignments(
  assignments: BackendManagementAssignment[] | undefined,
) {
  const now = new Date();

  return (assignments ?? []).map((assignment) => ({
    id: assignment.id,
    member_id: assignment.memberId,
    position_id: assignment.positionId,
    term_id: assignment.termId,
    start_date: assignment.startDate?.slice(0, 10),
    end_date: assignment.endDate?.slice(0, 10),
    display_order: assignment.displayOrder,
    notes: assignment.notes ?? undefined,
    custom_fields: assignment.customFields ?? {},
    current: isAssignmentCurrent(assignment, now),
    position: {
      id: assignment.position.id,
      code: assignment.position.code,
      name: assignment.position.name,
      display_order: assignment.position.displayOrder,
      description: assignment.position.description ?? undefined,
      is_active: assignment.position.isActive,
      custom_fields: assignment.position.customFields ?? {},
    },
    term: {
      id: assignment.term.id,
      name: assignment.term.name,
      start_date: assignment.term.startDate.slice(0, 10),
      end_date: assignment.term.endDate?.slice(0, 10),
      status: assignment.term.status,
      notes: assignment.term.notes ?? undefined,
      custom_fields: assignment.term.customFields ?? {},
    },
  }));
}

export function mapBackendMember(member: BackendMember): Member {
  const category = categoryFromMemberCode(member.memberCode);
  const visibility = getCustomField(member, 'visibility', {
    phone_public: false,
    email_public: false,
    address_public: false,
    photo_public: true,
    designation_public: true,
  });

  const managementAssignments = mapManagementAssignments(
    member.assignments,
  );

  const currentAssignments = managementAssignments.filter(
    (assignment) => assignment.current,
  );

  const currentManagementPost =
    currentAssignments.length > 0
      ? [...currentAssignments]
          .sort(
            (a, b) =>
              a.position.display_order - b.position.display_order ||
              a.display_order - b.display_order,
          )
          .map((assignment) => assignment.position.name)
          .join(', ')
      : undefined;

  return {
    id: member.id,
    member_code: member.memberCode ?? '',
    first_name: member.firstName,
    middle_name: member.middleName ?? '',
    last_name: member.lastName ?? '',
    display_name:
      member.displayName ??
      `${member.firstName} ${member.lastName ?? ''}`.trim(),
    gender: member.gender ?? '',
    date_of_birth: member.dateOfBirth?.slice(0, 10),
    category,
    designation: category,
    photo_url: mediaUrl(
      member.profileMedia?.storageKey ??
        getCustomField<string | undefined>(
          member,
          'photo_url',
          undefined,
        ),
    ),
    phone: member.phone ?? '',
    email: member.email ?? '',
    address: member.addressLine1 ?? '',
    address_line_2: member.addressLine2 ?? '',
    city: member.city ?? '',
    state: member.state ?? '',
    postal_code: member.postalCode ?? '',
    country: member.country,

    current_management: currentAssignments.length > 0,

    management_post: currentManagementPost,

    management_assignments: managementAssignments,

    display_order: getCustomField(member, 'display_order', 0),

    visibility,

    status:
      member.membershipStatus === 'archived'
        ? 'archived'
        : member.membershipStatus === 'deleted'
          ? 'deleted'
          : 'active',

    joined_date: member.joinedOn?.slice(0, 10),

    bio: getCustomField<string | undefined>(
      member,
      'bio',
      member.notes ?? undefined,
    ),

    notes: member.notes ?? undefined,

    profile_media_id: member.profileMediaId ?? undefined,

    metadata: member.metadata ?? {},

    custom_fields: member.customFields ?? {},

    native_place: getCustomField<string | undefined>(
      member,
      'native_place',
      undefined,
    ),

    joining_date: getCustomField<string | undefined>(
      member,
      'joining_date',
      undefined,
    ),

    show_phone: Boolean(visibility.phone_public),

    show_email: Boolean(visibility.email_public),
  };
}

function toBackendMember(member: Partial<Member>) {
  const {
    photo_url: _legacyPhotoUrl,
    ...customFields
  } = member.custom_fields ?? {};

  return {
    memberCode: member.member_code,
    firstName: member.first_name,
    middleName: member.middle_name,
    lastName: member.last_name,
    displayName: member.display_name,
    gender: member.gender,
    dateOfBirth: member.date_of_birth,
    phone: member.phone,
    email: member.email,
    addressLine1: member.address,
    addressLine2: member.address_line_2,
    city: member.city,
    state: member.state,
    postalCode: member.postal_code,
    country: member.country,
    membershipStatus: member.status,
    joinedOn: member.joined_date,
    notes: member.notes ?? member.bio,
    metadata: member.metadata,
    customFields: {
      ...customFields,
      category: member.category,
      designation: member.designation,
      display_order: member.display_order,
      visibility: member.visibility,
      bio: member.bio,
      native_place: member.native_place,
      joining_date: member.joining_date,
      show_phone: member.show_phone,
      show_email: member.show_email,
    },
  };
}

export async function fetchPublicMembers(): Promise<Member[]> {
  const response = await apiRequest<MemberListResponse>(
    '/api/public/members',
  );

  return response.data.map(mapBackendMember);
}

export async function fetchAdminMembers(): Promise<Member[]> {
  const firstPage = await apiRequest<MemberListResponse>(
    '/api/members?page=1&pageSize=200',
  );
  const totalPages = firstPage.pagination?.totalPages ?? 1;
  const remainingPages = await Promise.all(
    Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) =>
      apiRequest<MemberListResponse>(
        `/api/members?page=${index + 2}&pageSize=200`,
      ),
    ),
  );

  return [firstPage, ...remainingPages]
    .flatMap((response) => response.data)
    .map(mapBackendMember);
}

export async function createAdminMember(
  member: Member,
): Promise<Member> {
  const response = await apiRequest<MemberResponse>('/api/members', {
    method: 'POST',
    body: JSON.stringify(toBackendMember(member)),
  });

  return mapBackendMember(response.data);
}

export async function updateAdminMember(
  id: string,
  member: Partial<Member>,
): Promise<Member> {
  const response = await apiRequest<MemberResponse>(
    `/api/members/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(toBackendMember(member)),
    },
  );

  return mapBackendMember(response.data);
}

export async function archiveAdminMember(
  id: string,
): Promise<Member> {
  const response = await apiRequest<MemberResponse>(
    `/api/members/${id}/archive`,
    {
      method: 'PATCH',
    },
  );

  return mapBackendMember(response.data);
}

export async function deleteAdminMember(id: string): Promise<void> {
  await apiRequest<{ success: true }>(`/api/members/${id}`, {
    method: 'DELETE',
  });
}

export async function uploadMemberProfilePhoto(
  memberId: string,
  file: File,
): Promise<void> {
  const formData = new FormData();

  formData.append('profilePhoto', file, file.name);

  await apiRequest(`/api/members/${memberId}/profile-photo`, {
    method: 'POST',
    body: formData,
  });
}

export async function deleteMemberProfilePhoto(
  memberId: string,
): Promise<void> {
  await apiRequest<{ success: true }>(
    `/api/members/${memberId}/profile-photo`,
    {
      method: 'DELETE',
    },
  );
}
