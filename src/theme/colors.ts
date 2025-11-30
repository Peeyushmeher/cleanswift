/**
 * CleanSwift Color Tokens
 *
 * Centralized color definitions extracted from the design system.
 * These tokens represent the exact colors used throughout the app.
 *
 * IMPORTANT: Do not modify these values without design approval.
 * The visual design is locked per PROJECT_BRIEF.md constraints.
 */

export const COLORS = {
  // ===== BACKGROUNDS =====
  bg: {
    /** Main app background - very dark blue-black (#050B12) */
    primary: '#050B12',

    /** Card/elevated surface background - dark blue (#0A1A2F) */
    surface: '#0A1A2F',

    /** Selected state background (#071C33) */
    surfaceSelected: '#071C33',

    /** Disabled button/surface background (#071326) */
    surfaceDisabled: '#071326',
  },

  // ===== TEXT COLORS =====
  text: {
    /** Primary text - off-white (#F5F7FA) */
    primary: '#F5F7FA',

    /** Secondary/muted text - gray-blue (#C6CFD9) */
    secondary: '#C6CFD9',

    /** Pure white text - primarily for buttons (#FFFFFF) */
    inverse: '#FFFFFF',

    /** Disabled text - faded gray-blue */
    disabled: 'rgba(198,207,217,0.5)',

    /** Disabled text variant (#5F7290) */
    disabledAlt: '#5F7290',
  },

  // ===== ACCENT COLORS =====
  accent: {
    /** Primary accent - mint/teal (#6FF0C4) - for success, selected states */
    mint: '#6FF0C4',

    /** Secondary accent - bright blue (#1DA4F3) - for CTAs, interactive elements */
    blue: '#1DA4F3',

    /** Error/destructive accent - red (#FF6B6B) */
    error: '#FF6B6B',
  },

  // ===== BORDERS & DIVIDERS =====
  border: {
    /** Very subtle border - almost invisible */
    subtle: 'rgba(255,255,255,0.05)',

    /** Default border - subtle gray-blue */
    default: 'rgba(198,207,217,0.1)',

    /** More visible border - medium gray-blue */
    emphasis: 'rgba(198,207,217,0.2)',

    /** Strong border - for checkboxes and interactive elements */
    strong: 'rgba(198,207,217,0.3)',

    /** Accent border - mint */
    accentMint: 'rgba(111,240,196,0.4)',

    /** Accent border - blue */
    accentBlue: 'rgba(29,164,243,0.2)',
  },

  // ===== ACCENT BACKGROUNDS (with opacity) =====
  accentBg: {
    /** Mint backgrounds with varying opacity levels */
    mint5: 'rgba(111,240,196,0.05)',
    mint10: 'rgba(111,240,196,0.1)',
    mint15: 'rgba(111,240,196,0.15)',
    mint20: 'rgba(111,240,196,0.2)',
    mint30: 'rgba(111,240,196,0.3)',
    mint40: 'rgba(111,240,196,0.4)',

    /** Blue backgrounds with varying opacity levels */
    blue10: 'rgba(29,164,243,0.1)',
    blue15: 'rgba(29,164,243,0.15)',
    blue20: 'rgba(29,164,243,0.2)',
  },

  // ===== SHADOW COLORS =====
  shadow: {
    /** Default black shadow for depth */
    default: '#000',

    /** Mint glow shadow for accent elements */
    mint: '#6FF0C4',

    /** Blue glow shadow for interactive elements */
    blue: '#1DA4F3',
  },

  // ===== SPECIAL BACKGROUNDS =====
  special: {
    /** Faded card background for disabled states */
    surfaceFaded: 'rgba(10,26,47,0.3)',
  },
} as const;

// Type-safe color keys for autocomplete
export type ColorKeys = typeof COLORS;
