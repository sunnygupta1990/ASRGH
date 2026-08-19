// frontend/src/api/events.ts

import { Event } from '../types';
import { apiRequest } from './client';
import { API_BASE_URL } from './config';
import { getCustomField } from './customFields';

interface BackendEventPhoto {
  id: string;
  displayOrder: number;
  caption?: string | null;
  isFeatured: boolean;
  createdAt: string;
  mediaAsset: {
    storageKey: string;
    metadata?: {
      thumbnailUrl?: string;
    };
  };
}

interface BackendEventAlbum {
  id: string;
  title: string;
  coverMediaId?: string | null;
  photos: BackendEventPhoto[];
}

export interface BackendEvent {
  id: string;
  title: string;
  slug: string;
  category?: string | null;
  summary?: string | null;
  description?: string | null;
  venue?: string | null;
  startAt?: string | null;
  endAt?: string | null;
  status: string;
  coverMediaId?: string | null;
  publishedAt?: string | null;
  metadata?: Record<string, unknown> | null;
  customFields?: Record<string, unknown> | null;
  album?: BackendEventAlbum | null;
}

interface EventListResponse {
  success: true;
  data: BackendEvent[];
}

interface EventResponse {
  success: true;
  data: BackendEvent;
}


export function mapBackendEvent(event: BackendEvent): Event {
  const start = event.startAt ? new Date(event.startAt) : null;
  const end = event.endAt ? new Date(event.endAt) : null;

  return {
    id: event.id,
    event_code: getCustomField(event, 'event_code', event.slug),
    title: event.title,
    summary: event.summary ?? undefined,
    description: event.description ?? '',
    social_work_activity_id: getCustomField<string | undefined>(
      event,
      'social_work_activity_id',
      undefined,
    ),
    social_work_activity_title: getCustomField<string | undefined>(
      event,
      'social_work_activity_title',
      undefined,
    ),
    category: event.category ?? 'General',
    event_date: start
      ? start.toISOString().slice(0, 10)
      : '',
    start_time: start
      ? start.toISOString().slice(11, 16)
      : undefined,
    end_time: end
      ? end.toISOString().slice(11, 16)
      : undefined,
    location: event.venue ?? '',
    address: getCustomField<string | undefined>(event, 'address', undefined),
    google_maps_url: getCustomField<string | undefined>(
      event,
      'google_maps_url',
      undefined,
    ),
    status:
      event.status === 'completed'
        ? 'completed'
        : event.status === 'cancelled'
          ? 'cancelled'
          : event.status === 'ongoing'
            ? 'ongoing'
            : 'upcoming',
    featured: getCustomField(event, 'featured', false),
    countdown_enabled: getCustomField(event, 'countdown_enabled', false),
    display_status:
      event.status === 'archived'
        ? 'archived'
        : 'active',
    published_at: event.publishedAt ?? undefined,
    cover_media_id: event.coverMediaId ?? undefined,
    metadata: event.metadata ?? {},
    custom_fields: event.customFields ?? {},
    album_code: event.album?.id,
    album_name: event.album?.title,
    photos:
      event.album?.photos.map((photo) => ({
        id: photo.id,
        photo_url: `${API_BASE_URL}${photo.mediaAsset.storageKey}`,
        thumbnail_url: photo.mediaAsset.metadata?.thumbnailUrl
          ? `${API_BASE_URL}${photo.mediaAsset.metadata.thumbnailUrl}`
          : undefined,
        caption: photo.caption ?? undefined,
        display_order: photo.displayOrder,
        uploaded_at: photo.createdAt,
        is_featured: photo.isFeatured,
      })) ?? [],
  };
}

function parseTime(value?: string): string | undefined {
  if (!value) return undefined;

  const trimmed = value.trim();
  const direct = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(trimmed);

  if (direct) {
    return `${direct[1]}:${direct[2]}`;
  }

  const amPm = /^(1[0-2]|0?[1-9]):([0-5]\d)\s*(AM|PM)$/i.exec(trimmed);

  if (!amPm) {
    return undefined;
  }

  let hour = Number(amPm[1]);
  const minute = amPm[2];
  const period = amPm[3].toUpperCase();

  if (period === 'AM' && hour === 12) {
    hour = 0;
  }

  if (period === 'PM' && hour !== 12) {
    hour += 12;
  }

  return `${String(hour).padStart(2, '0')}:${minute}`;
}

