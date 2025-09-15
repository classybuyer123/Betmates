// GroupChatScreen - Chat interface for group betting
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { colors, textStyles, spacing, borderRadius } from '../theme';
import { useAuth } from '../hooks/useAuth';
import { useGroupStore, GroupMessage } from '../store/groupStore';
import { useBettingStore } from '../store/bettingStore';
import { UserAvatar, Button, TypeChip } from '../components';
import { createGroupBet, acceptGroupBet, formatGroupBetMessage } from '../services/groups';
import type { RootStackParamList, Group, Bet, BetType } from '../types';

type GroupChatRouteProp = RouteProp<RootStackParamList, 'GroupChat'>;

export const GroupChatScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<GroupChatRouteProp>();
  const { groupId } = route.params;
  const { user } = useAuth();
  const { groups, getGroupMessages, addMessage } = useGroupStore();
  const { users, bets, addBet, updateBet, startVoting } = useBettingStore();
  
  const [messageText, setMessageText] = useState('');
  const [showCreateBet, setShowCreateBet] = useState(false);
  const [betDescription, setBetDescription] = useState('');
  const [betWager, setBetWager] = useState('');
  const [betType, setBetType] = useState<BetType>('group_winner_takes_all');
  const [subBetType, setSubBetType] = useState<'money' | 'challenge'>('money'); // For individual group bets
  const [selectedOpponent, setSelectedOpponent] = useState<string>('');
  const [isCreatingBet, setIsCreatingBet] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);
  
  const group = groups.find(g => g.id === groupId);
  const messages = getGroupMessages(groupId);
  const groupBets = bets.filter(bet => bet.groupId === groupId);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const sendMessage = () => {
    if (!messageText.trim() || !user) return;
    
    const newMessage: GroupMessage = {
      id: `msg-${Date.now()}`,
      groupId,
      senderId: user.id,
      type: 'text',
      content: messageText.trim(),
      createdAt: Date.now()
    };
    
    addMessage(newMessage);
    setMessageText('');
  };

  const createBet = async () => {
    if (!betDescription.trim() || !betWager.trim() || !user) return;
    
    // Validation for individual group bet
    if (betType === 'individual_group_bet' && !selectedOpponent) {
      Alert.alert('Error', 'Please select an opponent for the individual bet.');
      return;
    }
    
    setIsCreatingBet(true);
    
    try {
      // Prepare individual participants if needed
      const individualParticipants = betType === 'individual_group_bet' && selectedOpponent
        ? [user.id, selectedOpponent] as [string, string]
        : undefined;
      
      // For individual group bets, use the sub bet type for actual bet creation
      const actualBetType = betType === 'individual_group_bet' ? subBetType : betType;
      
      // Create the bet
      const newBet = await createGroupBet(
        groupId,
        user.id,
        betDescription.trim(),
        betType,
        betWager.trim(),
        individualParticipants,
        betType === 'individual_group_bet' ? subBetType : undefined
      );
      
      addBet(newBet);
      
      // Add message about bet creation
      const betMessage: GroupMessage = {
        id: `msg-${Date.now()}`,
        groupId,
        senderId: user.id,
        type: 'bet_created',
        betId: newBet.id,
        createdAt: Date.now()
      };
      
      addMessage(betMessage);
      
      // Reset form
      setBetDescription('');
      setBetWager('');
      setBetType('group_winner_takes_all');
      setSubBetType('money');
      setSelectedOpponent('');
      setShowCreateBet(false);
      
      Alert.alert('Success', 'Your bet has been shared with the group!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create bet. Please try again.');
    } finally {
      setIsCreatingBet(false);
    }
  };

  const joinBet = (bet: Bet) => {
    if (!user) return;
    
    const updatedBet = acceptGroupBet(bet, user.id);
    updateBet(bet.id, updatedBet);
    
    // Add message about joining bet
    const joinMessage: GroupMessage = {
      id: `msg-${Date.now()}`,
      groupId,
      senderId: user.id,
      type: 'bet_accepted',
      betId: bet.id,
      createdAt: Date.now()
    };
    
    addMessage(joinMessage);
  };
  
  const startBetVoting = (bet: Bet) => {
    if (!group) return;
    startVoting(bet.id, group.memberIds);
    
    const votingMessage: GroupMessage = {
      id: `msg-${Date.now()}`,
      groupId,
      senderId: 'system',
      type: 'text',
      content: '🗳️ Voting has started! Tap the bet to vote for the winner.',
      createdAt: Date.now()
    };
    
    addMessage(votingMessage);
  };

  const formatMoneyInput = (text: string): string => {
    const numbers = text.replace(/[^0-9]/g, '');
    return numbers ? `$${numbers}` : '';
  };

  const renderMessage = ({ item: message }: { item: GroupMessage }) => {
    const sender = users[message.senderId];
    const isOwnMessage = message.senderId === user?.id;
    
    if (message.type === 'bet_created' || message.type === 'bet_accepted') {
      const bet = groupBets.find(b => b.id === message.betId);
      if (!bet) return null;
      
      return (
        <View style={styles.betMessageContainer}>
          <View style={styles.betCard}>
            <View style={styles.betHeader}>
              <TypeChip type={bet.type} size="small" />
              <Text style={styles.betTimestamp}>
                {formatDistanceToNow(message.createdAt, { addSuffix: true })}
              </Text>
            </View>
            
            <Text style={styles.betDescription}>{bet.description}</Text>
            
            <View style={styles.betStake}>
              <Text style={styles.betStakeLabel}>Stake:</Text>
              <Text style={styles.betStakeValue}>
                {bet.type === 'money' ? `$${bet.stakeMoney}` : bet.stakeText}
              </Text>
            </View>
            
            <View style={styles.betParticipants}>
              <Text style={styles.participantsLabel}>
                {bet.participantIds.length} {bet.participantIds.length === 1 ? 'participant' : 'participants'}
              </Text>
              <View style={styles.participantAvatars}>
                {bet.participantIds.slice(0, 4).map(participantId => {
                  const participant = users[participantId];
                  return participant ? (
                    <UserAvatar key={participantId} user={participant} size={24} />
                  ) : null;
                })}
              </View>
            </View>
            
            {/* Join bet button for group winner-takes-all */}
            {bet.status === 'pending' && bet.type === 'group_winner_takes_all' && user && !bet.participantIds.includes(user.id) && (
              <Button
                title="Join Bet"
                variant="primary"
                size="small"
                onPress={() => joinBet(bet)}
                style={styles.joinButton}
              />
            )}
            
            {/* Start voting button for group winner-takes-all */}
            {bet.status === 'active' && bet.type === 'group_winner_takes_all' && !bet.voting?.isActive && (
              <Button
                title="Start Voting"
                variant="secondary"
                size="small"
                onPress={() => startBetVoting(bet)}
                style={styles.joinButton}
              />
            )}
            
            {/* Show voting status */}
            {bet.voting?.isActive && (
              <Text style={styles.betStatus}>
                🗳️ Voting in progress ({Object.keys(bet.voting.votes).length}/{bet.voting.requiredVotes} votes needed)
              </Text>
            )}
            
            {bet.status === 'active' && !bet.voting?.isActive && bet.type !== 'group_winner_takes_all' && (
              <Text style={styles.betStatus}>Active • Tap for details</Text>
            )}
          </View>
        </View>
      );
    }
    
    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer
      ]}>
        {!isOwnMessage && (
          <UserAvatar user={sender || { id: '', displayName: 'Unknown' } as any} size={32} />
        )}
        
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble
        ]}>
          {!isOwnMessage && (
            <Text style={styles.senderName}>{sender?.displayName || 'Unknown'}</Text>
          )}
          <Text style={[
            styles.messageText,
            isOwnMessage ? styles.ownMessageText : styles.otherMessageText
          ]}>
            {message.content}
          </Text>
          <Text style={[
            styles.messageTime,
            isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime
          ]}>
            {formatDistanceToNow(message.createdAt, { addSuffix: true })}
          </Text>
        </View>
      </View>
    );
  };

  if (!group || !user) {
    return (
      <View style={styles.centerContainer}>
        <Text style={textStyles.body}>Group not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={insets.top}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.groupTitle}>{group.name}</Text>
          <Text style={styles.memberCount}>{group.memberIds.length} members</Text>
        </View>
        <TouchableOpacity>
          <Feather name="more-vertical" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
      />

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TouchableOpacity 
          style={styles.betButton}
          onPress={() => setShowCreateBet(true)}
        >
          <Feather name="target" size={20} color={colors.primary} />
        </TouchableOpacity>
        
        <TextInput
          style={styles.messageInput}
          placeholder="Type a message..."
          placeholderTextColor={colors.textMuted}
          value={messageText}
          onChangeText={setMessageText}
          multiline
          maxLength={500}
        />
        
        <TouchableOpacity 
          style={[styles.sendButton, !messageText.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!messageText.trim()}
        >
          <Feather name="send" size={20} color={messageText.trim() ? colors.primary : colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Create Bet Modal */}
      <Modal
        visible={showCreateBet}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateBet(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Group Bet</Text>
            <TouchableOpacity 
              onPress={createBet} 
              disabled={!betDescription.trim() || !betWager.trim() || isCreatingBet}
            >
              <Text style={[
                styles.createButton,
                (!betDescription.trim() || !betWager.trim()) && styles.createButtonDisabled
              ]}>
                {isCreatingBet ? 'Creating...' : 'Create'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputSection}>
              <Text style={styles.label}>What's the bet about?</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., Who can get the most Instagram likes?"
                placeholderTextColor={colors.textMuted}
                value={betDescription}
                onChangeText={setBetDescription}
                multiline
                maxLength={200}
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.label}>Bet Type</Text>
              <View style={styles.typeGrid}>
                <TouchableOpacity
                  style={[styles.typeOption, betType === 'group_winner_takes_all' && styles.typeOptionActive]}
                  onPress={() => setBetType('group_winner_takes_all')}
                >
                  <Feather name="award" size={20} color={betType === 'group_winner_takes_all' ? colors.background : colors.primary} />
                  <Text style={[styles.typeOptionText, betType === 'group_winner_takes_all' && styles.typeOptionTextActive]}>
                    Winner Takes All
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeOption, betType === 'individual_group_bet' && styles.typeOptionActive]}
                  onPress={() => setBetType('individual_group_bet')}
                >
                  <Feather name="users" size={20} color={betType === 'individual_group_bet' ? colors.background : colors.primary} />
                  <Text style={[styles.typeOptionText, betType === 'individual_group_bet' && styles.typeOptionTextActive]}>
                    1v1 in Group
                  </Text>
                </TouchableOpacity>
              </View>
              
              {/* Bet type descriptions */}
              <Text style={styles.typeDescription}>
                {betType === 'group_winner_takes_all' && 'Everyone pays same amount, winner takes all (decided by group vote)'}
                {betType === 'individual_group_bet' && 'Two people bet against each other, visible to all group members'}
              </Text>
            </View>

            {/* Sub-type selection for individual group bets */}
            {betType === 'individual_group_bet' && (
              <View style={styles.inputSection}>
                <Text style={styles.label}>Bet Style</Text>
                <View style={styles.typeGrid}>
                  <TouchableOpacity
                    style={[styles.typeOption, subBetType === 'money' && styles.typeOptionActive]}
                    onPress={() => setSubBetType('money')}
                  >
                    <Feather name="dollar-sign" size={20} color={subBetType === 'money' ? colors.background : colors.primary} />
                    <Text style={[styles.typeOptionText, subBetType === 'money' && styles.typeOptionTextActive]}>
                      Money
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.typeOption, subBetType === 'challenge' && styles.typeOptionActive]}
                    onPress={() => setSubBetType('challenge')}
                  >
                    <Feather name="zap" size={20} color={subBetType === 'challenge' ? colors.background : colors.primary} />
                    <Text style={[styles.typeOptionText, subBetType === 'challenge' && styles.typeOptionTextActive]}>
                      Challenge
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.typeDescription}>
                  {subBetType === 'money' && 'Loser pays winner money'}
                  {subBetType === 'challenge' && 'Loser performs a challenge/favor'}
                </Text>
              </View>
            )}

            {/* Opponent selection for individual group bets */}
            {betType === 'individual_group_bet' && (
              <View style={styles.inputSection}>
                <Text style={styles.label}>Select Opponent</Text>
                <View style={styles.opponentSelector}>
                  {group?.memberIds.filter(id => id !== user?.id).map(memberId => {
                    const member = users[memberId];
                    if (!member) return null;
                    
                    return (
                      <TouchableOpacity
                        key={memberId}
                        style={[
                          styles.opponentOption,
                          selectedOpponent === memberId && styles.opponentOptionActive
                        ]}
                        onPress={() => setSelectedOpponent(memberId)}
                      >
                        <UserAvatar user={member} size={32} />
                        <Text style={[
                          styles.opponentName,
                          selectedOpponent === memberId && styles.opponentNameActive
                        ]}>
                          {member.displayName}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
            
            <View style={styles.inputSection}>
              <Text style={styles.label}>
                {betType === 'group_winner_takes_all' ? 'Amount per person' : 
                 betType === 'individual_group_bet' && subBetType === 'money' ? 'Amount' :
                 'What does the loser have to do?'}
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder={
                  betType === 'group_winner_takes_all' ? '10' :
                  betType === 'individual_group_bet' && subBetType === 'money' ? '25' :
                  'Buy drinks for everyone'
                }
                placeholderTextColor={colors.textMuted}
                value={betWager}
                onChangeText={(betType === 'group_winner_takes_all' || (betType === 'individual_group_bet' && subBetType === 'money')) ? 
                  (text) => setBetWager(formatMoneyInput(text)) : 
                  setBetWager
                }
                keyboardType={(betType === 'group_winner_takes_all' || (betType === 'individual_group_bet' && subBetType === 'money')) ? 'numeric' : 'default'}
              />
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  groupTitle: {
    ...textStyles.h3,
    color: colors.textPrimary,
  },
  memberCount: {
    ...textStyles.caption,
    color: colors.textMuted,
  },
  messagesList: {
    padding: spacing.md,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: spacing.xs,
    alignItems: 'flex-end',
  },
  ownMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.sm,
  },
  ownMessageBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
  },
  senderName: {
    ...textStyles.caption,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  messageText: {
    ...textStyles.body,
  },
  ownMessageText: {
    color: colors.background,
  },
  otherMessageText: {
    color: colors.textPrimary,
  },
  messageTime: {
    ...textStyles.small,
    marginTop: spacing.xs,
  },
  ownMessageTime: {
    color: colors.background,
    opacity: 0.8,
  },
  otherMessageTime: {
    color: colors.textMuted,
  },
  betMessageContainer: {
    marginVertical: spacing.sm,
  },
  betCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary,
    borderLeftWidth: 4,
  },
  betHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  betTimestamp: {
    ...textStyles.caption,
    color: colors.textMuted,
  },
  betDescription: {
    ...textStyles.body,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  betStake: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  betStakeLabel: {
    ...textStyles.caption,
    color: colors.textMuted,
    marginRight: spacing.sm,
  },
  betStakeValue: {
    ...textStyles.body,
    color: colors.primary,
    fontWeight: '600',
  },
  betParticipants: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  participantsLabel: {
    ...textStyles.caption,
    color: colors.textMuted,
  },
  participantAvatars: {
    flexDirection: 'row',
    marginLeft: spacing.sm,
  },
  joinButton: {
    marginTop: spacing.sm,
  },
  betStatus: {
    ...textStyles.caption,
    color: colors.primary,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  betButton: {
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxHeight: 100,
    ...textStyles.body,
    color: colors.textPrimary,
  },
  sendButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...textStyles.h3,
    color: colors.textPrimary,
  },
  cancelButton: {
    ...textStyles.body,
    color: colors.textMuted,
  },
  createButton: {
    ...textStyles.body,
    color: colors.primary,
    fontWeight: '600',
  },
  createButtonDisabled: {
    color: colors.textMuted,
  },
  modalContent: {
    flex: 1,
    padding: spacing.lg,
  },
  inputSection: {
    marginBottom: spacing.lg,
  },
  label: {
    ...textStyles.body,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...textStyles.body,
    color: colors.textPrimary,
    minHeight: 44,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  typeOption: {
    minWidth: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
  },
  typeOptionActive: {
    backgroundColor: colors.primary,
  },
  typeOptionText: {
    ...textStyles.body,
    color: colors.primary,
    marginLeft: spacing.sm,
    fontWeight: '600',
  },
  typeOptionTextActive: {
    color: colors.background,
  },
  typeDescription: {
    ...textStyles.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  opponentSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  opponentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    minWidth: '48%',
  },
  opponentOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary100,
  },
  opponentName: {
    ...textStyles.caption,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
    fontWeight: '600',
  },
  opponentNameActive: {
    color: colors.primary,
  },
});
