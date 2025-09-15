// UI state store using Zustand

import { create } from 'zustand';
import type { Locale } from '../types';

export interface UIState {
  // Loading states
  isRefreshing: boolean;
  setRefreshing: (refreshing: boolean) => void;

  // Filters
  betFilter: 'all' | 'mine' | 'group';
  setBetFilter: (filter: 'all' | 'mine' | 'group') => void;

  // Notifications
  unreadNotifications: number;
  setUnreadNotifications: (count: number) => void;

  // Modals and overlays
  activeModal: string | null;
  setActiveModal: (modal: string | null) => void;

  // Language
  locale: Locale;
  setLocale: (locale: Locale) => void;

  // Tab navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  // Loading states
  isRefreshing: false,
  setRefreshing: (refreshing: boolean) => set({ isRefreshing: refreshing }),

  // Filters
  betFilter: 'all',
  setBetFilter: (filter: 'all' | 'mine' | 'group') => set({ betFilter: filter }),

  // Notifications
  unreadNotifications: 0,
  setUnreadNotifications: (count: number) => set({ unreadNotifications: count }),

  // Modals and overlays
  activeModal: null,
  setActiveModal: (modal: string | null) => set({ activeModal: modal }),

  // Language
  locale: 'en',
  setLocale: (locale: Locale) => set({ locale }),

  // Tab navigation
  activeTab: 'Home',
  setActiveTab: (tab: string) => set({ activeTab: tab }),
}));
