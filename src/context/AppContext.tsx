// src/context/AppContext.tsx

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { ApiError } from '../api/client';
import {
  clearAdminSession,
  getCurrentAdmin,
  hasAdminToken,
  loginAdmin,
  AuthUser,
} from '../api/auth';
import {
  archiveAdminMember,
  createAdminMember,
  deleteAdminMember,
  fetchAdminMembers,
  updateAdminMember,
} from '../api/members';
import {
  Member,
  Event,
  SocialWorkCategory,
  SocialWorkActivity,
  Announcement,
  Milestone,
  Achievement,
  OrganizationSettings,
  SocialLink,
  StatisticItem,
  ContactSubmission,
  NotificationRecord,
  AuditLog,
  RejectedRecord,
  ImportBatch,
  Employee,
  Role,
  TextScale,
  AppLanguage,
  EventPhoto,
} from '../types';
import {
  INITIAL_SETTINGS,
  INITIAL_SOCIAL_LINKS,
  INITIAL_MEMBERS,
  INITIAL_SOCIAL_WORK_CATEGORIES,
  INITIAL_SOCIAL_WORK_ACTIVITIES,
  INITIAL_EVENTS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_MILESTONES,
  INITIAL_ACHIEVEMENTS,
  INITIAL_STATISTICS,
  INITIAL_ROLES,
  INITIAL_EMPLOYEES,
  INITIAL_CONTACT_SUBMISSIONS,
  INITIAL_AUDIT_LOGS,
} from '../data/initialData';
import {
  archiveAdminEvent,
  createAdminEvent,
  fetchAdminEvents,
  updateAdminEvent,
} from '../api/events';
import {
  readNavigationState,
  serializeNavigationState,
} from '../utils/navigation';
import type { NavigationState } from '../utils/navigation';
import type { ActivePage } from '../utils/navigation';

export type { ActivePage } from '../utils/navigation';

interface LightboxState {
  photos: { url: string; caption?: string; title?: string }[];
  currentIndex: number;
  isOpen: boolean;
}

interface AppContextType {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  selectedEntityId: string | null;
  setSelectedEntityId: (id: string | null) => void;
  textSize: TextScale;
  setTextSize: (size: TextScale) => void;
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  lightbox: LightboxState;
  openLightbox: (
    photos: { url: string; caption?: string; title?: string }[],
    index?: number,
  ) => void;
  closeLightbox: () => void;

  settings: OrganizationSettings;
  updateSettings: (newSettings: Partial<OrganizationSettings>) => void;
  socialLinks: SocialLink[];
  updateSocialLinks: (links: SocialLink[]) => void;
  statistics: StatisticItem[];
  updateStatistic: (
    id: string,
    overrideValue: number,
    isOverridden: boolean,
  ) => void;

  members: Member[];
  addMember: (member: Member) => Promise<void>;
  updateMember: (id: string, member: Partial<Member>) => Promise<void>;
  archiveMember: (id: string) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  bulkAddMembers: (newMembers: Member[]) => void;

  events: Event[];
  addEvent: (event: Event) => Promise<void>;
  updateEvent: (id: string, event: Partial<Event>) => Promise<void>;
  archiveEvent: (id: string) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  bulkAddEvents: (newEvents: Event[]) => void;
  addEventPhoto: (eventId: string, photo: EventPhoto) => void;
  addEventPhotos: (eventId: string, photos: EventPhoto[]) => void;

  socialWorkCategories: SocialWorkCategory[];
  socialWorkActivities: SocialWorkActivity[];
  addSocialWorkActivity: (act: SocialWorkActivity) => void;
  updateSocialWorkActivity: (
    id: string,
    act: Partial<SocialWorkActivity>,
  ) => void;
  archiveSocialWorkActivity: (id: string) => void;
  deleteSocialWorkActivity: (id: string) => void;

  announcements: Announcement[];
  addAnnouncement: (ann: Announcement) => void;
  updateAnnouncement: (id: string, ann: Partial<Announcement>) => void;
  archiveAnnouncement: (id: string) => void;
  deleteAnnouncement: (id: string) => void;
  bulkAddAnnouncements: (anns: Announcement[]) => void;

