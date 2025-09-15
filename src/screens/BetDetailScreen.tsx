// BetDetailScreen - Bet Details

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatDistanceToNow, format } from 'date-fns';
import { colors, textStyles, spacing, borderRadius } from '../theme';
import { useTranslation } from '../services/i18n';
import { useAuth } from '../hooks/useAuth';
import { useBettingStore } from '../store/bettingStore';
import { UserAvatar } from '../components/UserAvatar';
import { TypeChip } from '../components/TypeChip';
import { StatusChip } from '../components/StatusChip';
import { Button } from '../components/Button';
import type { RootStackNavigationProp } from '../types';

type BetDetailScreenRouteProp = {
  key: string;
  name: string;
  params: {
    betId: string;
  };
};

export const BetDetailScreen: React.FC = () => {
  const { t } = useTranslation();
  const route = useRoute<BetDetailScreenRouteProp>();
  const navigation = useNavigation<RootStackNavigationProp>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { bets, users, resolveBet, expireBet, castVote, deleteBet } = useBettingStore();
  
  const [isResolving, setIsResolving] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  
  const bet = bets.find(b => b.id === route.params?.betId);

  // Check if bet has expired and update status if needed
  useEffect(() => {
    if (!bet || !bet.deadline || bet.status !== 'active') {
      setTimeLeft(null);
      setIsExpired(false);
      return;
    }

    const updateTimeLeft = () => {
      const now = Date.now();
      const deadline = bet?.deadline;
      
      if (deadline && now >= deadline) {
        setIsExpired(true);
        setTimeLeft('Expired');
        // Auto-expire the bet
        if (bet?.status === 'active' && bet?.id) {
          expireBet(bet.id);
        }
        return;
      }

      if (!deadline) {
        return;
      }

      const timeDiff = deadline - now;
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h left`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m left`);
      } else {
        setTimeLeft(`${minutes}m left`);
      }
      
      setIsExpired(false);
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [bet?.deadline, bet?.status, bet?.id, expireBet]);

  // Early return after all hooks are defined
  if (!bet) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={textStyles.body}>Bet not found</Text>
      </View>
    );
  }

  const canResolve = (bet.status === 'active' || bet.status === 'expired') && 
    user && 
    bet.participantIds.includes(user.id);

  const showExpiredResolution = bet.status === 'expired' && canResolve;

  const getStakeDisplay = () => {
    switch (bet.type) {
      case 'money':
        return `$${bet.stakeMoney || 0}`;
      case 'challenge':
        return bet.stakeText || 'Unknown stake';
      default:
        return '';
    }
  };

  const handleResolveWinner = (winnerId: string) => {
    if (!user) return;
    
    const winner = users[winnerId];
    const loser = bet.participantIds.find(id => id !== winnerId);
    const loserUser = loser ? users[loser] : null;
    
    Alert.alert(
      'Confirm Winner',
      `Confirm that ${winner?.displayName || 'Unknown'} won this bet?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setIsResolving(true);
            try {
              resolveBet(bet.id, winnerId, user.id);
              Alert.alert(
                'Bet Resolved!',
                `${loserUser?.displayName || 'Loser'} pays ${winner?.displayName || 'Winner'}`,
                [
                  {
                    text: 'OK',
                    onPress: () => navigation.goBack()
                  }
                ]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to resolve bet. Please try again.');
            } finally {
              setIsResolving(false);
            }
          }
        }
      ]
    );
  };
  
  const handleCastVote = (winnerId: string) => {
    if (!user || !bet.voting?.isActive) return;
    
    const winner = users[winnerId];
    
    Alert.alert(
      'Cast Your Vote',
      `Vote for ${winner?.displayName || 'Unknown'} as the winner?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Vote',
          onPress: () => {
            castVote(bet.id, user.id, winnerId);
            Alert.alert('Vote Cast!', `You voted for ${winner?.displayName || 'Unknown'}`);
          }
        }
      ]
    );
  };

  const handleDeleteBet = () => {
    if (!user) return;
    
    Alert.alert(
      'Delete Bet',
      'Are you sure you want to delete this bet? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteBet(bet.id, user.id);
            Alert.alert(
              'Bet Deleted',
              'The bet has been successfully deleted.',
              [
                {
                  text: 'OK',
                  onPress: () => navigation.goBack()
                }
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <ScrollView 
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.header}>
        <StatusChip status={bet.status} />
        <Text style={styles.betId}>#{bet.id.slice(-8)}</Text>
      </View>

      {/* Participants */}
      <View style={styles.participantsSection}>
        <Text style={styles.sectionTitle}>Participants</Text>
        <View style={styles.participantsList}>
          {bet.participantIds.map((participantId) => (
            <View key={participantId} style={styles.participantItem}>
              <UserAvatar user={users[participantId] || null} size={50} />
              <Text style={styles.participantName}>
                {users[participantId]?.displayName || 'Unknown'}
              </Text>
              {bet.status === 'resolved' && bet.winnerId === participantId && (
                <View style={styles.winnerBadge}>
                  <Text style={styles.winnerText}>WINNER</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* Bet Details */}
      <View style={styles.detailsSection}>
        <Text style={styles.sectionTitle}>Bet Details</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Type & Stake:</Text>
          <View style={styles.detailValue}>
            <TypeChip type={bet.type} size="small" />
            <Text style={styles.stakeText}>{getStakeDisplay()}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Description:</Text>
          <Text style={styles.detailText}>{bet.description}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Created:</Text>
          <Text style={styles.detailText}>
            {formatDistanceToNow(bet.createdAt, { addSuffix: true })}
          </Text>
        </View>

        {bet.deadline && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Deadline:</Text>
            <View style={styles.deadlineContainer}>
              <Text style={[styles.detailText, isExpired && styles.expiredText]}>
                {format(bet.deadline, 'MMM dd, yyyy \a\t h:mm a')}
              </Text>
              {timeLeft && (
                <Text style={[styles.timeLeftText, isExpired && styles.expiredText]}>
                  {timeLeft}
                </Text>
              )}
            </View>
          </View>
        )}

        {bet.resolvedAt && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Resolved:</Text>
            <Text style={styles.detailText}>
              {formatDistanceToNow(bet.resolvedAt, { addSuffix: true })}
            </Text>
          </View>
        )}
      </View>

      {/* Expired Notification */}
      {showExpiredResolution && (
        <View style={styles.expiredSection}>
          <Text style={styles.sectionTitle}>⏰ Bet Expired!</Text>
          <Text style={styles.expiredHelp}>
            This bet has reached its deadline. Please select who won to resolve it.
          </Text>
        </View>
      )}

      {/* Voting Section for Group Winner-Takes-All */}
      {bet.type === 'group_winner_takes_all' && bet.voting?.isActive && user && (
        <View style={styles.votingSection}>
          <Text style={styles.sectionTitle}>🗳️ Vote for Winner</Text>
          <Text style={styles.votingHelp}>
            Choose who you think won this bet. {bet.voting.requiredVotes} votes needed to win.
          </Text>
          
          <View style={styles.votingProgress}>
            <Text style={styles.votingProgressText}>
              Votes cast: {Object.keys(bet.voting.votes).length} / {bet.voting.requiredVotes}
            </Text>
          </View>
          
          <View style={styles.winnerButtons}>
            {bet.participantIds.map((participantId) => {
              const hasVoted = bet.voting!.votes[user.id] === participantId;
              const voteCount = Object.values(bet.voting!.votes).filter(vote => vote === participantId).length;
              
              return (
                <Button
                  key={participantId}
                  title={`${users[participantId]?.displayName || 'Unknown'} (${voteCount} vote${voteCount !== 1 ? 's' : ''})`}
                  onPress={() => handleCastVote(participantId)}
                  variant={hasVoted ? "primary" : "secondary"}
                  fullWidth
                  disabled={!!bet.voting!.votes[user.id]} // Can only vote once
                  style={[styles.winnerButton, hasVoted && styles.votedButton]}
                />
              );
            })}
          </View>
          
          {bet.voting.votes[user.id] && (
            <Text style={styles.userVoteStatus}>
              ✅ You voted for {users[bet.voting.votes[user.id]]?.displayName || 'Unknown'}
            </Text>
          )}
        </View>
      )}

      {/* Resolution Section */}
      {canResolve && bet.type !== 'group_winner_takes_all' && (
        <View style={[styles.resolutionSection, showExpiredResolution && styles.resolutionSectionExpired]}>
          <Text style={styles.sectionTitle}>
            {showExpiredResolution ? 'Who Won? (Expired)' : 'Who Won?'}
          </Text>
          <Text style={styles.resolutionHelp}>
            {showExpiredResolution 
              ? 'Since the deadline has passed, please resolve this bet by selecting the winner'
              : 'Tap the winner to resolve this bet'
            }
          </Text>
          
          <View style={styles.winnerButtons}>
            {bet.participantIds.map((participantId) => (
              <Button
                key={participantId}
                title={users[participantId]?.displayName || 'Unknown'}
                onPress={() => handleResolveWinner(participantId)}
                variant="primary"
                fullWidth
                loading={isResolving}
                style={styles.winnerButton}
              />
            ))}
          </View>
        </View>
      )}

      {/* Delete Section - Only show for active bets where user is involved */}
      {user && bet.participantIds.includes(user.id) && (bet.status === 'active' || bet.status === 'pending') && (
        <View style={styles.deleteSection}>
          <Text style={styles.sectionTitle}>🗑️ Delete Bet</Text>
          <Text style={styles.deleteHelp}>
            Only you can delete this bet. This action cannot be undone.
          </Text>
          <Button
            title="Delete Bet"
            onPress={handleDeleteBet}
            variant="danger"
            fullWidth
            style={styles.deleteButton}
          />
        </View>
      )}

      {/* Winner Info for Resolved Bets */}
      {bet.status === 'resolved' && bet.winnerId && (
        <View style={styles.resultSection}>
          <Text style={styles.sectionTitle}>Result</Text>
          <View style={styles.resultCard}>
            <Text style={styles.resultText}>
              {users[bet.participantIds.find(id => id !== bet.winnerId)]?.displayName || 'Loser'} pays{' '}
              {users[bet.winnerId]?.displayName || 'Winner'}
            </Text>
            <Text style={styles.resultStake}>{getStakeDisplay()}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  betId: {
    ...textStyles.caption,
    color: colors.textMuted,
    fontFamily: 'monospace',
  },
  sectionTitle: {
    ...textStyles.h3,
    marginBottom: spacing.md,
    color: '#FFFFFF',
  },
  participantsSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  participantsList: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  participantItem: {
    alignItems: 'center',
    position: 'relative',
  },
  participantName: {
    ...textStyles.body,
    marginTop: spacing.xs,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  winnerBadge: {
    position: 'absolute',
    top: -5,
    right: -10,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  winnerText: {
    ...textStyles.caption,
    color: colors.surface,
    fontSize: 10,
    fontWeight: 'bold',
  },
  detailsSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  detailRow: {
    marginBottom: spacing.md,
  },
  detailLabel: {
    ...textStyles.body,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  detailValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    ...textStyles.body,
    color: '#FFFFFF',
  },
  stakeText: {
    ...textStyles.body,
    color: '#FFFFFF',
    marginLeft: spacing.sm,
  },
  resolutionSection: {
    backgroundColor: colors.primary100,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  resolutionHelp: {
    ...textStyles.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  winnerButtons: {
    gap: spacing.sm,
  },
  winnerButton: {
    marginBottom: spacing.xs,
  },
  resultSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  resultCard: {
    backgroundColor: colors.primary100,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  resultText: {
    ...textStyles.body,
    color: '#000000',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultStake: {
    ...textStyles.h3,
    color: '#000000',
    marginTop: spacing.xs,
  },
  deadlineContainer: {
    flexDirection: 'column',
  },
  timeLeftText: {
    ...textStyles.caption,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  expiredText: {
    color: colors.error,
  },
  expiredSection: {
    backgroundColor: '#FEF3C7',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: '#D97706',
  },
  expiredHelp: {
    ...textStyles.caption,
    color: '#D97706',
    fontWeight: '500',
    marginTop: spacing.xs,
  },
  resolutionSectionExpired: {
    backgroundColor: '#FEE2E2',
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  votingSection: {
    backgroundColor: '#E6F5EE',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: '#059669',
  },
  votingHelp: {
    ...textStyles.caption,
    color: '#059669',
    fontWeight: '500',
    marginBottom: spacing.md,
  },
  votingProgress: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  votingProgressText: {
    ...textStyles.caption,
    color: colors.textMuted,
    textAlign: 'center',
    fontWeight: '600',
  },
  votedButton: {
    backgroundColor: colors.primary,
  },
  userVoteStatus: {
    ...textStyles.caption,
    color: '#059669',
    textAlign: 'center',
    marginTop: spacing.md,
    fontWeight: '600',
  },
  deleteSection: {
    backgroundColor: '#FEE2E2',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  deleteHelp: {
    ...textStyles.caption,
    color: colors.error,
    fontWeight: '500',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  deleteButton: {
    backgroundColor: colors.error,
  },
});
