# hooks — current behavior

## What this feature does
Shared React hooks for cross-cutting client state that must survive app restarts.
Both hooks persist to MMKV, so the values they expose are durable and readable
synchronously at startup.

## Behavior
- `useIsFirstTime()` returns `[isFirstTime, setIsFirstTime]`, backed by the MMKV
  boolean key `IS_FIRST_TIME`. When the key is unset it reports `true`, so a fresh
  install is treated as a first run without needing a seed write.
- `useSelectedTheme()` returns `{ selectedTheme, setSelectedTheme }`, backed by the
  MMKV string key `SELECTED_THEME`. `selectedTheme` is one of `'light' | 'dark' |
  'system'` and falls back to `'system'` when unset.
- `setSelectedTheme(t)` applies the theme via `Uniwind.setTheme(t)` and persists it
  in the same call, so the UI and storage never diverge.
- `loadSelectedTheme()` is a plain function, not a hook. It reads `SELECTED_THEME`
  directly from MMKV and applies it via `Uniwind.setTheme` before first paint,
  which is what prevents a light-theme flash on launch for dark-theme users.

## Entry points
- Hooks: `useIsFirstTime` from `src/lib/hooks/use-is-first-time.tsx`,
  `useSelectedTheme` from `src/lib/hooks/use-selected-theme.tsx`.
- Startup: `loadSelectedTheme()` is called from the root layout, not from a component.
- Both are re-exported from `src/lib/hooks/index.tsx`.

## Platform differences
- None. MMKV and Uniwind handle platform differences internally.

## Out of scope
- Styling components by theme. Use `useUniwind()` from `uniwind` for that;
  `useSelectedTheme` is only for reading and changing the user's stored preference.
- Migration of previously stored theme values — any unrecognized string is passed
  to `Uniwind.setTheme` as-is.
