// src/utils/navigation.ts

export const ACTIVE_PAGES = [
  'home',
  'about',
  'social_work',
  'events',
  'gallery',
  'members',
  'management',
  'announcements',
  'contact',
  'admin',
] as const;

export type ActivePage = (typeof ACTIVE_PAGES)[number];

export interface NavigationState {
  activePage: ActivePage;
  selectedEntityId: string | null;
  isAdminPortalOpen: boolean;
  activeAdminTab: string;
}

const DEFAULT_NAVIGATION_STATE: NavigationState = {
  activePage: 'home',
  selectedEntityId: null,
  isAdminPortalOpen: false,
  activeAdminTab: 'dashboard',
};

function isActivePage(value: string | null): value is ActivePage {
  return value !== null && ACTIVE_PAGES.includes(value as ActivePage);
}

export function readNavigationState(
  location: Pick<Location, 'hash'> = window.location,
): NavigationState {
  const hash = location.hash.startsWith('#')
    ? location.hash.slice(1)
    : location.hash;

  if (!hash) {
    return { ...DEFAULT_NAVIGATION_STATE };
  }

  const params = new URLSearchParams(hash);
  const activePage = params.get('page');
  const selectedEntityId = params.get('entity');
  const isAdminPortalOpen = params.get('admin') === '1';
  const activeAdminTab = params.get('tab')?.trim() || 'dashboard';

  return {
    activePage: isActivePage(activePage) ? activePage : 'home',
    selectedEntityId: selectedEntityId?.trim() || null,
    isAdminPortalOpen,
    activeAdminTab,
  };
}

export function serializeNavigationState(state: NavigationState): string {
  const params = new URLSearchParams();

  if (state.activePage !== 'home') {
    params.set('page', state.activePage);
  }

  if (state.selectedEntityId) {
    params.set('entity', state.selectedEntityId);
  }

  if (state.isAdminPortalOpen) {
    params.set('admin', '1');

    if (state.activeAdminTab !== 'dashboard') {
      params.set('tab', state.activeAdminTab);
    }
  }

  const query = params.toString();
  return query ? `#${query}` : '';
}
