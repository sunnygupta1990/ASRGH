// src/api/events.ts

import { Event } from '../types';
import { apiRequest } from './client';
import { API_BASE_URL } from './config';

interface BackendEventPhoto {
  id: string;
  displayOrder: number;
  caption?: string | null;
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
  photos: BackendEventPhoto[];
}

interface BackendEvent {
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

function custom<T>(
  event: BackendEvent,
  key: string,
  fallback: T,
): T {
  const value = event.customFields?.[key];
  return (value === undefined || value === null ? fallback : value) as T;
}

export function mapBackendEvent(event: BackendEvent): Event {
  const start = event.startAt ? new Date(event.startAt) : null;
  const end = event.endAt ? new Date(event.endAt) : null;

  return {
    id: event.id,
    event_code: custom(event, 'event_code', event.slug),
    title: event.title,
    description: event.description ?? '',
    social_work_activity_id: custom<string | undefined>(
      event,
      'social_work_activity_id',
      undefined,
    ),
    social_work_activity_title: custom<string | undefined>(
      event,
      'social_work_activity_title',
      undefined,
    ),
    category: event.category ?? 'General',
    event_date: start
      ? start.toISOString().slice(0, 10)
      : '',
    start_time: start
      ? start.toTimeString().slice(0, 5)
      : undefined,
    end_time: end
      ? end.toTimeString().slice(0, 5)
      : undefined,
    location: event.venue ?? '',
    address: custom<string | undefined>(event, 'address', undefined),
    google_maps_url: custom<string | undefined>(
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
    featured: custom(event, 'featured', false),
    countdown_enabled: custom(event, 'countdown_enabled', false),
    display_status:
      event.status === 'archived'
        ? 'archived'
        : 'active',
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
      })) ?? [],
  };
}

function toBackendEvent(event: Partial<Event>) {
  const startAt =
    event.event_date && event.start_time
      ? new Date(
          `${event.event_date}T${event.start_time}:00`,
        ).toISOString()
      : event.event_date
        ? new Date(`${event.event_date}T00:00:00`).toISOString()
        : undefined;

  const endAt =
    event.event_date && event.end_time
      ? new Date(
          `${event.event_date}T${event.end_time}:00`,
        ).toISOString()
      : undefined;

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
    description: event.description,
    venue: event.location,
    startAt,
    endAt,
    status:
      event.display_status === 'archived'
        ? 'archived'
        : event.status ?? 'upcoming',
  };
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

export async function uploadAdminEventPhotos(
  albumId: string,
  files: File[],
): Promise<void> {
  const token = localStorage.getItem('asrgh_admin_token');

  const formData = new FormData();

  files.forEach((file) => {
    formData.append('photos', file);
  });

  const response = await fetch(
    `${API_BASE_URL}/api/albums/${albumId}/photos`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    },
  );

  if (!response.ok) {
    const data = await response.json();
    throw new Error(
      data.message ?? 'Unable to upload photos',
    );
  }
}