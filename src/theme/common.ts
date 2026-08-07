import { StyleSheet } from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing } from './index';

/**
 * Styles repeated across more than one screen.
 *
 * Under NativeWind these cost nothing to repeat — `bg-accent py-3 rounded-full
 * items-center` was as cheap to write the fifth time as the first. In a StyleSheet
 * world that same repetition means five copies drifting apart, so the shapes that
 * genuinely recur live here instead. Anything used by a single screen stays in that
 * screen's own StyleSheet.
 */
export const CommonStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.surface.default },
  screenCentered: {
    flex: 1,
    backgroundColor: Colors.surface.default,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Filled pill — the primary action on every screen that has one.
  pillFilled: {
    backgroundColor: Colors.accent.default,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    alignItems: 'center',
  },
  pillFilledLabel: {
    color: Colors.accent.on,
    fontWeight: FontWeight.semibold,
    fontSize: FontSize.base,
  },

  // Outlined pill — the secondary action sitting directly under a filled one.
  pillOutline: {
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    alignItems: 'center',
  },
  pillOutlineLabel: {
    color: Colors.accent.default,
    fontWeight: FontWeight.semibold,
    fontSize: FontSize.base,
  },

  // Applied on top of either pill when the action is unavailable.
  pillDisabled: { backgroundColor: Colors.surface.raised },
  pillDisabledLabel: { color: Colors.ink.faint },

  // Bare text button — the "never mind" option, always the quietest thing on screen.
  textButton: { paddingVertical: Spacing.sm, alignItems: 'center' },
  textButtonLabel: { color: Colors.ink.faint, fontWeight: FontWeight.medium },

  // Inline validation message, e.g. "already in your library".
  warning: { color: Colors.dangerText, fontSize: FontSize.sm, textAlign: 'center' },
});
