import React, { useState, useMemo } from 'react';
import {
  Bell,
  Search,
  Calendar,
  Sparkles,
  ArrowRight,
  X,
  Share2,
  CheckCircle,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Announcement } from '../types';

export const AnnouncementsPage: React.FC = () => {
  const { announcements, selectedEntityId, setSelectedEntityId } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterImportant, setFilterImportant] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeModalAnn, setActiveModalAnn] = useState<Announcement | null>(() => {
    if (selectedEntityId) {
      return announcements.find((a) => a.id === selectedEntityId) || null;
    }
    return null;
  });

  const filteredAnnouncements = useMemo(() => {
    return announcements
      .filter((a) => a.status === 'published')
      .filter((a) => {
        if (filterImportant && !a.important) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          return a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q);
        }
        return true;
      })
      .sort((a, b) => {
        if (a.important && !b.important) return -1;
        if (!a.important && b.important) return 1;
        return new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime();
      });
  }, [announcements, searchQuery, filterImportant]);

  const handleShare = (ann: Announcement) => {
    if (navigator.share) {
      navigator.share({
        title: ann.title,
        text: ann.content.substring(0, 100) + '...',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${ann.title}\n\n${ann.content}`);
      setCopiedId(ann.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* 1. Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-900 rounded-full text-xs font-bold uppercase tracking-wider">
          <Bell className="w-3.5 h-3.5" />
          <span>Official Circulars & Notices</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Announcements & Bulletins
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          Read verified notices regarding community scholarship application windows, matrimonial registrations, general body circulars, and festival arrangements.
        </p>
      </div>

      {/* 2. Filter & Search Controls */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search circulars, keywords, scholarships, dates..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-900"
          />
        </div>

        {/* Important Filter Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterImportant(!filterImportant)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              filterImportant
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Important Only</span>
          </button>
        </div>
      </div>

      {/* 3. Announcements List */}
      {filteredAnnouncements.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200 p-8">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No circulars found.</h3>
          <p className="text-sm text-slate-500 mt-1">Try another keyword or reset the filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((ann) => (
            <div
              key={ann.id}
              className={`bg-white rounded-2xl p-6 border shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
                ann.important ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
              }`}
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Published: {ann.publish_date}</span>
                  </span>

                  {ann.important && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-amber-500 text-white shadow-2xs">
                      Urgent Notice
                    </span>
                  )}
                  {ann.announcement_code && (
                    <span className="text-slate-400 font-mono text-[11px]">
                      Ref: {ann.announcement_code}
                    </span>
                  )}
                </div>

                <h3
                  onClick={() => setActiveModalAnn(ann)}
                  className="text-xl font-bold text-slate-900 hover:text-indigo-900 cursor-pointer transition-colors"
                >
                  {ann.title}
                </h3>

                <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                  {ann.content}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <button
                  onClick={() => handleShare(ann)}
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  title="Share announcement"
                >
                  {copiedId === ann.id ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Share2 className="w-4 h-4" />
                  )}
                </button>

                <button
                  onClick={() => setActiveModalAnn(ann)}
                  className="px-4 py-2.5 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <span>Read Notice</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Full Reading Modal */}
      {activeModalAnn && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">
                    Dated: {activeModalAnn.publish_date}
                  </span>
                  {activeModalAnn.important && (
                    <span className="text-[10px] font-bold uppercase bg-amber-500 text-white px-2 py-0.5 rounded">
                      Important
                    </span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {activeModalAnn.title}
                </h2>
              </div>
              <button
                onClick={() => setActiveModalAnn(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4 text-slate-700 leading-relaxed text-sm sm:text-base whitespace-pre-line">
              {activeModalAnn.content}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => handleShare(activeModalAnn)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 rounded-lg text-xs font-semibold text-slate-800"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Notice</span>
              </button>
              <button
                onClick={() => setActiveModalAnn(null)}
                className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
