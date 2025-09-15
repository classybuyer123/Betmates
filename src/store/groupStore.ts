// Group Store - Manages groups and group betting
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Group, User, Bet } from '../types';

export interface GroupMessage {
  id: string;
  groupId: string;
  senderId: string;
  type: 'text' | 'bet_created' | 'bet_accepted' | 'bet_resolved';
  content?: string;
  betId?: string;
  createdAt: number;
}

export interface GroupState {
  groups: Group[];
  messages: Record<string, GroupMessage[]>; // by groupId
  addGroup: (group: Group) => void;
  updateGroup: (groupId: string, updates: Partial<Group>) => void;
  addMessage: (message: GroupMessage) => void;
  getGroupMessages: (groupId: string) => GroupMessage[];
  joinGroup: (groupId: string, userId: string) => void;
  leaveGroup: (groupId: string, userId: string) => void;
  initializeSampleGroups: (userId: string) => void;
}

// Sample groups for friends trips
const createSampleGroups = (userId: string): Group[] => [
  {
    id: 'group-1',
    name: '🏖️ Miami Trip 2024',
    ownerId: userId,
    isPublic: false,
    memberIds: [userId, 'contact-1', 'contact-2', 'contact-3', 'contact-4'],
    createdAt: Date.now() - 86400000 * 7 // 7 days ago
  },
  {
    id: 'group-2', 
    name: '🎿 Ski Weekend',
    ownerId: 'contact-1',
    isPublic: false,
    memberIds: [userId, 'contact-1', 'contact-5', 'contact-6'],
    createdAt: Date.now() - 86400000 * 14 // 14 days ago
  },
  {
    id: 'group-3',
    name: '🎮 Gaming Squad',
    ownerId: userId,
    isPublic: false,
    memberIds: [userId, 'contact-7', 'contact-8', 'contact-9', 'contact-10'],
    createdAt: Date.now() - 86400000 * 21 // 21 days ago
  },
  {
    id: 'group-4',
    name: '🍕 Foodie Adventures',
    ownerId: 'contact-2',
    isPublic: false,
    memberIds: [userId, 'contact-2', 'contact-3', 'contact-6', 'contact-8'],
    createdAt: Date.now() - 86400000 * 3 // 3 days ago
  }
];

// Sample messages for groups
const createSampleMessages = (userId: string): Record<string, GroupMessage[]> => ({
  'group-1': [
    {
      id: 'msg-1',
      groupId: 'group-1',
      senderId: userId,
      type: 'text',
      content: 'Who wants to bet on who gets the best tan? 😎',
      createdAt: Date.now() - 86400000 * 2
    },
    {
      id: 'msg-2',
      groupId: 'group-1',
      senderId: 'contact-1',
      type: 'bet_created',
      betId: 'group-bet-1',
      createdAt: Date.now() - 86400000 * 1
    },
    {
      id: 'msg-3',
      groupId: 'group-1',
      senderId: 'contact-2',
      type: 'bet_accepted',
      betId: 'group-bet-1',
      createdAt: Date.now() - 86400000 * 1 + 3600000
    }
  ],
  'group-2': [
    {
      id: 'msg-4',
      groupId: 'group-2',
      senderId: 'contact-1',
      type: 'text',
      content: 'Can\'t wait for the slopes! ⛷️',
      createdAt: Date.now() - 86400000 * 1
    }
  ],
  'group-3': [
    {
      id: 'msg-5',
      groupId: 'group-3',
      senderId: userId,
      type: 'text',
      content: 'Tournament this weekend?',
      createdAt: Date.now() - 3600000
    }
  ],
  'group-4': [
    {
      id: 'msg-6',
      groupId: 'group-4',
      senderId: 'contact-2',
      type: 'text',
      content: 'Found an amazing new restaurant! 🍽️',
      createdAt: Date.now() - 7200000
    }
  ]
});

export const useGroupStore = create<GroupState>()(
  persist(
    (set, get) => ({
      groups: [],
      messages: {},

      addGroup: (group: Group) => {
        set((state) => ({
          groups: [...state.groups, group]
        }));
      },

      updateGroup: (groupId: string, updates: Partial<Group>) => {
        set((state) => ({
          groups: state.groups.map(group =>
            group.id === groupId ? { ...group, ...updates } : group
          )
        }));
      },

      addMessage: (message: GroupMessage) => {
        set((state) => ({
          messages: {
            ...state.messages,
            [message.groupId]: [
              ...(state.messages[message.groupId] || []),
              message
            ]
          }
        }));
      },

      getGroupMessages: (groupId: string) => {
        const state = get();
        return state.messages[groupId] || [];
      },

      joinGroup: (groupId: string, userId: string) => {
        set((state) => ({
          groups: state.groups.map(group =>
            group.id === groupId && !group.memberIds.includes(userId)
              ? { ...group, memberIds: [...group.memberIds, userId] }
              : group
          )
        }));
      },

      leaveGroup: (groupId: string, userId: string) => {
        set((state) => ({
          groups: state.groups.map(group =>
            group.id === groupId
              ? { ...group, memberIds: group.memberIds.filter(id => id !== userId) }
              : group
          )
        }));
      },

      initializeSampleGroups: (userId: string) => {
        const state = get();
        
        // Only initialize if no groups exist
        if (state.groups.length === 0) {
          const sampleGroups = createSampleGroups(userId);
          const sampleMessages = createSampleMessages(userId);
          
          set({
            groups: sampleGroups,
            messages: sampleMessages
          });
        }
      },
    }),
    {
      name: 'group-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        groups: state.groups,
        messages: state.messages
      })
    }
  )
);