  milestones: Milestone[];
  achievements: Achievement[];
  addMilestone: (m: Milestone) => void;
  addAchievement: (a: Achievement) => void;

  contactSubmissions: ContactSubmission[];
  addContactSubmission: (
    sub: Omit<
      ContactSubmission,
      'id' | 'submission_code' | 'created_at' | 'status'
    >,
  ) => void;
  updateContactStatus: (
    id: string,
    status: ContactSubmission['status'],
    assignedTo?: string,
    notes?: string,
  ) => void;

  notifications: NotificationRecord[];
  sendNotification: (
    notif: Omit<
      NotificationRecord,
      'id' | 'sent_at' | 'sender_name' | 'targeted_devices'
    >,
  ) => void;

  auditLogs: AuditLog[];
  addAuditLog: (
    action: string,
    module: string,
    details: string,
    entityId?: string,
  ) => void;

  rejectedRecords: RejectedRecord[];
  addRejectedRecords: (records: RejectedRecord[]) => void;
  resolveRejectedRecord: (id: string) => void;

  importBatches: ImportBatch[];
  addImportBatch: (batch: ImportBatch) => void;

  isAuthenticated: boolean;
  authLoading: boolean;
  loginAdminUser: (email: string, password: string) => Promise<void>;
  logoutAdminUser: () => void;
  refreshMembersFromApi: () => Promise<void>;
  refreshEventsFromApi: () => Promise<void>;
  isAdminPortalOpen: boolean;
  setIsAdminPortalOpen: (open: boolean) => void;
  currentUser: Employee;
  setCurrentUser: (emp: Employee) => void;
  employees: Employee[];
  roles: Role[];
  activeAdminTab: string;
  setActiveAdminTab: (tab: string) => void;
  resetAllDataToDefault: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_PREFIX = 'asrgh_community_v1_';

function loadStored<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
}

function saveStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error('Local storage save error', e);
  }
}

