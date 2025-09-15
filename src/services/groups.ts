// Group service for managing group functionality
import type { Group, Bet, User, BetType } from '../types';
import { MOCK_CONTACTS } from './betting';

// Create a new group bet
export const createGroupBet = async (
  groupId: string,
  creatorId: string,
  description: string,
  betType: BetType,
  wager: string,
  individualParticipants?: [string, string],
  subBetType?: 'money' | 'challenge'
): Promise<Bet> => {
  const betId = `group-bet-${Date.now()}`;
  
  // Extract money amount or use text based on bet type and sub type
  const isMoneyBet = betType === 'group_winner_takes_all' || 
                     (betType === 'individual_group_bet' && subBetType === 'money');
  const isChallengeBox = betType === 'individual_group_bet' && subBetType === 'challenge';
  
  const stakeMoney = isMoneyBet ? parseFloat(wager.replace(/[^0-9.]/g, '')) : undefined;
  const stakeText = isChallengeBox ? wager : undefined;
  
  // For individual group bets, set specific participants
  const initialParticipantIds = betType === 'individual_group_bet' && individualParticipants 
    ? individualParticipants 
    : [creatorId];
    
  // For individual group bets, both participants are auto-accepted
  const initialConfirmations = betType === 'individual_group_bet' && individualParticipants
    ? { [individualParticipants[0]]: 'accepted' as const, [individualParticipants[1]]: 'accepted' as const }
    : { [creatorId]: 'accepted' as const };
    
  // Individual group bets start as active, others start as pending
  const initialStatus = betType === 'individual_group_bet' ? 'active' as const : 'pending' as const;
  
  const newBet: Bet = {
    id: betId,
    creatorId,
    participantIds: initialParticipantIds,
    type: betType,
    stakeMoney,
    stakeText,
    description,
    groupId,
    status: initialStatus,
    confirmations: initialConfirmations,
    individualParticipants: betType === 'individual_group_bet' ? individualParticipants : undefined,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    timeline: [
      {
        at: Date.now(),
        by: creatorId,
        type: 'created',
        notes: betType === 'individual_group_bet' ? 'Individual bet created in group' : 'Bet created in group'
      }
    ]
  };
  
  return newBet;
};

// Accept a group bet (join as participant)
export const acceptGroupBet = (bet: Bet, userId: string): Bet => {
  // Don't allow duplicate acceptance
  if (bet.participantIds.includes(userId)) {
    return bet;
  }
  
  const updatedBet: Bet = {
    ...bet,
    participantIds: [...bet.participantIds, userId],
    confirmations: {
      ...bet.confirmations,
      [userId]: 'accepted'
    },
    status: bet.participantIds.length >= 1 ? 'active' : 'pending', // Active when 2+ participants
    updatedAt: Date.now(),
    timeline: [
      ...bet.timeline,
      {
        at: Date.now(),
        by: userId,
        type: 'confirmed',
        notes: 'Joined group bet'
      }
    ]
  };
  
  return updatedBet;
};

// Get group member names for display
export const getGroupMemberNames = (group: Group, users: Record<string, User>): string[] => {
  return group.memberIds
    .map(id => users[id]?.displayName || 'Unknown User')
    .filter(Boolean);
};

// Check if user can join a bet (not already in it)
export const canJoinGroupBet = (bet: Bet, userId: string): boolean => {
  return !bet.participantIds.includes(userId) && bet.status === 'pending';
};

// Format group bet message
export const formatGroupBetMessage = (
  bet: Bet, 
  users: Record<string, User>, 
  messageType: 'created' | 'accepted' | 'resolved'
): string => {
  const creator = users[bet.creatorId];
  const creatorName = creator?.displayName || 'Someone';
  
  switch (messageType) {
    case 'created':
      return `${creatorName} created a new bet: "${bet.description}"`;
    case 'accepted':
      const participantCount = bet.participantIds.length;
      return `${participantCount} ${participantCount === 1 ? 'person has' : 'people have'} joined this bet`;
    case 'resolved':
      if (bet.winnerId && bet.winnerId !== 'tie') {
        const winner = users[bet.winnerId];
        const winnerName = winner?.displayName || 'Someone';
        return `${winnerName} won the bet!`;
      }
      return 'Bet was resolved';
    default:
      return '';
  }
};

