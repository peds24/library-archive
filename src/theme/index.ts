import { TextStyle } from 'react-native';

/**
 * Design tokens for the whole app.
 *
 * These were the `theme.extend` block of `tailwind.config.js` until the app moved
 * off NativeWind. Everything visual should come from here rather than from a literal
 * in a component, so a palette change stays a one-file change — the same guarantee
 * the Tailwind config used to give.
 *
 * The values are unchanged from the Tailwind ones; only the spelling moved, from
 * class names to `StyleSheet` properties.
 */

// Material 3 / OLED-black theme — see inspo/mockups/ui-direction-material-crisp.html
export const Colors = {
  accent: {
    default: '#9ecaff',
    on: '#003258', // text/icons placed directly on solid accent fills
    container: '#003a63',
    onContainer: '#d1e4ff', // text/icons on accent.container
  },
  surface: {
    default: '#0a0a0a',
    raised: '#141414', // was surface-2
  },
  ink: {
    default: '#ffffff',
    muted: '#c9c0b7',
    faint: '#8f857a',
  },
  border: '#2a2a2a',

  // Destructive actions: the icon tint and the inline warning text are different
  // weights of red on purpose — the icon sits alone on a dark header, the text
  // sits in a paragraph and would vibrate at full saturation.
  danger: '#ef4444',
  dangerText: '#f87171',

  status: {
    reading: { bg: 'rgba(59,130,246,0.22)', fg: '#9dc0ff' },
    tbr: { bg: 'rgba(217,119,6,0.24)', fg: '#ffc069' },
    read: { bg: 'rgba(34,197,94,0.22)', fg: '#7fe6a0' },
    shelved: { bg: 'rgba(255,255,255,0.09)', fg: '#d6cec5' },
  },

  // The scanner deliberately breaks the palette: it is a full-bleed camera view,
  // so it uses true black and pure white rather than the app's off-black surface.
  camera: {
    bg: '#000000',
    scrim: 'rgba(0,0,0,0.6)',
    frame: 'rgba(255,255,255,0.7)',
    caption: 'rgba(255,255,255,0.6)',
    captionStrong: 'rgba(255,255,255,0.7)',
  },
} as const;

// 4px base step, matching the Tailwind scale the layouts were built on. Values
// that fall between steps (6, 10, 14) stay as literals at the call site rather
// than bloating the scale with half-steps.
export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const Radius = {
  sm: 8, // rounded-lg
  md: 12, // rounded-xl
  lg: 16, // rounded-2xl
  xl: 20, // the large book card
  sheet: 24, // the scanner's bottom sheet
  full: 9999,
} as const;

export const FontSize = {
  micro: 11,
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  screenTitle: 28,
} as const;

export const FontWeight = {
  medium: '500',
  semibold: '600',
  bold: '700',
} as const satisfies Record<string, TextStyle['fontWeight']>;

// Tailwind's tracking-* are em-relative; these are the resolved pixel values for
// the two sizes the app actually uses them at (11px wide, 12px widest).
export const LetterSpacing = {
  wide: 0.3,
  widest: 1.2,
} as const;
