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
  UserPermission,
  TextScale,
  AppLanguage,
  EventPhoto,
} from '../types';
import {
  archiveAdminEvent,
  createAdminEvent,
  deleteAdminEvent,
  fetchAdminEvents,
  updateAdminEvent,
} from '../api/events';
import { fetchPublicContent, submitPublicContact } from '../api/publicContent';
import {
  archiveAnnouncementApi,
  archiveSocialWorkActivityApi,
  createAnnouncementApi,
  createNotificationApi,
  createSocialWorkActivityApi,
  deleteAnnouncementApi,
  deleteSocialWorkActivityApi,
  fetchAdminPortalState,
  updateAnnouncementApi,
  updateContactApi,
  updateSocialWorkActivityApi,
  commitImportApi,
  resolveRejectedRecordApi,
  updateAdminUserApi,
  updateNotificationApi,
  deleteNotificationApi,
  createSocialWorkCategoryApi,
  updateSocialWorkCategoryApi,
  deleteSocialWorkCategoryApi,
  fetchDashboardApi,
  DashboardData,
  ImportCommitResult,
  updateSettingsBundleApi,
} from '../api/adminPortal';

import {
  readNavigationState,
  serializeNavigationState,
} from '../utils/navigation';
import type { NavigationState } from '../utils/navigation';
import type { ActivePage } from '../utils/navigation';

export type { ActivePage } from '../utils/navigation';

