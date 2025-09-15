// BetMates Spacing System (8pt grid)

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const hitSlop = {
  default: { top: 8, bottom: 8, left: 8, right: 8 },
  large: { top: 12, bottom: 12, left: 12, right: 12 },
} as const;

// Common layout values
export const layout = {
  minTouchTarget: 44, // WCAG AA minimum touch target
  tabBarHeight: 83,
  headerHeight: 56,
} as const;
