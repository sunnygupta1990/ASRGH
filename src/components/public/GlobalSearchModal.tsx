import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, Users, Calendar, HeartHandshake, Bell, Award, ArrowRight } from 'lucide-react';
import { useApp, ActivePage } from '../../context/AppContext';

export const GlobalSearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    members,
    events,
    socialWorkActivities,
    announcements,
    milestones,
    setActivePage,
    setSelectedEntityId,
  } = useApp();

  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'members' | 'events' | 'social_work' | 'announcements'>('all');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();

    const results: {
      id: string;
      title: string;
      subtitle: string;
      type: 'member' | 'event' | 'social_work' | 'announcement' | 'milestone';
      page: ActivePage;
      entityId: string;
    }[] = [];

    // Search Members (Active and only public fields)
    if (filterType === 'all' || filterType === 'members') {
      members
        .filter((m) => m.status === 'active')
        .forEach((m) => {
          const match =
            m.display_name.toLowerCase().includes(q) ||
            m.first_name.toLowerCase().includes(q) ||
            m.last_name.toLowerCase().includes(q) ||
            m.category.toLowerCase().includes(q) ||
            m.designation.toLowerCase().includes(q) ||
            (m.management_post && m.management_post.toLowerCase().includes(q));

          if (match) {
            results.push({
              id: m.id,
              title: m.display_name,
              subtitle: `${m.designation} • ${m.category} ${m.management_post ? `(${m.management_post})` : ''}`,
              type: 'member',
              page: m.current_management ? 'management' : 'members',
              entityId: m.id,
            });
          }
        });
    }

    // Search Events
    if (filterType === 'all' || filterType === 'events') {
      events
        .filter((e) => e.display_status === 'active')
        .forEach((e) => {
          const match =
            e.title.toLowerCase().includes(q) ||
            e.description.toLowerCase().includes(q) ||
            e.category.toLowerCase().includes(q) ||
            e.location.toLowerCase().includes(q) ||
            e.event_date.includes(q);

          if (match) {
            results.push({
              id: e.id,
              title: e.title,
              subtitle: `${e.event_date} • ${e.location} (${e.status})`,
              type: 'event',
              page: 'events',
              entityId: e.id,
            });
          }
        });
    }

    // Search Social Work
    if (filterType === 'all' || filterType === 'social_work') {
      socialWorkActivities
        .filter((s) => s.status === 'active')
        .forEach((s) => {
          const match =
            s.title.toLowerCase().includes(q) ||
            s.description.toLowerCase().includes(q) ||
            s.category_name.toLowerCase().includes(q) ||
            (s.location && s.location.toLowerCase().includes(q));

          if (match) {
            results.push({
              id: s.id,
              title: s.title,
              subtitle: `${s.category_name} • ${s.type}`,
              type: 'social_work',
              page: 'social_work',
              entityId: s.id,
            });
          }
        });
    }

    // Search Announcements
    if (filterType === 'all' || filterType === 'announcements') {
      announcements
        .filter((a) => a.status === 'published')
        .forEach((a) => {
          const match = a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q);

          if (match) {
            results.push({
              id: a.id,
              title: a.title,
              subtitle: `Published: ${a.publish_date} ${a.important ? '• Important' : ''}`,
              type: 'announcement',
              page: 'announcements',
              entityId: a.id,
            });
          }
        });
    }

    return results;
  }, [query, filterType, members, events, socialWorkActivities, announcements, milestones]);

  const handleResultClick = (page: ActivePage, entityId: string) => {
    setSelectedEntityId(entityId);
    setActivePage(page);
    setIsSearchOpen(false);
    setQuery('');
  };

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-12 sm:pt-20 px-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search members, events, social work initiatives, announcements..."
            autoFocus
            className="w-full text-base sm:text-lg outline-none placeholder:text-slate-400 text-slate-900"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="text-xs bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded text-slate-600 font-medium"
          >
            Esc
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 border-b border-slate-200 overflow-x-auto text-xs">
          {[
            { id: 'all', label: 'All' },
            { id: 'members', label: 'Members' },
            { id: 'events', label: 'Events' },
            { id: 'social_work', label: 'Social Work' },
            { id: 'announcements', label: 'Announcements' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id as any)}
              className={`px-3 py-1 rounded-full font-medium transition-colors whitespace-nowrap ${
                filterType === f.id
                  ? 'bg-blue-900 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {!query.trim() ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-medium text-slate-700">Type to search the ASRGH Community Directory</p>
              <p className="text-xs text-slate-400 mt-1">Search by member names, event titles, categories, or keywords</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              <p className="font-semibold text-slate-800 text-base">No results found.</p>
              <p className="text-slate-500 mt-1">Try another name, keyword, year, or category.</p>
            </div>
          ) : (
            searchResults.map((res) => {
              const icon =
                res.type === 'member' ? (
                  <Users className="w-4 h-4 text-blue-600" />
                ) : res.type === 'event' ? (
                  <Calendar className="w-4 h-4 text-amber-600" />
                ) : res.type === 'social_work' ? (
                  <HeartHandshake className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Bell className="w-4 h-4 text-indigo-600" />
                );

              return (
                <button
                  key={res.id}
                  onClick={() => handleResultClick(res.page, res.entityId)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 text-left transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-white group-hover:shadow-2xs transition-all">
                      {icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm group-hover:text-blue-900 transition-colors">
                        {res.title}
                      </h4>
                      <p className="text-xs text-slate-500">{res.subtitle}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-900 group-hover:translate-x-0.5 transition-all" />
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
