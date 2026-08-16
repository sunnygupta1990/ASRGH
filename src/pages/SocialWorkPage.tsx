import React, { useState } from 'react';
import {
  HeartHandshake,
  Filter,
  Calendar,
  Users,
  MapPin,
  CheckCircle2,
  Image,
  ArrowRight,
  X,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SocialWorkActivity, SocialWorkType } from '../types';

export const SocialWorkPage: React.FC = () => {
  const {
    socialWorkCategories,
    socialWorkActivities,
    publicEvents,
    selectedEntityId,
    setSelectedEntityId,
    openLightbox,
    setActivePage,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [activeModalActivity, setActiveModalActivity] = useState<SocialWorkActivity | null>(() => {
    if (selectedEntityId) {
      return socialWorkActivities.find((s) => s.id === selectedEntityId) || null;
    }
    return null;
  });

  const filteredActivities = socialWorkActivities.filter((act) => {
    if (act.status !== 'active') return false;
    if (selectedCategory !== 'all' && act.category_id !== selectedCategory) return false;
    if (selectedType !== 'all' && act.type !== selectedType) return false;
    return true;
  });

  const handleOpenDetail = (act: SocialWorkActivity) => {
    setActiveModalActivity(act);
    setSelectedEntityId(act.id);
  };

  const handleCloseDetail = () => {
    setActiveModalActivity(null);
    setSelectedEntityId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      {/* 1. Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full text-xs font-bold uppercase tracking-wider">
          <HeartHandshake className="w-3.5 h-3.5" />
          <span>Selfless Community Service</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Social Work & Welfare Programs
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          Driven by our motto of collective upliftment, we conduct year-round philanthropic programs spanning higher education scholarships, free healthcare, blood donor networks, and emergency relief.
        </p>
      </div>

      {/* 2. Filter Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 text-xs">
          <span className="text-slate-500 font-semibold uppercase text-[11px] shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Category:
          </span>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-emerald-800 text-white shadow-2xs font-semibold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Categories
          </button>
          {socialWorkCategories
            .filter((c) => c.status === 'active')
            .map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-800 text-white shadow-2xs font-semibold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
        </div>

        {/* Type Toggle (Ongoing Initiative vs Individual Project) */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 text-xs font-semibold">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              selectedType === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            All Types
          </button>
          <button
            onClick={() => setSelectedType('Ongoing Initiative')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              selectedType === 'Ongoing Initiative' ? 'bg-white text-emerald-900 shadow-2xs font-bold' : 'text-slate-600'
            }`}
          >
            Ongoing Initiatives
          </button>
          <button
            onClick={() => setSelectedType('Individual Project')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              selectedType === 'Individual Project' ? 'bg-white text-blue-900 shadow-2xs font-bold' : 'text-slate-600'
            }`}
          >
            Individual Projects
          </button>
        </div>
      </div>

      {/* 3. Activities Grid */}
      {filteredActivities.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200 p-8">
          <HeartHandshake className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No programs found matching this filter.</h3>
          <p className="text-sm text-slate-500 mt-1">Try selecting a different category or reset filters.</p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedType('all');
            }}
            className="mt-4 px-4 py-2 bg-emerald-800 text-white text-xs font-bold rounded-lg"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredActivities.map((act) => {
            const relatedEvents = publicEvents.filter((e) => e.social_work_activity_id === act.id);

            return (
              <div
                key={act.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Photo Banner */}
                  <div className="relative h-52 bg-slate-100 overflow-hidden cursor-pointer" onClick={() => handleOpenDetail(act)}>
                    <img
                      src={act.photos[0] || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800'}
                      alt={act.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-3 left-3 bg-emerald-900/90 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase backdrop-blur-xs shadow-xs">
                      {act.category_name}
                    </span>
                    <span
                      className={`absolute bottom-3 right-3 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs shadow-xs ${
                        act.type === 'Ongoing Initiative' ? 'bg-emerald-700/90' : 'bg-blue-700/90'
                      }`}
                    >
                      {act.type}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-3">
                    <h3
                      onClick={() => handleOpenDetail(act)}
                      className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 cursor-pointer"
                    >
                      {act.title}
                    </h3>
                    <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                      {act.description}
                    </p>

                    {/* Metadata & Beneficiaries Badge */}
                    <div className="space-y-1.5 pt-2 text-xs text-slate-500">
                      {act.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{act.location}</span>
                        </div>
                      )}
                      {act.beneficiaries_count && (
                        <div className="flex items-center gap-1.5 text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg w-fit">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Beneficiaries: {act.beneficiaries_count.toLocaleString('en-IN')}+</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    {relatedEvents.length} Linked Event{relatedEvents.length !== 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={() => handleOpenDetail(act)}
                    className="flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-900 transition-colors"
                  >
                    <span>View Full Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Detailed Activity Modal */}
      {activeModalActivity && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded">
                  {activeModalActivity.category_name}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                  {activeModalActivity.title}
                </h2>
              </div>
              <button
                onClick={handleCloseDetail}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Photo Gallery Grid */}
              {activeModalActivity.photos && activeModalActivity.photos.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Program Photos</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {activeModalActivity.photos.map((photo, i) => (
                      <div
                        key={i}
                        onClick={() =>
                          openLightbox(
                            activeModalActivity.photos.map((p) => ({ url: p, title: activeModalActivity.title })),
                            i
                          )
                        }
                        className="h-44 rounded-xl overflow-hidden cursor-pointer bg-slate-100 hover:opacity-90 transition-opacity"
                      >
                        <img src={photo} alt={activeModalActivity.title} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Description */}
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Initiative Overview</h4>
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">
                  {activeModalActivity.description}
                </p>
              </div>

              {/* Metadata Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-xs">
                <div>
                  <span className="text-slate-500 block">Activity Type:</span>
                  <span className="font-bold text-slate-800">{activeModalActivity.type}</span>
                </div>
                {activeModalActivity.location && (
                  <div>
                    <span className="text-slate-500 block">Operating Region:</span>
                    <span className="font-bold text-slate-800">{activeModalActivity.location}</span>
                  </div>
                )}
                {activeModalActivity.start_date && (
                  <div>
                    <span className="text-slate-500 block">Initiated Date:</span>
                    <span className="font-bold text-slate-800">{activeModalActivity.start_date}</span>
                  </div>
                )}
                {activeModalActivity.beneficiaries_count && (
                  <div>
                    <span className="text-slate-500 block">Total Beneficiaries:</span>
                    <span className="font-bold text-emerald-800">
                      {activeModalActivity.beneficiaries_count.toLocaleString('en-IN')}+ Citizens
                    </span>
                  </div>
                )}
              </div>

              {/* Related Events Section (Spec Section 15) */}
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-500 mb-3">Linked Community Events</h4>
                {publicEvents.filter((e) => e.social_work_activity_id === activeModalActivity.id).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No specific camps linked yet.</p>
                ) : (
                  <div className="space-y-2">
                    {publicEvents
                      .filter((e) => e.social_work_activity_id === activeModalActivity.id)
                      .map((evt) => (
                        <div
                          key={evt.id}
                          onClick={() => {
                            handleCloseDetail();
                            setSelectedEntityId(evt.id);
                            setActivePage('events');
                          }}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-emerald-700" />
                            <div>
                              <h5 className="font-bold text-sm text-slate-900">{evt.title}</h5>
                              <p className="text-xs text-slate-500">
                                {evt.event_date} • {evt.location} ({evt.status})
                              </p>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-400" />
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
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
