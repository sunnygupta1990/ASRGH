import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Filter,
  Image,
  ArrowRight,
  X,
  Sparkles,
  ChevronRight,
  HeartHandshake,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Event, EventStatus } from '../types';

export const EventsPage: React.FC = () => {
  const { events, selectedEntityId, setSelectedEntityId, openLightbox, setActivePage } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeModalEvent, setActiveModalEvent] = useState<Event | null>(() => {
    if (selectedEntityId) {
      return events.find((e) => e.id === selectedEntityId) || null;
    }
    return null;
  });

  const filteredEvents = events.filter((e) => {
    if (e.display_status !== 'active') return false;
    if (statusFilter !== 'all' && e.status !== statusFilter) return false;
    return true;
  });

  const handleOpenDetail = (evt: Event) => {
    setActiveModalEvent(evt);
    setSelectedEntityId(evt.id);
  };

  const handleCloseDetail = () => {
    setActiveModalEvent(null);
    setSelectedEntityId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      {/* 1. Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold uppercase tracking-wider">
          <Calendar className="w-3.5 h-3.5" />
          <span>Community Gatherings & Camps</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Community Events & Assemblies
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          Stay informed on upcoming annual general meetings, health checkup camps, youth seminars, and cultural festivals organized by ASRGH.
        </p>
      </div>

      {/* 2. Filter Bar */}
      <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex-wrap gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'all', label: 'All Events' },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'ongoing', label: 'Ongoing Today' },
            { id: 'completed', label: 'Past & Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-blue-900 text-white shadow-xs font-bold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Showing {filteredEvents.length} Event{filteredEvents.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* 3. Event Cards Grid */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200 p-8">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No events found in this category.</h3>
          <p className="text-sm text-slate-500 mt-1">Please check back later or switch filter to "All Events".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Image Banner */}
                <div
                  className="relative h-48 bg-slate-100 overflow-hidden cursor-pointer"
                  onClick={() => handleOpenDetail(evt)}
                >
                  <img
                    src={
                      evt.photos[0]?.photo_url ||
                      'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800'
                    }
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 bg-slate-900/90 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase backdrop-blur-xs">
                    {evt.category}
                  </span>
                  <span
                    className={`absolute bottom-3 right-3 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase backdrop-blur-xs ${
                      evt.status === 'upcoming'
                        ? 'bg-amber-600/90'
                        : evt.status === 'ongoing'
                        ? 'bg-emerald-600/90'
                        : 'bg-slate-700/90'
                    }`}
                  >
                    {evt.status}
                  </span>
                </div>

                {/* Event Body */}
                <div className="p-6 space-y-3">
                  <h3
                    onClick={() => handleOpenDetail(evt)}
                    className="text-xl font-bold text-slate-900 group-hover:text-blue-900 transition-colors line-clamp-2 cursor-pointer"
                  >
                    {evt.title}
                  </h3>
                  <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                    {evt.description}
                  </p>

                  <div className="space-y-2 pt-2 text-xs text-slate-600 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="font-semibold text-slate-800">
                        {new Date(evt.event_date).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    {evt.start_time && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>
                          {evt.start_time} {evt.end_time ? `– ${evt.end_time}` : ''}
                        </span>
                      </div>
                    )}

                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span className="truncate">{evt.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                {evt.photos.length > 0 ? (
                  <button
                    onClick={() =>
                      openLightbox(
                        evt.photos.map((p) => ({ url: p.photo_url, caption: p.caption, title: evt.title }))
                      )
                    }
                    className="flex items-center gap-1.5 text-slate-600 hover:text-blue-900 font-medium"
                  >
                    <Image className="w-4 h-4 text-amber-600" />
                    <span>{evt.photos.length} Photo{evt.photos.length !== 1 ? 's' : ''}</span>
                  </button>
                ) : (
                  <span className="text-slate-400">Community Event</span>
                )}

                <button
                  onClick={() => handleOpenDetail(evt)}
                  className="flex items-center gap-1 font-bold text-blue-900 hover:text-blue-700"
                >
                  <span>Details & Map</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Event Detail Modal */}
      {activeModalEvent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded">
                  {activeModalEvent.category} • {activeModalEvent.status}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                  {activeModalEvent.title}
                </h2>
              </div>
              <button
                onClick={handleCloseDetail}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Event Photos Gallery */}
              {activeModalEvent.photos.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2"><h4 className="text-xs font-bold uppercase text-slate-500">Event Album</h4><span className="text-[11px] text-slate-400">{activeModalEvent.photos.length} photos</span></div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {activeModalEvent.photos.map((p, i) => (
                      <div
                        key={p.id}
                        onClick={() =>
                          openLightbox(
                            activeModalEvent.photos.map((ph) => ({
                              url: ph.photo_url,
                              caption: ph.caption,
                              title: activeModalEvent.title,
                            })),
                            i
                          )
                        }
                        className="h-36 rounded-xl overflow-hidden cursor-pointer bg-slate-100 hover:opacity-90 transition-opacity"
                      >
                        <img src={p.photo_url} alt={p.caption || 'Event'} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Program Overview & Agenda</h4>
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">
                  {activeModalEvent.description}
                </p>
              </div>

              {/* Schedule & Location Box */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 text-xs sm:text-sm">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="font-bold text-slate-900">
                    {new Date(activeModalEvent.event_date).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                {activeModalEvent.start_time && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Timings: {activeModalEvent.start_time} to {activeModalEvent.end_time || 'Conclusion'}
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">{activeModalEvent.location}</span>
                    {activeModalEvent.address && (
                      <span className="text-slate-500 text-xs block">{activeModalEvent.address}</span>
                    )}
                  </div>
                </div>

                {/* Google Maps Link */}
                {activeModalEvent.google_maps_url && (
                  <div className="pt-2">
                    <a
                      href={activeModalEvent.google_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 hover:text-blue-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Venue in Google Maps</span>
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={handleCloseDetail}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
