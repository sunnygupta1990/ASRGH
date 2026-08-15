import React, { useState } from 'react';
import { Image, Filter, Calendar, Sparkles, Folder } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const GalleryPage: React.FC = () => {
  const { events, socialWorkActivities, openLightbox } = useApp();

  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedAlbum, setSelectedAlbum] = useState<string>('all');

  // Collect all photos from events and social work activities
  const allMediaPhotos: {
    id: string;
    url: string;
    caption?: string;
    title: string;
    year: string;
    albumName: string;
    category: string;
  }[] = [];

  events.forEach((evt) => {
    const year = evt.event_date.split('-')[0] || '2026';
    evt.photos.forEach((p, idx) => {
      allMediaPhotos.push({
        id: `${evt.id}-${idx}`,
        url: p.photo_url,
        caption: p.caption,
        title: evt.title,
        year,
        albumName: evt.title,
        category: evt.category,
      });
    });
  });

  socialWorkActivities.forEach((sw) => {
    const year = sw.start_date ? sw.start_date.split('-')[0] : '2026';
    sw.photos.forEach((p, idx) => {
      allMediaPhotos.push({
        id: `${sw.id}-${idx}`,
        url: p,
        caption: sw.title,
        title: sw.title,
        year,
        albumName: sw.category_name,
        category: sw.category_name,
      });
    });
  });

  // Extract unique years
  const availableYears = Array.from(new Set(allMediaPhotos.map((p) => p.year))).sort().reverse();
  const availableAlbums = Array.from(new Set(allMediaPhotos.map((p) => p.albumName)));

  const filteredPhotos = allMediaPhotos.filter((p) => {
    if (selectedYear !== 'all' && p.year !== selectedYear) return false;
    if (selectedAlbum !== 'all' && p.albumName !== selectedAlbum) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      {/* 1. Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-xs font-bold uppercase tracking-wider">
          <Image className="w-3.5 h-3.5" />
          <span>Community Photo Archives</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Visual Media Gallery
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          Explore photographs and historic memories from our annual gatherings, charitable relief missions, student felicitations, and blood donation drives.
        </p>
      </div>

      {/* 2. Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Year Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 text-xs">
          <span className="text-slate-500 font-semibold uppercase text-[11px] shrink-0 mr-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Year:
          </span>
          <button
            onClick={() => setSelectedYear('all')}
            className={`px-3 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap ${
              selectedYear === 'all'
                ? 'bg-blue-900 text-white font-semibold shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Years
          </button>
          {availableYears.map((yr) => (
            <button
              key={yr}
              onClick={() => setSelectedYear(yr)}
              className={`px-3 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap ${
                selectedYear === yr
                  ? 'bg-blue-900 text-white font-semibold shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {yr}
            </button>
          ))}
        </div>

        {/* Album Selector */}
        <div className="flex items-center gap-2 text-xs">
          <Folder className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedAlbum}
            onChange={(e) => setSelectedAlbum(e.target.value)}
            aria-label="Filter by Event Album"
            className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none"
          >
            <option value="all">All Albums & Collections</option>
            {availableAlbums.map((alb) => (
              <option key={alb} value={alb}>
                {alb}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Photo Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200 p-8">
          <Image className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No photos found in this filter.</h3>
          <p className="text-sm text-slate-500 mt-1">Please select "All Years" or "All Albums".</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPhotos.map((photo, idx) => (
            <div
              key={photo.id}
              onClick={() =>
                openLightbox(
                  filteredPhotos.map((p) => ({ url: p.url, caption: p.caption, title: p.title })),
                  idx
                )
              }
              className="relative h-60 rounded-2xl overflow-hidden bg-slate-900 cursor-pointer shadow-xs hover:shadow-xl transition-all group"
            >
              <img
                src={photo.url}
                alt={photo.caption || photo.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 opacity-90 group-hover:opacity-100"
              />

              {/* Hover Caption Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 text-white">
                <span className="text-xs font-bold text-amber-300">{photo.title}</span>
                {photo.caption && <p className="text-[11px] text-slate-200 line-clamp-2 mt-0.5">{photo.caption}</p>}
                <span className="text-[10px] text-slate-400 mt-1">Year {photo.year}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
