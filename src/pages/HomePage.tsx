import React, { useState, useEffect } from 'react';
import {
  Calendar,
  HeartHandshake,
  Users,
  Award,
  Bell,
  ArrowRight,
  MapPin,
  Clock,
  ExternalLink,
  MessageSquare,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const HomePage: React.FC = () => {
  const {
    settings,
    statistics,
    announcements,
    events,
    socialWorkActivities,
    members,
    setActivePage,
    setSelectedEntityId,
    openLightbox,
    language,
  } = useApp();

  // Upcoming featured events
  const upcomingEvents = events
    .filter((e) => e.display_status === 'active' && (e.status === 'upcoming' || e.status === 'ongoing'))
    .slice(0, 3);

  // Latest announcements
  const latestAnnouncements = announcements
    .filter((a) => a.status === 'published')
    .slice(0, 3);

  // Featured social work
  const featuredSocialWork = socialWorkActivities
    .filter((s) => s.status === 'active' && s.featured)
    .slice(0, 3);

  // Management members snapshot
  const managementPreview = members
    .filter((m) => m.status === 'active' && m.current_management)
    .sort((a, b) => a.display_order - b.display_order)
    .slice(0, 4);

  // Live countdown timer for the next primary event
  const primaryEvent = upcomingEvents[0];
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; mins: number; secs: number }>({
    days: 0,
    hours: 0,
    mins: 0,
    secs: 0,
  });

  useEffect(() => {
    if (!primaryEvent) return;
    const targetDate = new Date(`${primaryEvent.event_date}T${primaryEvent.start_time || '09:00'}:00`).getTime();

    const calculate = () => {
      const now = new Date().getTime();
      const diff = Math.max(0, targetDate - now);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        mins: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        secs: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [primaryEvent]);

  // Gallery Highlights photos
  const galleryHighlights = [
    {
      url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800',
      caption: 'Annual General Assembly Felicitation Ceremony',
      title: 'Community Felicitation',
    },
    {
      url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800',
      caption: 'Free Eye Screening & Medical Checkup Camp',
      title: 'Healthcare Camp',
    },
    {
      url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800',
      caption: 'Vidya Jyoti Higher Education Scholarship Distribution',
      title: 'Scholarship Ceremony',
    },
    {
      url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800',
      caption: 'Harit Parivar Environment Tree Plantation Drive',
      title: 'Tree Plantation',
    },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* 1. Hero / Organization Introduction Section */}
      <section className="relative bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 text-white overflow-hidden py-16 sm:py-24 border-b border-slate-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Serving the Community Since 1998</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                {language === 'hi'
                  ? 'एकता, सेवा और समर्पण का सशक्त मंच'
                  : settings.organization_name}
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                {settings.tagline}. We unite families, foster educational excellence through scholarships, provide free medical care, and uplift our community with transparency and mutual respect.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  id="hero-explore-social-work-btn"
                  onClick={() => {
                    setActivePage('social_work');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm sm:text-base shadow-md transition-all flex items-center gap-2"
                >
                  <HeartHandshake className="w-5 h-5" />
                  <span>{language === 'hi' ? 'समाज सेवा प्रकल्प' : 'Explore Social Work'}</span>
                </button>

                <button
                  id="hero-view-members-btn"
                  onClick={() => {
                    setActivePage('members');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm sm:text-base border border-white/20 transition-all flex items-center gap-2"
                >
                  <Users className="w-5 h-5 text-blue-300" />
                  <span>{language === 'hi' ? 'सदस्य निर्देशिका' : 'Member Directory'}</span>
                </button>

                {settings.show_whatsapp && settings.whatsapp_number && (
                  <a
                    id="hero-whatsapp-btn"
                    href={`https://wa.me/${settings.whatsapp_number.replace(/\+/g, '')}?text=Namaste!%20I%20am%20interested%20in%20ASRGH%20Community%20initiatives.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-sm sm:text-base transition-all flex items-center gap-2"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>
            </div>

            {/* Right Card: Next Major Event with Live Countdown */}
            {primaryEvent && (
              <div className="lg:col-span-5 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-6 shadow-2xl text-left space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-white/15">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                    <Calendar className="w-4 h-4" />
                    <span>Featured Upcoming Event</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    {primaryEvent.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white line-clamp-2">
                    {primaryEvent.title}
                  </h3>
                  <div className="mt-2 space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{new Date(primaryEvent.event_date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{primaryEvent.start_time} - {primaryEvent.end_time || 'Conclusion'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{primaryEvent.location}</span>
                    </div>
                  </div>
                </div>

                {/* Countdown Clock */}
                {primaryEvent.countdown_enabled && (
                  <div className="pt-2">
                    <p className="text-[11px] text-slate-300 uppercase font-semibold tracking-wider mb-2">
                      Event Countdown Clock
                    </p>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="bg-slate-950/60 rounded-xl p-2 border border-white/10">
                        <span className="block text-xl font-black text-amber-400">{timeLeft.days}</span>
                        <span className="text-[10px] text-slate-400 uppercase">Days</span>
                      </div>
                      <div className="bg-slate-950/60 rounded-xl p-2 border border-white/10">
                        <span className="block text-xl font-black text-amber-400">{timeLeft.hours}</span>
                        <span className="text-[10px] text-slate-400 uppercase">Hours</span>
                      </div>
                      <div className="bg-slate-950/60 rounded-xl p-2 border border-white/10">
                        <span className="block text-xl font-black text-amber-400">{timeLeft.mins}</span>
                        <span className="text-[10px] text-slate-400 uppercase">Mins</span>
                      </div>
                      <div className="bg-slate-950/60 rounded-xl p-2 border border-white/10">
                        <span className="block text-xl font-black text-amber-400">{timeLeft.secs}</span>
                        <span className="text-[10px] text-slate-400 uppercase">Secs</span>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  id="home-primary-event-details-btn"
                  onClick={() => {
                    setSelectedEntityId(primaryEvent.id);
                    setActivePage('events');
                  }}
                  className="w-full py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                >
                  <span>View Event Details & Venue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Quick Access Cards for Older Audiences & Public Navigation */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              title: 'Members Directory',
              desc: 'Browse 2,450+ verified community members',
              icon: <Users className="w-6 h-6 text-blue-900" />,
              bg: 'bg-blue-50/80 hover:bg-blue-100/90 border-blue-200',
              page: 'members' as const,
            },
            {
              title: 'Current Management',
              desc: 'Governing body & executive office bearers',
              icon: <Award className="w-6 h-6 text-amber-700" />,
              bg: 'bg-amber-50/80 hover:bg-amber-100/90 border-amber-200',
              page: 'management' as const,
            },
            {
              title: 'Social Work',
              desc: 'Education, health & charitable initiatives',
              icon: <HeartHandshake className="w-6 h-6 text-emerald-700" />,
              bg: 'bg-emerald-50/80 hover:bg-emerald-100/90 border-emerald-200',
              page: 'social_work' as const,
            },
            {
              title: 'Announcements',
              desc: 'Notices, circulars & scholarship updates',
              icon: <Bell className="w-6 h-6 text-indigo-700" />,
              bg: 'bg-indigo-50/80 hover:bg-indigo-100/90 border-indigo-200',
              page: 'announcements' as const,
            },
          ].map((card, idx) => (
            <div
              key={idx}
              onClick={() => {
                setActivePage(card.page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`${card.bg} border rounded-2xl p-5 shadow-xs hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group`}
            >
              <div className="p-3 bg-white rounded-xl shadow-2xs w-fit mb-3 group-hover:scale-110 transition-transform">
                {card.icon}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base sm:text-lg mb-1 flex items-center justify-between">
                  <span>{card.title}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{card.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Our Impact Statistics */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden border border-slate-800">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Measurable Community Impact
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Dedicated to Selfless Service
            </h2>
            <p className="text-sm text-slate-300">
              Transparent, accountable, and impactful initiatives reaching thousands of individuals across decades.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {statistics.map((stat) => (
              <div
                key={stat.id}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xs flex flex-col justify-between"
              >
                <div className="text-3xl sm:text-5xl font-black text-amber-400 tracking-tight mb-2">
                  {stat.value.toLocaleString('en-IN')}{stat.suffix}
                </div>
                <div className="font-bold text-white text-sm sm:text-base mb-1">{stat.label}</div>
                <div className="text-xs text-slate-400 leading-tight">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Latest Announcements Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Official Notices</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Latest Announcements</h2>
          </div>
          <button
            onClick={() => {
              setActivePage('announcements');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-1.5 text-sm font-bold text-blue-900 hover:text-blue-700 transition-colors"
          >
            <span>View All Announcements</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {latestAnnouncements.map((ann) => (
            <div
              key={ann.id}
              onClick={() => {
                setSelectedEntityId(ann.id);
                setActivePage('announcements');
              }}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">{ann.publish_date}</span>
                  {ann.important && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded text-[10px] uppercase">
                      Important
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-900 transition-colors line-clamp-2">
                  {ann.title}
                </h3>
                <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                  {ann.content}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-900">
                <span>Read Full Announcement</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Featured Social Work Initiatives */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Selfless Service</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Featured Social Work Programs</h2>
          </div>
          <button
            onClick={() => {
              setActivePage('social_work');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:text-emerald-600 transition-colors"
          >
            <span>Explore All Initiatives</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredSocialWork.map((sw) => (
            <div
              key={sw.id}
              onClick={() => {
                setSelectedEntityId(sw.id);
                setActivePage('social_work');
              }}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col group"
            >
              <div className="relative h-48 bg-slate-100 overflow-hidden">
                <img
                  src={sw.photos[0] || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800'}
                  alt={sw.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 bg-emerald-800/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-full uppercase backdrop-blur-xs">
                  {sw.category_name}
                </span>
                <span className="absolute bottom-3 right-3 bg-slate-900/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded backdrop-blur-xs">
                  {sw.type}
                </span>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg group-hover:text-emerald-700 transition-colors line-clamp-2">
                    {sw.title}
                  </h3>
                  <p className="text-sm text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                    {sw.description}
                  </p>
                </div>

                {sw.beneficiaries_count && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 p-2.5 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Benefited: {sw.beneficiaries_count.toLocaleString('en-IN')}+ Citizens</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Current Management Committee Showcase */}
      <section className="bg-slate-50 py-12 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Governance & Leadership</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Current Management</h2>
            </div>
            <button
              onClick={() => {
                setActivePage('management');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-1.5 text-sm font-bold text-blue-900 hover:text-blue-700 transition-colors"
            >
              <span>View Full Committee</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {managementPreview.map((m) => (
              <div
                key={m.id}
                onClick={() => {
                  setSelectedEntityId(m.id);
                  setActivePage('management');
                }}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col items-center text-center group"
              >
                <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-amber-400/80 group-hover:scale-105 transition-transform">
                  <img
                    src={m.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=600'}
                    alt={m.display_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full mb-1.5">
                  {m.management_post || 'Office Bearer'}
                </span>
                <h3 className="font-bold text-slate-900 text-base">{m.display_name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">{m.designation}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Gallery Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800">Visual Archives</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Gallery Highlights</h2>
          </div>
          <button
            onClick={() => {
              setActivePage('gallery');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-1.5 text-sm font-bold text-blue-900 hover:text-blue-700 transition-colors"
          >
            <span>Explore All Media Albums</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {galleryHighlights.map((item, idx) => (
            <div
              key={idx}
              onClick={() => openLightbox(galleryHighlights, idx)}
              className="relative h-56 rounded-2xl overflow-hidden bg-slate-900 group cursor-pointer shadow-xs hover:shadow-lg transition-all"
            >
              <img
                src={item.url}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 opacity-90 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 text-white">
                <span className="text-xs font-semibold text-amber-300">{item.title}</span>
                <p className="text-[11px] text-slate-200 line-clamp-1 mt-0.5">{item.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Direct WhatsApp & Community Support Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Have Questions or Wish to Join as a Volunteer?
            </h3>
            <p className="text-sm text-emerald-100 max-w-xl">
              Connect directly with our community helpdesk on WhatsApp for quick inquiries about membership, scholarship forms, or emergency blood assistance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {settings.show_whatsapp && settings.whatsapp_number && (
              <a
                href={`https://wa.me/${settings.whatsapp_number.replace(/\+/g, '')}?text=Namaste!%20I%20would%20like%20to%20reach%20out%20to%20ASRGH%20Community%20office.`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 bg-white text-emerald-900 hover:bg-emerald-50 font-bold rounded-xl text-sm shadow-md transition-colors flex items-center gap-2"
              >
                <MessageSquare className="w-5 h-5 text-emerald-700" />
                <span>Message on WhatsApp</span>
              </a>
            )}

            <button
              onClick={() => {
                setActivePage('contact');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-6 py-3.5 bg-emerald-950/60 hover:bg-emerald-950 text-white font-bold rounded-xl text-sm border border-emerald-500/30 transition-colors"
            >
              Submit Contact Form
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
