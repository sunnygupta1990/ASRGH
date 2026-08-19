import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ImportantAnnouncementBanner } from './components/public/ImportantAnnouncementBanner';
import { Header } from './components/public/Header';
import { Footer } from './components/public/Footer';
import { MobileBottomNav } from './components/public/MobileBottomNav';
import { PhotoLightbox } from './components/public/PhotoLightbox';
import { GlobalSearchModal } from './components/public/GlobalSearchModal';

// Public Pages
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { SocialWorkPage } from './pages/SocialWorkPage';
import { EventsPage } from './pages/EventsPage';
import { GalleryPage } from './pages/GalleryPage';
import { MembersPage } from './pages/MembersPage';
import { ManagementPage } from './pages/ManagementPage';
import { AnnouncementsPage } from './pages/AnnouncementsPage';
import { ContactPage } from './pages/ContactPage';

// Admin Portal
import { AdminPortalModal } from './components/admin/AdminPortalModal';
import { applyTextScale } from './utils/accessibility';
import { membersDirectoryCopy } from './utils/membersDirectory';

const AppContent: React.FC = () => {
  const { activePage, textSize, language, publicContentError } = useApp();

  useEffect(() => {
    applyTextScale(document.documentElement, textSize);
  }, [textSize]);

  const renderActivePage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage />;
      case 'about':
        return <AboutPage />;
      case 'social_work':
        return <SocialWorkPage />;
      case 'events':
        return <EventsPage />;
      case 'gallery':
        return <GalleryPage />;
      case 'members':
        return <MembersPage />;
      case 'management':
        return <ManagementPage />;
      case 'announcements':
        return <AnnouncementsPage />;
      case 'contact':
        return <ContactPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* 1. Flash Announcement Bar */}
      <ImportantAnnouncementBanner />

      {/* 2. Top Header & Navigation */}
      <Header />

      {/* 3. Main Page Content */}
      <main className="flex-1 pb-20 md:pb-0">
        {publicContentError && (
          <div
            role="alert"
            className="border-b border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-800"
          >
            {membersDirectoryCopy(language).loadError}: {publicContentError}
          </div>
        )}
        {renderActivePage()}
      </main>

      {/* 4. Footer */}
      <Footer />

      {/* 5. Mobile Bottom Floating Nav */}
      <MobileBottomNav />

      {/* 6. Overlays, Lightbox, Global Search, Admin Portal */}
      <GlobalSearchModal />
      <PhotoLightbox />
      <AdminPortalModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
