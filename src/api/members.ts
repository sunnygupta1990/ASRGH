import { Member } from '../types';
import { apiRequest } from './client';

interface BackendMember {
  id: string;
  memberCode?: string | null;
  firstName: string;
  middleName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  phone?: string | null;
  email?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  membershipStatus: string;
  joinedOn?: string | null;
  notes?: string | null;
  customFields?: Record<string, unknown> | null;
}

interface MemberListResponse {
  success: true;
  data: BackendMember[];
}

interface MemberResponse {
  success: true;
  data: BackendMember;
}

function custom<T>(member: BackendMember, key: string, fallback: T): T {
  const value = member.customFields?.[key];
  return (value === undefined || value === null ? fallback : value) as T;
}

export function mapBackendMember(member: BackendMember): Member {
  return {
    id: member.id,
    member_code: member.memberCode ?? '',
    first_name: member.firstName,
    last_name: member.lastName ?? '',
    display_name:
      member.displayName ??
      `${member.firstName} ${member.lastName ?? ''}`.trim(),
    category: custom(member, 'category', 'General'),
    designation: custom(member, 'designation', 'Community Member'),
    photo_url: custom<string | undefined>(member, 'photo_url', undefined),
    phone: member.phone ?? '',
    email: member.email ?? '',
    address: member.addressLine1 ?? '',
    city: member.city ?? '',
    state: member.state ?? '',
    current_management: custom(member, 'current_management', false),
    management_post: custom<string | undefined>(
      member,
      'management_post',
      undefined,
    ),
    display_order: custom(member, 'display_order', 0),
    visibility: custom(member, 'visibility', {
      phone_public: false,
      email_public: false,
      address_public: false,
      photo_public: true,
      designation_public: true,
    }),
    status:
      member.membershipStatus === 'archived'
        ? 'archived'
        : member.membershipStatus === 'deleted'
          ? 'deleted'
          : 'active',
    joined_date: member.joinedOn?.slice(0, 10),
    bio: custom<string | undefined>(member, 'bio', member.notes ?? undefined),
  };
}

function toBackendMember(member: Partial<Member>) {
  return {
    memberCode: member.member_code,
    firstName: member.first_name,
    lastName: member.last_name,
    displayName: member.display_name,
    phone: member.phone,
    email: member.email,
    addressLine1: member.address,
    city: member.city,
    state: member.state,
    membershipStatus: member.status ?? 'active',
    customFields: {
      category: member.category,
      designation: member.designation,
      photo_url: member.photo_url,
      current_management: member.current_management,
      management_post: member.management_post,
      display_order: member.display_order,
      visibility: member.visibility,
      bio: member.bio,
    },
  };
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
