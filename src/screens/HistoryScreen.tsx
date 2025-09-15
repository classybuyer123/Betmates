// HistoryScreen - Bet History

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, textStyles, spacing } from '../theme';
import { useTranslation } from '../services/i18n';

export const HistoryScreen: React.FC = () => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={textStyles.h2}>{t('history.title')}</Text>
      <Text style={textStyles.body}>History screen coming soon...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
});