const EMPTY_SETTINGS: OrganizationSettings = {
  organization_name: '', tagline: '', legal_name: '', primary_email: '', primary_phone: '', whatsapp_number: '',
  address_line_1: '', address_line_2: '', city: '', state: '', postal_code: '', country: '', google_maps_url: '', office_hours: '',
  show_phone: false, show_email: false, show_whatsapp: false, show_address: false, show_office_hours: false, show_map: false,
};

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
  updateSettings: (newSettings: Partial<OrganizationSettings>) => Promise<void>;
  socialLinks: SocialLink[];
  updateSocialLinks: (links: SocialLink[]) => Promise<void>;
  statistics: StatisticItem[];
  dashboardData: DashboardData | null;
  updateStatistic: (
    id: string,
    overrideValue: number,
    isOverridden: boolean,
  ) => Promise<void>;

  members: Member[];
  publicMembers: Member[];
  addMember: (member: Member) => Promise<Member>;
  updateMember: (id: string, member: Partial<Member>) => Promise<void>;
  archiveMember: (id: string) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;

  events: Event[];
  publicEvents: Event[];
  publicContentError: string | null;
  addEvent: (event: Event) => Promise<void>;
  updateEvent: (id: string, event: Partial<Event>) => Promise<void>;
  archiveEvent: (id: string) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;

  socialWorkCategories: SocialWorkCategory[];
  addSocialWorkCategory: (category: Omit<SocialWorkCategory, 'id'>) => Promise<void>;
  updateSocialWorkCategory: (id: string, category: Partial<SocialWorkCategory>) => Promise<void>;
  deleteSocialWorkCategory: (id: string) => Promise<void>;
  socialWorkActivities: SocialWorkActivity[];
  addSocialWorkActivity: (act: SocialWorkActivity) => Promise<void>;
  updateSocialWorkActivity: (
    id: string,
    act: Partial<SocialWorkActivity>,
  ) => Promise<void>;
  archiveSocialWorkActivity: (id: string) => Promise<void>;
  deleteSocialWorkActivity: (id: string) => Promise<void>;

  announcements: Announcement[];
  addAnnouncement: (ann: Announcement) => Promise<void>;
  updateAnnouncement: (id: string, ann: Partial<Announcement>) => Promise<void>;
  archiveAnnouncement: (id: string) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;

  milestones: Milestone[];
  achievements: Achievement[];

  contactSubmissions: ContactSubmission[];
  addContactSubmission: (
    sub: Omit<
      ContactSubmission,
      'id' | 'submission_code' | 'created_at' | 'status'
    >,
  ) => Promise<string>;
  updateContactStatus: (
    id: string,
    status: ContactSubmission['status'],
    assignedTo?: string,
    notes?: string,
  ) => Promise<void>;

  notifications: NotificationRecord[];
  sendNotification: (
    notif: Omit<
      NotificationRecord,
      'id' | 'sent_at' | 'sender_name' | 'targeted_devices'
    >,
  ) => Promise<void>;
  updateNotification: (id: string, data: Partial<NotificationRecord>) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;

  auditLogs: AuditLog[];

  rejectedRecords: RejectedRecord[];
  resolveRejectedRecord: (id: string) => Promise<void>;

  importBatches: ImportBatch[];
  commitImport: (entityType: 'members' | 'events' | 'social_work' | 'announcements', filename: string, rows: Record<string, string>[]) => Promise<ImportCommitResult>;
  updateAdminUser: (id: string, data: { status?: string; roleIds?: string[] }) => Promise<void>;
  hasPermission: (permission: string) => boolean;

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
  fallback?: Employee,
): Employee {
  return {
    phone: '',
    designation: '',
    ...(fallback ?? {}),
    id: user.id,
    employee_code: user.employeeId ?? 'ADMIN',
    full_name: user.displayName,
    email: user.email,
    role_id: user.roleId ?? '',
    role_name: user.roleName ?? 'Admin',
    role_ids: user.roles?.map((role) => role.id) ?? (user.roleId ? [user.roleId] : []),
    permission_codes: user.permissions ?? [],
    is_system_role: user.isSystemRole === true,
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
  const [language, setLanguage] = useState<AppLanguage>(() => loadStored('language', 'en'));
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

  const [settings, setSettings] = useState<OrganizationSettings>(EMPTY_SETTINGS);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [statistics, setStatistics] = useState<StatisticItem[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [publicMembers, setPublicMembers] = useState<Member[]>([]);
  const [socialWorkCategories, setSocialWorkCategories] = useState<
    SocialWorkCategory[]
  >([]);
  const [socialWorkActivities, setSocialWorkActivities] = useState<
    SocialWorkActivity[]
  >([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [publicEvents, setPublicEvents] = useState<Event[]>([]);
  const [publicContentError, setPublicContentError] = useState<string | null>(
    null,
  );
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [contactSubmissions, setContactSubmissions] = useState<
    ContactSubmission[]
  >([]);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const [rejectedRecords, setRejectedRecords] = useState<RejectedRecord[]>([]);
  const [importBatches, setImportBatches] = useState<ImportBatch[]>([]);

  const [roles, setRoles] = useState<Role[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentUser, setCurrentUser] = useState<Employee>({ id: '', employee_code: '', full_name: '', email: '', phone: '', designation: '', role_id: '', role_name: '', status: 'active' });
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

  const refreshPublicContentFromApi = async () => {
    setPublicContentError(null);

    try {
      const { events: remoteEvents, members: remoteMembers, settings: publicSettings } =
        await fetchPublicContent();

      setPublicEvents(remoteEvents);
      setPublicMembers(remoteMembers);
      const organization = publicSettings.organization;
      const websiteSetting = publicSettings.websiteSetting;
      const uiState = websiteSetting?.customFields && typeof websiteSetting.customFields === 'object'
        ? ((websiteSetting.customFields as Record<string, unknown>).adminUiState as Record<string, unknown> | undefined)
        : undefined;
      const storedSettings = uiState?.settings as Partial<OrganizationSettings> | undefined;
      setSettings((previous) => ({
        ...previous,
        ...(storedSettings ?? {}),
        organization_name: typeof organization.name === 'string' ? organization.name : previous.organization_name,
        legal_name: typeof organization.legalName === 'string' ? organization.legalName : previous.legal_name,
        primary_email: typeof organization.email === 'string' ? organization.email : previous.primary_email,
        primary_phone: typeof organization.phone === 'string' ? organization.phone : previous.primary_phone,
      }));
    } catch (error) {
      setPublicContentError(
        error instanceof Error
          ? error.message
          : 'Unable to load public events and members.',
      );
      throw error;
    }
  };

  const refreshAdminPortalState = async () => {
    const state = await fetchAdminPortalState();
    const ui = state.adminUiState;

    if (ui.settings) {
      setSettings((prev) => ({ ...prev, ...ui.settings }));
    } else if (state.organization) {
      const organization = state.organization;
      setSettings((prev) => ({
        ...prev,
        organization_name:
          typeof organization.name === 'string'
            ? organization.name
            : prev.organization_name,
        legal_name:
          typeof organization.legalName === 'string'
            ? organization.legalName
            : prev.legal_name,
        primary_email:
          typeof organization.email === 'string'
            ? organization.email
            : prev.primary_email,
        primary_phone:
          typeof organization.phone === 'string'
            ? organization.phone
            : prev.primary_phone,
        address_line_1:
          typeof organization.addressLine1 === 'string'
            ? organization.addressLine1
            : prev.address_line_1,
        address_line_2:
          typeof organization.addressLine2 === 'string'
            ? organization.addressLine2
            : prev.address_line_2,
        city:
          typeof organization.city === 'string'
            ? organization.city
            : prev.city,
        state:
          typeof organization.state === 'string'
            ? organization.state
            : prev.state,
        postal_code:
          typeof organization.postalCode === 'string'
            ? organization.postalCode
            : prev.postal_code,
        country:
          typeof organization.country === 'string'
            ? organization.country
            : prev.country,
      }));
    }

    if (Array.isArray(ui.socialLinks)) {
      setSocialLinks(ui.socialLinks);
    }

    if (Array.isArray(ui.statistics)) {
      setStatistics(ui.statistics);
    }

    if (Array.isArray(ui.milestones)) {
      setMilestones(ui.milestones);
    }

    if (Array.isArray(ui.achievements)) {
      setAchievements(ui.achievements as Achievement[]);
    }

    setSocialWorkCategories(
      state.socialWorkCategories.map((category) => {
        const item = category as Record<string, unknown>;
        return {
          id: String(item.id),
          name: String(item.name ?? ''),
          description:
            typeof item.description === 'string'
              ? item.description
              : undefined,
          icon_name:
            typeof item.iconKey === 'string'
              ? item.iconKey
              : undefined,
          display_order:
            typeof item.displayOrder === 'number'
              ? item.displayOrder
              : 0,
          status: item.isActive === false ? 'archived' : 'active',
        };
      }),
    );

    setSocialWorkActivities(
      state.socialWorkActivities.map((activity) => {
        const item = activity as Record<string, unknown>;
        const category =
          item.category as Record<string, unknown> | null | undefined;
        const customFields =
          item.customFields as Record<string, unknown> | null | undefined;

        return {
          id: String(item.id),
          activity_code:
            typeof customFields?.activity_code === 'string'
              ? customFields.activity_code
              : String(item.slug ?? item.id),
          category_id:
            typeof item.categoryId === 'string' ? item.categoryId : '',
          category_name:
            typeof category?.name === 'string'
              ? category.name
              : '',
          title: String(item.title ?? ''),
          summary: typeof item.summary === 'string' ? item.summary : undefined,
          description:
            typeof item.description === 'string'
              ? item.description
              : '',
          type:
            customFields?.type === 'Individual Project'
              ? 'Individual Project'
              : 'Ongoing Initiative',
          start_date:
            typeof item.startDate === 'string'
              ? item.startDate.slice(0, 10)
              : undefined,
          end_date:
            typeof item.endDate === 'string'
              ? item.endDate.slice(0, 10)
              : undefined,
          location:
            typeof customFields?.location === 'string'
              ? customFields.location
              : undefined,
          status:
            item.status === 'archived'
              ? 'archived'
              : item.status === 'deleted'
                ? 'deleted'
                : 'active',
          featured:
            customFields?.featured === true,
          display_order:
            typeof item.displayOrder === 'number'
              ? item.displayOrder
              : 0,
          photos: Array.isArray(customFields?.photos)
            ? customFields.photos.filter(
                (photo): photo is string => typeof photo === 'string',
              )
            : [],
          beneficiaries_count:
            typeof customFields?.beneficiaries_count === 'number'
              ? customFields.beneficiaries_count
              : undefined,
          published_at: typeof item.publishedAt === 'string' ? item.publishedAt : undefined,
          cover_media_id: typeof item.coverMediaId === 'string' ? item.coverMediaId : undefined,
          metadata: (item.metadata as Record<string, unknown> | undefined) ?? {},
          custom_fields: customFields ?? {},
        };
      }),
    );

    setAnnouncements(
      state.announcements.map((announcement) => {
        const item = announcement as Record<string, unknown>;
        const customFields =
          item.customFields as Record<string, unknown> | null | undefined;

        return {
          id: String(item.id),
          announcement_code:
            typeof customFields?.announcement_code === 'string'
              ? customFields.announcement_code
              : String(item.slug ?? item.id),
          title: String(item.title ?? ''),
          summary: typeof item.summary === 'string' ? item.summary : undefined,
          content: String(item.body ?? ''),
          important: customFields?.important === true,
          featured: customFields?.featured === true,
          publish_date:
            typeof item.publishedAt === 'string'
              ? item.publishedAt.slice(0, 10)
              : '',
          expiry_date:
            typeof item.expiresAt === 'string'
              ? item.expiresAt.slice(0, 10)
              : undefined,
          status:
            item.status === 'draft' ||
            item.status === 'scheduled' ||
            item.status === 'archived'
              ? item.status
              : 'published',
          cover_media_id: typeof item.coverMediaId === 'string' ? item.coverMediaId : undefined,
          metadata: (item.metadata as Record<string, unknown> | undefined) ?? {},
          custom_fields: customFields ?? {},
        };
      }),
    );

    setContactSubmissions(
      state.contacts.map((contact) => {
        const item = contact as Record<string, unknown>;
        const assignee =
          item.assignee as Record<string, unknown> | null | undefined;
        const metadata =
          item.metadata as Record<string, unknown> | null | undefined;

        return {
          id: String(item.id),
          submission_code:
            typeof metadata?.submission_code === 'string'
              ? metadata.submission_code
              : String(item.id),
          name: String(item.name ?? ''),
          email: typeof item.email === 'string' ? item.email : '',
          phone: typeof item.phone === 'string' ? item.phone : '',
          subject:
            typeof item.subject === 'string' ? item.subject : '',
          message: String(item.message ?? ''),
          category:
            typeof metadata?.category === 'string'
              ? metadata.category
              : undefined,
          status:
            item.status === 'assigned' ||
            item.status === 'in_progress' ||
            item.status === 'resolved' ||
            item.status === 'closed'
              ? item.status
              : 'new',
          assigned_to_employee_id:
            typeof item.assignedTo === 'string'
              ? item.assignedTo
              : undefined,
          assigned_to_name:
            typeof assignee?.displayName === 'string'
              ? assignee.displayName
              : undefined,
          admin_notes:
            typeof metadata?.adminNotes === 'string'
              ? metadata.adminNotes
              : undefined,
          created_at:
            typeof item.createdAt === 'string'
              ? item.createdAt
              : new Date().toISOString(),
          resolved_at:
            typeof item.respondedAt === 'string'
              ? item.respondedAt
              : undefined,
        };
      }),
    );

    setNotifications(
      state.notifications.map((notification) => {
        const item = notification as Record<string, unknown>;
        const notificationMetadata = item.metadata as Record<string, unknown> | undefined;
        const sender = item.adminUser as Record<string, unknown> | null | undefined;
        return {
          id: String(item.id),
          title: String(item.title ?? ''),
          message: String(item.message ?? ''),
          destination_type:
            item.type === 'announcement' ||
            item.type === 'event' ||
            item.type === 'social_work'
              ? item.type
              : 'general',
          destination_id:
            typeof item.linkUrl === 'string'
              ? item.linkUrl
              : undefined,
          sender_name: typeof sender?.displayName === 'string' ? sender.displayName : 'System',
          sent_at:
            typeof item.createdAt === 'string'
              ? item.createdAt
              : new Date().toISOString(),
          targeted_devices: 0,
          status: notificationMetadata?.deliveryStatus === 'failed' ? 'failed' : 'scheduled',
          is_read: item.isRead === true,
        };
      }),
    );

    setAuditLogs(
      state.auditLogs.map((log) => {
        const item = log as Record<string, unknown>;
        const actor =
          item.actor as Record<string, unknown> | null | undefined;
        const metadata =
          item.metadata as Record<string, unknown> | null | undefined;
        const actorRoles = Array.isArray(actor?.roles) ? actor.roles : [];
        const actorRole = actorRoles[0] as Record<string, unknown> | undefined;
        const actorRoleData = actorRole?.role as Record<string, unknown> | undefined;

        return {
          id: String(item.id),
          actor_name:
            typeof actor?.displayName === 'string'
              ? actor.displayName
              : 'System',
          actor_role: typeof actorRoleData?.name === 'string' ? actorRoleData.name : 'System',
          action: String(item.action ?? ''),
          module: String(item.entityType ?? 'system'),
          entity_id:
            typeof item.entityId === 'string'
              ? item.entityId
              : undefined,
          details:
            typeof metadata?.details === 'string'
              ? metadata.details
              : '',
          timestamp:
            typeof item.createdAt === 'string'
              ? item.createdAt
              : new Date().toISOString(),
        };
      }),
    );

    setRejectedRecords(
      state.rejectedRecords.map((record) => {
        const item = record as Record<string, unknown>;
        const importRecord =
          item.importRecord as Record<string, unknown> | null | undefined;
        const sourceData =
          importRecord?.sourceData as Record<string, unknown> | null | undefined;
        const validationErrors = importRecord?.validationErrors;

        return {
          id: String(item.id),
          batch_id:
            typeof importRecord?.batchId === 'string'
              ? importRecord.batchId
              : '',
          module: 'imports',
          row_number:
            typeof importRecord?.rowNumber === 'number'
              ? importRecord.rowNumber
              : 0,
          record_reference:
            typeof importRecord?.recordKey === 'string'
              ? importRecord.recordKey
              : String(item.id),
          raw_data: Object.fromEntries(
            Object.entries(sourceData ?? {}).map(([key, value]) => [
              key,
              String(value ?? ''),
            ]),
          ),
          error_message:
            Array.isArray(validationErrors) && validationErrors.length
              ? String(validationErrors[0])
              : String(item.rejectionReason ?? ''),
          rejected_at:
            typeof item.createdAt === 'string'
              ? item.createdAt
              : new Date().toISOString(),
          status:
            item.correctionStatus === 'resolved'
              ? 'resolved'
              : 'rejected',
        };
      }),
    );

    setImportBatches(
      state.importBatches.map((batch) => {
        const item = batch as Record<string, unknown>;
        const metadata =
          item.metadata as Record<string, unknown> | null | undefined;

        return {
          id: String(item.id),
          batch_code:
            typeof metadata?.batch_code === 'string'
              ? metadata.batch_code
              : String(item.id),
          module_name: String(item.entityType ?? ''),
          file_name: String(item.originalFilename ?? ''),
          total_rows:
            typeof item.totalRecords === 'number'
              ? item.totalRecords
              : 0,
          passed_rows:
            typeof item.acceptedRecords === 'number'
              ? item.acceptedRecords
              : 0,
          failed_rows:
            typeof item.rejectedRecords === 'number'
              ? item.rejectedRecords
              : 0,
          warning_rows: 0,
          uploaded_by: String(item.uploadedBy ?? ''),
          uploaded_at:
            typeof item.createdAt === 'string'
              ? item.createdAt
              : new Date().toISOString(),
          status:
            item.status === 'failed' ||
            item.status === 'completed' ||
            item.status === 'validated' ||
            item.status === 'partially_accepted'
              ? item.status
              : 'uploaded',
        };
      }),
    );

    setEmployees(
      state.employees.map((employee) => {
        const item = employee as Record<string, unknown>;
        const roleAssignments = Array.isArray(item.roles)
          ? item.roles
          : [];
        const roleAssignment =
          roleAssignments[0] as Record<string, unknown> | undefined;
        const role =
          roleAssignment?.role as Record<string, unknown> | undefined;
        const allRoleIds = roleAssignments.map((assignment) => {
          const assignedRole = (assignment as Record<string, unknown>).role as Record<string, unknown> | undefined;
          return String(assignedRole?.id ?? '');
        }).filter(Boolean);

        return {
          id: String(item.id),
          employee_code:
            typeof item.employeeId === 'string'
              ? item.employeeId
              : 'ADMIN',
          full_name: String(item.displayName ?? ''),
          email: String(item.email ?? ''),
          phone: typeof item.phone === 'string' ? item.phone : '',
          designation:
            typeof item.designation === 'string'
              ? item.designation
              : typeof item.customFields === 'object' &&
                  item.customFields !== null &&
                  typeof (item.customFields as Record<string, unknown>).designation ===
                    'string'
                ? String(
                    (item.customFields as Record<string, unknown>).designation,
                  )
                : '',
          role_id: String(role?.id ?? ''),
          role_name: String(role?.name ?? 'Admin'),
          role_ids: allRoleIds,
          status:
            item.status === 'blocked'
              ? 'blocked'
              : item.status === 'suspended' ||
                  item.status === 'archived'
                ? item.status
                : 'active',
          date_of_birth:
            typeof item.dateOfBirth === 'string'
              ? item.dateOfBirth.slice(0, 10)
              : undefined,
          address_line_1:
            typeof item.addressLine1 === 'string'
              ? item.addressLine1
              : undefined,
          address_line_2:
            typeof item.addressLine2 === 'string'
              ? item.addressLine2
              : undefined,
          city:
            typeof item.city === 'string' ? item.city : undefined,
          state:
            typeof item.state === 'string' ? item.state : undefined,
          country:
            typeof item.country === 'string' ? item.country : undefined,
          failed_login_attempts:
            typeof item.failedLoginAttempts === 'number'
              ? item.failedLoginAttempts
              : undefined,
          last_failed_login_at:
            typeof item.lastFailedLoginAt === 'string'
              ? item.lastFailedLoginAt
              : undefined,
          blocked_at:
            typeof item.blockedAt === 'string'
              ? item.blockedAt
              : undefined,
          last_login_at:
            typeof item.lastLoginAt === 'string'
              ? item.lastLoginAt
              : undefined,
        };
      }),
    );

    setRoles(
      state.roles.map((role) => {
        const item = role as Record<string, unknown>;
        const permissions = Array.isArray(item.permissions)
          ? item.permissions
          : [];

        const permissionMap: Record<string, UserPermission> = {};

        for (const relation of permissions) {
          const relationItem = relation as Record<string, unknown>;
          const permission =
            relationItem.permission as Record<string, unknown> | undefined;
          if (!permission) continue;

          permissionMap[String(permission.module)] = {
            module: String(permission.module),
            can_view: true,
            can_create: String(permission.code).includes('create'),
            can_edit: String(permission.code).includes('edit'),
            can_import: String(permission.code).includes('import'),
            can_archive: String(permission.code).includes('archive'),
            can_delete: String(permission.code).includes('delete'),
          };
        }

        return {
          id: String(item.id),
          role_name: String(item.name ?? ''),
          description:
            typeof item.description === 'string'
              ? item.description
              : '',
          is_system_role: item.isSystemRole === true,
          permissions: permissionMap,
        };
      }),
    );
  };

  const persistAdminUiState = async (
    overrides: Record<string, unknown> = {},
  ) => {
    await updateSettingsBundleApi({ uiState: {
      settings,
      socialLinks,
      statistics,
      milestones,
      achievements,
      ...overrides,
    } });
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
        refreshPublicContentFromApi(),
        refreshAdminPortalState(),
        ...(user.isSystemRole || user.permissions?.includes('dashboard.read') ? [fetchDashboardApi().then(setDashboardData)] : []),
      ]);
    } finally {
      setAuthLoading(false);
    }
  };

  const logoutAdminUser = () => {
    clearAdminSession();
    setIsAuthenticated(false);
    setCurrentUser({ id: '', employee_code: '', full_name: '', email: '', phone: '', designation: '', role_id: '', role_name: '', status: 'active' });
    setIsAdminPortalOpen(false);
    void refreshPublicContentFromApi().catch((error) => {
      console.error('Public content refresh failed after logout:', error);
    });
  };

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      if (!hasAdminToken()) {
        try {
          await refreshPublicContentFromApi();
        } catch (error) {
          if (!cancelled) {
            console.error('Public content restore failed:', error);
          }
        } finally {
          if (!cancelled) {
            setAuthLoading(false);
          }
        }
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
            refreshPublicContentFromApi(),
            refreshAdminPortalState(),
            ...(user.isSystemRole || user.permissions?.includes('dashboard.read') ? [fetchDashboardApi().then(setDashboardData)] : []),
          ]);
        } catch (error) {
          if (!cancelled) {
            console.error('Admin data restore failed:', error);
          }
        }
      } catch (error) {
        if (cancelled) return;

        if (error instanceof ApiError && error.status === 401) {
          clearAdminSession();
          setIsAuthenticated(false);

          try {
            await refreshPublicContentFromApi();
          } catch (publicError) {
            if (!cancelled) {
              console.error('Public content restore failed:', publicError);
            }
          }
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

  useEffect(() => {
    const handleUnauthorized = () => {
      setIsAuthenticated(false);
      setIsAdminPortalOpen(true);
    };
    window.addEventListener('asrgh:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('asrgh:unauthorized', handleUnauthorized);
  }, [setIsAdminPortalOpen]);

  useEffect(() => saveStored('text_size', textSize), [textSize]);
  useEffect(() => saveStored('language', language), [language]);

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


  const updateSettings = async (
    newSettings: Partial<OrganizationSettings>,
  ) => {
    const nextSettings = { ...settings, ...newSettings };
    await updateSettingsBundleApi({
      organization: { name: nextSettings.organization_name, legalName: nextSettings.legal_name, email: nextSettings.primary_email, phone: nextSettings.primary_phone, addressLine1: nextSettings.address_line_1, addressLine2: nextSettings.address_line_2, city: nextSettings.city, state: nextSettings.state, postalCode: nextSettings.postal_code, country: nextSettings.country },
      websiteSetting: { siteTitle: nextSettings.organization_name, tagline: nextSettings.tagline, contactEmail: nextSettings.primary_email, contactPhone: nextSettings.primary_phone, address: [nextSettings.address_line_1, nextSettings.address_line_2, nextSettings.city, nextSettings.state, nextSettings.postal_code, nextSettings.country].filter(Boolean).join(', '), socialLinks, publicSettings: { googleMapsUrl: nextSettings.google_maps_url, officeHours: nextSettings.office_hours, showPhone: nextSettings.show_phone, showEmail: nextSettings.show_email, showWhatsapp: nextSettings.show_whatsapp, showAddress: nextSettings.show_address, showOfficeHours: nextSettings.show_office_hours, showMap: nextSettings.show_map } },
      uiState: { settings: nextSettings, socialLinks, statistics, milestones, achievements },
    });
    setSettings(nextSettings);
  };

  const updateSocialLinks = async (links: SocialLink[]) => {
    await persistAdminUiState({ socialLinks: links });
    setSocialLinks(links);
  };

  const updateStatistic = async (
    id: string,
    overrideValue: number,
    isOverridden: boolean,
  ) => {
    const nextStatistics = statistics.map((stat) =>
      stat.id === id
        ? {
            ...stat,
            value: overrideValue,
            is_overridden: isOverridden,
          }
        : stat,
    );

    await persistAdminUiState({ statistics: nextStatistics });
    setStatistics(nextStatistics);
  };

  const addMember = async (member: Member) => {
    const saved = await createAdminMember(member);

    setMembers((prev) => [
      saved,
      ...prev.filter((m) => m.id !== member.id),
    ]);

    return saved;

  };

  const updateMember = async (
    id: string,
    updated: Partial<Member>,
  ) => {
    const saved = await updateAdminMember(id, updated);

    setMembers((prev) =>
      prev.map((m) => (m.id === id ? saved : m)),
    );

  };

  const archiveMember = async (id: string) => {
    const saved = await archiveAdminMember(id);

    setMembers((prev) =>
      prev.map((m) => (m.id === id ? saved : m)),
    );

  };

  const deleteMember = async (id: string) => {
    await deleteAdminMember(id);

    setMembers((prev) =>
      prev.filter((m) => m.id !== id),
    );

  };

  const addEvent = async (event: Event) => {
    const saved = await createAdminEvent(event);

    setEvents((prev) => [
      saved,
      ...prev.filter((e) => e.id !== event.id),
    ]);

  };

  const updateEvent = async (
    id: string,
    updated: Partial<Event>,
  ) => {
    const saved = await updateAdminEvent(id, updated);

    setEvents((prev) =>
      prev.map((e) => (e.id === id ? saved : e)),
    );

  };

  const archiveEvent = async (id: string) => {
    const saved = await archiveAdminEvent(id);

    setEvents((prev) =>
      prev.map((e) => (e.id === id ? saved : e)),
    );

  };

  const deleteEvent = async (id: string) => {
    await deleteAdminEvent(id);

    setEvents((prev) =>
      prev.filter((e) => e.id !== id),
    );

  };

  const addSocialWorkActivity = async (
    act: SocialWorkActivity,
  ) => {
    const created = await createSocialWorkActivityApi({
      title: act.title,
      slug: act.activity_code || act.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      categoryId: act.category_id || undefined,
      summary: act.summary,
      description: act.description,
      startDate: act.start_date,
      endDate: act.end_date,
      status: act.status,
      displayOrder: act.display_order,
      publishedAt: act.published_at ? new Date(act.published_at).toISOString() : null,
      coverMediaId: act.cover_media_id || null,
      metadata: act.metadata,
      customFields: {
        ...(act.custom_fields ?? {}),
        activity_code: act.activity_code,
        type: act.type,
        location: act.location,
        featured: act.featured,
        photos: act.photos,
        beneficiaries_count: act.beneficiaries_count,
      },
    });

    const item = created as Record<string, unknown>;
    const category = item.category as Record<string, unknown> | undefined;
    const customFields = item.customFields as Record<string, unknown> | undefined;
    const saved: SocialWorkActivity = {
      ...act,
      id: String(item.id),
      activity_code:
        typeof customFields?.activity_code === 'string'
          ? customFields.activity_code
          : act.activity_code,
      category_name:
        typeof category?.name === 'string'
          ? category.name
          : act.category_name,
    };

    setSocialWorkActivities((prev) => [saved, ...prev]);
  };

  const addSocialWorkCategory = async (category: Omit<SocialWorkCategory, 'id'>) => {
    await createSocialWorkCategoryApi({ name: category.name, description: category.description, iconKey: category.icon_name, displayOrder: category.display_order, isActive: category.status === 'active' });
    await refreshAdminPortalState();
  };

  const updateSocialWorkCategory = async (id: string, category: Partial<SocialWorkCategory>) => {
    await updateSocialWorkCategoryApi(id, { name: category.name, description: category.description, iconKey: category.icon_name, displayOrder: category.display_order, isActive: category.status ? category.status === 'active' : undefined });
    await refreshAdminPortalState();
  };

  const deleteSocialWorkCategory = async (id: string) => {
    await deleteSocialWorkCategoryApi(id);
    setSocialWorkCategories((prev) => prev.filter((category) => category.id !== id));
  };

  const updateSocialWorkActivity = async (
    id: string,
    updated: Partial<SocialWorkActivity>,
  ) => {
    const current = socialWorkActivities.find((activity) => activity.id === id);
    if (!current) return;

    const merged = { ...current, ...updated };
    const saved = await updateSocialWorkActivityApi(id, {
      title: merged.title,
      slug: merged.activity_code || merged.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      categoryId: merged.category_id || undefined,
      summary: merged.summary,
      description: merged.description,
      startDate: merged.start_date,
      endDate: merged.end_date,
      status: merged.status,
      displayOrder: merged.display_order,
      publishedAt: merged.published_at ? new Date(merged.published_at).toISOString() : null,
      coverMediaId: merged.cover_media_id || null,
      metadata: merged.metadata,
      customFields: {
        ...(merged.custom_fields ?? {}),
        activity_code: merged.activity_code,
        type: merged.type,
        location: merged.location,
        featured: merged.featured,
        photos: merged.photos,
        beneficiaries_count: merged.beneficiaries_count,
      },
    });

    setSocialWorkActivities((prev) =>
      prev.map((activity) =>
        activity.id === id ? merged : activity,
      ),
    );


  };

  const archiveSocialWorkActivity = async (id: string) => {
    await archiveSocialWorkActivityApi(id);
    setSocialWorkActivities((prev) =>
      prev.map((activity) =>
        activity.id === id
          ? { ...activity, status: 'archived' }
          : activity,
      ),
    );

  };

  const deleteSocialWorkActivity = async (id: string) => {
    await deleteSocialWorkActivityApi(id);
    setSocialWorkActivities((prev) =>
      prev.filter((activity) => activity.id !== id),
    );

  };

  const addAnnouncement = async (ann: Announcement) => {
    const created = await createAnnouncementApi({
      title: ann.title,
      slug: ann.announcement_code || ann.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      body: ann.content,
      summary: ann.summary,
      status: ann.status,
      publishedAt: ann.publish_date
        ? new Date(ann.publish_date).toISOString()
        : undefined,
      expiresAt: ann.expiry_date
        ? new Date(ann.expiry_date).toISOString()
        : undefined,
      coverMediaId: ann.cover_media_id || null,
      metadata: ann.metadata,
      customFields: {
        ...(ann.custom_fields ?? {}),
        announcement_code: ann.announcement_code,
        important: ann.important,
        featured: ann.featured,
      },
    });

    const item = created as Record<string, unknown>;
    const saved: Announcement = {
      ...ann,
      id: String(item.id),
    };

    setAnnouncements((prev) => [saved, ...prev]);
  };

  const updateAnnouncement = async (
    id: string,
    updated: Partial<Announcement>,
  ) => {
    const current = announcements.find((announcement) => announcement.id === id);
    if (!current) return;

    const merged = { ...current, ...updated };
    await updateAnnouncementApi(id, {
      title: merged.title,
      slug: merged.announcement_code,
      body: merged.content,
      summary: merged.summary,
      status: merged.status,
      publishedAt: merged.publish_date
        ? new Date(merged.publish_date).toISOString()
        : undefined,
      expiresAt: merged.expiry_date
        ? new Date(merged.expiry_date).toISOString()
        : null,
      coverMediaId: merged.cover_media_id || null,
      metadata: merged.metadata,
      customFields: {
        ...(merged.custom_fields ?? {}),
        announcement_code: merged.announcement_code,
        important: merged.important,
        featured: merged.featured,
      },
    });

    setAnnouncements((prev) =>
      prev.map((announcement) =>
        announcement.id === id ? merged : announcement,
      ),
    );

  };

  const archiveAnnouncement = async (id: string) => {
    await archiveAnnouncementApi(id);
    setAnnouncements((prev) =>
      prev.map((announcement) =>
        announcement.id === id
          ? { ...announcement, status: 'archived' }
          : announcement,
      ),
    );

  };

  const deleteAnnouncement = async (id: string) => {
    await deleteAnnouncementApi(id);
    setAnnouncements((prev) =>
      prev.filter((announcement) => announcement.id !== id),
    );

  };

  const addContactSubmission = async (
    sub: Omit<
      ContactSubmission,
      'id' | 'submission_code' | 'created_at' | 'status'
    >,
  ) => {
    const created = await submitPublicContact(sub) as Record<string, unknown>;
    return String(created.id);
  };

  const updateContactStatus = async (
    id: string,
    status: ContactSubmission['status'],
    assignedTo?: string,
    notes?: string,
  ) => {
    const updated = await updateContactApi(id, {
      status,
      assignedTo: assignedTo || null,
      notes,
    });

    const item = updated as Record<string, unknown>;
    const assignee =
      item.assignee as Record<string, unknown> | undefined;

    setContactSubmissions((prev) =>
      prev.map((contact) =>
        contact.id === id
          ? {
              ...contact,
              status,
              assigned_to_employee_id: assignedTo,
              assigned_to_name:
                typeof assignee?.displayName === 'string'
                  ? assignee.displayName
                  : contact.assigned_to_name,
              admin_notes:
                notes !== undefined ? notes : contact.admin_notes,
              resolved_at:
                status === 'resolved' || status === 'closed'
                  ? new Date().toISOString()
                  : contact.resolved_at,
            }
          : contact,
      ),
    );

  };

  const sendNotification = async (
    notif: Omit<
      NotificationRecord,
      'id' | 'sent_at' | 'sender_name' | 'targeted_devices'
    >,
  ) => {
    const created = await createNotificationApi({
      type: notif.destination_type,
      title: notif.title,
      message: notif.message,
      linkUrl: notif.destination_id,
    });

    const item = created as Record<string, unknown>;
    const newNotif: NotificationRecord = {
      ...notif,
      id: String(item.id),
      sender_name: currentUser.full_name,
      sent_at:
        typeof item.createdAt === 'string'
          ? item.createdAt
          : new Date().toISOString(),
      targeted_devices: 0,
      status: 'scheduled',
      is_read: item.isRead === true,
    };

    setNotifications((prev) => [newNotif, ...prev]);

  };

  const updateNotification = async (id: string, data: Partial<NotificationRecord>) => {
    await updateNotificationApi(id, { title: data.title, message: data.message, isRead: data.is_read });
    setNotifications((prev) => prev.map((item) => item.id === id ? { ...item, ...data } : item));
  };

  const deleteNotification = async (id: string) => {
    await deleteNotificationApi(id);
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  const resolveRejectedRecord = async (id: string) => {
    await resolveRejectedRecordApi(id);
    setRejectedRecords((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: 'resolved' }
          : r,
      ),
    );

  };

  const commitImport = async (entityType: 'members' | 'events' | 'social_work' | 'announcements', filename: string, rows: Record<string, string>[]) => {
    const result = await commitImportApi(entityType, filename, rows);
    await Promise.all([refreshMembersFromApi(), refreshEventsFromApi(), refreshAdminPortalState()]);
    return result;
  };

  const updateAdminUser = async (id: string, data: { status?: string; roleIds?: string[] }) => {
    await updateAdminUserApi(id, data);
    await refreshAdminPortalState();
  };

  const hasPermission = (permission: string) => Boolean(currentUser.is_system_role || currentUser.permission_codes?.includes(permission));

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
        dashboardData,
        updateStatistic,

        members,
        publicMembers,
        addMember,
        updateMember,
        archiveMember,
        deleteMember,

        events,
        publicEvents,
        publicContentError,
        addEvent,
        updateEvent,
        archiveEvent,
        deleteEvent,

        socialWorkCategories,
        addSocialWorkCategory,
        updateSocialWorkCategory,
        deleteSocialWorkCategory,
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

        milestones,
        achievements,

        contactSubmissions,
        addContactSubmission,
        updateContactStatus,

        notifications,
        sendNotification,
        updateNotification,
        deleteNotification,

        auditLogs,

        rejectedRecords,
        resolveRejectedRecord,

        importBatches,
        commitImport,

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
        updateAdminUser,
        hasPermission,
        activeAdminTab,
        setActiveAdminTab,
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
