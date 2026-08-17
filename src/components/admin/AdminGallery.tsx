import React, { useMemo, useRef, useState } from 'react';
import {
  Image as ImageIcon,
  Search,
  Eye,
  Calendar,
  FolderOpen,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { updateAdminEventPhotoCaption, uploadAdminEventPhotos } from '../../api/events';

type UploadPreview = {
  id: string;
  name: string;
  dataUrl: string;
  caption: string;
  file: File;
};

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error(`Unable to read ${file.name}`));
    reader.readAsDataURL(file);
  });
}

export const AdminGallery: React.FC = () => {
  const { events, socialWorkActivities, milestones, openLightbox, refreshEventsFromApi } = useApp();
  const inputRef = useRef<HTMLInputElement>(null);
  const [filterType, setFilterType] = useState<'all' | 'events' | 'social_work' | 'milestones'>('all');
  const [search, setSearch] = useState('');
  const [targetEventId, setTargetEventId] = useState(events[0]?.id || '');
  const [previews, setPreviews] = useState<UploadPreview[]>([]);
  const [caption, setCaption] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');

  const eventAlbums = useMemo(
    () =>
      events
        .filter((event) => event.display_status === 'active')
        .map((event) => ({
          id: event.id,
          code: event.album_code || `ALB-${event.event_code}`,
          name: event.album_name || event.title,
          eventTitle: event.title,
          date: event.event_date,
          photos: event.photos || [],
        })),
    [events]
  );

  const allPhotos = useMemo(() => {
    const list: {
      id: string;
      url: string;
      title: string;
      sourceType: 'events' | 'social_work' | 'milestones';
      sourceName: string;
      caption?: string;
      date?: string;
    }[] = [];

    events.forEach((event) => {
      (event.photos || []).forEach((photo, index) => {
        list.push({
          id: `evt-${event.id}-${photo.id || index}`,
          url: photo.photo_url,
          title: event.album_name || event.title,
          sourceType: 'events',
          sourceName: event.album_name || event.title,
          caption: photo.caption,
          date: event.event_date,
        });
      });
    });

    socialWorkActivities.forEach((activity) => {
      (activity.photos || []).forEach((url, index) => {
        list.push({
          id: `sw-${activity.id}-${index}`,
          url,
          title: activity.title,
          sourceType: 'social_work',
          sourceName: activity.title,
          caption: activity.category_name,
          date: activity.start_date,
        });
      });
    });

    milestones.forEach((milestone) => {
      if (milestone.photo_url) {
        list.push({
          id: `mil-${milestone.id}`,
          url: milestone.photo_url,
          title: milestone.title,
          sourceType: 'milestones',
          sourceName: `Milestone: ${milestone.year}`,
          caption: milestone.title,
          date: milestone.year,
        });
      }
    });

    return list;
  }, [events, socialWorkActivities, milestones]);

  const filteredPhotos = useMemo(
    () =>
      allPhotos.filter((photo) => {
        if (filterType !== 'all' && photo.sourceType !== filterType) return false;
        if (!search.trim()) return true;
        const query = search.toLowerCase();
        return [photo.title, photo.sourceName, photo.caption || '', photo.date || '']
          .join(' ')
          .toLowerCase()
          .includes(query);
      }),
    [allPhotos, filterType, search]
  );

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const accepted = Array.from(files).filter((file) => file.type.startsWith('image/'));
    const rejected = files.length - accepted.length;
    const next: UploadPreview[] = [];

    for (const file of accepted) {
      next.push({
        id: `${file.name}-${file.lastModified}-${Math.random()}`,
        name: file.name,
        dataUrl: await readFileAsDataUrl(file),
        caption: caption.trim(),
        file,
      });
    }

    setPreviews((current) => [...current, ...next]);
    setUploadMessage(
      rejected
        ? `${rejected} non-image file${rejected === 1 ? '' : 's'} skipped.`
        : `${accepted.length} photo${accepted.length === 1 ? '' : 's'} ready to upload.`
    );
  };

  const handleUpload = async () => {
    if (!targetEventId || previews.length === 0) return;
    const event = events.find((item) => item.id === targetEventId);
    if (!event?.album_code) {
      setUploadMessage('The selected event does not have an album.');
      return;
    }
    try {
      const uploaded = await uploadAdminEventPhotos(event.album_code, previews.map((preview) => preview.file));
      await Promise.all(uploaded.map((photo, index) => {
        const photoCaption = previews[index]?.caption.trim();
        return photoCaption
          ? updateAdminEventPhotoCaption(event.album_code!, photo.id, photoCaption)
          : Promise.resolve();
      }));
      await refreshEventsFromApi();
      setPreviews([]);
      setCaption('');
      setUploadMessage('Photos uploaded successfully to the event album.');
    } catch (error) {
      setUploadMessage(error instanceof Error ? error.message : 'Unable to upload photos.');
    }
  };

  const openUploader = (eventId?: string) => {
    setTargetEventId(eventId || events[0]?.id || '');
    setPreviews([]);
    setCaption('');
    setUploadMessage('');
    setIsUploadOpen(true);
  };

  return (
    <div className="space-y-7">
      <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-900" />
              <h2 className="text-xl font-bold text-slate-900">Albums & Photos</h2>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Each event has one album. An album can contain any number of photos.
            </p>
          </div>
          <button
            onClick={() => openUploader()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-900 text-white text-sm font-bold hover:bg-blue-800"
          >
            <Upload className="w-4 h-4" />
            Upload Photos
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Event Albums</h3>
            <p className="text-xs text-slate-500">One album per event — {eventAlbums.length} albums in UAT data.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {eventAlbums.map((album) => (
            <article key={album.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="h-36 bg-slate-100 relative">
                {album.photos[0] ? (
                  <img src={album.photos[0].photo_url} alt={album.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <FolderOpen className="w-10 h-10" />
                  </div>
                )}
                <span className="absolute top-3 left-3 bg-slate-950/80 text-white rounded-full px-2.5 py-1 text-[10px] font-bold">
                  {album.code}
                </span>
                <span className="absolute bottom-3 right-3 bg-white/95 text-slate-900 rounded-full px-2.5 py-1 text-[10px] font-bold">
                  {album.photos.length} photos
                </span>
              </div>
              <div className="p-4">
                <h4 className="font-bold text-slate-900 line-clamp-2">{album.name}</h4>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {album.date} · {album.eventTitle}
                </p>
                <button
                  onClick={() => openUploader(album.id)}
                  className="mt-4 w-full py-2 rounded-xl border border-blue-200 text-blue-900 text-xs font-bold hover:bg-blue-50"
                >
                  Add Photos to This Album
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search photos, albums or captions"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl"
            />
          </div>
          <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1">
            {[
              ['all', `All (${allPhotos.length})`],
              ['events', 'Event Albums'],
              ['social_work', 'Social Work'],
              ['milestones', 'Milestones'],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setFilterType(value as typeof filterType)}
                className={`px-3 py-2 rounded-lg text-xs font-bold ${
                  filterType === value ? 'bg-blue-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredPhotos.map((photo, index) => (
            <button
              key={photo.id}
              onClick={() =>
                openLightbox(
                  filteredPhotos.map((item) => ({
                    url: item.url,
                    caption: item.caption,
                    title: item.title,
                  })),
                  index
                )
              }
              className="group text-left bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-[4/3] bg-slate-100 relative">
                <img src={photo.url} alt={photo.caption || photo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <span className="absolute right-2 bottom-2 bg-slate-950/75 text-white rounded-full p-1.5">
                  <Eye className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="p-3">
                <p className="text-xs font-bold text-slate-900 line-clamp-1">{photo.sourceName}</p>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{photo.caption || 'Community photo'}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Upload Photos to Event Album</h3>
                <p className="text-xs text-slate-500 mt-1">Select multiple photos at once. No image URLs are required.</p>
              </div>
              <button onClick={() => setIsUploadOpen(false)} className="p-2 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Event album</label>
                <select
                  value={targetEventId}
                  onChange={(event) => setTargetEventId(event.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm"
                >
                  {eventAlbums.map((album) => (
                    <option key={album.id} value={album.id}>
                      {album.name} — {album.photos.length} photos
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Caption for selected photos (optional)</label>
                <input
                  value={caption}
                  onChange={(event) => setCaption(event.target.value)}
                  placeholder="e.g. Members at the annual gathering"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div
                onClick={() => inputRef.current?.click()}
                className="border-2 border-dashed border-blue-200 bg-blue-50/60 rounded-2xl p-8 text-center cursor-pointer hover:bg-blue-50"
              >
                <Upload className="w-8 h-8 text-blue-900 mx-auto" />
                <p className="font-bold text-blue-950 mt-2">Choose photos from your computer</p>
                <p className="text-xs text-slate-500 mt-1">JPG, PNG, WEBP and other browser-supported image files · multiple selection allowed</p>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(event) => handleFiles(event.target.files)}
                />
              </div>

              {uploadMessage && (
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs">
                  {uploadMessage.includes('successfully') ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                  )}
                  {uploadMessage}
                </div>
              )}

              {previews.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-sm">Ready to upload ({previews.length})</h4>
                    <button onClick={() => setPreviews([])} className="text-xs font-bold text-red-600">Clear all</button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {previews.map((preview) => (
                      <div key={preview.id} className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                        <img src={preview.dataUrl} alt={preview.name} className="w-full aspect-square object-cover" />
                        <button
                          onClick={() => setPreviews((items) => items.filter((item) => item.id !== preview.id))}
                          className="absolute top-2 right-2 bg-slate-950/80 text-white rounded-full p-1"
                          aria-label={`Remove ${preview.name}`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <p className="p-2 text-[10px] text-slate-600 truncate">{preview.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-slate-200 flex justify-end gap-2">
              <button onClick={() => setIsUploadOpen(false)} className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100">
                Cancel
              </button>
              <button
                disabled={!previews.length || !targetEventId}
                onClick={handleUpload}
                className="px-5 py-2.5 rounded-xl bg-blue-900 text-white text-sm font-bold disabled:opacity-40"
              >
                Upload {previews.length || ''} Photo{previews.length === 1 ? '' : 's'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
