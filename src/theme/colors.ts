// Mirrors the palette in tailwind.config.js — for spots that need a raw
// color value instead of a className (React Navigation options,
// SymbolView tintColor, ActivityIndicator color, inline TextInput styles).
export const colors = {
  accent: {
    default: '#9ecaff',
    on: '#003258',
    container: '#003a63',
    onContainer: '#d1e4ff',
  },
  surface: {
    default: '#0a0a0a',
    2: '#141414',
  },
  ink: {
    default: '#ffffff',
    muted: '#c9c0b7',
    faint: '#8f857a',
  },
  border: '#2a2a2a',
} as const;
