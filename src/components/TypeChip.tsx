// TypeChip component for displaying bet types

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, textStyles, spacing, borderRadius } from '../theme';
import type { BetType } from '../types';

export interface TypeChipProps {
  type: BetType;
  size?: 'small' | 'medium';
}

export const TypeChip: React.FC<TypeChipProps> = ({ type, size = 'medium' }) => {
  const getTypeConfig = (betType: BetType) => {
    switch (betType) {
      case 'money':
        return {
          icon: '💵',
          label: 'Money',
          backgroundColor: colors.primary100,
          textColor: colors.primary,
        };
      case 'challenge':
        return {
          icon: '🎭',
          label: 'Challenge',
          backgroundColor: '#FEF3C7',
          textColor: '#F59E0B',
        };
      case 'group_winner_takes_all':
        return {
          icon: '🏆',
          label: 'Winner Takes All',
          backgroundColor: '#E6F5EE',
          textColor: '#059669',
        };
      case 'individual_group_bet':
        return {
          icon: '👥',
          label: 'Group 1v1',
          backgroundColor: '#E0E7FF',
          textColor: '#4F46E5',
        };
      default:
        return {
          icon: '❓',
          label: 'Unknown',
          backgroundColor: colors.border,
          textColor: colors.textMuted,
        };
    }
  };

  const config = getTypeConfig(type);
  const isSmall = size === 'small';

  return (
    <View style={[
      styles.container,
      { backgroundColor: config.backgroundColor },
      isSmall && styles.containerSmall
    ]}>
      <Text style={[
        styles.icon,
        isSmall && styles.iconSmall
      ]}>
        {config.icon}
      </Text>
      <Text style={[
        textStyles.caption,
        { color: config.textColor },
        isSmall && styles.labelSmall
      ]}>
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  containerSmall: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  icon: {
    fontSize: 12,
    marginRight: 4,
  },
  iconSmall: {
    fontSize: 10,
    marginRight: 2,
  },
  labelSmall: {
    fontSize: 10,
  },
});
