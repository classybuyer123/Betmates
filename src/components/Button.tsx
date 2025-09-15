// Button component with BetMates styling

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View, ViewStyle, TextStyle } from 'react-native';
import { colors, textStyles, spacing, borderRadius, shadows, hitSlop } from '../theme';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  icon,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: borderRadius.xl,
      minHeight: size === 'small' ? 36 : size === 'large' ? 52 : 44,
      paddingHorizontal: size === 'small' ? spacing.md : spacing.lg,
    };

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: disabled ? colors.border : colors.primary,
          ...(!disabled && shadows.button),
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: disabled ? colors.border : colors.secondary,
          ...(!disabled && shadows.button),
        };
      case 'tertiary':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: disabled ? colors.border : colors.primary,
        };
      case 'danger':
        return {
          ...baseStyle,
          backgroundColor: disabled ? colors.border : colors.error,
          ...(!disabled && shadows.button),
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: size === 'small' ? 14 : size === 'large' ? 18 : 16,
      fontWeight: '600',
    };

    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger':
        return {
          ...baseStyle,
          color: disabled ? colors.textMuted : colors.surface,
        };
      case 'tertiary':
        return {
          ...baseStyle,
          color: disabled ? colors.textMuted : colors.primary,
        };
      default:
        return baseStyle;
    }
  };

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      hitSlop={hitSlop.default}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'tertiary' ? colors.primary : colors.surface}
          style={{ marginRight: spacing.xs }}
        />
      )}
      
      {icon && !loading && (
        <View style={{ marginRight: spacing.xs }}>
          {icon}
        </View>
      )}
      
      <Text style={[getTextStyle(), textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};
