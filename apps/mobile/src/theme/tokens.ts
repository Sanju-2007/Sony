// ============================================================================
// MINIMALIST MONOCHROME DESIGN TOKENS
// Inspired by generous whitespace, subtle floating particles, and zero clutter
// ============================================================================

export const colors = {
  light: {
    background: '#FFFFFF',
    surface: '#FAFAFA',
    surfaceHover: '#F4F4F5',
    card: '#FFFFFF',
    border: 'rgba(0, 0, 0, 0.07)',
    borderSubtle: 'rgba(0, 0, 0, 0.04)',
    textPrimary: '#09090B',
    textSecondary: '#71717A',
    textTertiary: '#A1A1AA',
    accent: '#18181B', // Charcoal/Black primary accent
    accentMuted: '#E4E4E7',
    particle: 'rgba(0, 0, 0, 0.22)',
    particleActive: 'rgba(16, 185, 129, 0.5)', // Subtle emerald glow for voice
    speaking: '#10B981',
    duckingIndicator: '#6366F1',
  },
  dark: {
    background: '#09090B',
    surface: '#121215',
    surfaceHover: '#18181B',
    card: '#121215',
    border: 'rgba(255, 255, 255, 0.08)',
    borderSubtle: 'rgba(255, 255, 255, 0.04)',
    textPrimary: '#FAFAFA',
    textSecondary: '#A1A1AA',
    textTertiary: '#71717A',
    accent: '#FFFFFF',
    accentMuted: '#27272A',
    particle: 'rgba(255, 255, 255, 0.25)',
    particleActive: 'rgba(52, 211, 153, 0.6)',
    speaking: '#34D399',
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
