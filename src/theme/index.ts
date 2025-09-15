// BetMates Theme System

export { colors, type ColorKey } from './colors';
export { typography, textStyles } from './typography';
export { spacing, borderRadius, hitSlop, layout } from './spacing';

// Common shadow styles
export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  button: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
} as const;
