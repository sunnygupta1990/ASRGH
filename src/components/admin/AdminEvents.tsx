import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Plus,
  Search,
  Edit2,
  Trash2,
  Clock,
  MapPin,
  Image as ImageIcon,
  Check,
  X,
  Sparkles,
  Download,
  Upload,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Event, EventPhoto } from '../../types';
import { downloadTemplate } from '../../utils/excelEngine';

export const AdminEvents: React.FC<{ onNavigateTab: (tab: string) => void }> = ({ onNavigateTab }) => {
  const { events, addEvent, updateEvent, deleteEvent, archiveEvent, socialWorkActivities, openLightbox } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Photo gallery manager modal for a specific event
  const [photoManagingEvent, setPhotoManagingEvent] = useState<Event | null>(null);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);

  const [formData, setFormData] = useState<Partial<Event>>({
    event_code: '',
    title: '',
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
    return events.filter((e) => {
      if (statusFilter !== 'all' && e.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          e.title.toLowerCase().includes(q) ||
          e.event_code.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [events, search, statusFilter]);

  const handleOpenAdd = () => {
    const nextCode = `EVT-${new Date().getFullYear()}-${String(events.length + 1).padStart(4, '0')}`;
    setFormData({
      event_code: nextCode,
      title: '',
      description: '',
      category: 'Cultural Program',
      event_date: new Date().toISOString().split('T')[0],
      start_time: '10:00 AM',
      end_time: '04:00 PM',
      location: 'Community Hall, New Delhi',
      address: 'Plot 42, Institutional Area, Sector 5, RK Puram, New Delhi',
      google_maps_url: 'https://maps.google.com',
      status: 'upcoming',
      featured: true,
      countdown_enabled: true,
      display_status: 'active',
      photos: [
        {
          id: `p-${Date.now()}`,
          photo_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1200',
          caption: 'Event Banner',
          display_order: 1,
          uploaded_at: new Date().toISOString(),
        },
      ],
    });
    setSelectedEvent(null);
    setIsEditing(true);
  };

  const handleOpenEdit = (evt: Event) => {
    setSelectedEvent(evt);
    setFormData({ ...evt });
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.event_date || !formData.location) {
      alert('Please provide event title, date, and location.');
      return;
    }

    if (selectedEvent) {
      updateEvent(selectedEvent.id, formData);
    } else {
      const newEvt: Event = {
        id: `evt-${Date.now()}`,
        event_code: formData.event_code || `EVT-${Date.now()}`,
        title: formData.title || '',
        description: formData.description || '',
        social_work_activity_id: formData.social_work_activity_id,
        social_work_activity_title: formData.social_work_activity_title,
        category: formData.category || 'General',
        event_date: formData.event_date || new Date().toISOString().split('T')[0],
        start_time: formData.start_time,
        end_time: formData.end_time,
        location: formData.location || '',
        address: formData.address,
        google_maps_url: formData.google_maps_url,
        status: (formData.status as any) || 'upcoming',
        featured: formData.featured || false,
        countdown_enabled: formData.countdown_enabled || false,
        display_status: formData.display_status || 'active',
        photos: formData.photos || [],
      };
      addEvent(newEvt);
    }
    setIsEditing(false);
  };

  const resizeImageForUat = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
      reader.onload = () => {
        const image = new Image();
        image.onerror = () => reject(new Error(`Could not decode ${file.name}`));
        image.onload = () => {
          const maxDimension = 1600;
          const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
          canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
          const context = canvas.getContext('2d');
          if (!context) {
            reject(new Error('Browser image processing is unavailable.'));
            return;
          }
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.78));
        };
        image.src = String(reader.result);
      };
      reader.readAsDataURL(file);
    });

  const handleUploadLocalPhotos = async (files: FileList | null) => {
    if (!photoManagingEvent || !files?.length) return;
    setIsUploadingPhotos(true);
    try {
      const photos = await Promise.all(
        Array.from(files).map(async (file, index) => ({
          id: `p-${Date.now()}-${index}`,
          photo_url: await resizeImageForUat(file),
          caption: newPhotoCaption.trim() || file.name.replace(/\.[^/.]+$/, ''),
          display_order: (photoManagingEvent.photos?.length || 0) + index + 1,
          uploaded_at: new Date().toISOString(),
        }))
      );
      const updatedPhotos = [...(photoManagingEvent.photos || []), ...photos];
      updateEvent(photoManagingEvent.id, { photos: updatedPhotos });
      setPhotoManagingEvent({ ...photoManagingEvent, photos: updatedPhotos });
      setNewPhotoCaption('');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to upload selected photos.');
    } finally {
      setIsUploadingPhotos(false);
    }
  };

  const handleAddPhotoToEvent = () => {
    if (!photoManagingEvent || !newPhotoUrl.trim()) return;
    const newPhoto: EventPhoto = {
      id: `p-${Date.now()}`,
      photo_url: newPhotoUrl.trim(),
      caption: newPhotoCaption.trim() || 'Event Photo',
      display_order: (photoManagingEvent.photos?.length || 0) + 1,
      uploaded_at: new Date().toISOString(),
    };
    const updatedPhotos = [...(photoManagingEvent.photos || []), newPhoto];
    updateEvent(photoManagingEvent.id, { photos: updatedPhotos });
    setPhotoManagingEvent({ ...photoManagingEvent, photos: updatedPhotos });
    setNewPhotoUrl('');
    setNewPhotoCaption('');
  };

  const handleRemovePhotoFromEvent = (photoId: string) => {
    if (!photoManagingEvent) return;
    const updatedPhotos = (photoManagingEvent.photos || []).filter((p) => p.id !== photoId);
    updateEvent(photoManagingEvent.id, { photos: updatedPhotos });
    setPhotoManagingEvent({ ...photoManagingEvent, photos: updatedPhotos });
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
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

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by event title, location, code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-hidden focus:border-blue-900"
          >
            <option value="all">All Event Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Events Table / Grid */}
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
                filteredEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-start gap-2.5">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                          {evt.photos && evt.photos[0] ? (
                            <img
                              src={evt.photos[0].photo_url}
                              alt={evt.title}
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
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 text-sm">{evt.title}</span>
                            {evt.featured && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-100 text-amber-800">
                                Featured
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">{evt.event_code}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{evt.category}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 font-semibold text-slate-900">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{evt.event_date}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {evt.start_time} - {evt.end_time}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-slate-700 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[160px]">{evt.location}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          evt.status === 'upcoming'
                            ? 'bg-blue-100 text-blue-800'
                            : evt.status === 'ongoing'
                            ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                            : evt.status === 'completed'
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {evt.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => setPhotoManagingEvent(evt)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                        <span>{evt.photos?.length || 0} Photos</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(evt)}
                          title="Edit Event"
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-blue-900 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete "${evt.title}"?`)) {
                              deleteEvent(evt.id);
                            }
                          }}
                          title="Delete Event"
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

      {/* Edit / Create Event Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-600" />
                <span>{selectedEvent ? 'Edit Event Details' : 'Create New Event'}</span>
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
                  <label className="block font-bold text-slate-700 mb-1">Event Code</label>
                  <input
                    type="text"
                    value={formData.event_code}
                    onChange={(e) => setFormData({ ...formData, event_code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium"
                  >
                    <option value="Cultural Program">Cultural Program</option>
                    <option value="Health & Medical Camp">Health & Medical Camp</option>
                    <option value="Educational Seminar">Educational Seminar</option>
                    <option value="Annual General Meeting">Annual General Meeting (AGM)</option>
                    <option value="Youth Conference">Youth Conference</option>
                    <option value="Religious & Spiritual">Religious & Spiritual</option>
                    <option value="Sports & Fitness">Sports & Fitness</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Event Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Sindhi Cultural Festival & Youth Sammelan 2026"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Event Date</label>
                  <input
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="text"
                    placeholder="10:00 AM"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Time</label>
                  <input
                    type="text"
                    placeholder="05:00 PM"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Location / Venue Name</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Siri Fort Auditorium"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Google Maps URL</label>
                  <input
                    type="text"
                    value={formData.google_maps_url}
                    onChange={(e) => setFormData({ ...formData, google_maps_url: e.target.value })}
                    placeholder="https://maps.google.com/..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Venue Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street, Landmark, City, State, PIN"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description & Program Schedule</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide complete details, schedule, chief guest, and registration guidelines..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              {/* Status and Flags */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Event Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-900 focus:ring-blue-900 border-slate-300"
                  />
                  <label htmlFor="featured" className="font-bold text-slate-700 cursor-pointer">
                    Featured on Home
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="countdown_enabled"
                    checked={formData.countdown_enabled}
                    onChange={(e) => setFormData({ ...formData, countdown_enabled: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-900 focus:ring-blue-900 border-slate-300"
                  />
                  <label htmlFor="countdown_enabled" className="font-bold text-slate-700 cursor-pointer">
                    Show Live Countdown
                  </label>
                </div>
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

      {/* Event Photo Manager Modal */}
      {photoManagingEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-blue-900" />
                  <span>Gallery Photos: {photoManagingEvent.title}</span>
                </h3>
                <span className="text-xs text-slate-500 font-mono">{photoManagingEvent.event_code}</span>
              </div>
              <button
                onClick={() => setPhotoManagingEvent(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mt-4 space-y-4">
              <div>
                <p className="text-sm font-bold text-slate-900">Add photos to this event album</p>
                <p className="text-xs text-slate-500 mt-1">
                  Select multiple photos from the computer. Photos are resized for the browser UAT and stored locally.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center justify-center min-h-24 px-4 py-3 border-2 border-dashed border-blue-200 bg-white rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition-colors">
                  <div className="text-center">
                    <Upload className="w-5 h-5 mx-auto text-blue-900 mb-1" />
                    <span className="text-xs font-bold text-slate-800">
                      {isUploadingPhotos ? 'Processing photos…' : 'Choose multiple photos'}
                    </span>
                    <span className="block text-[10px] text-slate-500 mt-1">JPG, PNG, WEBP</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={isUploadingPhotos}
                    className="sr-only"
                    onChange={(e) => {
                      void handleUploadLocalPhotos(e.target.files);
                      e.currentTarget.value = '';
                    }}
                  />
                </label>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Caption for selected photos</label>
                  <input
                    type="text"
                    placeholder="Optional caption"
                    value={newPhotoCaption}
                    onChange={(e) => setNewPhotoCaption(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl"
                  />
                  <p className="text-[10px] text-slate-500">
                    Leave blank to use each filename as its caption.
                  </p>
                </div>
              </div>

              <details className="text-xs">
                <summary className="cursor-pointer font-semibold text-slate-600">Advanced: add an existing image URL</summary>
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 mt-3">
                  <input
                    type="url"
                    placeholder="https://example.com/photo.jpg"
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl"
                  />
                  <button
                    onClick={handleAddPhotoToEvent}
                    disabled={!newPhotoUrl.trim()}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold"
                  >
                    Add URL
                  </button>
                </div>
              </details>
            </div>

            {/* Photo List */}
            <div className="mt-6 space-y-3">
              <span className="text-xs font-bold text-slate-700">
                Uploaded Event Photos ({photoManagingEvent.photos?.length || 0})
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(photoManagingEvent.photos || []).map((photo) => (
                  <div key={photo.id} className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                    <img
                      src={photo.photo_url}
                      alt={photo.caption}
                      className="w-full h-28 object-cover cursor-pointer"
                      onClick={() =>
                        openLightbox(
                          (photoManagingEvent.photos || []).map((p) => ({ url: p.photo_url, caption: p.caption }))
                        )
                      }
                      referrerPolicy="no-referrer"
                    />
                    <div className="p-2 bg-white text-[10px] text-slate-700 truncate font-medium">
                      {photo.caption || 'No caption'}
                    </div>
                    <button
                      onClick={() => handleRemovePhotoFromEvent(photo.id)}
                      className="absolute top-1.5 right-1.5 p-1 bg-rose-600/90 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
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
