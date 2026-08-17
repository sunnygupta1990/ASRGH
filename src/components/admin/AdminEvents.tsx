// frontend/src/components/admin/AdminEvents.tsx

import React, { useMemo, useState } from 'react';
import {
  Calendar,
  Plus,
  Search,
  Edit2,
  Trash2,
  Clock,
  MapPin,
  Image as ImageIcon,
  X,
  Download,
  Upload,
  Star,
  Save,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  deleteAdminEventPhoto,
  fetchAdminEvents,
  setAdminEventCoverPhoto,
  updateAdminEventPhotoCaption,
  uploadAdminEventPhotos,
  reorderAdminEventPhotos,
} from '../../api/events';
import { Event } from '../../types';
import { downloadTemplate } from '../../utils/excelEngine';

export const AdminEvents: React.FC<{
  onNavigateTab: (tab: string) => void;
}> = ({ onNavigateTab }) => {
  const {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    socialWorkActivities,
    openLightbox,
    refreshEventsFromApi,
  } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [photoManagingEvent, setPhotoManagingEvent] = useState<Event | null>(null);
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const [busyPhotoId, setBusyPhotoId] = useState<string | null>(null);
  const [captionDrafts, setCaptionDrafts] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<Partial<Event>>({
    event_code: '',
    title: '',
    summary: '',
    description: '',
    category: 'Cultural',
    event_date: new Date().toISOString().split('T')[0],
    start_time: '10:00',
    end_time: '18:00',
    location: '',
    address: '',
    google_maps_url: '',
    status: 'upcoming',
    featured: false,
    countdown_enabled: true,
    display_status: 'active',
    photos: [],
  });

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (statusFilter !== 'all' && event.status !== statusFilter) {
        return false;
      }

      if (!search.trim()) {
        return true;
      }

      const query = search.toLowerCase();

      return (
        event.title.toLowerCase().includes(query) ||
        event.event_code.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query) ||
        event.category.toLowerCase().includes(query)
      );
    });
  }, [events, search, statusFilter]);

  const reloadPhotoManagingEvent = async (eventId: string) => {
    await refreshEventsFromApi();

    const refreshedEvents = await fetchAdminEvents();
    const refreshedEvent = refreshedEvents.find(
      (event) => event.id === eventId,
    );

    if (refreshedEvent) {
      setPhotoManagingEvent(refreshedEvent);
    }
  };

  const handleOpenAdd = () => {
    const nextCode = `EVT-${new Date().getFullYear()}-${String(
      events.length + 1,
    ).padStart(4, '0')}`;

    setFormData({
      event_code: nextCode,
      title: '',
      summary: '',
      description: '',
      category: 'Cultural Program',
      event_date: new Date().toISOString().split('T')[0],
      start_time: '10:00',
      end_time: '16:00',
      location: '',
      address: '',
      google_maps_url: '',
      status: 'upcoming',
      featured: false,
      countdown_enabled: true,
      display_status: 'active',
      photos: [],
    });

    setSelectedEvent(null);
    setIsEditing(true);
  };

  const handleOpenEdit = (event: Event) => {
    setSelectedEvent(event);
    setFormData({ ...event });
    setIsEditing(true);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.title || !formData.event_date || !formData.location) {
      alert('Please provide event title, date, and location.');
      return;
    }

    try {
      if (selectedEvent) {
        await updateEvent(selectedEvent.id, formData);
      } else {
        const newEvent: Event = {
          id: `evt-${Date.now()}`,
          event_code: formData.event_code || `EVT-${Date.now()}`,
          title: formData.title || '',
          summary: formData.summary,
          description: formData.description || '',
          social_work_activity_id: formData.social_work_activity_id,
          social_work_activity_title: formData.social_work_activity_title,
          category: formData.category || 'General',
          event_date:
            formData.event_date || new Date().toISOString().split('T')[0],
          start_time: formData.start_time,
          end_time: formData.end_time,
          location: formData.location || '',
          address: formData.address,
          google_maps_url: formData.google_maps_url,
          status: formData.status || 'upcoming',
          featured: formData.featured || false,
          countdown_enabled: formData.countdown_enabled || false,
          display_status: formData.display_status || 'active',
          photos: [],
          published_at: formData.published_at,
          metadata: formData.metadata,
          custom_fields: formData.custom_fields,
        };

        await addEvent(newEvent);
      }

      setIsEditing(false);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : 'Unable to save event.',
      );
    }
  };

  const handleUploadPhotos = async (files: FileList | null) => {
    if (!photoManagingEvent || !files?.length) {
      return;
    }

    if (!photoManagingEvent.album_code) {
      alert('This event does not have an album.');
      return;
    }

    setIsUploadingPhotos(true);

    try {
      await uploadAdminEventPhotos(
        photoManagingEvent.album_code,
        Array.from(files),
      );

      await reloadPhotoManagingEvent(photoManagingEvent.id);
      setNewPhotoCaption('');
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : 'Unable to upload selected photos.',
      );
    } finally {
      setIsUploadingPhotos(false);
    }
  };

  const handleSaveCaption = async (photoId: string) => {
    if (!photoManagingEvent?.album_code) {
      return;
    }

    setBusyPhotoId(photoId);

    try {
      const currentPhoto = photoManagingEvent.photos.find(
        (photo) => photo.id === photoId,
      );
      const caption =
        captionDrafts[photoId] ?? currentPhoto?.caption ?? '';

      await updateAdminEventPhotoCaption(
        photoManagingEvent.album_code,
        photoId,
        caption,
      );

      await reloadPhotoManagingEvent(photoManagingEvent.id);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : 'Unable to update caption.',
      );
    } finally {
      setBusyPhotoId(null);
    }
  };

  const handleSetCover = async (photoId: string) => {
    if (!photoManagingEvent?.album_code) {
      return;
    }

    setBusyPhotoId(photoId);

    try {
      await setAdminEventCoverPhoto(
        photoManagingEvent.album_code,
        photoId,
      );

      await reloadPhotoManagingEvent(photoManagingEvent.id);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : 'Unable to set cover photo.',
      );
    } finally {
      setBusyPhotoId(null);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!photoManagingEvent?.album_code) {
      return;
    }

    if (!confirm('Delete this photo permanently?')) {
      return;
    }

    setBusyPhotoId(photoId);

    try {
      await deleteAdminEventPhoto(
        photoManagingEvent.album_code,
        photoId,
      );

      await reloadPhotoManagingEvent(photoManagingEvent.id);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : 'Unable to delete photo.',
      );
    } finally {
      setBusyPhotoId(null);
    }
  };

  const handleMovePhoto = async (photoId: string, offset: number) => {
    if (!photoManagingEvent?.album_code) return;
    const ids = photoManagingEvent.photos.map((photo) => photo.id);
    const index = ids.indexOf(photoId);
    const target = index + offset;
    if (index < 0 || target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    setBusyPhotoId(photoId);
    try {
      await reorderAdminEventPhotos(photoManagingEvent.album_code, ids);
      await reloadPhotoManagingEvent(photoManagingEvent.id);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to reorder photos.');
    } finally {
      setBusyPhotoId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-600" />
            <span>Community Events & Functions</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Schedule cultural gatherings, medical camps, annual general meetings, and youth conferences.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => downloadTemplate('events')}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Template</span>
          </button>

          <button
            onClick={() => onNavigateTab('import')}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Import</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Event</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by event title, location, code..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="px-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl font-medium text-slate-700"
        >
          <option value="all">All Event Status</option>
          <option value="upcoming">Upcoming</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Code & Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Gallery</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No events found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event) => (
                  <tr
                    key={event.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-start gap-2.5">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                          {event.photos?.[0] ? (
                            <img
                              src={
                                event.photos.find(
                                  (photo) => photo.is_featured,
                                )?.photo_url ?? event.photos[0].photo_url
                              }
                              alt={event.title}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <Calendar className="w-4 h-4" />
                            </div>
                          )}
                        </div>

                        <div>
                          <span className="font-bold text-slate-900 text-sm">
                            {event.title}
                          </span>
                          <span className="block text-[10px] text-slate-400 font-mono">
                            {event.event_code}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {event.category}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 font-semibold text-slate-900">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{event.event_date}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {event.start_time || '--:--'} - {event.end_time || '--:--'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-slate-700 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[160px]">
                          {event.location}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
                        {event.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => {
                          setCaptionDrafts({});
                          setPhotoManagingEvent(event);
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                        <span>{event.photos?.length || 0} Photos</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(event)}
                          title="Edit Event"
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-blue-900 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            if (
                              confirm(
                                `Remove "${event.title}" from the current event list?`,
                              )
                            ) {
                              void deleteEvent(event.id).catch((error) => alert(error instanceof Error ? error.message : 'Unable to delete event.'));
                            }
                          }}
                          title="Remove Event"
                          className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-600" />
                <span>
                  {selectedEvent
                    ? 'Edit Event Details'
                    : 'Create New Event'}
                </span>
              </h3>

              <button
                onClick={() => setIsEditing(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Event Code
                  </label>
                  <input
                    type="text"
                    value={formData.event_code || ''}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        event_code: event.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category || ''}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        category: event.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium"
                  >
                    <option value="Cultural Program">Cultural Program</option>
                    <option value="Health & Medical Camp">
                      Health & Medical Camp
                    </option>
                    <option value="Educational Seminar">
                      Educational Seminar
                    </option>
                    <option value="Annual General Meeting">
                      Annual General Meeting (AGM)
                    </option>
                    <option value="Youth Conference">Youth Conference</option>
                    <option value="Religious & Spiritual">
                      Religious & Spiritual
                    </option>
                    <option value="Sports & Fitness">
                      Sports & Fitness
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      title: event.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
                  required
                />
              </div>

              <div><label className="block font-bold text-slate-700 mb-1">Summary</label><textarea rows={2} value={formData.summary || ''} onChange={(event) => setFormData({ ...formData, summary: event.target.value })} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800" /></div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={formData.event_date || ''}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        event_date: event.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formData.start_time || ''}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        start_time: event.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.end_time || ''}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        end_time: event.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><label className="block font-bold text-slate-700 mb-1">Published Date</label><input type="date" value={formData.published_at?.slice(0,10) || ''} onChange={(event) => setFormData({ ...formData, published_at: event.target.value })} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl" /></div><div><label className="block font-bold text-slate-700 mb-1">Metadata JSON</label><textarea key={selectedEvent?.id ?? 'new'} defaultValue={JSON.stringify(formData.metadata ?? {}, null, 2)} onBlur={(event) => { try { setFormData({ ...formData, metadata: JSON.parse(event.target.value) }); } catch { alert('Metadata must be valid JSON.'); } }} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono" /></div></div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Location / Venue Name
                  </label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        location: event.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Google Maps URL
                  </label>
                  <input
                    type="text"
                    value={formData.google_maps_url || ''}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        google_maps_url: event.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Full Venue Address
                </label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      address: event.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Description & Program Schedule
                </label>
                <textarea
                  rows={3}
                  value={formData.description || ''}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      description: event.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Event Status
                  </label>
                  <select
                    value={formData.status || 'upcoming'}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        status: event.target.value as Event['status'],
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <label className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    checked={Boolean(formData.featured)}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        featured: event.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded"
                  />
                  <span className="font-bold text-slate-700">
                    Featured on Home
                  </span>
                </label>

                <label className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    checked={Boolean(formData.countdown_enabled)}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        countdown_enabled: event.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded"
                  />
                  <span className="font-bold text-slate-700">
                    Show Live Countdown
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-bold shadow-2xs"
                >
                  {selectedEvent ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {photoManagingEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-blue-900" />
                  <span>Gallery Photos: {photoManagingEvent.title}</span>
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  {photoManagingEvent.event_code}
                </span>
              </div>

              <button
                onClick={() => setPhotoManagingEvent(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mt-4">
              <p className="text-sm font-bold text-slate-900">
                Add photos to this event album
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Select multiple photos. Localhost uses local media storage;
                production uses Cloudflare R2.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                <label className="flex items-center justify-center min-h-24 px-4 py-3 border-2 border-dashed border-blue-200 bg-white rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition-colors">
                  <div className="text-center">
                    <Upload className="w-5 h-5 mx-auto text-blue-900 mb-1" />
                    <span className="text-xs font-bold text-slate-800">
                      {isUploadingPhotos
                        ? 'Uploading photos...'
                        : 'Choose multiple photos'}
                    </span>
                    <span className="block text-[10px] text-slate-500 mt-1">
                      JPG, PNG, WEBP
                    </span>
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={isUploadingPhotos}
                    className="sr-only"
                    onChange={(event) => {
                      void handleUploadPhotos(event.target.files);
                      event.currentTarget.value = '';
                    }}
                  />
                </label>

                <div className="flex items-center text-xs text-slate-500">
                  Upload first, then edit each photo caption or choose the event
                  cover below.
                </div>
              </div>
            </div>

            <div className="mt-6">
              <span className="text-xs font-bold text-slate-700">
                Uploaded Event Photos ({photoManagingEvent.photos?.length || 0})
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
                {(photoManagingEvent.photos || []).map((photo, photoIndex) => {
                  const isBusy = busyPhotoId === photo.id;
                  const draftCaption =
                    captionDrafts[photo.id] ?? photo.caption ?? '';

                  return (
                    <div
                      key={photo.id}
                      className="rounded-xl overflow-hidden border border-slate-200 bg-white"
                    >
                      <div className="relative bg-slate-100">
                        <img
                          src={photo.photo_url}
                          alt={photo.caption || 'Event photo'}
                          className="w-full h-40 object-cover cursor-pointer"
                          onClick={() =>
                            openLightbox(
                              (photoManagingEvent.photos || []).map(
                                (item) => ({
                                  url: item.photo_url,
                                  caption: item.caption,
                                }),
                              ),
                            )
                          }
                          referrerPolicy="no-referrer"
                        />

                        {photo.is_featured && (
                          <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-amber-400 text-amber-950 text-[10px] font-bold flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current" />
                            Event Cover
                          </div>
                        )}
                      </div>

                      <div className="p-3 space-y-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Caption
                          </label>
                          <input
                            type="text"
                            value={draftCaption}
                            disabled={isBusy}
                            onChange={(event) =>
                              setCaptionDrafts((previous) => ({
                                ...previous,
                                [photo.id]: event.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg"
                            placeholder="Photo caption"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => void handleSaveCaption(photo.id)}
                            disabled={isBusy}
                            className="px-2 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1"
                          >
                            <Save className="w-3 h-3" />
                            Caption
                          </button>

                          <button
                            onClick={() => void handleSetCover(photo.id)}
                            disabled={isBusy || photo.is_featured}
                            className="px-2 py-2 bg-amber-50 hover:bg-amber-100 disabled:opacity-50 text-amber-800 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1"
                          >
                            <Star className="w-3 h-3" />
                            Cover
                          </button>

                          <button
                            onClick={() => void handleDeletePhoto(photo.id)}
                            disabled={isBusy}
                            className="px-2 py-2 bg-rose-50 hover:bg-rose-100 disabled:opacity-50 text-rose-700 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <button onClick={() => void handleMovePhoto(photo.id, -1)} disabled={isBusy || photoIndex === 0} className="px-2 py-1.5 bg-slate-100 rounded-lg text-[10px] font-bold disabled:opacity-40">Move earlier</button>
                          <button onClick={() => void handleMovePhoto(photo.id, 1)} disabled={isBusy || photoIndex === photoManagingEvent.photos.length - 1} className="px-2 py-1.5 bg-slate-100 rounded-lg text-[10px] font-bold disabled:opacity-40">Move later</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 mt-6 flex justify-end">
              <button
                onClick={() => setPhotoManagingEvent(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
