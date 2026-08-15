import React from 'react';
import {
  Target,
  Eye,
  Heart,
  Calendar,
  Award,
  Sparkles,
  CheckCircle,
  Building,
  Users,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AboutPage: React.FC = () => {
  const { settings, milestones, achievements, openLightbox } = useApp();

  const sortedMilestones = [...milestones].sort((a, b) => a.display_order - b.display_order);
  const sortedAchievements = [...achievements].sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-16">
      {/* 1. Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Heritage & Philosophy</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          About {settings.organization_name}
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          Founded in 1998, our mission is to build an empowered, educated, and compassionate community through continuous social welfare, healthcare initiatives, and mutual brotherhood.
        </p>
      </div>

      {/* 2. Overview & Founding Information Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-800">
        <div className="lg:col-span-7 space-y-5">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            Our Foundation Story
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Rooted in Service, Driven by Purpose
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            The {settings.organization_name} was established by a collective of visionary community elders and philanthropists with the noble purpose of extending educational financial grants, healthcare assistance, and matrimonial networking.
          </p>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Over the past 28 years, the trust has grown into a cornerstone institution with thousands of registered members, a central Community Bhawan, a charitable diagnostic clinic, and scholarships touching over 50,000 lives.
          </p>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800">
            <div>
              <span className="block text-2xl sm:text-3xl font-black text-amber-400">1998</span>
              <span className="text-xs text-slate-400">Year Established</span>
            </div>
            <div>
              <span className="block text-2xl sm:text-3xl font-black text-amber-400">2,450+</span>
              <span className="text-xs text-slate-400">Active Members</span>
            </div>
            <div>
              <span className="block text-2xl sm:text-3xl font-black text-amber-400">100%</span>
              <span className="text-xs text-slate-400">Non-Profit Trust</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 relative rounded-2xl overflow-hidden shadow-2xl border border-slate-700 h-80 bg-slate-800">
          <img
            src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800"
            alt="Founding Assembly"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
            <span className="text-xs text-slate-200 font-medium">
              Community Assembly & Annual Felicitation Gathering
            </span>
          </div>
        </div>
      </div>

      {/* 3. Mission, Vision, & Core Objectives */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Mission */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-4">
          <div className="p-3 bg-blue-100 text-blue-900 rounded-xl w-fit">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Our Mission</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            To provide continuous, non-discriminatory social, financial, and healthcare assistance to community members in need, with special emphasis on youth higher education and elderly care.
          </p>
        </div>

        {/* Vision */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-4">
          <div className="p-3 bg-amber-100 text-amber-900 rounded-xl w-fit">
            <Eye className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Our Vision</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            A cohesive, progressive, and self-sustaining community where every deserving student has access to higher education, quality healthcare is guaranteed, and no family feels unsupported.
          </p>
        </div>

        {/* Objectives */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-4">
          <div className="p-3 bg-emerald-100 text-emerald-900 rounded-xl w-fit">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Key Objectives</h3>
          <ul className="space-y-2 text-xs text-slate-600">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Higher education scholarships & career guidance</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Free diagnostic health camps & eye surgeries</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Emergency medical and disaster relief funds</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Preserving cultural values and social brotherhood</span>
            </li>
          </ul>
        </div>
      </div>

      {/* 4. Historical Milestones Timeline */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-900">Journey Through Time</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Organizational Milestones</h2>
          <p className="text-sm text-slate-600">Key chapters in our decades of dedicated service.</p>
        </div>

        <div className="relative border-l-2 border-amber-300 ml-4 sm:ml-32 space-y-10 pl-6 sm:pl-8 py-2">
          {sortedMilestones.map((ms) => (
            <div key={ms.id} className="relative group">
              {/* Year Badge on the Left for larger screens */}
              <div className="hidden sm:block absolute -left-36 top-1 text-right w-24">
                <span className="text-lg font-black text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  {ms.year}
                </span>
              </div>

              {/* Marker Dot */}
              <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-amber-600 border-4 border-white shadow-xs group-hover:scale-125 transition-transform" />

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
                <span className="sm:hidden inline-block text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded mb-2">
                  {ms.year}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mb-1">{ms.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{ms.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Annual Achievements & Recognitions */}
      <div className="space-y-8 pt-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Honors & Accolades</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Key Achievements</h2>
          <p className="text-sm text-slate-600">Milestone accomplishments celebrated by the community.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sortedAchievements.map((ach) => (
            <div
              key={ach.id}
              className="bg-amber-50/50 rounded-2xl p-6 border border-amber-200/80 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="font-bold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-md">
                    Year {ach.year}
                  </span>
                  <Award className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2">{ach.title}</h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{ach.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
