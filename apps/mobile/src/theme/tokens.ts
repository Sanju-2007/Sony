// ============================================================================
// MINIMALIST DUAL THEME TOKENS (LIGHT & DARK GLASS)
// ============================================================================

export const colors = {
  light: {
    background: '#FFFFFF',
    surface: 'rgba(255, 255, 255, 0.82)',
    surfaceHover: 'rgba(255, 255, 255, 0.95)',
    card: 'rgba(255, 255, 255, 0.85)',
    cardSolid: '#F8FAFC',
    border: 'rgba(0, 0, 0, 0.08)',
    borderSubtle: 'rgba(0, 0, 0, 0.04)',
    textPrimary: '#0A0A0A',
    textSecondary: '#52525B',
    textTertiary: '#71717A',
    accent: '#0A0A0A',
    accentInverted: '#FFFFFF',
    accentMuted: '#F4F4F5',
    particle: 'rgba(0, 0, 0, 0.35)',
    particleActive: 'rgba(16, 185, 129, 0.65)',
    speaking: '#10B981',
    duckingIndicator: '#6366F1',
    canvasDot: 'rgba(15, 15, 20, 0.45)',
    canvasBg: '#FFFFFF',
  },
  dark: {
    background: '#090A0F',
    surface: 'rgba(18, 20, 29, 0.85)',
    surfaceHover: 'rgba(28, 32, 48, 0.95)',
    card: 'rgba(18, 20, 29, 0.85)',
    cardSolid: '#11131C',
    border: 'rgba(255, 255, 255, 0.12)',
    borderSubtle: 'rgba(255, 255, 255, 0.06)',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textTertiary: '#64748B',
    accent: '#FFFFFF',
    accentInverted: '#0A0A0A',
    accentMuted: '#1E2235',
    particle: 'rgba(255, 255, 255, 0.35)',
    particleActive: 'rgba(16, 185, 129, 0.8)',
    speaking: '#10B981',
    duckingIndicator: '#818CF8',
    canvasDot: 'rgba(240, 245, 255, 0.45)',
    canvasBg: '#090A0F',
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
