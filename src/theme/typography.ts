// BetMates Typography System

import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'sans-serif',
  android: 'sans-serif',
  default: 'sans-serif',
});

export const typography = {
  // Font Families
  fontFamily: {
    regular: fontFamily,
    bold: `${fontFamily}-Bold`,
  },
  
  // Font Sizes
  fontSize: {
    h1: 28,
    h2: 22,
    h3: 18,
    body: 16,
    caption: 13,
    small: 11,
  },
  
  // Line Heights
  lineHeight: {
    h1: 34,
    h2: 28,
    h3: 24,
    body: 22,
    caption: 18,
    small: 16,
  },
  
  // Font Weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const;

// Text Style Presets
export const textStyles = {
  h1: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.h1,
    lineHeight: typography.lineHeight.h1,
    fontWeight: typography.fontWeight.bold,
  },
  h2: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.h2,
    lineHeight: typography.lineHeight.h2,
    fontWeight: typography.fontWeight.bold,
  },
  h3: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.h3,
    lineHeight: typography.lineHeight.h3,
    fontWeight: typography.fontWeight.semibold,
  },
  body: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.fontWeight.regular,
  },
  bodyBold: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.fontWeight.semibold,
  },
  caption: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.fontWeight.regular,
  },
  small: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.small,
    lineHeight: typography.lineHeight.small,
    fontWeight: typography.fontWeight.regular,
  },
} as const;