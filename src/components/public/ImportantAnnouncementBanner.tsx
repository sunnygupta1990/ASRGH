import React, { useState } from 'react';
import { Bell, X, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ImportantAnnouncementBanner: React.FC = () => {
  const { announcements, setActivePage, setSelectedEntityId } = useApp();
  const [dismissed, setDismissed] = useState(false);

  const importantAnn = announcements.find((a) => a.important && a.status === 'published');

  if (!importantAnn || dismissed) return null;

  return (
    <div
      id="important-announcement-banner"
      className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-white px-4 py-2.5 shadow-sm transition-all"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className="flex items-center justify-center p-1 bg-amber-800/60 rounded text-amber-200 shrink-0">
            <Bell className="w-4 h-4" />
          </span>
          <span className="font-semibold text-amber-100 uppercase tracking-wide text-xs px-2 py-0.5 bg-amber-900/50 rounded-full shrink-0">
            Notice
          </span>
          <p className="font-medium truncate text-amber-50">
            {importantAnn.title}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            id="view-important-announcement-btn"
            onClick={() => {
              setSelectedEntityId(importantAnn.id);
              setActivePage('announcements');
            }}
            className="flex items-center gap-1 text-xs font-semibold bg-white/15 hover:bg-white/25 px-3 py-1 rounded transition-colors text-white whitespace-nowrap"
          >
            Read Notice
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            id="dismiss-announcement-banner-btn"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss banner"
            className="p-1 hover:bg-black/20 rounded text-amber-200 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
