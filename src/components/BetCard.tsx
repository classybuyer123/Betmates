// BetCard component for displaying bet information

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { Feather } from '@expo/vector-icons';
import { colors, textStyles, spacing, borderRadius, shadows } from '../theme';
import { UserAvatar } from './UserAvatar';
import { TypeChip } from './TypeChip';
import { StatusChip } from './StatusChip';
import type { Bet, User } from '../types';
import { useTranslation } from '../services/i18n';

export interface BetCardProps {
  bet: Bet;
  users: Record<string, User>;
  onPress: () => void;
  currentUserId?: string;
}

export const BetCard: React.FC<BetCardProps> = ({ 
  bet, 
  users, 
  onPress, 
  currentUserId 
}) => {
  const { t } = useTranslation();

  const getStakeDisplay = () => {
    switch (bet.type) {
      case 'money':
        return `$${bet.stakeMoney || 0}`;
      case 'challenge':
        return bet.stakeText || t('common.error');
      default:
        return '';
    }
  };

  const getParticipantNames = () => {
    if (bet.status === 'resolved' && bet.winnerId) {
      const winner = users[bet.winnerId];
      const loser = bet.participantIds.find(id => id !== bet.winnerId);
      const loserUser = loser ? users[loser] : null;
      
      if (winner && loserUser) {
        return `${loserUser.displayName} pays ${winner.displayName}`;
      }
    }
    
    return bet.participantIds
      .map(id => users[id]?.displayName || 'Unknown')
      .join(' vs ');
  };

  const isUserInvolved = currentUserId && bet.participantIds.includes(currentUserId);
  const needsUserAction = isUserInvolved && 
    bet.status === 'pending' && 
    bet.confirmations[currentUserId] === 'pending';


  return (
    <TouchableOpacity 
      style={[
        styles.container,
        needsUserAction && styles.containerHighlighted
      ]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header with participants and delete button */}
      <View style={styles.header}>
        <View style={styles.participants}>
          {bet.participantIds.slice(0, 3).map((participantId, index) => (
            <View key={participantId} style={[styles.avatar, index > 0 && styles.avatarOverlap]}>
              <UserAvatar user={users[participantId] || null} size={32} />
            </View>
          ))}
          {bet.participantIds.length > 3 && (
            <View style={[styles.avatar, styles.avatarOverlap, styles.avatarMore]}>
              <Text style={[textStyles.caption, { color: colors.textMuted }]}>
                +{bet.participantIds.length - 3}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.headerRight}>
          <StatusChip status={bet.status} size="small" />
        </View>
      </View>

      {/* Participants names */}
      <Text style={[textStyles.bodyBold, styles.participantNames]} numberOfLines={1}>
        {getParticipantNames()}
      </Text>

      {/* Bet details */}
      <View style={styles.betDetails}>
        <TypeChip type={bet.type} size="small" />
        <Text style={[textStyles.body, styles.stake]} numberOfLines={1}>
          {getStakeDisplay()}
        </Text>
      </View>

      {/* Description */}
      <Text style={[textStyles.caption, styles.description]} numberOfLines={2}>
        {bet.description}
      </Text>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[textStyles.caption, { color: colors.textMuted }]}>
          {formatDistanceToNow(bet.createdAt, { addSuffix: true })}
        </Text>
        
        <Text style={[textStyles.caption, { color: colors.secondary }]}>
          Details
        </Text>
      </View>

      {/* Action indicator */}
      {needsUserAction && (
        <View style={styles.actionIndicator}>
          <View style={styles.actionDot} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs,
    ...shadows.card,
  },
  containerHighlighted: {
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  participants: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    position: 'relative',
  },
  avatarOverlap: {
    marginLeft: -spacing.sm,
  },
  avatarMore: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  participantNames: {
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  betDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  stake: {
    color: colors.textPrimary,
    flex: 1,
  },
  description: {
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionIndicator: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  actionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondary,
  },
});