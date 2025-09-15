// SettingsScreen - App Settings
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { colors, textStyles, spacing, borderRadius } from '../theme';
import { useTranslation } from '../services/i18n';
import { Button } from '../components/Button';
import type { RootStackNavigationProp } from '../types';

interface SettingItem {
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  rightElement?: React.ReactNode;
}

interface LanguageOption {
  code: string;
  name: string;
  flag: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
];

export const SettingsScreen: React.FC = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<RootStackNavigationProp>();
  
  // Settings state
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [soundsEnabled, setSoundsEnabled] = useState(true);

  const handleLanguageChange = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    // TODO: Implement actual language change
    Alert.alert('Language Changed', `Language set to ${LANGUAGES.find(l => l.code === languageCode)?.name}`);
  };

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
    // TODO: Implement actual theme change
    Alert.alert('Theme Changed', `${!isDarkMode ? 'Dark' : 'Light'} mode enabled`);
  };

  const handleSoundsToggle = () => {
    setSoundsEnabled(!soundsEnabled);
    // TODO: Implement actual sound setting change
    Alert.alert('Sounds', `Sounds ${!soundsEnabled ? 'enabled' : 'disabled'}`);
  };

  const handleQnA = () => {
    Alert.alert(
      'Frequently Asked Questions',
      'Q: How do I create a bet?\nA: Tap the + button on the home screen and follow the steps.\n\nQ: Can I delete a bet?\nA: Yes, go to the bet details and tap the delete button.\n\nQ: How do I invite friends?\nA: Use the friends section to add and invite people to bets.',
      [{ text: 'Got it!' }]
    );
  };

  const handleTutorial = () => {
    Alert.alert(
      'App Tutorial',
      '1. Home: View and manage your active bets\n2. Create: Start new bets with friends\n3. History: Check completed bets\n4. Groups: Join betting groups\n5. Profile: Manage your account\n\nTip: Use the 1v1s filter to see only your personal bets!',
      [{ text: 'Start Exploring!' }]
    );
  };

  const renderSettingItem = ({ icon, title, subtitle, onPress, rightElement }: SettingItem) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <Feather name={icon as any} size={20} color={colors.primary} />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingRight}>
        {rightElement || <Feather name="chevron-right" size={20} color={colors.textMuted} />}
      </View>
    </TouchableOpacity>
  );

  const renderLanguageSelector = () => (
    <View style={styles.languageGrid}>
      {LANGUAGES.map((language) => (
        <TouchableOpacity
          key={language.code}
          style={[
            styles.languageOption,
            selectedLanguage === language.code && styles.languageOptionSelected
          ]}
          onPress={() => handleLanguageChange(language.code)}
          activeOpacity={0.7}
        >
          <Text style={styles.languageFlag}>{language.flag}</Text>
          <Text style={[
            styles.languageName,
            selectedLanguage === language.code && styles.languageNameSelected
          ]}>
            {language.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <ScrollView 
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Language Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌍 Language</Text>
        <Text style={styles.sectionSubtitle}>Choose your preferred language</Text>
        {renderLanguageSelector()}
      </View>

      {/* Appearance Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎨 Appearance</Text>
        {renderSettingItem({
          icon: 'moon',
          title: 'Dark Mode',
          subtitle: isDarkMode ? 'Dark theme enabled' : 'Light theme enabled',
          onPress: handleThemeToggle,
          rightElement: (
            <Switch
              value={isDarkMode}
              onValueChange={handleThemeToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.surface}
            />
          )
        })}
      </View>

      {/* Audio Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔊 Audio</Text>
        {renderSettingItem({
          icon: 'volume-2',
          title: 'Sounds',
          subtitle: soundsEnabled ? 'Sound effects enabled' : 'Sound effects disabled',
          onPress: handleSoundsToggle,
          rightElement: (
            <Switch
              value={soundsEnabled}
              onValueChange={handleSoundsToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.surface}
            />
          )
        })}
      </View>

      {/* Help Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>❓ Help & Support</Text>
        {renderSettingItem({
          icon: 'help-circle',
          title: 'Q&A',
          subtitle: 'Frequently asked questions',
          onPress: handleQnA,
        })}
        {renderSettingItem({
          icon: 'book-open',
          title: 'Tutorial',
          subtitle: 'Learn how to use the app',
          onPress: handleTutorial,
        })}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>BetMates v1.0.0</Text>
        <Text style={styles.footerSubtext}>Built with ❤️ for friendly betting</Text>
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
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingBottom: spacing.lg,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    ...textStyles.h2,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
    marginRight: spacing.lg, // Compensate for back button
  },
  headerSpacer: {
    width: 40, // Same as back button width
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...textStyles.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    ...textStyles.caption,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  settingItem: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    ...textStyles.body,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  settingSubtitle: {
    ...textStyles.caption,
    color: colors.textMuted,
  },
  settingRight: {
    marginLeft: spacing.md,
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  languageOption: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    minWidth: '45%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  languageOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary100,
  },
  languageFlag: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  languageName: {
    ...textStyles.body,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  languageNameSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    ...textStyles.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
  footerSubtext: {
    ...textStyles.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
