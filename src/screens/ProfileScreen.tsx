// ProfileScreen - User Profile

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { colors, textStyles, spacing, borderRadius } from '../theme';
import { useTranslation } from '../services/i18n';
import { useAuth } from '../hooks/useAuth';
import { UserAvatar } from '../components/UserAvatar';
import { Button } from '../components/Button';
import { Feather } from '@expo/vector-icons';
import type { RootStackNavigationProp } from '../types';

export const ProfileScreen: React.FC = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<RootStackNavigationProp>();
  const { user, updateProfile, signOut } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileImage, setProfileImage] = useState(user?.photoURL || '');

  const handleSaveProfile = async () => {
    if (!user) return;
    
    if (!displayName.trim()) {
      Alert.alert('Error', 'Display name cannot be empty.');
      return;
    }
    
    try {
      // Update the user in the auth store
      await updateProfile({
        displayName: displayName.trim(),
        email: email.trim(),
        photoURL: profileImage,
      });
      
      Alert.alert('Success', 'Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const handleChangePhoto = async () => {
    try {
      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission required', 'Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await signOut();
              // RootNavigator will automatically show auth screen when isAuthenticated becomes false
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          }
        },
      ]
    );
  };

  if (!user) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={textStyles.body}>Please sign in to view your profile.</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('profile.title')}</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => {
            if (isEditing) {
              // Reset values when cancelling edit
              setDisplayName(user?.displayName || '');
              setEmail(user?.email || '');
              setProfileImage(user?.photoURL || '');
            }
            setIsEditing(!isEditing);
          }}
        >
          <Feather 
            name={isEditing ? 'x' : 'edit-3'} 
            size={24} 
            color={colors.primary} 
          />
        </TouchableOpacity>
      </View>

      {/* Profile Picture Section */}
      <View style={styles.photoSection}>
        <UserAvatar 
          user={profileImage ? {...user, photoURL: profileImage} : user} 
          size={120} 
        />
        {isEditing && (
          <TouchableOpacity 
            style={styles.changePhotoButton}
            onPress={handleChangePhoto}
          >
            <Feather name="camera" size={20} color={colors.surface} />
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Profile Info */}
      <View style={styles.infoSection}>
        <View style={styles.inputSection}>
          <Text style={styles.label}>Display Name *</Text>
          {isEditing ? (
            <TextInput
              style={styles.textInput}
              placeholder="Enter your display name"
              placeholderTextColor={colors.textMuted}
              value={displayName}
              onChangeText={setDisplayName}
            />
          ) : (
            <Text style={styles.value}>{user.displayName || 'Not set'}</Text>
          )}
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.label}>Email</Text>
          {isEditing ? (
            <TextInput
              style={styles.textInput}
              placeholder="Enter your email"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          ) : (
            <Text style={styles.value}>{user.email || 'Not set'}</Text>
          )}
        </View>

        {!isEditing && (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.label}>User ID</Text>
              <Text style={styles.value}>{user.id}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Member Since</Text>
              <Text style={styles.value}>
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
              </Text>
            </View>
          </>
        )}
      </View>

      {/* Stats Section */}
      {user.stats && (
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Betting Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user.stats.total}</Text>
              <Text style={styles.statLabel}>Total Bets</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user.stats.wins}</Text>
              <Text style={styles.statLabel}>Wins</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user.stats.losses}</Text>
              <Text style={styles.statLabel}>Losses</Text>
            </View>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionsSection}>
        {isEditing && (
          <Button
            title="Save Changes"
            onPress={handleSaveProfile}
            variant="primary"
            fullWidth
            style={[styles.saveButton, styles.whiteButton]}
            textStyle={styles.whiteButtonText}
          />
        )}
        
        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="danger"
          fullWidth
          style={[styles.signOutButton, styles.redButton]}
          textStyle={styles.redButtonText}
        />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...textStyles.h2,
    flex: 1,
    marginRight: spacing.sm,
    color: '#FFFFFF',
  },
  editButton: {
    padding: spacing.sm,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
  },
  changePhotoText: {
    color: colors.surface,
    marginLeft: spacing.sm,
  },
  infoSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  inputSection: {
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  textInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...textStyles.body,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  label: {
    ...textStyles.body,
    color: colors.textMuted,
    fontWeight: 'bold',
  },
  value: {
    ...textStyles.body,
    color: colors.textPrimary,
  },
  editableText: {
    ...textStyles.body,
    color: colors.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.xs,
  },
  statsSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...textStyles.h3,
    marginBottom: spacing.sm,
    color: '#FFFFFF',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...textStyles.h4,
    color: colors.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...textStyles.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  actionsSection: {
    marginTop: spacing.md,
  },
  saveButton: {
    marginBottom: spacing.sm,
  },
  whiteButton: {
    backgroundColor: '#6B7280',
  },
  whiteButtonText: {
    color: '#FFFFFF',
  },
  redButton: {
    backgroundColor: '#B91C1C',
  },
  redButtonText: {
    color: '#FFFFFF',
  },
  signOutButton: {
    marginTop: spacing.sm,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