// Sample group bets
export const generateSampleGroupBets = (userId: string): Bet[] => [
  {
    id: 'group-bet-1',
    creatorId: 'contact-1',
    participantIds: ['contact-1', 'contact-2', userId],
    type: 'challenge',
    stakeText: 'Buy drinks for the group',
    description: 'Who can get the most Instagram likes on their Miami beach photo?',
    groupId: 'group-1',
    status: 'active',
    confirmations: {
      'contact-1': 'accepted',
      'contact-2': 'accepted',
      [userId]: 'accepted'
    },
    createdAt: Date.now() - 86400000 * 1,
    updatedAt: Date.now() - 86400000 * 1 + 3600000,
    timeline: [
      {
        at: Date.now() - 86400000 * 1,
        by: 'contact-1',
        type: 'created',
        notes: 'Created in Miami Trip group'
      },
      {
        at: Date.now() - 86400000 * 1 + 1800000,
        by: 'contact-2',
        type: 'confirmed'
      },
      {
        at: Date.now() - 86400000 * 1 + 3600000,
        by: userId,
        type: 'confirmed'
      }
    ]
  },
  {
    id: 'group-bet-2',
    creatorId: userId,
    participantIds: [userId],
    type: 'money',
    stakeMoney: 25,
    description: 'Who will win the next game tournament?',
    groupId: 'group-3',
    status: 'pending',
    confirmations: {
      [userId]: 'accepted'
    },
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 3600000,
    timeline: [
      {
        at: Date.now() - 3600000,
        by: userId,
        type: 'created',
        notes: 'Created in Gaming Squad group'
      }
    ]
  },
  {
    id: 'group-bet-3',
    creatorId: 'contact-1',
    participantIds: ['contact-1', 'contact-2', 'contact-3', userId],
    type: 'group_winner_takes_all',
    stakeMoney: 20,
    description: 'Who will get the most hoes this weekend? 😄',
    groupId: 'group-1',
    status: 'active',
    confirmations: {
      'contact-1': 'accepted',
      'contact-2': 'accepted',
      'contact-3': 'accepted',
      [userId]: 'accepted'
    },
    voting: {
      isActive: true,
      votes: {},
      requiredVotes: 3, // majority of 4 participants
      startedAt: Date.now() - 1800000 // 30 minutes ago
    },
    createdAt: Date.now() - 7200000, // 2 hours ago
    updatedAt: Date.now() - 1800000,
    timeline: [
      {
        at: Date.now() - 7200000,
        by: 'contact-1',
        type: 'created',
        notes: 'Winner takes all bet created'
      },
      {
        at: Date.now() - 6900000,
        by: 'contact-2',
        type: 'confirmed'
      },
      {
        at: Date.now() - 6600000,
        by: 'contact-3',
        type: 'confirmed'
      },
      {
        at: Date.now() - 6300000,
        by: userId,
        type: 'confirmed'
      },
      {
        at: Date.now() - 1800000,
        by: 'system',
        type: 'voting_started',
        notes: 'Voting has started - choose the winner!'
      }
    ]
  },
  {
    id: 'group-bet-4',
    creatorId: 'contact-2',
    participantIds: ['contact-2', userId],
    type: 'individual_group_bet',
    stakeMoney: 15,
    description: 'I bet you can\'t beat me in FIFA tonight',
    groupId: 'group-3',
    status: 'active',
    individualParticipants: ['contact-2', userId],
    confirmations: {
      'contact-2': 'accepted',
      [userId]: 'accepted'
    },
    createdAt: Date.now() - 1800000,
    updatedAt: Date.now() - 1800000,
    timeline: [
      {
        at: Date.now() - 1800000,
        by: 'contact-2',
        type: 'created',
        notes: 'Individual bet created in group'
      }
    ]
  }
];
