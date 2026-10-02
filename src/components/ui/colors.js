// JS-side mirror of the `--color-*` tokens in src/global.css, for props that
// can't take a className (icon `color`, StatusBar, navigation theme,
// Reanimated/Moti interpolation, third-party style props).
//
// Keys are the camelCase form of the CSS token name (`--color-ink-muted` →
// `inkMuted`); numbered palettes nest (`--color-danger-500` → `danger[500]`).
// Parity with global.css is enforced by design-tokens.test.ts, so a value
// changed in one file must be changed in the other.
module.exports = {
  white: '#ffffff',

  ink: '#172741',
  inkVariant: '#4e5a74',
  inkMuted: '#78839c',
  label: '#374b6c',
  paper: '#fbfaf7',

  primary: '#172741',
  primaryContainer: '#374b6c',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#cca1d0',
  primaryFixed: '#f2d6f4',
  secondaryContainer: '#eeeadf',
  navyDeep: '#0f1b30',

  plum: '#3a243c',
  plumMid: '#57385a',
  sage: '#d4dcce',
  forest: '#043f29',
  ice: '#b9d8e1',
  iceLight: '#daedf3',

  surface: '#fbfaf7',
  surfaceContainerLowest: '#ffffff',
  surfaceContainer: '#f1eee7',
  surfaceContainerHigh: '#ece8df',

  outline: '#17274133',
  outlineVariant: '#1727411f',

  success: {
    50: '#f0fdf4',
    300: '#86efac',
    500: '#22c55e',
    700: '#15803d',
  },
  warning: {
    50: '#fffbeb',
    300: '#fcd34d',
    500: '#f59e0b',
    700: '#b45309',
  },
  danger: {
    50: '#fef2f2',
    300: '#fca5a5',
    500: '#ef4444',
    700: '#b91c1c',
  },

  background: '#fbfaf7',
  foreground: '#172741',
  card: '#ffffff',
  cardForeground: '#172741',
  muted: '#eeeadf',
  mutedForeground: '#4e5a74',
  border: '#1727411f',
  input: '#1727411f',
  ring: '#172741',
  destructive: '#ef4444',
  destructiveForeground: '#ffffff',

  // --- JS-only values (no className equivalent; not in global.css) ---
  // Scrim behind modals/bottom sheets: ink @40%.
  scrim: '#17274166',
  // Race placing medals (result tiles). Not brand colours, so not tokens.
  medal: {
    gold: '#ffd700',
    silver: '#c0c0c0',
    bronze: '#cd7f32',
    other: '#9ca3af',
  },
};
