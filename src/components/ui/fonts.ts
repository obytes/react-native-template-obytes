/**
 * Plus Jakarta Sans is loaded as one family per weight (src/app/_layout.tsx),
 * because iOS cannot map `fontWeight` onto a single-weight custom family.
 * Use the `font-sans-medium|semibold|bold` classes; this map is for style props
 * that can't take a className (rich-text renderers).
 */
export const FONT_FAMILY = {
  regular: 'PlusJakartaSans',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
} as const;
