// GroupsScreen - Groups List

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { colors, textStyles, spacing, borderRadius } from '../theme';
import { useTranslation } from '../services/i18n';
import { useAuth } from '../hooks/useAuth';
import { useGroupStore } from '../store/groupStore';
import { useBettingStore } from '../store/bettingStore';
import { UserAvatar } from '../components';
import type { Group } from '../types';
import type { RootStackNavigationProp } from '../types';

export const GroupsScreen: React.FC = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<RootStackNavigationProp>();
  const { user } = useAuth();
  const { groups, initializeSampleGroups } = useGroupStore();
  const { users } = useBettingStore();

  // Initialize sample groups
  useEffect(() => {
    if (user) {
      initializeSampleGroups(user.id);
    }
  }, [user, initializeSampleGroups]);

  const renderGroupItem = ({ item: group }: { item: Group }) => {
    const memberAvatars = group.memberIds.slice(0, 3).map(id => users[id]).filter(Boolean);
    const extraMembersCount = Math.max(0, group.memberIds.length - 3);

    return (
      <TouchableOpacity
        style={styles.groupCard}
        onPress={() => navigation.navigate('GroupChat', { groupId: group.id })}
      >
        <View style={styles.groupHeader}>
          <Text style={styles.groupName}>{group.name}</Text>
          <View style={styles.memberCount}>
            <Feather name="users" size={14} color={colors.textMuted} />
            <Text style={styles.memberCountText}>{group.memberIds.length}</Text>
          </View>
        </View>
        
        <View style={styles.groupMembers}>
          <View style={styles.avatarStack}>
            {memberAvatars.map((member, index) => (
              <View key={member.id} style={[styles.avatar, { zIndex: memberAvatars.length - index }]}>
                <UserAvatar user={member} size={24} />
              </View>
            ))}
            {extraMembersCount > 0 && (
              <View style={[styles.avatar, styles.extraMembersAvatar, { zIndex: 0 }]}>
                <Text style={styles.extraMembersText}>+{extraMembersCount}</Text>
              </View>
            )}
          </View>
          <Text style={styles.memberNames}>
            {memberAvatars.map(member => member.displayName).join(', ')}
            {extraMembersCount > 0 && ` +${extraMembersCount} more`}
          </Text>
        </View>

        <View style={styles.groupStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{group.activeBets || 0}</Text>
            <Text style={styles.statLabel}>Active Bets</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{group.totalBets || 0}</Text>
            <Text style={styles.statLabel}>Total Bets</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Feather name="users" size={48} color={colors.textMuted} />
      <Text style={styles.emptyTitle}>No Groups Yet</Text>
      <Text style={styles.emptySubtitle}>
        Create or join groups to start group betting with friends!
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft} />
        <Text style={styles.title}>Groups</Text>
        <TouchableOpacity style={styles.addButton}>
          <Feather name="plus" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={renderGroupItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerLeft: {
    width: 40, // Same width as addButton to balance the layout
  },
  title: {
    ...textStyles.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    flex: 1,
  },
  addButton: {
    padding: spacing.xs,
    width: 40,
    alignItems: 'center',
  },
  listContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  groupCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  groupName: {
    ...textStyles.h3,
    color: colors.textPrimary,
    flex: 1,
  },
  memberCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  memberCountText: {
    ...textStyles.caption,
    color: colors.textMuted,
  },
  groupMembers: {
    marginBottom: spacing.md,
  },
  avatarStack: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  avatar: {
    marginLeft: -8,
    borderWidth: 2,
    borderColor: colors.background,
    borderRadius: 12,
  },
  extraMembersAvatar: {
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    width: 24,
    height: 24,
  },
  extraMembersText: {
    ...textStyles.small,
    color: colors.textMuted,
    fontWeight: '600',
  },
  memberNames: {
    ...textStyles.caption,
    color: colors.textMuted,
    marginLeft: spacing.xs,
  },
  groupStats: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...textStyles.h3,
    color: colors.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...textStyles.caption,
    color: colors.textMuted,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyTitle: {
    ...textStyles.h3,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...textStyles.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
});