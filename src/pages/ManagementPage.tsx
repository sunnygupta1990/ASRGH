// ASRGH_V2_NODE/src/pages/ManagementPage.tsx

import React, { useMemo, useState } from 'react';
import {
  Award,
  CalendarDays,
  ChevronRight,
  Mail,
  MapPin,
  Phone,
  Quote,
  Users,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ManagementAssignment, Member } from '../types';

type ManagementTeamMember = {
  member: Member;
  assignment: ManagementAssignment;
};

type ManagementTeam = {
  id: string;
  name: string;
  startDate: string;
  endDate: string | null;
  status: string;
  assignments: ManagementTeamMember[];
};

function getAssignments(member: Member): ManagementAssignment[] {
  return Array.isArray(member.management_assignments)
    ? member.management_assignments
    : [];
}

function localToday(): string {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${today.getFullYear()}-${month}-${day}`;
}

function isTermCurrent(team: ManagementTeam, today: string): boolean {
  return team.startDate <= today && (!team.endDate || team.endDate >= today);
}

function isAssignmentCurrent(
  assignment: ManagementAssignment,
  today: string,
): boolean {
  return (
    assignment.term.start_date <= today &&
    (!assignment.term.end_date || assignment.term.end_date >= today) &&
    (!assignment.start_date || assignment.start_date <= today) &&
    (!assignment.end_date || assignment.end_date >= today)
  );
}

function formatDate(value: string | null | undefined): string {
  if (!value) {
    return 'Present';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function formatTeamDates(team: ManagementTeam): string {
  return `${formatDate(team.startDate)} – ${
    team.endDate ? formatDate(team.endDate) : 'Present'
  }`;
}

function isPresident(assignment: ManagementAssignment): boolean {
  const name = assignment.position.name.trim().toLowerCase();
  const code = assignment.position.code
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, '');
  return (
    name === 'president' ||
    name === 'adhyaksh' ||
    code === 'president' ||
    code === 'pres' ||
    code === 'adhyaksh'
  );
}

function sortTeamMembers(
  members: ManagementTeamMember[],
): ManagementTeamMember[] {
  return [...members].sort((a, b) => {
    const positionOrder =
      a.assignment.position.display_order -
      b.assignment.position.display_order;

    if (positionOrder !== 0) {
      return positionOrder;
    }

    const assignmentOrder =
      a.assignment.display_order - b.assignment.display_order;

    if (assignmentOrder !== 0) {
      return assignmentOrder;
    }

    return a.member.display_name.localeCompare(b.member.display_name);
  });
}

function uniqueTeamMembers(
  assignments: ManagementTeamMember[],
): ManagementTeamMember[] {
  const unique = new Map<string, ManagementTeamMember>();
  for (const item of sortTeamMembers(assignments)) {
    if (!unique.has(item.member.id)) unique.set(item.member.id, item);
  }
  return [...unique.values()];
}

function MemberCard({
  item,
  onOpen,
}: {
  item: ManagementTeamMember;
  onOpen: (item: ManagementTeamMember) => void;
}) {
  const { assignment, member } = item;
  const position = assignment.position.name || 'Committee Member';

  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-lg transition-all flex flex-col items-center text-center group"
    >
      <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-amber-400/80 shadow-xs mb-4 group-hover:scale-105 transition-transform">
        <img
          src={
            member.photo_url ||
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=600'
          }
          alt={member.display_name}
          className="w-full h-full object-cover"
        />
      </div>

      <span className="text-xs font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-full mb-2">
        {position}
      </span>

      <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-900 transition-colors">
        {member.display_name}
      </h3>

      <p className="text-xs text-slate-500 mt-0.5">
        {member.designation}
      </p>

      <div className="w-full pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-900">
        <span>View Full Profile</span>
        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  );
}

function TeamSection({
  team,
  members,
  previous,
  onOpen,
}: {
  team: ManagementTeam;
  members: ManagementTeamMember[];
  previous: boolean;
  onOpen: (item: ManagementTeamMember) => void;
}) {
  const sortedMembers = sortTeamMembers(members);

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
            {previous ? 'Previous Team' : 'Executive Committee'}
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {team.name}
            <span className="ml-2 text-lg sm:text-xl font-medium text-slate-500">
              ({formatTeamDates(team)})
            </span>
          </h2>

          {!previous && (
            <p className="text-sm text-slate-600 mt-1">
              Managing day-to-day operations and social programs.
            </p>
          )}
        </div>

        {previous && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
            <CalendarDays className="w-3.5 h-3.5" />
            Team Completed
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedMembers.map((item) => (
          <MemberCard
            key={`${team.id}-${item.member.id}`}
            item={item}
            onOpen={onOpen}
          />
        ))}
      </div>
    </section>
  );
}

export const ManagementPage: React.FC = () => {
  const { publicMembers } = useApp();

  const [activeModalMember, setActiveModalMember] =
    useState<ManagementTeamMember | null>(null);

  const teams = useMemo<ManagementTeam[]>(() => {
    const teamMap = new Map<string, ManagementTeam>();

    for (const member of publicMembers) {
      for (const assignment of getAssignments(member)) {
        const term = assignment.term;

        if (!term) {
          continue;
        }

        if (!teamMap.has(term.id)) {
          teamMap.set(term.id, {
            id: term.id,
            name: term.name,
            startDate: term.start_date,
            endDate: term.end_date ?? null,
            status: term.status,
            assignments: [],
          });
        }

        const team = teamMap.get(term.id);
        team?.assignments.push({ member, assignment });
      }
    }

    return [...teamMap.values()].sort(
      (a, b) =>
        new Date(b.startDate).getTime() -
        new Date(a.startDate).getTime(),
    );
  }, [publicMembers]);

  const today = localToday();

  const currentTeam =
    teams.find((team) => isTermCurrent(team, today)) ?? null;

  const previousTeams = teams.filter(
    (team) => team.endDate !== null && team.endDate < today,
  );

  const currentMembers = currentTeam
    ? uniqueTeamMembers(
        currentTeam.assignments.filter(({ assignment }) =>
          isAssignmentCurrent(assignment, today),
        ),
      )
    : [];

  const currentPresident =
    currentMembers.find(({ assignment }) => isPresident(assignment)) ??
    currentMembers[0];

  const currentExecutiveMembers = currentMembers.filter(
    ({ member }) => member.id !== currentPresident?.member.id,
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold uppercase tracking-wider">
          <Award className="w-3.5 h-3.5" />
          <span>Governance & Executive Body</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Current Management Committee
        </h1>

        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          Elected trustees, executive office bearers, and committee patrons
          steering the organization with transparency, democratic ethos, and
          devotion.
        </p>
      </div>

      {currentPresident && (
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-4 flex flex-col items-center text-center">
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-3xl overflow-hidden border-4 border-amber-400/80 shadow-2xl mb-4">
                <img
                  src={
                    currentPresident.member.photo_url ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600'
                  }
                  alt={currentPresident.member.display_name}
                  className="w-full h-full object-cover"
                />
              </div>

              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-500/30">
                {currentPresident.assignment.position.name}
              </span>

              <h3 className="text-xl font-bold text-white mt-2">
                {currentPresident.member.display_name}
              </h3>

              <p className="text-xs text-slate-400">
                {currentPresident.member.designation}
              </p>
            </div>

            <div className="md:col-span-8 space-y-4 text-left border-t md:border-t-0 md:border-l border-slate-800 pt-6 md:pt-0 md:pl-8">
              <Quote className="w-10 h-10 text-amber-400/30 mb-2" />

              <h4 className="text-xl font-bold text-white">
                "Together in Service, United in Progress"
              </h4>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {currentPresident.member.bio ||
                  'Our goal is to reach the underprivileged segments of our community, ensure no talented student drops out due to lack of funds, and establish high-quality healthcare access for every family.'}
              </p>

              <div className="pt-3 flex flex-wrap items-center gap-3 text-xs">
                {currentPresident.member.show_phone &&
                  currentPresident.member.phone && (
                    <a
                      href={`tel:${currentPresident.member.phone}`}
                      className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-slate-200 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-amber-400" />
                      <span>{currentPresident.member.phone}</span>
                    </a>
                  )}

                {currentPresident.member.show_email &&
                  currentPresident.member.email && (
                    <a
                      href={`mailto:${currentPresident.member.email}`}
                      className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-slate-200 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5 text-amber-400" />
                      <span>{currentPresident.member.email}</span>
                    </a>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}

      {currentTeam && (
        <TeamSection
          team={currentTeam}
          members={currentExecutiveMembers}
          previous={false}
          onOpen={setActiveModalMember}
        />
      )}

      {previousTeams.length > 0 && (
        <section className="space-y-10 border-t border-slate-200 pt-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Previous Teams
            </span>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Past Management Committees
            </h2>

            <p className="text-sm text-slate-600">
              Previous management committees are shown in chronological
              order, with every member listed under the team they served.
            </p>
          </div>

          <div className="space-y-12">
            {previousTeams.map((team) => (
              <TeamSection
                key={team.id}
                team={team}
                members={uniqueTeamMembers(team.assignments)}
                previous
                onOpen={setActiveModalMember}
              />
            ))}
          </div>
        </section>
      )}

      {activeModalMember && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
          onClick={() => setActiveModalMember(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-amber-400 shrink-0">
                  <img
                    src={
                      activeModalMember.member.photo_url ||
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=600'
                    }
                    alt={activeModalMember.member.display_name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {activeModalMember.member.display_name}
                  </h3>

                  <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    {activeModalMember.assignment.position.name}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveModalMember(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              {activeModalMember.member.bio && (
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-500 mb-1">
                    Office Bearer Bio
                  </h4>

                  <p className="text-slate-700 leading-relaxed">
                    {activeModalMember.member.bio}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl text-xs">
                <div>
                  <span className="text-slate-500 block">
                    Registration Code:
                  </span>

                  <span className="font-bold text-slate-800">
                    {activeModalMember.member.member_code}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block">Category:</span>

                  <span className="font-bold text-slate-800">
                    {activeModalMember.member.category}
                  </span>
                </div>

              {activeModalMember.member.city && (
                  <div>
                    <span className="text-slate-500 block">City:</span>

                    <span className="font-bold text-slate-800">
                      {activeModalMember.member.city}
                    </span>
                  </div>
                )}

              {activeModalMember.member.native_place && (
                  <div>
                    <span className="text-slate-500 block">
                      Native Place:
                    </span>

                    <span className="font-bold text-slate-800">
                      {activeModalMember.member.native_place}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">
                  Direct Contact
                </h4>

                <div className="flex flex-wrap gap-3">
                {activeModalMember.member.show_phone &&
                activeModalMember.member.phone ? (
                    <a
                    href={`tel:${activeModalMember.member.phone}`}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    <span>{activeModalMember.member.phone}</span>
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 italic">
                      Contact details are managed privately
                    </span>
                  )}

                {activeModalMember.member.show_email &&
                activeModalMember.member.email ? (
                    <a
                    href={`mailto:${activeModalMember.member.email}`}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-800 rounded-lg text-xs font-semibold"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    <span>{activeModalMember.member.email}</span>
                    </a>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
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
