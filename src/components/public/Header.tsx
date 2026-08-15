import React, { useState } from 'react';
import {
  Search,
  Menu,
  X,
  Phone,
  MessageSquare,
  Shield,
  Type,
  Globe,
  ChevronRight,
} from 'lucide-react';
import { useApp, ActivePage } from '../../context/AppContext';

export const Header: React.FC = () => {
  const {
    activePage,
    setActivePage,
    settings,
    textSize,
    setTextSize,
    language,
    setLanguage,
    setIsSearchOpen,
    setIsAdminPortalOpen,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks: { id: ActivePage; label: string; hindiLabel: string }[] = [
    { id: 'home', label: 'Home', hindiLabel: 'मुख्य पृष्ठ' },
    { id: 'about', label: 'About Us', hindiLabel: 'हमारे बारे में' },
    { id: 'social_work', label: 'Social Work', hindiLabel: 'समाज सेवा' },
    { id: 'events', label: 'Events', hindiLabel: 'आयोजन व कार्यक्रम' },
    { id: 'gallery', label: 'Gallery', hindiLabel: 'चित्र दीर्घा' },
    { id: 'members', label: 'Members', hindiLabel: 'सदस्य सूची' },
    { id: 'management', label: 'Management', hindiLabel: 'प्रबंध समिति' },
    { id: 'announcements', label: 'Announcements', hindiLabel: 'सूचनाएं' },
    { id: 'contact', label: 'Contact Us', hindiLabel: 'संपर्क करें' },
  ];

  const handleNavClick = (page: ActivePage) => {
    setActivePage(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Utility Bar for Accessibility & Senior Citizen Support */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-slate-300">
            {settings.show_phone && settings.primary_phone && (
              <a
                href={`tel:${settings.primary_phone.replace(/\s+/g, '')}`}
                className="flex items-center gap-1.5 hover:text-white transition-colors"
                id="header-phone-link"
              >
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>{settings.primary_phone}</span>
              </a>
            )}
            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="hidden sm:inline text-slate-400">
              {settings.tagline}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Text Resizer for Senior Citizens */}
            <div className="flex items-center gap-1 bg-slate-800 rounded px-1.5 py-0.5" title="Adjust Text Size">
              <Type className="w-3 h-3 text-slate-400 mr-0.5" />
              <button
                id="text-size-normal-btn"
                onClick={() => setTextSize('normal')}
                className={`px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  textSize === 'normal' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                A
              </button>
              <button
                id="text-size-large-btn"
                onClick={() => setTextSize('large')}
                className={`px-1.5 py-0.5 rounded text-[12px] font-bold transition-colors ${
                  textSize === 'large' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                A+
              </button>
              <button
                id="text-size-xlarge-btn"
                onClick={() => setTextSize('xlarge')}
                className={`px-1.5 py-0.5 rounded text-[13px] font-black transition-colors ${
                  textSize === 'xlarge' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                A++
              </button>
            </div>

            {/* Language Switcher */}
            <button
              id="lang-toggle-btn"
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="flex items-center gap-1 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 transition-colors"
              title="Toggle Language"
            >
              <Globe className="w-3 h-3 text-amber-400" />
              <span className="font-medium uppercase">{language === 'en' ? 'हिन्दी' : 'English'}</span>
            </button>

            {/* Admin Portal Gateway */}
            <button
              id="header-admin-portal-btn"
              onClick={() => setIsAdminPortalOpen(true)}
              className="flex items-center gap-1 px-2 py-0.5 bg-blue-900/80 hover:bg-blue-800 text-blue-200 hover:text-white rounded border border-blue-700 transition-colors"
            >
              <Shield className="w-3 h-3 text-blue-400" />
              <span className="font-semibold">Admin Portal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand & Organization Identity */}
        <div
          id="header-brand"
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shadow-xs group-hover:scale-105 transition-transform shrink-0 flex items-center justify-center">
            <img
              src="/logo.jpg"
              alt="ASRGH Logo"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback graceful graphic if image path differs
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&q=80&w=200';
              }}
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 text-base sm:text-lg leading-tight tracking-tight group-hover:text-blue-900 transition-colors">
              {language === 'hi' ? 'अग्रवाल सभा रोहिणी ग्रुप हाउसिंग (ASRGH)' : settings.organization_name}
            </span>
            <span className="text-xs text-slate-600 font-medium line-clamp-1">
              {language === 'hi' ? 'सामुदायिक सेवा, शिक्षा, स्वास्थ्य व सहयोग' : settings.legal_name}
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = activePage === link.id;
            return (
              <button
                key={link.id}
                id={`nav-link-${link.id}`}
                onClick={() => handleNavClick(link.id)}
                className={`px-3 py-2 rounded-md font-medium transition-all text-sm whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-900 text-white shadow-xs font-semibold'
                    : 'text-slate-700 hover:text-blue-900 hover:bg-slate-100'
                }`}
              >
                {language === 'hi' ? link.hindiLabel : link.label}
              </button>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Global Search Button */}
          <button
            id="global-search-trigger-btn"
            onClick={() => setIsSearchOpen(true)}
            aria-label="Search directory"
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm transition-colors border border-slate-200"
          >
            <Search className="w-4 h-4 text-slate-500" />
            <span className="hidden md:inline font-medium text-slate-600">Search</span>
            <kbd className="hidden lg:inline-block text-[10px] bg-white border border-slate-300 rounded px-1.5 py-0.5 text-slate-500">
              ⌘K
            </kbd>
          </button>

          {/* Quick WhatsApp Action Button */}
          {settings.show_whatsapp && settings.whatsapp_number && (
            <a
              id="header-whatsapp-btn"
              href={`https://wa.me/${settings.whatsapp_number.replace(/\+/g, '')}?text=Namaste!%20I%20would%20like%20to%20know%20more%20about%20ASRGH%20Community%20initiatives.`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-xs transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
          )}

          {/* Mobile Hamburger Menu */}
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-t border-slate-200 px-4 pt-3 pb-6 space-y-2 shadow-lg animate-in slide-in-from-top duration-200">
          <div className="grid grid-cols-1 gap-1">
            {navLinks.map((link) => {
              const isActive = activePage === link.id;
              return (
                <button
                  key={link.id}
                  id={`mobile-nav-link-${link.id}`}
                  onClick={() => handleNavClick(link.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left font-medium transition-colors text-base ${
                    isActive
                      ? 'bg-blue-900 text-white font-semibold'
                      : 'text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <span>{language === 'hi' ? link.hindiLabel : link.label}</span>
                  <ChevronRight className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
            <button
              id="mobile-admin-access-btn"
              onClick={() => {
                setMobileMenuOpen(false);
                setIsAdminPortalOpen(true);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium text-sm"
            >
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Enter Admin Portal</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
