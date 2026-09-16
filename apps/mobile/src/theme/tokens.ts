// ============================================================================
// MINIMALIST MONOCHROME DESIGN TOKENS
// Inspired by generous whitespace, subtle floating particles, and zero clutter
// ============================================================================

export const colors = {
  light: {
    background: '#090A0F',
    surface: '#12141C',
    surfaceHover: '#1A1D28',
    card: '#161924',
    border: 'rgba(255, 255, 255, 0.08)',
    borderSubtle: 'rgba(255, 255, 255, 0.04)',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textTertiary: '#64748B',
    accent: '#6366F1', // Electric indigo / Sony violet
    accentMuted: '#1E1B4B',
    particle: 'rgba(255, 255, 255, 0.25)',
    particleActive: 'rgba(52, 211, 153, 0.6)',
    speaking: '#10B981',
    duckingIndicator: '#818CF8',
  },
  dark: {
    background: '#090A0F',
    surface: '#12141C',
    surfaceHover: '#1A1D28',
    card: '#161924',
    border: 'rgba(255, 255, 255, 0.08)',
    borderSubtle: 'rgba(255, 255, 255, 0.04)',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textTertiary: '#64748B',
    accent: '#6366F1',
    accentMuted: '#1E1B4B',
    particle: 'rgba(255, 255, 255, 0.25)',
    particleActive: 'rgba(52, 211, 153, 0.6)',
    speaking: '#10B981',
    duckingIndicator: '#818CF8',
  },
};

export const typography = {
  fontFamily: {
    sans: 'System',
    display: 'System',
  },
  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    '2xl': 30,
    '3xl': 38,
  },
  weights: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  letterSpacing: {
    tighter: -0.8,
    tight: -0.4,
    normal: 0,
    wide: 0.6,
    wider: 1.2,
    widest: 2.0,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  full: 9999,
};
