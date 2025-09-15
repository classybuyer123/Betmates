// EmptyState component for when there's no content to display

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, textStyles, spacing } from '../theme';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  subtitle?: string;
  icon?: string;
  actionTitle?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  subtitle,
  icon = '📭',
  actionTitle,
  onAction,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[textStyles.h3, styles.title]}>{title}</Text>
      {subtitle && (
        <Text style={[textStyles.body, styles.subtitle]}>{subtitle}</Text>
      )}
      {actionTitle && onAction && (
        <Button
          title={actionTitle}
          onPress={onAction}
          variant="secondary"
          style={styles.action}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  icon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  action: {
    minWidth: 160,
  },
});
