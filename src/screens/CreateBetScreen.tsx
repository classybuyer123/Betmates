// CreateBetScreen - Create New Bet

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, textStyles, spacing, borderRadius } from '../theme';
import { useTranslation } from '../services/i18n';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/Button';
import { Feather } from '@expo/vector-icons';
import { createBet, getContacts } from '../services/betting';
import { useBettingStore } from '../store/bettingStore';
import { TypeChip, UserAvatar } from '../components';
import type { RootStackNavigationProp, BetType } from '../types';

export const CreateBetScreen: React.FC = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<RootStackNavigationProp>();
  const { user } = useAuth();
  const { addBet, users } = useBettingStore();
  
  const [description, setDescription] = useState('');
  const [wager, setWager] = useState('');
  const [opponentUsername, setOpponentUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [betType, setBetType] = useState<'money' | 'challenge'>('money');
  
  // Duration state
  const [hasDuration, setHasDuration] = useState(false);
  const [durationValue, setDurationValue] = useState('');
  const [durationUnit, setDurationUnit] = useState<'hours' | 'days'>('hours');
  
  const contacts = getContacts();

  // Smart text formatting helpers
  const formatMoneyInput = (text: string) => {
    // Remove any non-numeric characters except decimal point
    const cleanedText = text.replace(/[^0-9.]/g, '');
    const numericValue = parseFloat(cleanedText);
    
    if (isNaN(numericValue)) return '';
    
    // Format as currency without $ sign (we'll add it in display)
    return numericValue.toString();
  };

  const formatTextInput = (text: string) => {
    // Capitalize first letter and basic grammar
    if (!text) return '';
    
    return text
      .toLowerCase()
      .split(' ')
      .map((word, index) => {
        if (index === 0) {
          // Capitalize first word
          return word.charAt(0).toUpperCase() + word.slice(1);
        }
        // Capitalize words after periods
        if (word.includes('.')) {
          return word.split('.').map(part => 
            part.charAt(0).toUpperCase() + part.slice(1)
          ).join('.');
        }
        return word;
      })
      .join(' ');
  };

  const handleWagerChange = (text: string) => {
    if (betType === 'money') {
      setWager(formatMoneyInput(text));
    } else {
      setWager(formatTextInput(text));
    }
  };

  const getWagerDisplay = () => {
    if (betType === 'money' && wager) {
      return `$${wager}`;
    }
    return wager;
  };

  const getWagerForBet = () => {
    if (betType === 'money' && wager) {
      return `$${wager}`;
    }
    return wager;
  };

  const calculateDeadline = () => {
    if (!hasDuration || !durationValue.trim()) {
      return null;
    }
    
    const value = parseInt(durationValue);
    if (isNaN(value) || value <= 0) {
      return null;
    }
    
    const now = Date.now();
    const multiplier = durationUnit === 'hours' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    return now + (value * multiplier);
  };

  const handleCreateBet = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be signed in to create a bet.');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter what the bet is about.');
      return;
    }

    if (!wager.trim()) {
      Alert.alert('Error', 'Please enter the wager amount.');
      return;
    }

    if (!opponentUsername.trim()) {
      Alert.alert('Error', 'Please enter the username of your opponent.');
      return;
    }

    if (hasDuration && durationValue.trim()) {
      const value = parseInt(durationValue);
      if (isNaN(value) || value <= 0) {
        Alert.alert('Error', 'Please enter a valid duration.');
        return;
      }
    }

    setIsLoading(true);

    try {
      const deadline = calculateDeadline();
      const bet = await createBet(user.id, description, getWagerForBet(), opponentUsername, betType, deadline);
      
      // Add the bet to the store
      addBet(bet);
      
      Alert.alert(
        'Bet Created!', 
        `Your bet with ${opponentUsername} has been accepted and is now active!`,
        [
          {
            text: 'View Bet',
            onPress: () => {
              // Reset form and go back to home
              setDescription('');
              setWager('');
              setOpponentUsername('');
              setHasDuration(false);
              setDurationValue('');
              setDurationUnit('hours');
              navigation.navigate('Home');
            }
          }
        ]
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create bet. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (description.trim() || wager.trim() || opponentUsername.trim()) {
      Alert.alert(
        'Cancel Creation',
        'Are you sure you want to cancel? All entered data will be lost.',
        [
          { text: 'Continue Editing', style: 'cancel' },
          { text: 'Cancel', style: 'destructive', onPress: () => navigation.goBack() }
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <ScrollView 
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Create New Bet</Text>
        <Text style={styles.subtitle}>
          Challenge a friend to a bet and see who comes out on top!
        </Text>
      </View>

      {/* Bet Description */}
      <View style={styles.inputSection}>
        <Text style={styles.label}>What's the bet about? *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g., I bet you can't finish the marathon in under 4 hours"
          placeholderTextColor={colors.textMuted}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      {/* Bet Type Selector */}
      <View style={styles.inputSection}>
        <Text style={styles.label}>Bet Type *</Text>
        <View style={styles.typeSelector}>
          {(['money', 'challenge'] as BetType[]).map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.typeOption,
                betType === type && styles.typeOptionActive
              ]}
              onPress={() => {
                setBetType(type);
                setWager(''); // Clear wager when changing type
              }}
            >
              <TypeChip type={type} size="small" />
              <Text style={[
                styles.typeOptionText,
                betType === type && styles.typeOptionTextActive
              ]}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.helperText}>
          {betType === 'money' ? 'Enter amount in dollars' :
           'Describe the challenge (e.g., "Do 20 pushups", "Sing karaoke")'}
        </Text>
      </View>

      {/* Wager Amount */}
      <View style={styles.inputSection}>
        <Text style={styles.label}>
          {betType === 'money' ? 'Amount ($) *' : 'Challenge Description *'}
        </Text>
        <View style={styles.wagerInputContainer}>
          {betType === 'money' && (
            <Text style={styles.currencySymbol}>$</Text>
          )}
          <TextInput
            style={[
              styles.textInput,
              betType === 'money' && styles.textInputWithSymbol
            ]}
            placeholder={
              betType === 'money' ? '50' : 'e.g., Do 50 pushups, Sing karaoke'
            }
            placeholderTextColor={colors.textMuted}
            value={betType === 'money' ? wager : wager}
            onChangeText={handleWagerChange}
            keyboardType={betType === 'money' ? 'numeric' : 'default'}
            autoCapitalize={betType === 'money' ? 'none' : 'sentences'}
          />
        </View>
        {betType === 'money' && wager && (
          <Text style={styles.amountPreview}>
            Amount: {getWagerDisplay()}
          </Text>
        )}
      </View>

      {/* Optional Duration */}
      <View style={styles.inputSection}>
        <View style={styles.durationToggle}>
          <Text style={styles.label}>Set Duration (Optional)</Text>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => {
              setHasDuration(!hasDuration);
              if (!hasDuration) {
                setDurationValue('');
              }
            }}
          >
            <View style={[styles.toggleSwitch, hasDuration && styles.toggleSwitchActive]}>
              <View style={[styles.toggleKnob, hasDuration && styles.toggleKnobActive]} />
            </View>
          </TouchableOpacity>
        </View>
        
        {hasDuration && (
          <View style={styles.durationInputs}>
            <Text style={styles.subLabel}>How long to resolve this bet?</Text>
            <View style={styles.durationRow}>
              <TextInput
                style={[styles.textInput, styles.durationInput]}
                placeholder="1"
                placeholderTextColor={colors.textMuted}
                value={durationValue}
                onChangeText={setDurationValue}
                keyboardType="numeric"
                maxLength={3}
              />
              <View style={styles.unitSelector}>
                <TouchableOpacity
                  style={[
                    styles.unitOption,
                    durationUnit === 'hours' && styles.unitOptionActive
                  ]}
                  onPress={() => setDurationUnit('hours')}
                >
                  <Text style={[
                    styles.unitText,
                    durationUnit === 'hours' && styles.unitTextActive
                  ]}>Hours</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.unitOption,
                    durationUnit === 'days' && styles.unitOptionActive
                  ]}
                  onPress={() => setDurationUnit('days')}
                >
                  <Text style={[
                    styles.unitText,
                    durationUnit === 'days' && styles.unitTextActive
                  ]}>Days</Text>
                </TouchableOpacity>
              </View>
            </View>
            {durationValue && !isNaN(parseInt(durationValue)) && parseInt(durationValue) > 0 && (
              <Text style={styles.durationPreview}>
                Deadline: {new Date(calculateDeadline() || 0).toLocaleDateString()} at {new Date(calculateDeadline() || 0).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            )}
          </View>
        )}
        
        <Text style={styles.helperText}>
          Set an optional deadline for when this bet should be resolved
        </Text>
      </View>

      {/* Opponent Username */}
      <View style={styles.inputSection}>
        <Text style={styles.label}>Opponent Username *</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.textInput, styles.textInputWithButton]}
            placeholder="Enter your friend's username"
            placeholderTextColor={colors.textMuted}
            value={opponentUsername}
            onChangeText={setOpponentUsername}
            autoCapitalize="none"
          />
          <TouchableOpacity 
            style={styles.contactsButton}
            onPress={() => setShowContacts(!showContacts)}
          >
            <Feather name="users" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        {showContacts && (
          <View style={styles.contactsList}>
            <Text style={styles.contactsTitle}>Choose from your contacts:</Text>
            <ScrollView 
              style={styles.contactsScrollView}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={true}
            >
              {contacts.map((contact) => (
                <TouchableOpacity
                  key={contact.id}
                  style={styles.contactItem}
                  onPress={() => {
                    setOpponentUsername(contact.displayName);
                    setShowContacts(false);
                  }}
                >
                  <View style={styles.contactInfo}>
                    <UserAvatar user={contact} size={32} />
                    <View style={styles.contactDetails}>
                      <Text style={styles.contactName}>{contact.displayName}</Text>
                      <Text style={styles.contactStats}>
                        {contact.stats?.total || 0} bets • {contact.stats?.wins || 0} wins
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        
        <Text style={styles.helperText}>
          Tap the contacts icon to choose from your friends
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsSection}>
        <Button
          title="Create Bet"
          onPress={handleCreateBet}
          variant="primary"
          fullWidth
          loading={isLoading}
          style={styles.createButton}
        />
        
        <Button
          title="Cancel"
          onPress={handleCancel}
          variant="tertiary"
          fullWidth
          style={styles.cancelButton}
        />
      </View>

      {/* Info Section */}
      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <Feather name="info" size={16} color={colors.textMuted} />
          <Text style={styles.infoText}>
            Your bet will be sent as a request to your opponent. They'll need to accept it before the bet becomes active.
          </Text>
        </View>
    </View>
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
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...textStyles.h2,
    color: '#FFFFFF', // White text
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...textStyles.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  inputSection: {
    marginBottom: spacing.lg,
  },
  label: {
    ...textStyles.body,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...textStyles.body,
    color: colors.textPrimary,
    minHeight: 48,
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: 4,
    gap: 4,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: 'transparent',
  },
  typeOptionActive: {
    backgroundColor: colors.primary,
  },
  typeOptionText: {
    ...textStyles.caption,
    color: colors.textMuted,
    marginLeft: spacing.xs,
    fontWeight: '600',
  },
  typeOptionTextActive: {
    color: colors.surface,
  },
  wagerInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  currencySymbol: {
    position: 'absolute',
    left: spacing.md,
    zIndex: 1,
    ...textStyles.body,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  textInputWithSymbol: {
    paddingLeft: spacing.xl,
  },
  amountPreview: {
    ...textStyles.caption,
    color: colors.primary,
    marginTop: spacing.xs,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInputWithButton: {
    flex: 1,
    marginRight: spacing.sm,
  },
  contactsButton: {
    backgroundColor: colors.primary100,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  contactsList: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
    maxHeight: 300,
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contactsTitle: {
    ...textStyles.caption,
    color: colors.textMuted,
    padding: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    fontWeight: 'bold',
    backgroundColor: colors.background,
  },
  contactsScrollView: {
    maxHeight: 240,
  },
  contactItem: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactDetails: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  contactName: {
    ...textStyles.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  contactStats: {
    ...textStyles.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  helperText: {
    ...textStyles.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  actionsSection: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  createButton: {
    marginBottom: spacing.sm,
  },
  cancelButton: {
    marginBottom: spacing.sm,
  },
  infoSection: {
    backgroundColor: colors.primary100,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    ...textStyles.caption,
    color: colors.textMuted,
    marginLeft: spacing.sm,
    flex: 1,
    lineHeight: 18,
  },
  durationToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  toggleButton: {
    padding: spacing.xs,
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleSwitchActive: {
    backgroundColor: colors.primary,
  },
  toggleKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surface,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  toggleKnobActive: {
    transform: [{ translateX: 22 }],
  },
  durationInputs: {
    marginTop: spacing.sm,
  },
  subLabel: {
    ...textStyles.caption,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  durationInput: {
    flex: 1,
    textAlign: 'center',
  },
  unitSelector: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  unitOption: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    backgroundColor: 'transparent',
  },
  unitOptionActive: {
    backgroundColor: colors.primary,
  },
  unitText: {
    ...textStyles.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
  unitTextActive: {
    color: colors.surface,
  },
  durationPreview: {
    ...textStyles.caption,
    color: colors.primary,
    marginTop: spacing.sm,
    fontWeight: '600',
    backgroundColor: colors.primary100,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    textAlign: 'center',
  },
});
