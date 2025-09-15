// FriendsScreen - Manage Friends
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  Modal,
  ScrollView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { colors, textStyles, spacing, borderRadius } from '../theme';
import { useAuth } from '../hooks/useAuth';
import { useBettingStore } from '../store/bettingStore';
import { UserAvatar, Button } from '../components';
import { MOCK_CONTACTS } from '../services/betting';
import type { User, RootStackNavigationProp } from '../types';

export const FriendsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<RootStackNavigationProp>();
  const { user } = useAuth();
  const { users } = useBettingStore();
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Get all friends (mock contacts for now)
  const friends = MOCK_CONTACTS;
  const friendsCount = friends.length;

  // Filter friends based on search
  const filteredFriends = friends.filter(friend =>
    friend.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddFriend = () => {
    setShowAddFriend(true);
  };



  const renderFriendItem = ({ item: friend }: { item: User }) => (
    <View style={styles.friendItem}>
      <UserAvatar user={friend} size={50} />
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{friend.displayName}</Text>
        <Text style={styles.friendStats}>
          {friend.stats?.total || 0} bets • {friend.stats?.wins || 0} wins • {friend.stats?.losses || 0} losses
        </Text>
      </View>

    </View>
  );

  if (!user) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={textStyles.body}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Friends</Text>
          <Text style={styles.friendsCount}>{friendsCount} friends</Text>
        </View>
        <TouchableOpacity onPress={handleAddFriend}>
          <Feather name="user-plus" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search friends..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Button
          title="Add Friend"
          onPress={handleAddFriend}
          variant="primary"
          fullWidth
          icon={<Feather name="user-plus" size={20} color={colors.surface} />}
        />
      </View>

      {/* Friends List */}
      <FlatList
        data={filteredFriends}
        keyExtractor={(item) => item.id}
        renderItem={renderFriendItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="users" size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No Friends Found</Text>
            <Text style={styles.emptyDescription}>
              {searchQuery ? 'Try a different search term' : 'Add some friends to start betting!'}
            </Text>
          </View>
        }
      />

      {/* Add Friend Modal */}
      <Modal
        visible={showAddFriend}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddFriend(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Friend</Text>
            <TouchableOpacity onPress={() => setShowAddFriend(false)}>
              <Text style={styles.doneButton}>Done</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.addMethodSection}>
              <Text style={styles.sectionTitle}>Add by Username</Text>
              <View style={styles.usernameSection}>
                <TextInput
                  style={styles.usernameInput}
                  placeholder="Enter username..."
                  placeholderTextColor={colors.textMuted}
                />
                <Button
                  title="Add"
                  variant="primary"
                  size="small"
                  onPress={() => Alert.alert('Coming Soon', 'Friend adding functionality will be implemented soon!')}
                />
              </View>
            </View>

            <View style={styles.addMethodSection}>
              <Text style={styles.sectionTitle}>Invite via Link</Text>
              <Button
                title="Share Invite Link"
                variant="secondary"
                fullWidth
                icon={<Feather name="share-2" size={20} color={colors.primary} />}
                onPress={() => Alert.alert('Coming Soon', 'Invite link sharing will be implemented soon!')}
              />
            </View>

            <View style={styles.addMethodSection}>
              <Text style={styles.sectionTitle}>Find Contacts</Text>
              <Button
                title="Sync Contacts"
                variant="tertiary"
                fullWidth
                icon={<Feather name="smartphone" size={20} color={colors.textMuted} />}
                onPress={() => Alert.alert('Coming Soon', 'Contact syncing will be implemented soon!')}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    ...textStyles.h2,
    color: colors.textPrimary,
  },
  friendsCount: {
    ...textStyles.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  searchSection: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    ...textStyles.body,
    color: colors.textPrimary,
  },
  actionButtons: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  listContainer: {
    padding: spacing.lg,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  friendInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  friendName: {
    ...textStyles.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  friendStats: {
    ...textStyles.caption,
    color: colors.textMuted,
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyTitle: {
    ...textStyles.h3,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyDescription: {
    ...textStyles.body,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 280,
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
    backgroundColor: colors.surface,
  },
  modalTitle: {
    ...textStyles.h3,
    color: colors.textPrimary,
  },
  cancelButton: {
    ...textStyles.body,
    color: colors.textMuted,
  },
  doneButton: {
    ...textStyles.body,
    color: colors.primary,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: spacing.lg,
  },
  addMethodSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...textStyles.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  usernameSection: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-end',
  },
  usernameInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...textStyles.body,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
});
