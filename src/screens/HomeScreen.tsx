// HomeScreen - Active Bets

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { RootStackNavigationProp } from '../types';
import { Feather } from '@expo/vector-icons';
import { colors, textStyles, spacing, borderRadius } from '../theme';
import { BetCard, EmptyState, Button } from '../components';
import { useTranslation } from '../services/i18n';
import { useAuth } from '../hooks/useAuth';
import { useUIStore } from '../store/uiStore';
import { useBettingStore } from '../store/bettingStore';
import type { Bet, User } from '../types';
import { UserAvatar } from '../components/UserAvatar';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { betFilter, setBetFilter, unreadNotifications } = useUIStore();
  const { 
    bets, 
    users, 
    initializeSampleData, 
    getBetsByStatus, 
    resolveBet,
    deleteBet,
    addBet,
    updateUser 
  } = useBettingStore();

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [betCategory, setBetCategory] = useState<'active' | 'completed'>('active');

  // Initialize sample data on first load
  useEffect(() => {
    if (user) {
      initializeSampleData(user.id, user);
      setIsLoading(false);
    }
  }, [user, initializeSampleData]);

  // Update user in betting store when profile changes
  useEffect(() => {
    if (user) {
      updateUser(user);
    }
  }, [user, updateUser]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // TODO: Implement refresh logic
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleBetPress = (betId: string) => {
    navigation.navigate('BetDetail', { betId });
  };


  const handleNotificationsPress = () => {
    navigation.navigate('Notifications');
  };

  // Get bets based on category
  const categoryBets = betCategory === 'active' 
    ? [...getBetsByStatus('active'), ...getBetsByStatus('expired')]
    : getBetsByStatus('resolved');

  const filteredBets = categoryBets.filter(bet => {
    // Apply search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      return (
        bet.description.toLowerCase().includes(searchLower) ||
        bet.participantIds.some(id => 
          users[id]?.displayName?.toLowerCase().includes(searchLower)
        )
      );
    }
    
    // Apply bet filter
    switch (betFilter) {
      case 'mine':
        // Show only 1v1 bets (exactly 2 participants) where current user is involved
        return user ? 
          (bet.participantIds.length === 2 && bet.participantIds.includes(user.id)) : 
          false;
      case 'group':
        return !!bet.groupId;
      default:
        return true;
    }
  }).sort((a, b) => {
    // Sort by creation date in descending order (newest first)
    return b.createdAt - a.createdAt;
  });

  const renderBetCard = ({ item }: { item: Bet }) => (
    <BetCard
      bet={item}
      users={users}
      onPress={() => handleBetPress(item.id)}
      currentUserId={user?.id}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Title and Profile Section */}
      <View style={styles.titleSection}>
        <Text style={styles.title}>BetMates</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings')}
            activeOpacity={0.8}
          >
            <Feather name="settings" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.createBetButton}
            onPress={() => navigation.navigate('Friends')}
            activeOpacity={0.8}
          >
            <Feather name="users" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.8}
          >
            <UserAvatar user={user} size={40} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('common.search')}
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={handleNotificationsPress}
        >
          <Feather name="bell" size={24} color={colors.textPrimary} />
          {unreadNotifications > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>
                {unreadNotifications > 99 ? '99+' : unreadNotifications}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Category Tabs */}
      <View style={styles.categoryContainer}>
        <TouchableOpacity
          style={[
            styles.categoryTab,
            betCategory === 'active' && styles.categoryTabActive
          ]}
          onPress={() => setBetCategory('active')}
        >
          <Text style={[
            styles.categoryTabText,
            betCategory === 'active' && styles.categoryTabTextActive
          ]}>
            Active Bets ({getBetsByStatus('active').length + getBetsByStatus('expired').length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.categoryTab,
            betCategory === 'completed' && styles.categoryTabActive
          ]}
          onPress={() => setBetCategory('completed')}
        >
          <Text style={[
            styles.categoryTabText,
            betCategory === 'completed' && styles.categoryTabTextActive
          ]}>
            Completed Bets ({getBetsByStatus('resolved').length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      <View style={styles.filterContainer}>
        {(['all', 'mine', 'group'] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterChip,
              betFilter === filter && styles.filterChipActive
            ]}
            onPress={() => setBetFilter(filter)}
          >
            <Text style={[
              styles.filterChipText,
              betFilter === filter && styles.filterChipTextActive
            ]}>
              {t(`home.filters.${filter}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <EmptyState
      title={t('home.emptyState')}
      subtitle={t('create.title')}
      icon="🎯"
      actionTitle="Manage Friends"
      onAction={() => navigation.navigate('Friends')}
    />
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={textStyles.body}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        data={filteredBets}
        renderItem={renderBetCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={[
          styles.listContent,
          filteredBets.length === 0 && styles.listContentEmpty
        ]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingTop: 47, // Moved up by 2% more (48 - 1 = 47)
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...textStyles.h1,
    color: '#FFFFFF', // White text
    fontWeight: 'bold',
    fontSize: 33.6, // 20% bigger than h1 (28 * 1.2 = 33.6)
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  settingsButton: {
    padding: spacing.xs,
  },
  createBetButton: {
    padding: spacing.xs,
  },
  profileButton: {
    padding: spacing.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...textStyles.body,
    paddingVertical: spacing.md,
    color: colors.textPrimary,
  },
  notificationButton: {
    padding: spacing.xs,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: colors.surface,
    fontSize: 10,
    fontWeight: 'bold',
  },
  categoryContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: 4,
    marginBottom: spacing.md,
  },
  categoryTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  categoryTabActive: {
    backgroundColor: colors.primary,
  },
  categoryTabText: {
    ...textStyles.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
  categoryTabTextActive: {
    color: colors.background,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    ...textStyles.caption,
    color: colors.textMuted,
  },
  filterChipTextActive: {
    color: colors.background,
  },
  listContent: {
    paddingVertical: spacing.sm,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
});