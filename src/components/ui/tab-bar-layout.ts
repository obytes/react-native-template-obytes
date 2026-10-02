import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Design V2 floating tab bar metrics (S13-01 §8, Figma "tab bar" node 5:201).
 * The pill is 350×60 and sits ~20pt above the home indicator, which on
 * notched iPhones is the bottom safe-area inset.
 */
export const TAB_BAR_WIDTH = 350;
export const TAB_BAR_HEIGHT = 60;
/** Side margin when the screen is narrower than 350 + 2×this. */
export const TAB_BAR_MIN_SIDE_MARGIN = 16;

/** Minimum offset from the screen bottom on devices with no bottom inset. */
const TAB_BAR_MIN_BOTTOM_OFFSET = 16;

/**
 * Inner vertical size of the pill. Full-bleed screens must pad by at least
 * this plus the bottom offset so content clears the floating bar.
 */
export const CUSTOM_TAB_BAR_INNER_HEIGHT = TAB_BAR_HEIGHT;

/** Bottom offset for the floating tab pill. */
export function useTabBarBottomOffset(): number {
  const { bottom } = useSafeAreaInsets();
  return Math.max(bottom, TAB_BAR_MIN_BOTTOM_OFFSET);
}

/** Scroll content padding so the last item clears the floating tab pill. */
export function useTabBarContentPadding(extra = 24): number {
  return useTabBarBottomOffset() + CUSTOM_TAB_BAR_INNER_HEIGHT + extra;
}
