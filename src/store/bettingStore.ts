// Betting store using Zustand for managing bets

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Bet, User } from '../types';
import { generateSampleBets, MOCK_CONTACTS } from '../services/betting';
import { generateSampleGroupBets } from '../services/groups';

export interface BettingState {
  bets: Bet[];
  users: Record<string, User>;
  lastUserId?: string; // Track the last user ID to regenerate data if needed
  addBet: (bet: Bet) => void;
  updateBet: (betId: string, updates: Partial<Bet>) => void;
  deleteBet: (betId: string, currentUserId: string) => void;
  resolveBet: (betId: string, winnerId: string, currentUserId: string) => void;
  expireBet: (betId: string) => void;
  startVoting: (betId: string, groupMemberIds: string[]) => void;
  castVote: (betId: string, voterId: string, winnerId: string) => void;
  getBetsByStatus: (status: string) => Bet[];
  updateUser: (user: User) => void;
  initializeSampleData: (userId: string, currentUser?: User) => void;
}

export const useBettingStore = create<BettingState>()(
  persist(
    (set, get) => ({
      bets: [],
      users: {},
      lastUserId: undefined,

      addBet: (bet: Bet) => {
        set((state) => ({
          bets: [...state.bets, bet]
        }));
      },

      updateBet: (betId: string, updates: Partial<Bet>) => {
        set((state) => ({
          bets: state.bets.map(bet => 
            bet.id === betId 
              ? { ...bet, ...updates, updatedAt: Date.now() }
              : bet
          )
        }));
      },

      deleteBet: (betId: string, currentUserId: string) => {
        const now = Date.now();
        
        set((state) => {
          const betToDelete = state.bets.find(bet => bet.id === betId);
          if (!betToDelete) return state;

          // For now, delete immediately but simulate sending request to counterparty
          console.log(`Simulating delete request sent to counterparty for bet: ${betId}`);
          
          // In a real app, this would send a request to the counterparty
          // For now, we'll just delete it immediately
          const updatedBets = state.bets.filter(bet => bet.id !== betId);
          
          return {
            bets: updatedBets
          };
        });
      },

      resolveBet: (betId: string, winnerId: string, currentUserId: string) => {
        const now = Date.now();
        
        set((state) => ({
          bets: state.bets.map(bet => {
            if (bet.id === betId) {
              return {
                ...bet,
                status: 'resolved' as const,
                winnerId,
                resolvedAt: now,
                updatedAt: now,
                timeline: [
                  ...bet.timeline,
                  {
                    at: now,
                    by: currentUserId,
                    type: 'resolved' as const,
                    notes: `Winner selected: ${state.users[winnerId]?.displayName || winnerId}`
                  }
                ]
              };
            }
            return bet;
          })
        }));
      },

      expireBet: (betId: string) => {
        const now = Date.now();
        
        set((state) => ({
          bets: state.bets.map(bet => {
            if (bet.id === betId && bet.status === 'active') {
              return {
                ...bet,
                status: 'expired' as const,
                updatedAt: now,
                timeline: [
                  ...bet.timeline,
                  {
                    at: now,
                    by: 'system',
                    type: 'resolved' as const,
                    notes: 'Bet expired - deadline reached'
                  }
                ]
              };
            }
            return bet;
          })
        }));
      },

      startVoting: (betId: string, groupMemberIds: string[]) => {
        const now = Date.now();
        const requiredVotes = Math.ceil(groupMemberIds.length / 2); // Majority needed
        
        set((state) => ({
          bets: state.bets.map(bet => {
            if (bet.id === betId && bet.type === 'group_winner_takes_all' && bet.status === 'active') {
              return {
                ...bet,
                voting: {
                  isActive: true,
                  votes: {},
                  requiredVotes,
                  startedAt: now
                },
                updatedAt: now,
                timeline: [
                  ...bet.timeline,
                  {
                    at: now,
                    by: 'system',
                    type: 'voting_started' as const,
                    notes: 'Voting has started - choose the winner!'
                  }
                ]
              };
            }
            return bet;
          })
        }));
      },

      castVote: (betId: string, voterId: string, winnerId: string) => {
        const now = Date.now();
        
        set((state) => {
          const updatedBets = state.bets.map(bet => {
            if (bet.id === betId && bet.voting?.isActive) {
              const newVotes = {
                ...bet.voting.votes,
                [voterId]: winnerId
              };
              
              // Count votes for each participant
              const voteCounts: Record<string, number> = {};
              Object.values(newVotes).forEach(vote => {
                voteCounts[vote] = (voteCounts[vote] || 0) + 1;
              });
              
              // Check if someone has majority
              const winnerEntry = Object.entries(voteCounts).find(([_, count]) => count >= bet.voting!.requiredVotes);
              const hasWinner = !!winnerEntry;
              
              const updatedBet = {
                ...bet,
                voting: {
                  ...bet.voting,
                  votes: newVotes,
                  isActive: !hasWinner,
                  endedAt: hasWinner ? now : bet.voting.endedAt
                },
                status: hasWinner ? 'resolved' as const : bet.status,
                winnerId: hasWinner ? winnerEntry[0] : bet.winnerId,
                resolvedAt: hasWinner ? now : bet.resolvedAt,
                updatedAt: now,
                timeline: [
                  ...bet.timeline,
                  {
                    at: now,
                    by: voterId,
                    type: 'vote_cast' as const,
                    notes: `Voted for ${state.users[winnerId]?.displayName || winnerId}`
                  },
                  ...(hasWinner ? [{
                    at: now,
                    by: 'system',
                    type: 'resolved' as const,
                    notes: `${state.users[winnerEntry[0]]?.displayName || winnerEntry[0]} won by majority vote!`
                  }] : [])
                ]
              };
              
              return updatedBet;
            }
            return bet;
          });
          
          return { bets: updatedBets };
        });
      },

      getBetsByStatus: (status: string) => {
        const state = get();
        return state.bets.filter(bet => bet.status === status);
      },

      updateUser: (user: User) => {
        set((state) => ({
          users: {
            ...state.users,
            [user.id]: user
          }
        }));
      },

      initializeSampleData: (userId: string, currentUser?: User) => {
        const state = get();
        
        // Regenerate data if user ID changed or no bets exist
        if (state.bets.length === 0 || state.lastUserId !== userId) {
          console.log('Regenerating sample data for user:', userId);
          
          const sampleBets = generateSampleBets(userId);
          const sampleGroupBets = generateSampleGroupBets(userId);
          
          // Create users record with contacts
          const usersRecord: Record<string, User> = {};
          MOCK_CONTACTS.forEach(contact => {
            usersRecord[contact.id] = contact;
          });

          // Add current user to users record if provided
          if (currentUser) {
            usersRecord[currentUser.id] = currentUser;
          }

          set({
            bets: [...sampleBets, ...sampleGroupBets],
            users: usersRecord,
            lastUserId: userId
          });
        } else {
          // Update current user if provided
          if (currentUser) {
            set((state) => ({
              users: {
                ...state.users,
                [currentUser.id]: currentUser
              }
            }));
          }
        }
      },
    }),
    {
      name: 'betting-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        bets: state.bets,
        users: state.users,
        lastUserId: state.lastUserId,
      }),
    }
  )
);