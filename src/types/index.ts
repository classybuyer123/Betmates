// Data model types for BetMates app

export type BetType = 'money' | 'challenge' | 'group_winner_takes_all' | 'individual_group_bet';
export type BetStatus = 'pending' | 'active' | 'double_proposed' | 'resolved' | 'cancelled' | 'expired';
export type ConfirmationStatus = 'pending' | 'accepted' | 'declined';
export type Locale = 'en' | 'es';

export interface User {
  id: string;
  displayName: string;
  photoURL?: string;
  createdAt: number; // ms
  locale?: Locale;
  stats?: {
    total: number;
    wins: number;
    losses: number;
    owed: number;   // challenges you owe
    owedToYou: number;
  };
  pushTokens?: string[]; // Expo push tokens
}

export interface Group {
  id: string;
  name: string;
  ownerId: string;
  isPublic: boolean;
  memberIds: string[];
  createdAt: number;
}

export interface Bet {
  id: string;
  creatorId: string;
  participantIds: string[];      // length >= 2
  type: BetType;
  stakeMoney?: number;           // when type = money (symbolic)
  stakeText?: string;            // favor/challenge label
  description: string;
  groupId?: string;
  status: BetStatus;
  confirmations: Record<string, ConfirmationStatus>; // by userId
  doubleProposal?: {
    proposedBy: string;
    proposedAt: number;
    factor: number; // 2 = double
    approvals: Record<string, ConfirmationStatus>;
  };
  // Voting system for group winner-takes-all bets
  voting?: {
    isActive: boolean;
    votes: Record<string, string>; // voterId -> winnerUserId
    requiredVotes: number; // majority needed
    startedAt: number;
    endedAt?: number;
  };
  // For individual group bets - specify the two participants
  individualParticipants?: [string, string]; // exactly 2 participants for individual group bets
  deadline?: number | null;
  winnerId?: string;             // set on resolved
  resolvedAt?: number;
  createdAt: number;
  updatedAt: number;
  timeline: Array<{
    at: number;
    by: string;
    type:
      | 'created' | 'confirmed' | 'declined'
      | 'double_proposed' | 'double_accepted' | 'double_declined'
      | 'resolved' | 'voting_started' | 'vote_cast';
    notes?: string;
  }>;
}

export interface Notification {
  id: string;
  userId: string;
  type:
    | 'bet_created' | 'bet_confirmation_request'
    | 'bet_confirmed' | 'bet_declined'
    | 'double_proposed' | 'double_approved'
    | 'double_declined' | 'bet_resolve_reminder'
    | 'bet_resolved';
  betId?: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: number;
}

// UI Types
export interface BetCardProps {
  bet: Bet;
  users: Record<string, User>;
  onPress: () => void;
}

export interface UserAvatarProps {
  user: User;
  size?: number;
}

export interface TypeChipProps {
  type: BetType;
  size?: 'small' | 'medium';
}

// Re-export navigation types
export type {
  RootTabParamList,
  RootStackParamList,
  RootStackNavigationProp,
  RootTabNavigationProp,
} from './navigation';
