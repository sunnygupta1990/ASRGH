import React from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageSquare,
  Globe,
  Heart,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useApp, ActivePage } from '../../context/AppContext';

export const Footer: React.FC = () => {
  const { settings, socialLinks, setActivePage, setIsAdminPortalOpen, language } = useApp();

  const handleNav = (page: ActivePage) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      {/* Top Banner Accent */}
      <div className="h-1.5 bg-gradient-to-r from-blue-900 via-amber-500 to-emerald-600"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: Organization Overview */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg overflow-hidden bg-white p-0.5 shrink-0 border border-slate-700">
                <img
                  src="/logo.jpg"
                  alt="ASRGH Logo"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&q=80&w=200';
                  }}
                />
              </div>
              <div>
                <h3 className="font-bold text-white text-base leading-tight">
                  {settings.organization_name}
                </h3>
                <p className="text-xs text-amber-400 font-medium">{settings.legal_name}</p>
              </div>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed">
              {settings.tagline}. Operating non-profit social welfare initiatives, student educational grants, free healthcare camps, and community support since 1998.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-2 pt-2">
              {socialLinks
                .filter((s) => s.is_enabled)
                .map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-slate-900 hover:bg-amber-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-slate-800"
                    title={link.platform_name}
                  >
                    {link.platform_name.toLowerCase().includes('whatsapp') ? (
                      <MessageSquare className="w-4 h-4" />
                    ) : (
                      <Globe className="w-4 h-4" />
                    )}
                  </a>
                ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider border-b border-slate-800 pb-2">
              {language === 'hi' ? 'त्वरित लिंक' : 'Quick Navigation'}
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                { id: 'about' as ActivePage, label: 'About & History' },
                { id: 'social_work' as ActivePage, label: 'Social Work & Welfare' },
                { id: 'events' as ActivePage, label: 'Upcoming & Past Events' },
                { id: 'gallery' as ActivePage, label: 'Photo & Media Gallery' },
                { id: 'members' as ActivePage, label: 'Community Directory' },
                { id: 'management' as ActivePage, label: 'Current Management' },
                { id: 'announcements' as ActivePage, label: 'Announcements & Circulars' },
              ].map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => handleNav(item.id)}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-amber-400 transition-colors text-left"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Community Initiatives */}
          <div className="space-y-4">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider border-b border-slate-800 pb-2">
              {language === 'hi' ? 'मुख्य सेवा प्रकल्प' : 'Core Initiatives'}
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0"></span>
                <div>
                  <strong className="text-slate-200 block text-xs">Vidya Jyoti Scholarships</strong>
                  <span className="text-xs">Financial aid for higher education in Engineering, CA, Medical.</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></span>
                <div>
                  <strong className="text-slate-200 block text-xs">Mission Aarogya Free Camps</strong>
                  <span className="text-xs">Periodic specialist diagnostic checkups & eye surgeries.</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0"></span>
                <div>
                  <strong className="text-slate-200 block text-xs">Jeevan Raksha Blood Network</strong>
                  <span className="text-xs">Emergency volunteer donor registry for patients in need.</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Office Info */}
          <div className="space-y-4">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider border-b border-slate-800 pb-2">
              {language === 'hi' ? 'कार्यालय व संपर्क' : 'Registered Office'}
            </h4>
            <div className="space-y-3 text-xs text-slate-400">
              {settings.show_address && (
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    {settings.address_line_1}, {settings.address_line_2}, {settings.city}, {settings.state} - {settings.postal_code}
                  </span>
                </div>
              )}

              {settings.show_phone && (
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                  <a href={`tel:${settings.primary_phone}`} className="hover:text-white transition-colors">
                    {settings.primary_phone}
                  </a>
                </div>
              )}

              {settings.show_email && (
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                  <a href={`mailto:${settings.primary_email}`} className="hover:text-white transition-colors">
                    {settings.primary_email}
                  </a>
                </div>
              )}

              {settings.show_office_hours && (
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{settings.office_hours}</span>
                </div>
              )}

              {settings.show_whatsapp && settings.whatsapp_number && (
                <div className="pt-2">
                  <a
                    href={`https://wa.me/${settings.whatsapp_number.replace(/\+/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs font-semibold transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Connect on WhatsApp</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar with Copyright & Admin Link */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span>© {new Date().getFullYear()} {settings.organization_name}. All Rights Reserved.</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => handleNav('contact')}
              className="hover:text-slate-300 transition-colors"
            >
              Contact Trust
            </button>
            <span>•</span>
            <button
              onClick={() => setIsAdminPortalOpen(true)}
              className="flex items-center gap-1 text-slate-400 hover:text-amber-400 transition-colors font-medium"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Portal Login</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