function localDateTimeToIso(date?: string, time?: string): string | undefined {
  if (!date) return undefined;

  const normalizedTime = parseTime(time) ?? '00:00';
  return new Date(`${date}T${normalizedTime}:00`).toISOString();
}

function toBackendEvent(event: Partial<Event>) {
  const slug =
    event.event_code ||
    event.title
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

  return {
    title: event.title,
    slug,
    category: event.category,
    summary: event.summary,
    description: event.description,
    venue: event.location,
    startAt: localDateTimeToIso(event.event_date, event.start_time),
    endAt: event.end_time === undefined
      ? undefined
      : event.end_time
        ? localDateTimeToIso(event.event_date, event.end_time)
        : null,
    status:
      event.display_status === 'archived'
        ? 'archived'
        : event.status ?? 'upcoming',
    publishedAt: event.published_at ? new Date(event.published_at).toISOString() : null,
    coverMediaId: event.cover_media_id || null,
    metadata: event.metadata,
    customFields: {
      ...(event.custom_fields ?? {}),
      event_code: event.event_code,
      social_work_activity_id: event.social_work_activity_id,
      social_work_activity_title: event.social_work_activity_title,
      address: event.address,
      google_maps_url: event.google_maps_url,
      featured: event.featured,
      countdown_enabled: event.countdown_enabled,
    },
  };
}

export async function fetchPublicEvents(): Promise<Event[]> {
  const response = await apiRequest<EventListResponse>('/api/public/events');
  return response.data.map(mapBackendEvent);
}

export async function fetchAdminEvents(): Promise<Event[]> {
  const response = await apiRequest<EventListResponse>('/api/events');
  return response.data.map(mapBackendEvent);
}

export async function createAdminEvent(
  event: Event,
): Promise<Event> {
  const response = await apiRequest<EventResponse>('/api/events', {
    method: 'POST',
    body: JSON.stringify(toBackendEvent(event)),
  });

  return mapBackendEvent(response.data);
}

export async function updateAdminEvent(
  id: string,
  event: Partial<Event>,
): Promise<Event> {
  const response = await apiRequest<EventResponse>(
    `/api/events/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(toBackendEvent(event)),
    },
  );

  return mapBackendEvent(response.data);
}

export async function archiveAdminEvent(
  id: string,
): Promise<Event> {
  const response = await apiRequest<EventResponse>(
    `/api/events/${id}/archive`,
    {
      method: 'PATCH',
    },
  );

  return mapBackendEvent(response.data);
}

export async function deleteAdminEvent(id: string): Promise<void> {
  await apiRequest(`/api/events/${id}`, { method: 'DELETE' });
}

export async function uploadAdminEventPhotos(
  albumId: string,
  files: File[],
): Promise<Array<{ id: string }>> {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append('photos', file);
  });

  const response = await apiRequest<{ success: true; data: Array<{ id: string }> }>(
    `/api/albums/${albumId}/photos`,
    {
      method: 'POST',
      body: formData,
    },
  );

  return response.data;
}

export async function updateAdminEventPhotoCaption(
  albumId: string,
  photoId: string,
  caption: string,
): Promise<void> {
  await apiRequest(
    `/api/albums/${albumId}/photos/${photoId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ caption }),
    },
  );
}

export async function setAdminEventCoverPhoto(
  albumId: string,
  photoId: string,
): Promise<void> {
  await apiRequest(
    `/api/albums/${albumId}/photos/${photoId}/cover`,
    {
      method: 'PATCH',
    },
  );
}

export async function deleteAdminEventPhoto(
  albumId: string,
  photoId: string,
): Promise<void> {
  await apiRequest(
    `/api/albums/${albumId}/photos/${photoId}`,
    {
      method: 'DELETE',
    },
  );
}

export async function reorderAdminEventPhotos(albumId: string, photoIds: string[]): Promise<void> {
  await apiRequest(`/api/albums/${albumId}/photos/order`, { method: 'PUT', body: JSON.stringify({ photoIds }) });
}
