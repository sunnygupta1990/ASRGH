import React, { useState } from 'react';
import { Home, Search, Calendar, Image, MoreHorizontal, X, Users, Award, Bell, Mail, Info, HeartHandshake } from 'lucide-react';
import { useApp, ActivePage } from '../../context/AppContext';

export const MobileBottomNav: React.FC = () => {
  const { activePage, setActivePage, setIsSearchOpen, language } = useApp();
  const [moreDrawerOpen, setMoreDrawerOpen] = useState(false);

  const handlePageChange = (page: ActivePage) => {
    setActivePage(page);
    setMoreDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const moreItems: { id: ActivePage; label: string; icon: React.ReactNode }[] = [
    { id: 'social_work', label: 'Social Work', icon: <HeartHandshake className="w-5 h-5 text-emerald-600" /> },
    { id: 'members', label: 'Members Directory', icon: <Users className="w-5 h-5 text-blue-600" /> },
    { id: 'management', label: 'Management', icon: <Award className="w-5 h-5 text-amber-600" /> },
    { id: 'announcements', label: 'Announcements', icon: <Bell className="w-5 h-5 text-indigo-600" /> },
    { id: 'about', label: 'About & History', icon: <Info className="w-5 h-5 text-slate-600" /> },
    { id: 'contact', label: 'Contact Us', icon: <Mail className="w-5 h-5 text-rose-600" /> },
  ];

  return (
    <>
      {/* More Options Drawer Modal */}
      {moreDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end xl:hidden">
          <div className="bg-white rounded-t-2xl p-5 shadow-2xl border-t border-slate-200 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {language === 'hi' ? 'अन्य विकल्प' : 'Community Services'}
              </h3>
              <button
                onClick={() => setMoreDrawerOpen(false)}
                className="p-1 text-slate-500 hover:text-slate-900 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 py-4">
              {moreItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handlePageChange(item.id)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 text-left transition-colors"
                >
                  <div className="p-2 bg-white rounded-lg shadow-2xs shrink-0">
                    {item.icon}
                  </div>
                  <span className="text-sm font-semibold text-slate-800 leading-tight">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Bar for Mobile & Tablet */}
      <div className="xl:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 py-1.5 safe-area-pb">
        <div className="flex items-center justify-around">
          <button
            onClick={() => handlePageChange('home')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs font-medium transition-colors ${
              activePage === 'home' ? 'text-blue-900 font-bold' : 'text-slate-600'
            }`}
          >
            <Home className={`w-5 h-5 ${activePage === 'home' ? 'text-blue-900' : 'text-slate-500'}`} />
            <span>Home</span>
          </button>

          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs font-medium text-slate-600"
          >
            <Search className="w-5 h-5 text-slate-500" />
            <span>Search</span>
          </button>

          <button
            onClick={() => handlePageChange('events')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs font-medium transition-colors ${
              activePage === 'events' ? 'text-blue-900 font-bold' : 'text-slate-600'
            }`}
          >
            <Calendar className={`w-5 h-5 ${activePage === 'events' ? 'text-blue-900' : 'text-slate-500'}`} />
            <span>Events</span>
          </button>

          <button
            onClick={() => handlePageChange('gallery')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs font-medium transition-colors ${
              activePage === 'gallery' ? 'text-blue-900 font-bold' : 'text-slate-600'
            }`}
          >
            <Image className={`w-5 h-5 ${activePage === 'gallery' ? 'text-blue-900' : 'text-slate-500'}`} />
            <span>Gallery</span>
          </button>

          <button
            onClick={() => setMoreDrawerOpen(true)}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs font-medium transition-colors ${
              moreDrawerOpen ? 'text-blue-900 font-bold' : 'text-slate-600'
            }`}
          >
            <MoreHorizontal className="w-5 h-5 text-slate-500" />
            <span>More</span>
          </button>
        </div>
      </div>
    </>
  );
};
