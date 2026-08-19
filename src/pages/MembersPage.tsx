import React, { useEffect, useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  Award,
  Heart,
  X,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Member, MemberCategory } from '../types';
import { compareMembersByCode, filterMembersByCategory, MEMBER_CATEGORIES } from '../utils/memberClassification';
import { matchesPublicMemberSearch, memberCategoryLabel, membersDirectoryCopy } from '../utils/membersDirectory';

export const MembersPage: React.FC = () => {
  const { publicMembers, selectedEntityId, setSelectedEntityId, language } = useApp();
  const text = membersDirectoryCopy(language);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLetter, setSelectedLetter] = useState<string>('all');
  const [activeModalMember, setActiveModalMember] = useState<Member | null>(() => {
    if (selectedEntityId) {
      return publicMembers.find((m) => m.id === selectedEntityId) || null;
    }
    return null;
  });

  useEffect(() => {
    if (!selectedEntityId) {
      setActiveModalMember(null);
      return;
    }

    setActiveModalMember(
      publicMembers.find((member) => member.id === selectedEntityId) ?? null,
    );
  }, [publicMembers, selectedEntityId]);

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const categories: MemberCategory[] = MEMBER_CATEGORIES;

  const filteredMembers = useMemo(() => {
    return filterMembersByCategory(publicMembers, selectedCategory)
      .filter((m) => m.status === 'active')
      .filter((m) => {
        // Search Filter
        if (!matchesPublicMemberSearch(m, searchQuery)) return false;

        // Alphabet Filter
        if (selectedLetter !== 'all') {
          const firstChar = (m.first_name || m.display_name || '').trim().charAt(0).toUpperCase();
          if (firstChar !== selectedLetter) return false;
        }

        return true;
      })
      .sort(compareMembersByCode);
  }, [publicMembers, searchQuery, selectedCategory, selectedLetter]);

  const handleOpenDetail = (m: Member) => {
    setActiveModalMember(m);
    setSelectedEntityId(m.id);
  };

  const handleCloseDetail = () => {
    setActiveModalMember(null);
    setSelectedEntityId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* 1. Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-xs font-bold uppercase tracking-wider">
          <Users className="w-3.5 h-3.5" />
          <span>{text.badge}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          {text.title}
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          {text.subtitle}
        </p>
      </div>

      {/* 2. Search & Filter Controls */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={text.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-900 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                {text.clear}
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label={text.filterLabel}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-blue-900"
            >
              <option value="all">{text.all}</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {memberCategoryLabel(c, language)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Alphabet Quick Jump Bar (Spec Section 20) */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-1 overflow-x-auto text-xs pb-1">
          <span className="text-slate-400 font-semibold uppercase text-[10px] mr-1 shrink-0">{text.alphabetJump}</span>
          <button
            onClick={() => setSelectedLetter('all')}
            className={`px-2 py-1 rounded font-bold transition-colors shrink-0 ${
              selectedLetter === 'all' ? 'bg-blue-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {text.all}
          </button>
          {alphabet.map((letter) => (
            <button
              key={letter}
              onClick={() => setSelectedLetter(letter)}
              className={`w-6 h-6 flex items-center justify-center rounded font-semibold transition-colors shrink-0 ${
                selectedLetter === letter
                  ? 'bg-blue-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-blue-900'
              }`}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Members Grid */}
      {filteredMembers.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200 p-8">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">{text.noRecords}</h3>
          <p className="text-sm text-slate-500 mt-1">{text.noRecordsHint}</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedLetter('all');
            }}
            className="mt-4 px-4 py-2 bg-blue-900 text-white text-xs font-bold rounded-lg"
          >
            {text.resetFilters}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMembers.map((m) => (
            <div
              key={m.id}
              onClick={() => handleOpenDetail(m)}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {/* Photo & Badges */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 group-hover:scale-105 transition-transform">
                    <img
                      src={
                        m.photo_url ||
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=600'
                      }
                      alt={m.display_name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                      {memberCategoryLabel(m.category, language)}
                    </span>
                    {m.current_management && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Award className="w-3 h-3 text-amber-700" />
                        <span>{text.management}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Identity & Bio */}
                <div>
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-900 transition-colors">
                    {m.display_name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">{memberCategoryLabel(m.category, language)}</p>

                  {m.management_post && (
                    <p className="text-xs font-bold text-amber-800 mt-1">
                      {m.management_post}
                    </p>
                  )}

                  <div className="mt-3 space-y-1 text-xs text-slate-500 border-t border-slate-100 pt-2">
                    {m.native_place && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{text.native}: {m.native_place}</span>
                      </div>
                    )}
                    {m.city && (
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 text-center text-slate-400">•</span>
                        <span>{text.residing}: {m.city}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Bottom */}
              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-900">
                <span>{text.viewProfile}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Member Profile Modal with Strict Privacy Handling (Spec Section 22) */}
      {activeModalMember && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseDetail();
            }
          }}
        >
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-400 shrink-0">
                  <img
                    src={
                      activeModalMember.photo_url ||
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=600'
                    }
                    alt={activeModalMember.display_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{activeModalMember.display_name}</h2>
                  <p className="text-xs text-slate-500">{memberCategoryLabel(activeModalMember.category, language)} • {memberCategoryLabel(activeModalMember.category, language)}</p>
                  {activeModalMember.management_post && (
                    <span className="inline-block text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded mt-1">
                      {activeModalMember.management_post}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={handleCloseDetail}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              {/* Bio */}
              {activeModalMember.bio && (
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-500 mb-1">{text.aboutMember}</h4>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line">{activeModalMember.bio}</p>
                </div>
              )}

              {/* Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-xs">
                <div>
                  <span className="text-slate-500 block">{text.memberId}</span>
                  <span className="font-bold text-slate-800">{activeModalMember.member_code}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">{text.membershipStatus}</span>
                  <span className="font-bold text-emerald-800 uppercase">{activeModalMember.status}</span>
                </div>
                {activeModalMember.native_place && (
                  <div>
                    <span className="text-slate-500 block">{text.nativePlace}</span>
                    <span className="font-bold text-slate-800">{activeModalMember.native_place}</span>
                  </div>
                )}
                {activeModalMember.visibility.address_public && activeModalMember.city && (
                  <div>
                    <span className="text-slate-500 block">{text.currentCity}</span>
                    <span className="font-bold text-slate-800">
                      {activeModalMember.city}
                    </span>
                  </div>
                )}
                {activeModalMember.visibility.address_public &&
                  (activeModalMember.address_line_2 || activeModalMember.city) && (
                    <div className="sm:col-span-2">
                      <span className="text-slate-500 block">{text.address}</span>
                      <span className="font-bold text-slate-800 whitespace-pre-line">
                        {[
                          activeModalMember.address_line_2,
                          activeModalMember.city,
                        ]
                          .filter(Boolean)
                          .join('\n')}
                      </span>
                    </div>
                  )}
                {activeModalMember.joining_date && (
                  <div>
                    <span className="text-slate-500 block">{text.memberSince}</span>
                    <span className="font-bold text-slate-800">{activeModalMember.joining_date}</span>
                  </div>
                )}
              </div>

              {/* Public Contact Details (Respecting Privacy Flags - Section 22) */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <h4 className="text-xs font-bold uppercase text-slate-500">{text.contactDetails}</h4>
                <div className="flex flex-wrap gap-4">
                  {activeModalMember.show_phone && activeModalMember.phone ? (
                    <a
                      href={`tel:${activeModalMember.phone}`}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{activeModalMember.phone}</span>
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 italic">{text.phonePrivate}</span>
                  )}

                  {activeModalMember.show_email && activeModalMember.email ? (
                    <a
                      href={`mailto:${activeModalMember.email}`}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold"
                    >
                      <Mail className="w-3.5 h-3.5 text-blue-600" />
                      <span>{activeModalMember.email}</span>
                    </a>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={handleCloseDetail}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors"
              >
                {text.closeProfile}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
