import React, { useState } from 'react';
import { Award, Phone, Mail, MapPin, Sparkles, X, ChevronRight, Quote } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Member } from '../types';

export const ManagementPage: React.FC = () => {
  const { publicMembers, setSelectedEntityId, setActivePage } = useApp();

  const [activeModalMember, setActiveModalMember] = useState<Member | null>(null);

  // Extract management members sorted by display_order
  const managementMembers = publicMembers
    .filter((m) => m.status === 'active' && m.current_management)
    .sort((a, b) => a.display_order - b.display_order);

  // President / Chief Patron leader
  const president = managementMembers.find(
    (m) =>
      m.management_post?.toLowerCase().includes('president') ||
      m.management_post?.toLowerCase().includes('adhyaksh')
  ) || managementMembers[0];

  const executiveTeam = managementMembers.filter((m) => m.id !== president?.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-16">
      {/* 1. Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold uppercase tracking-wider">
          <Award className="w-3.5 h-3.5" />
          <span>Governance & Executive Body</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Current Management Committee
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          Elected trustees, executive office bearers, and committee patrons steering the organization with transparency, democratic ethos, and devotion.
        </p>
      </div>

      {/* 2. President's Desk / Executive Message Card */}
      {president && (
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-4 flex flex-col items-center text-center">
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-3xl overflow-hidden border-4 border-amber-400/80 shadow-2xl mb-4">
                <img
                  src={
                    president.photo_url ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600'
                  }
                  alt={president.display_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-500/30">
                {president.management_post || 'President'}
              </span>
              <h3 className="text-xl font-bold text-white mt-2">{president.display_name}</h3>
              <p className="text-xs text-slate-400">{president.designation}</p>
            </div>

            <div className="md:col-span-8 space-y-4 text-left border-t md:border-t-0 md:border-l border-slate-800 pt-6 md:pt-0 md:pl-8">
              <Quote className="w-10 h-10 text-amber-400/30 mb-2" />
              <h4 className="text-xl font-bold text-white">
                "Together in Service, United in Progress"
              </h4>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {president.bio ||
                  'Our goal is to reach the underprivileged segments of our community, ensure no talented student drops out due to lack of funds, and establish high-quality healthcare access for every family.'}
              </p>

              <div className="pt-3 flex flex-wrap items-center gap-3 text-xs">
                {president.show_phone && president.phone && (
                  <a
                    href={`tel:${president.phone}`}
                    className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-slate-200 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    <span>{president.phone}</span>
                  </a>
                )}
                {president.show_email && president.email && (
                  <a
                    href={`mailto:${president.email}`}
                    className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-slate-200 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-amber-400" />
                    <span>{president.email}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Executive Committee Grid */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Office Bearers & Trustees</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Executive Committee</h2>
          <p className="text-sm text-slate-600">Managing day-to-day operations and social programs.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {executiveTeam.map((m) => (
            <div
              key={m.id}
              onClick={() => setActiveModalMember(m)}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col items-center text-center group justify-between"
            >
              <div className="w-full flex flex-col items-center">
                <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-amber-400/80 shadow-xs mb-4 group-hover:scale-105 transition-transform">
                  <img
                    src={
                      m.photo_url ||
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=600'
                    }
                    alt={m.display_name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <span className="text-xs font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-full mb-2">
                  {m.management_post || 'Committee Member'}
                </span>

                <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-900 transition-colors">
                  {m.display_name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{m.designation}</p>

                {m.native_place && (
                  <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{m.native_place}</span>
                  </p>
                )}
              </div>

              <div className="w-full pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-900">
                <span>View Full Profile</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Member Profile Modal */}
      {activeModalMember && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-amber-400 shrink-0">
                  <img
                    src={
                      activeModalMember.photo_url ||
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=600'
                    }
                    alt={activeModalMember.display_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{activeModalMember.display_name}</h3>
                  <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    {activeModalMember.management_post}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveModalMember(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              {activeModalMember.bio && (
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-500 mb-1">Office Bearer Bio</h4>
                  <p className="text-slate-700 leading-relaxed">{activeModalMember.bio}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl text-xs">
                <div>
                  <span className="text-slate-500 block">Registration Code:</span>
                  <span className="font-bold text-slate-800">{activeModalMember.member_code}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Category:</span>
                  <span className="font-bold text-slate-800">{activeModalMember.category}</span>
                </div>
                {activeModalMember.city && (
                  <div>
                    <span className="text-slate-500 block">City:</span>
                    <span className="font-bold text-slate-800">{activeModalMember.city}</span>
                  </div>
                )}
                {activeModalMember.native_place && (
                  <div>
                    <span className="text-slate-500 block">Native Place:</span>
                    <span className="font-bold text-slate-800">{activeModalMember.native_place}</span>
                  </div>
                )}
              </div>

              {/* Public Contact */}
              <div className="pt-2">
                <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Direct Contact</h4>
                <div className="flex flex-wrap gap-3">
                  {activeModalMember.show_phone && activeModalMember.phone ? (
                    <a
                      href={`tel:${activeModalMember.phone}`}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{activeModalMember.phone}</span>
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Contact details are managed privately</span>
                  )}
                  {activeModalMember.show_email && activeModalMember.email ? (
                    <a
                      href={`mailto:${activeModalMember.email}`}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-800 rounded-lg text-xs font-semibold"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{activeModalMember.email}</span>
                    </a>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setActiveModalMember(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
