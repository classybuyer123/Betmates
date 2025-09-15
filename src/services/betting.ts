// Betting service for managing bets and simulating the betting flow

import type { Bet, User, BetType, BetStatus } from '../types';

// Mock contacts that users can bet with
export const MOCK_CONTACTS: User[] = [
  {
    id: 'contact-1',
    displayName: 'Alex Rodriguez',
    photoURL: undefined,
    createdAt: Date.now() - 86400000 * 30, // 30 days ago
    locale: 'en',
    stats: { total: 15, wins: 8, losses: 7, owed: 2, owedToYou: 1 }
  },
  {
    id: 'contact-2',
    displayName: 'Sarah Johnson',
    photoURL: undefined,
    createdAt: Date.now() - 86400000 * 45, // 45 days ago
    locale: 'en',
    stats: { total: 22, wins: 12, losses: 10, owed: 0, owedToYou: 3 }
  },
  {
    id: 'contact-3',
    displayName: 'Mike Chen',
    photoURL: undefined,
    createdAt: Date.now() - 86400000 * 60, // 60 days ago
    locale: 'en',
    stats: { total: 8, wins: 3, losses: 5, owed: 1, owedToYou: 0 }
  },
  {
    id: 'contact-4',
    displayName: 'Emma Wilson',
    photoURL: undefined,
    createdAt: Date.now() - 86400000 * 20, // 20 days ago
    locale: 'en',
    stats: { total: 18, wins: 11, losses: 7, owed: 0, owedToYou: 2 }
  },
  {
    id: 'contact-5',
    displayName: 'John Smith',
    photoURL: undefined,
    createdAt: Date.now() - 86400000 * 35, // 35 days ago
    locale: 'en',
    stats: { total: 12, wins: 6, losses: 6, owed: 1, owedToYou: 1 }
  },
  {
    id: 'contact-6',
    displayName: 'Maria Garcia',
    photoURL: undefined,
    createdAt: Date.now() - 86400000 * 15, // 15 days ago
    locale: 'en',
    stats: { total: 25, wins: 14, losses: 11, owed: 3, owedToYou: 1 }
  },
  {
    id: 'contact-7',
    displayName: 'David Park',
    photoURL: undefined,
    createdAt: Date.now() - 86400000 * 50, // 50 days ago
    locale: 'en',
    stats: { total: 9, wins: 4, losses: 5, owed: 0, owedToYou: 2 }
  },
  {
    id: 'contact-8',
    displayName: 'Lisa Thompson',
    photoURL: undefined,
    createdAt: Date.now() - 86400000 * 25, // 25 days ago
    locale: 'en',
    stats: { total: 31, wins: 18, losses: 13, owed: 2, owedToYou: 4 }
  },
  {
    id: 'contact-9',
    displayName: 'Kevin Brown',
    photoURL: undefined,
    createdAt: Date.now() - 86400000 * 40, // 40 days ago
    locale: 'en',
    stats: { total: 14, wins: 7, losses: 7, owed: 1, owedToYou: 0 }
  },
  {
    id: 'contact-10',
    displayName: 'Jessica Lee',
    photoURL: undefined,
    createdAt: Date.now() - 86400000 * 55, // 55 days ago
    locale: 'en',
    stats: { total: 20, wins: 13, losses: 7, owed: 0, owedToYou: 3 }
  }
];

// Get all contacts (for the contacts picker)
export const getContacts = (): User[] => {
  return MOCK_CONTACTS;
};

// Find contact by username/display name
export const findContactByUsername = (username: string): User | null => {
  return MOCK_CONTACTS.find(contact => 
    contact.displayName.toLowerCase().includes(username.toLowerCase())
  ) || null;
};

// Determine bet type from wager text
export const determineBetType = (wager: string): BetType => {
  const lowerWager = wager.toLowerCase();
  
  if (lowerWager.includes('$') || lowerWager.includes('dollar') || lowerWager.includes('money')) {
    return 'money';
  }
  
  return 'challenge'; // Default for other types
};

