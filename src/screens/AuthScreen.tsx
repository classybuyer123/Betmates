// AuthScreen - Authentication

import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, textStyles, spacing } from '../theme';
import { Button } from '../components';
import { useTranslation } from '../services/i18n';
import { useAuth } from '../hooks/useAuth';

export const AuthScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { signInAsGuest } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGuestSignIn = async () => {
    try {
      setIsLoading(true);
      await signInAsGuest();
    } catch (error) {
      console.error('Guest sign in failed:', error);
      // TODO: Show error toast/alert
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = () => {
    // TODO: Implement Apple Sign In
    console.log('Apple Sign In - Coming soon');
  };

  const handleGoogleSignIn = () => {
    // TODO: Implement Google Sign In
    console.log('Google Sign In - Coming soon');
  };

  const handlePhoneSignIn = async () => {
    try {
      setIsLoading(true);
      await signInAsGuest();
    } catch (error) {
      console.error('Phone sign in failed:', error);
      // TODO: Show error toast/alert
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        {/* Title Section */}
        <View style={styles.logoContainer}>
          <Text style={[textStyles.h1, styles.title]}>BetMates</Text>
          <Text style={[textStyles.body, styles.subtitle]}>
            {t('auth.subtitle')}
          </Text>
        </View>

        {/* Auth buttons */}
        <View style={styles.buttonContainer}>
          <Button
            title={t('auth.signInWithApple')}
            onPress={handleAppleSignIn}
            variant="primary"
            fullWidth
            style={[styles.button, styles.appleButton]}
            textStyle={styles.appleButtonText}
          />
          
          <Button
            title={t('auth.signInWithGoogle')}
            onPress={handleGoogleSignIn}
            variant="secondary"
            fullWidth
            style={[styles.button, styles.googleButton]}
            textStyle={styles.googleButtonText}
          />
          
          <Button
            title="Sign in with Phone"
            onPress={handlePhoneSignIn}
            variant="secondary"
            fullWidth
            loading={isLoading}
            style={[styles.button, styles.phoneButton]}
            textStyle={styles.phoneButtonText}
          />
        </View>

        {/* Disclaimer */}
        <Text style={[textStyles.caption, styles.disclaimer]}>
          {t('create.symbolicOnly')}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary, // Green background using theme color
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  title: {
    color: '#FFFFFF', // White text
    marginBottom: spacing.sm,
    fontSize: 38, // 35% bigger than h1 (28 * 1.35 = 37.8)
  },
  subtitle: {
    color: '#FFFFFF', // White text
    textAlign: 'center',
    opacity: 0.9,
  },
  buttonContainer: {
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  button: {
    // Additional button styling if needed
  },
  appleButton: {
    backgroundColor: '#000000',
  },
  appleButtonText: {
    color: '#FFFFFF',
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
  },
  googleButtonText: {
    color: '#000000',
  },
  phoneButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
  },
  phoneButtonText: {
    color: '#000000',
  },
  disclaimer: {
    color: '#FFFFFF', // White text
    textAlign: 'center',
    lineHeight: 18,
    opacity: 0.8,
  },
});
