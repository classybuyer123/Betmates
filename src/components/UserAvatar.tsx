// UserAvatar component

import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { colors, textStyles } from '../theme';
import type { User } from '../types';

export interface UserAvatarProps {
  user: User | null;
  size?: number;
  showName?: boolean;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ 
  user, 
  size = 40, 
  showName = false 
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const avatarStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const fallbackStyle = {
    ...avatarStyle,
    backgroundColor: colors.primary100,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  };

  const textSize = size < 32 ? 10 : size < 48 ? 12 : 14;

  if (!user) {
    return (
      <View style={[styles.container, showName && styles.containerWithName]}>
        <View style={[fallbackStyle, styles.fallback]}>
          <Text style={[textStyles.caption, { fontSize: textSize, color: colors.background }]}>
            ?
          </Text>
        </View>
        {showName && (
          <Text style={[textStyles.caption, styles.name]} numberOfLines={1}>
            Unknown
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, showName && styles.containerWithName]}>
      {user.photoURL ? (
        <Image 
          source={{ uri: user.photoURL }} 
          style={avatarStyle}
          defaultSource={require('../../assets/icon.png')}
        />
      ) : (
        <View style={fallbackStyle}>
          <Text style={[textStyles.caption, { fontSize: textSize, color: colors.background }]}>
            {getInitials(user.displayName || 'Unknown')}
          </Text>
        </View>
      )}
      {showName && (
        <Text style={[textStyles.caption, styles.name]} numberOfLines={1}>
          {user.displayName || 'Unknown'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  containerWithName: {
    maxWidth: 60,
  },
  fallback: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  name: {
    marginTop: 4,
    textAlign: 'center',
    color: colors.textMuted,
  },
});