function mapAuthUserToEmployee(
  user: AuthUser,
  fallback: Employee,
): Employee {
  return {
    ...fallback,
    id: user.id,
    employee_code: 'ADMIN',
    full_name: user.displayName,
    email: user.email,
    role_id: 'super-admin',
    role_name: 'Super Admin',
    status: 'active',
    last_login_at: user.lastLoginAt ?? undefined,
  };
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [initialNavigation] = useState<NavigationState>(() =>
    readNavigationState(),
  );
  const navigationRef = useRef<NavigationState>(initialNavigation);
  const navigationWriteScheduledRef = useRef(false);

  const [activePage, setActivePageState] = useState<ActivePage>(
    initialNavigation.activePage,
  );
  const [selectedEntityId, setSelectedEntityIdState] = useState<string | null>(
    initialNavigation.selectedEntityId,
  );
  const [textSize, setTextSize] = useState<TextScale>(() =>
    loadStored('text_size', 'normal'),
  );
  const [language, setLanguage] = useState<AppLanguage>('en');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAdminPortalOpen, setIsAdminPortalOpenState] = useState(
    initialNavigation.isAdminPortalOpen,
  );
  const [activeAdminTab, setActiveAdminTabState] = useState(
    initialNavigation.activeAdminTab,
  );

  const syncNavigationToUrl = useCallback(() => {
    if (navigationWriteScheduledRef.current) {
      return;
    }

    navigationWriteScheduledRef.current = true;

    queueMicrotask(() => {
      navigationWriteScheduledRef.current = false;

      const hash = serializeNavigationState(navigationRef.current);
      const currentUrl =
        window.location.pathname +
        window.location.search +
        window.location.hash;
      const nextUrl =
        window.location.pathname +
        window.location.search +
        hash;

      if (currentUrl === nextUrl) {
        return;
      }

      window.history.pushState(null, '', nextUrl);
    });
  }, []);

  const setActivePage = useCallback(
    (page: ActivePage) => {
      navigationRef.current = {
        ...navigationRef.current,
        activePage: page,
      };
      setActivePageState(page);
      syncNavigationToUrl();
    },
    [syncNavigationToUrl],
  );

  const setSelectedEntityId = useCallback(
    (id: string | null) => {
      navigationRef.current = {
        ...navigationRef.current,
        selectedEntityId: id,
      };
      setSelectedEntityIdState(id);
      syncNavigationToUrl();
    },
    [syncNavigationToUrl],
  );

  const setIsAdminPortalOpen = useCallback(
    (open: boolean) => {
      navigationRef.current = {
        ...navigationRef.current,
        isAdminPortalOpen: open,
      };
      setIsAdminPortalOpenState(open);
      syncNavigationToUrl();
    },
    [syncNavigationToUrl],
  );

  const setActiveAdminTab = useCallback(
    (tab: string) => {
      const normalizedTab = tab.trim() || 'dashboard';

      navigationRef.current = {
        ...navigationRef.current,
        activeAdminTab: normalizedTab,
      };
      setActiveAdminTabState(normalizedTab);
      syncNavigationToUrl();
    },
    [syncNavigationToUrl],
  );

  useEffect(() => {
    const restoreNavigation = () => {
      const next = readNavigationState();

      navigationRef.current = next;
      setActivePageState(next.activePage);
      setSelectedEntityIdState(next.selectedEntityId);
      setIsAdminPortalOpenState(next.isAdminPortalOpen);
      setActiveAdminTabState(next.activeAdminTab);
    };

    window.addEventListener('popstate', restoreNavigation);
    window.addEventListener('hashchange', restoreNavigation);

    return () => {
      window.removeEventListener('popstate', restoreNavigation);
      window.removeEventListener('hashchange', restoreNavigation);
    };
  }, []);

  const [lightbox, setLightbox] = useState<LightboxState>({
    photos: [],
    currentIndex: 0,
    isOpen: false,
  });

  const [settings, setSettings] = useState<OrganizationSettings>(() =>
    loadStored('settings', INITIAL_SETTINGS),
  );
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(() =>
    loadStored('social_links', INITIAL_SOCIAL_LINKS),
  );
  const [statistics, setStatistics] = useState<StatisticItem[]>(() =>
    loadStored('statistics', INITIAL_STATISTICS),
  );
  const [members, setMembers] = useState<Member[]>(() =>
    loadStored('members', INITIAL_MEMBERS),
  );
  const [socialWorkCategories, setSocialWorkCategories] = useState<
    SocialWorkCategory[]
  >(() => loadStored('sw_categories', INITIAL_SOCIAL_WORK_CATEGORIES));
  const [socialWorkActivities, setSocialWorkActivities] = useState<
    SocialWorkActivity[]
  >(() => loadStored('sw_activities', INITIAL_SOCIAL_WORK_ACTIVITIES));
  const [events, setEvents] = useState<Event[]>(() =>
    loadStored('events', INITIAL_EVENTS),
  );
  const [announcements, setAnnouncements] = useState<Announcement[]>(() =>
    loadStored('announcements', INITIAL_ANNOUNCEMENTS),
  );
  const [milestones, setMilestones] = useState<Milestone[]>(() =>
    loadStored('milestones', INITIAL_MILESTONES),
  );
  const [achievements, setAchievements] = useState<Achievement[]>(() =>
    loadStored('achievements', INITIAL_ACHIEVEMENTS),
  );
  const [contactSubmissions, setContactSubmissions] = useState<
    ContactSubmission[]
  >(() => loadStored('contacts', INITIAL_CONTACT_SUBMISSIONS));
  const [notifications, setNotifications] = useState<NotificationRecord[]>(
    () => loadStored('notifications', []),
  );
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() =>
    loadStored('audit_logs', INITIAL_AUDIT_LOGS),
  );

  const UAT_REJECTED_RECORDS: RejectedRecord[] = [
    {
      id: 'rej-uat-001',
      batch_id: 'BATCH-MEM-2026-004',
      module: 'members',
      row_number: 7,
      record_reference: 'MEM-0016',
      raw_data: {
        'Member Code': 'MEM-0016',
        'First Name': '',
        'Last Name': 'Mehta',
        'Member Category': 'Life Member',
      },
      error_message: 'Missing required field: First Name.',
      suggested_fix:
        'Enter the member first name and upload the corrected file.',
      rejected_at: '2026-08-12 11:24',
      status: 'rejected',
    },
    {
      id: 'rej-uat-002',
      batch_id: 'BATCH-MEM-2026-004',
      module: 'members',
      row_number: 11,
      record_reference: 'MEM-0003',
      raw_data: {
        'Member Code': 'MEM-0003',
        'First Name': 'Priya',
        'Last Name': 'Gupta',
      },
      error_message: 'Duplicate Member Code already exists.',
      suggested_fix: 'Use a new unique Member Code.',
      rejected_at: '2026-08-12 11:24',
      status: 'rejected',
    },
    {
      id: 'rej-uat-003',
      batch_id: 'BATCH-EVT-2026-002',
      module: 'events',
      row_number: 5,
      record_reference: 'EVT-2026-009',
      raw_data: {
        'Event Code': 'EVT-2026-009',
        'Event Title': 'Medical Camp',
        'Event Date': 'not-a-date',
      },
      error_message: 'Event Date is not a valid date.',
      suggested_fix: 'Use YYYY-MM-DD format.',
      rejected_at: '2026-08-10 15:05',
      status: 'rejected',
    },
  ];

  const [rejectedRecords, setRejectedRecords] = useState<
    RejectedRecord[]
  >(() => loadStored('rejected_records', UAT_REJECTED_RECORDS));

  const UAT_IMPORT_BATCHES: ImportBatch[] = [
    {
      id: 'batch-uat-001',
      batch_code: 'BATCH-MEM-2026-004',
      module_name: 'Members',
      file_name: 'members_august_2026.xlsx',
      total_rows: 14,
      passed_rows: 12,
      failed_rows: 2,
      warning_rows: 1,
      uploaded_by: 'Anil Bansal',
      uploaded_at: '2026-08-12 11:24',
      status: 'completed',
    },
    {
      id: 'batch-uat-002',
      batch_code: 'BATCH-EVT-2026-002',
      module_name: 'Events',
      file_name: 'events_august_2026.xlsx',
      total_rows: 8,
      passed_rows: 7,
      failed_rows: 1,
      warning_rows: 0,
      uploaded_by: 'Anil Bansal',
      uploaded_at: '2026-08-10 15:05',
      status: 'completed',
    },
  ];

  const [importBatches, setImportBatches] = useState<ImportBatch[]>(() =>
    loadStored('import_batches', UAT_IMPORT_BATCHES),
  );

  const [roles] = useState<Role[]>(() =>
    loadStored('roles', INITIAL_ROLES),
  );
  const [employees] = useState<Employee[]>(() =>
    loadStored('employees', INITIAL_EMPLOYEES),
  );
  const [currentUser, setCurrentUser] = useState<Employee>(employees[0]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const refreshMembersFromApi = async () => {
    const remoteMembers = await fetchAdminMembers();
    setMembers(remoteMembers);
  };

  const refreshEventsFromApi = async () => {
    const remoteEvents = await fetchAdminEvents();
    setEvents(remoteEvents);
  };

  const loginAdminUser = async (email: string, password: string) => {
    setAuthLoading(true);

    try {
      const user = await loginAdmin(email, password);
      setCurrentUser(mapAuthUserToEmployee(user, employees[0]));
      setIsAuthenticated(true);

      await Promise.all([
        refreshMembersFromApi(),
        refreshEventsFromApi(),
      ]);
    } finally {
      setAuthLoading(false);
    }
  };

  const logoutAdminUser = () => {
    clearAdminSession();
    setIsAuthenticated(false);
    setCurrentUser(employees[0]);
    setIsAdminPortalOpen(false);
  };

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      if (!hasAdminToken()) {
        setAuthLoading(false);
        return;
      }

      try {
        const user = await getCurrentAdmin();

        if (cancelled) return;

        setCurrentUser(mapAuthUserToEmployee(user, employees[0]));
        setIsAuthenticated(true);

        try {
          await Promise.all([
            refreshMembersFromApi(),
            refreshEventsFromApi(),
          ]);
        } catch (error) {
          console.error('Admin data restore failed:', error);
        }
      } catch (error) {
        if (cancelled) return;

        if (error instanceof ApiError && error.status === 401) {
          clearAdminSession();
          setIsAuthenticated(false);
        } else {
          console.error('Admin session restore failed:', error);
        }
      } finally {
        if (!cancelled) {
          setAuthLoading(false);
        }
      }
    };

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => saveStored('settings', settings), [settings]);
  useEffect(() => saveStored('social_links', socialLinks), [socialLinks]);
  useEffect(() => saveStored('statistics', statistics), [statistics]);
  useEffect(() => saveStored('members', members), [members]);
  useEffect(
    () => saveStored('sw_categories', socialWorkCategories),
    [socialWorkCategories],
  );
  useEffect(
    () => saveStored('sw_activities', socialWorkActivities),
    [socialWorkActivities],
  );
  useEffect(() => saveStored('events', events), [events]);
  useEffect(
    () => saveStored('announcements', announcements),
    [announcements],
  );
  useEffect(() => saveStored('milestones', milestones), [milestones]);
  useEffect(() => saveStored('achievements', achievements), [achievements]);
  useEffect(
    () => saveStored('contacts', contactSubmissions),
    [contactSubmissions],
  );
  useEffect(
    () => saveStored('notifications', notifications),
    [notifications],
  );
  useEffect(() => saveStored('audit_logs', auditLogs), [auditLogs]);
  useEffect(
    () => saveStored('rejected_records', rejectedRecords),
    [rejectedRecords],
  );
  useEffect(
    () => saveStored('import_batches', importBatches),
    [importBatches],
  );
  useEffect(() => saveStored('text_size', textSize), [textSize]);

  const openLightbox = (
    photos: { url: string; caption?: string; title?: string }[],
    index = 0,
  ) => {
    setLightbox({
      photos,
      currentIndex: Math.max(
        0,
        Math.min(index, photos.length - 1),
      ),
      isOpen: true,
    });
  };

  const closeLightbox = () => {
    setLightbox((prev) => ({ ...prev, isOpen: false }));
  };

  const addAuditLog = (
    action: string,
    module: string,
    details: string,
    entityId?: string,
  ) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 4)}`,
      actor_name: currentUser.full_name,
      actor_role: currentUser.role_name,
      action,
      module,
      entity_id: entityId,
      details,
      timestamp: new Date().toLocaleString(),
    };

    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const updateSettings = (
    newSettings: Partial<OrganizationSettings>,
  ) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    addAuditLog(
      'SETTINGS_UPDATE',
      'settings',
      'Updated organization settings and contact info',
    );
  };

  const updateSocialLinks = (links: SocialLink[]) => {
    setSocialLinks(links);
    addAuditLog(
      'SOCIAL_LINKS_UPDATE',
      'settings',
      'Updated social links configuration',
    );
  };

  const updateStatistic = (
    id: string,
    overrideValue: number,
    isOverridden: boolean,
  ) => {
    setStatistics((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              value: overrideValue,
              is_overridden: isOverridden,
            }
          : s,
      ),
    );

    addAuditLog(
      'STATISTIC_OVERRIDE',
      'statistics',
      `Updated statistics metric value to ${overrideValue}`,
    );
  };

  const addMember = async (member: Member) => {
    const saved = isAuthenticated
      ? await createAdminMember(member)
      : member;

    setMembers((prev) => [
      saved,
      ...prev.filter((m) => m.id !== member.id),
    ]);

    addAuditLog(
      'MEMBER_CREATE',
      'members',
      `Created member record: ${saved.display_name} (${saved.member_code})`,
      saved.id,
    );
  };

  const updateMember = async (
    id: string,
    updated: Partial<Member>,
  ) => {
    const saved = isAuthenticated
      ? await updateAdminMember(id, updated)
      : ({
          ...members.find((m) => m.id === id),
          ...updated,
        } as Member);

    setMembers((prev) =>
      prev.map((m) => (m.id === id ? saved : m)),
    );

    addAuditLog(
      'MEMBER_UPDATE',
      'members',
      `Updated member: ${saved.display_name || id}`,
      id,
    );
  };

  const archiveMember = async (id: string) => {
    const saved = isAuthenticated
      ? await archiveAdminMember(id)
      : ({
          ...members.find((m) => m.id === id),
          status: 'archived',
        } as Member);

    setMembers((prev) =>
      prev.map((m) => (m.id === id ? saved : m)),
    );

    addAuditLog(
      'MEMBER_ARCHIVE',
      'members',
      `Archived member record: ${id}`,
      id,
    );
  };

  const deleteMember = async (id: string) => {
    if (isAuthenticated) {
      await deleteAdminMember(id);
    }

    setMembers((prev) =>
      prev.filter((m) => m.id !== id),
    );

    addAuditLog(
      'MEMBER_DELETE',
      'members',
      `Deleted member record: ${id}`,
      id,
    );
  };

  const bulkAddMembers = (newMembers: Member[]) => {
    setMembers((prev) => [...newMembers, ...prev]);

    addAuditLog(
      'MEMBER_BULK_IMPORT',
      'members',
      `Imported ${newMembers.length} member records via Excel validation engine.`,
    );
  };

  const addEvent = async (event: Event) => {
    const saved = isAuthenticated
      ? await createAdminEvent(event)
      : event;

    setEvents((prev) => [
      saved,
      ...prev.filter((e) => e.id !== event.id),
    ]);

    addAuditLog(
      'EVENT_CREATE',
      'events',
      `Created event: ${saved.title} (${saved.event_code})`,
      saved.id,
    );
  };

  const updateEvent = async (
    id: string,
    updated: Partial<Event>,
  ) => {
    const saved = isAuthenticated
      ? await updateAdminEvent(id, updated)
      : ({
          ...events.find((e) => e.id === id),
          ...updated,
        } as Event);

    setEvents((prev) =>
      prev.map((e) => (e.id === id ? saved : e)),
    );

    addAuditLog(
      'EVENT_UPDATE',
      'events',
      `Updated event: ${saved.title || id}`,
      id,
    );
  };

  const archiveEvent = async (id: string) => {
    const saved = isAuthenticated
      ? await archiveAdminEvent(id)
      : ({
          ...events.find((e) => e.id === id),
          display_status: 'archived',
        } as Event);

    setEvents((prev) =>
      prev.map((e) => (e.id === id ? saved : e)),
    );

    addAuditLog(
      'EVENT_ARCHIVE',
      'events',
      `Archived event: ${id}`,
      id,
    );
  };

  const deleteEvent = async (id: string) => {
    setEvents((prev) =>
      prev.filter((e) => e.id !== id),
    );

    addAuditLog(
      'EVENT_DELETE',
      'events',
      `Removed event from current view: ${id}`,
      id,
    );
  };

  const bulkAddEvents = (newEvents: Event[]) => {
    setEvents((prev) => [...newEvents, ...prev]);

    addAuditLog(
      'EVENT_BULK_IMPORT',
      'events',
      `Imported ${newEvents.length} event records via Excel validation engine.`,
    );
  };

  const addEventPhoto = (
    eventId: string,
    photo: EventPhoto,
  ) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? {
              ...e,
              photos: [photo, ...(e.photos || [])],
            }
          : e,
      ),
    );

    addAuditLog(
      'EVENT_PHOTO_UPLOAD',
      'gallery',
      `Uploaded new photo to event: ${eventId}`,
      eventId,
    );
  };

  const addEventPhotos = (
    eventId: string,
    photos: EventPhoto[],
  ) => {
    if (!photos.length) return;

    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? {
              ...e,
              photos: [...photos, ...(e.photos || [])].map(
                (photo, index) => ({
                  ...photo,
                  display_order: index + 1,
                }),
              ),
            }
          : e,
      ),
    );

    addAuditLog(
      'EVENT_PHOTOS_UPLOAD',
      'gallery',
      `Uploaded ${photos.length} photo${
        photos.length === 1 ? '' : 's'
      } to event album: ${eventId}`,
      eventId,
    );
  };

  const addSocialWorkActivity = (
    act: SocialWorkActivity,
  ) => {
    setSocialWorkActivities((prev) => [act, ...prev]);

    addAuditLog(
      'SOCIAL_WORK_CREATE',
      'social_work',
      `Created activity: ${act.title} (${act.activity_code})`,
      act.id,
    );
  };

  const updateSocialWorkActivity = (
    id: string,
    updated: Partial<SocialWorkActivity>,
  ) => {
    setSocialWorkActivities((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, ...updated } : a,
      ),
    );

    addAuditLog(
      'SOCIAL_WORK_UPDATE',
      'social_work',
      `Updated activity: ${updated.title || id}`,
      id,
    );
  };

  const archiveSocialWorkActivity = (id: string) => {
    setSocialWorkActivities((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: 'archived' }
          : a,
      ),
    );

    addAuditLog(
      'SOCIAL_WORK_ARCHIVE',
      'social_work',
      `Archived activity: ${id}`,
      id,
    );
  };

  const deleteSocialWorkActivity = (id: string) => {
    setSocialWorkActivities((prev) =>
      prev.filter((a) => a.id !== id),
    );

    addAuditLog(
      'SOCIAL_WORK_DELETE',
      'social_work',
      `Deleted activity: ${id}`,
      id,
    );
  };

  const addAnnouncement = (ann: Announcement) => {
    setAnnouncements((prev) => [ann, ...prev]);

    addAuditLog(
      'ANNOUNCEMENT_CREATE',
      'announcements',
      `Created announcement: ${ann.title} (${ann.announcement_code})`,
      ann.id,
    );
  };

  const updateAnnouncement = (
    id: string,
    updated: Partial<Announcement>,
  ) => {
    setAnnouncements((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, ...updated } : a,
      ),
    );

    addAuditLog(
      'ANNOUNCEMENT_UPDATE',
      'announcements',
      `Updated announcement: ${updated.title || id}`,
      id,
    );
  };

  const archiveAnnouncement = (id: string) => {
    setAnnouncements((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: 'archived' }
          : a,
      ),
    );

    addAuditLog(
      'ANNOUNCEMENT_ARCHIVE',
      'announcements',
      `Archived announcement: ${id}`,
      id,
    );
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements((prev) =>
      prev.filter((a) => a.id !== id),
    );

    addAuditLog(
      'ANNOUNCEMENT_DELETE',
      'announcements',
      `Deleted announcement: ${id}`,
      id,
    );
  };

  const bulkAddAnnouncements = (
    anns: Announcement[],
  ) => {
    setAnnouncements((prev) => [...anns, ...prev]);

    addAuditLog(
      'ANNOUNCEMENT_BULK_IMPORT',
      'announcements',
      `Imported ${anns.length} announcements.`,
    );
  };

  const addMilestone = (m: Milestone) => {
    setMilestones((prev) => [m, ...prev]);

    addAuditLog(
      'MILESTONE_CREATE',
      'about',
      `Created milestone: ${m.title}`,
      m.id,
    );
  };

  const addAchievement = (a: Achievement) => {
    setAchievements((prev) => [a, ...prev]);

    addAuditLog(
      'ACHIEVEMENT_CREATE',
      'about',
      `Created achievement: ${a.title}`,
      a.id,
    );
  };

  const addContactSubmission = (
    sub: Omit<
      ContactSubmission,
      'id' | 'submission_code' | 'created_at' | 'status'
    >,
  ) => {
    const code = `CON-2026-${String(
      contactSubmissions.length + 1,
    ).padStart(3, '0')}`;

    const newSubmission: ContactSubmission = {
      ...sub,
      id: `con-${Date.now()}`,
      submission_code: code,
      status: 'new',
      created_at: new Date().toLocaleString(),
    };

    setContactSubmissions((prev) => [
      newSubmission,
      ...prev,
    ]);

    addAuditLog(
      'CONTACT_SUBMIT',
      'contact',
      `New public contact request submitted by ${sub.name}: "${sub.subject}"`,
      newSubmission.id,
    );
  };

  const updateContactStatus = (
    id: string,
    status: ContactSubmission['status'],
    assignedTo?: string,
    notes?: string,
  ) => {
    setContactSubmissions((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status,
              assigned_to_name:
                assignedTo || c.assigned_to_name,
              admin_notes:
                notes !== undefined
                  ? notes
                  : c.admin_notes,
              resolved_at:
                status === 'resolved' ||
                status === 'closed'
                  ? new Date().toLocaleString()
                  : c.resolved_at,
            }
          : c,
      ),
    );

    addAuditLog(
      'CONTACT_STATUS_UPDATE',
      'contact',
      `Updated contact #${id} status to ${status}`,
      id,
    );
  };

  const sendNotification = (
    notif: Omit<
      NotificationRecord,
      'id' | 'sent_at' | 'sender_name' | 'targeted_devices'
    >,
  ) => {
    const newNotif: NotificationRecord = {
      ...notif,
      id: `notif-${Date.now()}`,
      sender_name: currentUser.full_name,
      sent_at: new Date().toLocaleString(),
      targeted_devices: 2450,
    };

    setNotifications((prev) => [
      newNotif,
      ...prev,
    ]);

    addAuditLog(
      'NOTIFICATION_SENT',
      'notifications',
      `Broadcast push notification to 2,450 devices: "${notif.title}"`,
      newNotif.id,
    );
  };

  const addRejectedRecords = (
    records: RejectedRecord[],
  ) => {
    setRejectedRecords((prev) => [
      ...records,
      ...prev,
    ]);
  };

  const resolveRejectedRecord = (id: string) => {
    setRejectedRecords((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: 'resolved' }
          : r,
      ),
    );

    addAuditLog(
      'REJECTION_RESOLVED',
      'imports',
      `Marked rejected record #${id} as resolved.`,
      id,
    );
  };

  const addImportBatch = (batch: ImportBatch) => {
    setImportBatches((prev) => [
      batch,
      ...prev,
    ]);
  };

  const resetAllDataToDefault = () => {
    setSettings(INITIAL_SETTINGS);
    setSocialLinks(INITIAL_SOCIAL_LINKS);
    setStatistics(INITIAL_STATISTICS);
    setMembers(INITIAL_MEMBERS);
    setSocialWorkCategories(
      INITIAL_SOCIAL_WORK_CATEGORIES,
    );
    setSocialWorkActivities(
      INITIAL_SOCIAL_WORK_ACTIVITIES,
    );
    setEvents(INITIAL_EVENTS);
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
    setMilestones(INITIAL_MILESTONES);
    setAchievements(INITIAL_ACHIEVEMENTS);
    setContactSubmissions(
      INITIAL_CONTACT_SUBMISSIONS,
    );
    setNotifications([]);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setRejectedRecords([]);
    setImportBatches([]);
    localStorage.clear();
  };

  return (
    <AppContext.Provider
      value={{
        activePage,
        setActivePage,
        selectedEntityId,
        setSelectedEntityId,
        textSize,
        setTextSize,
        language,
        setLanguage,
        isSearchOpen,
        setIsSearchOpen,
        lightbox,
        openLightbox,
        closeLightbox,

        settings,
        updateSettings,
        socialLinks,
        updateSocialLinks,
        statistics,
        updateStatistic,

        members,
        addMember,
        updateMember,
        archiveMember,
        deleteMember,
        bulkAddMembers,

        events,
        addEvent,
        updateEvent,
        archiveEvent,
        deleteEvent,
        bulkAddEvents,
        addEventPhoto,
        addEventPhotos,

        socialWorkCategories,
        socialWorkActivities,
        addSocialWorkActivity,
        updateSocialWorkActivity,
        archiveSocialWorkActivity,
        deleteSocialWorkActivity,

        announcements,
        addAnnouncement,
        updateAnnouncement,
        archiveAnnouncement,
        deleteAnnouncement,
        bulkAddAnnouncements,

        milestones,
        achievements,
        addMilestone,
        addAchievement,

        contactSubmissions,
        addContactSubmission,
        updateContactStatus,

        notifications,
        sendNotification,

        auditLogs,
        addAuditLog,

        rejectedRecords,
        addRejectedRecords,
        resolveRejectedRecord,

        importBatches,
        addImportBatch,

        isAuthenticated,
        authLoading,
        loginAdminUser,
        logoutAdminUser,
        refreshMembersFromApi,
        refreshEventsFromApi,
        isAdminPortalOpen,
        setIsAdminPortalOpen,
        currentUser,
        setCurrentUser,
        employees,
        roles,
        activeAdminTab,
        setActiveAdminTab,
        resetAllDataToDefault,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error(
      'useApp must be used within an AppProvider',
    );
  }

  return context;
};