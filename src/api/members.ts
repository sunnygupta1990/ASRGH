import { Member } from '../types';
import { apiRequest } from './client';
import { getCustomField } from './customFields';

interface BackendMember {
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
  metadata?: Record<string, unknown> | null;
  customFields?: Record<string, unknown> | null;
  assignments?: Array<{ id: string; memberId: string; positionId: string; termId: string; startDate?: string | null; endDate?: string | null; displayOrder: number; notes?: string | null; customFields?: Record<string, unknown>; position: { id: string; code: string; name: string; displayOrder: number; description?: string | null; isActive: boolean; customFields?: Record<string, unknown> }; term: { id: string; name: string; startDate: string; endDate?: string | null; status: string; notes?: string | null; customFields?: Record<string, unknown> } }>;
}

interface MemberListResponse {
  success: true;
  data: BackendMember[];
}

interface MemberResponse {
  success: true;
  data: BackendMember;
}


export function mapBackendMember(member: BackendMember): Member {
  const visibility = getCustomField(member, 'visibility', {
    phone_public: false,
    email_public: false,
    address_public: false,
    photo_public: true,
    designation_public: true,
  });

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
    category: getCustomField(member, 'category', 'General'),
    designation: getCustomField(member, 'designation', 'Community Member'),
    photo_url: getCustomField<string | undefined>(member, 'photo_url', undefined),
    phone: member.phone ?? '',
    email: member.email ?? '',
    address: member.addressLine1 ?? '',
    address_line_2: member.addressLine2 ?? '',
    city: member.city ?? '',
    state: member.state ?? '',
    postal_code: member.postalCode ?? '',
    country: member.country,
    current_management: Boolean(member.assignments?.some((assignment) => assignment.term.status === 'active' && assignment.position.isActive)),
    management_post: member.assignments?.filter((assignment) => assignment.term.status === 'active' && assignment.position.isActive).map((assignment) => assignment.position.name).join(', ') || undefined,
    management_assignments: member.assignments?.map((assignment) => ({ id: assignment.id, member_id: assignment.memberId, position_id: assignment.positionId, term_id: assignment.termId, start_date: assignment.startDate?.slice(0, 10), end_date: assignment.endDate?.slice(0, 10), display_order: assignment.displayOrder, notes: assignment.notes ?? undefined, custom_fields: assignment.customFields ?? {}, position: { id: assignment.position.id, code: assignment.position.code, name: assignment.position.name, display_order: assignment.position.displayOrder, description: assignment.position.description ?? undefined, is_active: assignment.position.isActive, custom_fields: assignment.position.customFields ?? {} }, term: { id: assignment.term.id, name: assignment.term.name, start_date: assignment.term.startDate.slice(0, 10), end_date: assignment.term.endDate?.slice(0, 10), status: assignment.term.status, notes: assignment.term.notes ?? undefined, custom_fields: assignment.term.customFields ?? {} } })) ?? [],
    display_order: getCustomField(member, 'display_order', 0),
    visibility,
    status:
      member.membershipStatus === 'archived'
        ? 'archived'
        : member.membershipStatus === 'deleted'
          ? 'deleted'
          : 'active',
    joined_date: member.joinedOn?.slice(0, 10),
    bio: getCustomField<string | undefined>(member, 'bio', member.notes ?? undefined),
    notes: member.notes ?? undefined,
    profile_media_id: member.profileMediaId ?? undefined,
    metadata: member.metadata ?? {},
    custom_fields: member.customFields ?? {},
    native_place: getCustomField<string | undefined>(member, 'native_place', undefined),
    joining_date: getCustomField<string | undefined>(member, 'joining_date', undefined),
    show_phone: Boolean(visibility.phone_public),
    show_email: Boolean(visibility.email_public),
  };
}

function toBackendMember(member: Partial<Member>) {
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
    profileMediaId: member.profile_media_id || null,
    metadata: member.metadata,
    customFields: {
      ...(member.custom_fields ?? {}),
      category: member.category,
      designation: member.designation,
      photo_url: member.photo_url,
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
  const response = await apiRequest<MemberListResponse>('/api/public/members');
  return response.data.map(mapBackendMember);
}

export async function fetchAdminMembers(): Promise<Member[]> {
  const response = await apiRequest<MemberListResponse>('/api/members');
  return response.data.map(mapBackendMember);
}

export async function createAdminMember(member: Member): Promise<Member> {
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
  const response = await apiRequest<MemberResponse>(`/api/members/${id}`, {
    method: 'PUT',
    body: JSON.stringify(toBackendMember(member)),
  });
  return mapBackendMember(response.data);
}

export async function archiveAdminMember(id: string): Promise<Member> {
  const response = await apiRequest<MemberResponse>(
    `/api/members/${id}/archive`,
    { method: 'PATCH' },
  );
  return mapBackendMember(response.data);
}

export async function deleteAdminMember(id: string): Promise<void> {
  await apiRequest<{ success: true }>(`/api/members/${id}`, {
    method: 'DELETE',
  });
}
