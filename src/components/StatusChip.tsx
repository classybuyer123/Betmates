// StatusChip component for displaying bet status

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, textStyles, spacing, borderRadius } from '../theme';
import type { BetStatus } from '../types';
import { useTranslation } from '../services/i18n';

export interface StatusChipProps {
  status: BetStatus;
  size?: 'small' | 'medium';
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, size = 'medium' }) => {
  const { t } = useTranslation();

  const getStatusConfig = (betStatus: BetStatus) => {
    switch (betStatus) {
      case 'pending':
        return {
          label: t('betDetail.status.pending'),
          backgroundColor: '#FEF3C7',
          textColor: '#F59E0B',
        };
      case 'active':
        return {
          label: t('betDetail.status.active'),
          backgroundColor: colors.primary,
          textColor: colors.background,
        };
      case 'double_proposed':
        return {
          label: t('betDetail.status.doubleProposed'),
          backgroundColor: '#E6F5EE',
          textColor: colors.secondary,
        };
      case 'resolved':
        return {
          label: `✓ ${t('betDetail.status.resolved')}`,
          backgroundColor: '#000000',
          textColor: '#FFFFFF',
        };
      case 'cancelled':
        return {
          label: t('betDetail.status.cancelled'),
          backgroundColor: '#FEE2E2',
          textColor: colors.error,
        };
      case 'expired':
        return {
          label: t('betDetail.status.expired'),
          backgroundColor: '#FEF3C7',
          textColor: '#D97706',
        };
      default:
        return {
          label: betStatus,
          backgroundColor: colors.border,
          textColor: colors.textMuted,
        };
    }
  };

  const config = getStatusConfig(status);
  const isSmall = size === 'small';

  return (
    <View style={[
      styles.container,
      { backgroundColor: config.backgroundColor },
      isSmall && styles.containerSmall
    ]}>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.lg,
    alignSelf: 'flex-start',
    minWidth: 80,
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  containerSmall: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    minWidth: 70,
  },
  labelSmall: {
    fontSize: 10,
    fontWeight: '600',
  },
});
