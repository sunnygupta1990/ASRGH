import React, { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2, Download } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PhotoLightbox: React.FC = () => {
  const { lightbox, closeLightbox, openLightbox } = useApp();

  const currentPhoto = lightbox.photos[lightbox.currentIndex];

  const handleNext = useCallback(() => {
    if (lightbox.currentIndex < lightbox.photos.length - 1) {
      openLightbox(lightbox.photos, lightbox.currentIndex + 1);
    } else {
      openLightbox(lightbox.photos, 0); // loop back
    }
  }, [lightbox, openLightbox]);

  const handlePrev = useCallback(() => {
    if (lightbox.currentIndex > 0) {
      openLightbox(lightbox.photos, lightbox.currentIndex - 1);
    } else {
      openLightbox(lightbox.photos, lightbox.photos.length - 1);
    }
  }, [lightbox, openLightbox]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightbox.isOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightbox.isOpen, closeLightbox, handleNext, handlePrev]);

  if (!lightbox.isOpen || !currentPhoto) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200 select-none">
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between text-white z-10">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-300 bg-white/10 px-3 py-1 rounded-full">
            {lightbox.currentIndex + 1} / {lightbox.photos.length}
          </span>
          {currentPhoto.title && (
            <h4 className="text-sm font-semibold text-slate-200 truncate max-w-md hidden sm:block">
              {currentPhoto.title}
            </h4>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={closeLightbox}
            className="p-2 hover:bg-white/15 rounded-full text-slate-300 hover:text-white transition-colors"
            title="Close Lightbox (Esc)"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
        {lightbox.photos.length > 1 && (
          <button
            onClick={handlePrev}
            className="absolute left-2 sm:left-4 z-10 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all backdrop-blur-xs"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        <img
          src={currentPhoto.url}
          alt={currentPhoto.caption || 'Community event photograph'}
          className="max-h-full max-w-full object-contain rounded-lg shadow-2xl transition-transform"
        />

        {lightbox.photos.length > 1 && (
          <button
            onClick={handleNext}
            className="absolute right-2 sm:right-4 z-10 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all backdrop-blur-xs"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Caption & Metadata Footer */}
      <div className="text-center max-w-2xl mx-auto z-10">
        {currentPhoto.caption ? (
          <p className="text-sm sm:text-base text-slate-200 font-medium bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl inline-block">
            {currentPhoto.caption}
          </p>
        ) : (
          <p className="text-xs text-slate-400">ASRGH Community Archives</p>
        )}
      </div>
    </div>
  );
};