// Extract monetary amount from wager text
export const extractMoneyAmount = (wager: string): number | undefined => {
  const moneyMatch = wager.match(/\$(\d+(?:\.\d{2})?)/);
  return moneyMatch ? parseFloat(moneyMatch[1]) : undefined;
};

// Create a new bet (simulates sending request and immediate acceptance)
export const createBet = async (
  creatorId: string,
  description: string,
  wager: string,
  opponentUsername: string,
  explicitBetType?: BetType,
  deadline?: number | null
): Promise<Bet> => {
  // Find the opponent
  const opponent = findContactByUsername(opponentUsername);
  if (!opponent) {
    throw new Error(`Contact "${opponentUsername}" not found`);
  }

  const betType = explicitBetType || determineBetType(wager);
  const now = Date.now();
  
  const bet: Bet = {
    id: `bet-${now}-${Math.random().toString(36).substr(2, 9)}`,
    creatorId,
    participantIds: [creatorId, opponent.id],
    type: betType,
    stakeMoney: betType === 'money' ? extractMoneyAmount(wager) : undefined,
    stakeText: betType === 'challenge' ? wager : undefined,
    description,
    deadline: deadline || null,
    status: 'active', // Simulate immediate acceptance
    confirmations: {
      [creatorId]: 'accepted',
      [opponent.id]: 'accepted' // Simulate opponent accepting immediately
    },
    createdAt: now,
    updatedAt: now,
    timeline: [
      {
        at: now,
        by: creatorId,
        type: 'created'
      },
      {
        at: now + 1000, // 1 second later
        by: opponent.id,
        type: 'confirmed',
        notes: 'Auto-accepted for demo'
      }
    ]
  };

  console.log('Bet created and accepted:', bet);
  return bet;
};

// Resolve a bet (mark winner)
export const resolveBet = async (
  betId: string,
  winnerId: string,
  currentUserId: string
): Promise<Bet> => {
  // In a real app, this would update the backend
  // For demo, we'll just return the updated bet structure
  
  const now = Date.now();
  
  // This is a mock - in real implementation, you'd fetch the current bet
  // and update it. For now, we'll assume the caller provides the complete updated bet
  throw new Error('Bet resolution should be handled by the calling component with the current bet state');
};

// Generate some sample active bets for demonstration
export const generateSampleBets = (userId: string): Bet[] => {
  const now = Date.now();
  
  return [
    {
      id: 'sample-bet-1',
      creatorId: userId,
      participantIds: [userId, 'contact-1'],
      type: 'money',
      stakeMoney: 20,
      description: 'I bet you can\'t finish the marathon in under 4 hours',
      status: 'active',
      confirmations: {
        [userId]: 'accepted',
        'contact-1': 'accepted'
      },
      createdAt: now - 86400000 * 2, // 2 days ago
      updatedAt: now - 86400000 * 2,
      timeline: [
        {
          at: now - 86400000 * 2,
          by: userId,
          type: 'created'
        },
        {
          at: now - 86400000 * 2 + 3600000, // 1 hour later
          by: 'contact-1',
          type: 'confirmed'
        }
      ]
    },
    {
      id: 'sample-bet-2',
      creatorId: 'contact-2',
      participantIds: ['contact-2', userId],
      type: 'challenge',
      stakeText: 'Do 25 pushups',
      description: 'The Lakers will win their next game',
      status: 'active',
      confirmations: {
        'contact-2': 'accepted',
        [userId]: 'accepted'
      },
      createdAt: now - 86400000 * 1, // 1 day ago
      updatedAt: now - 86400000 * 1,
      timeline: [
        {
          at: now - 86400000 * 1,
          by: 'contact-2',
          type: 'created'
        },
        {
          at: now - 86400000 * 1 + 1800000, // 30 minutes later
          by: userId,
          type: 'confirmed'
        }
      ]
    }
  ];
};
