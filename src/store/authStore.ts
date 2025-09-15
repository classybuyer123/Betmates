// Auth store using Zustand

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '../types';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => void;
  setGuest: (isGuest: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isGuest: false,
      isLoading: true,

      setUser: (user: User | null) => {
        set({
          user,
          isAuthenticated: !!user,
          isGuest: false,
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      signOut: () => {
        set({
          user: null,
          isAuthenticated: false,
          isGuest: false,
        });
      },

      setGuest: (isGuest: boolean) => {
        set({
          isGuest,
          isAuthenticated: isGuest,
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isGuest: state.isGuest,
      }),
    }
  )
);
