// BetMates Color Palette

export const colors = {
  // Primary Green
  primary: '#00ba57',
  primary600: '#00a050',
  primary100: '#E6F5EE',
  
  // Secondary Green (replacing blue)
  secondary: '#00ba57',
  
  // Accent Yellow
  accent: '#F2C94C',
  
  // Status Colors
  error: '#E53935',
  success: '#2E7D32',
  
  // Text Colors
  textPrimary: '#F9FAFB',
  textMuted: '#9CA3AF',
  
  // Surface Colors
  surface: '#374151',
  background: '#1F2937',
  
  // Additional UI Colors
  border: '#4B5563',
  shadow: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // Bet Type Colors
  betMoney: '#00ba57',
  betFavor: '#8B5CF6',
  betChallenge: '#F59E0B',
} as const;

export type ColorKey = keyof typeof colors;
