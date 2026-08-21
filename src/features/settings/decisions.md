# Settings — decisions

## 2026-08-14 — MMKV for theme and language
**Chose:** react-native-mmkv via `useMMKVString` hook
**Over:** AsyncStorage or Zustand persist middleware
**Why:** Synchronous reads ensure correct theme/language on first render. Zustand persist is async; AsyncStorage is async.
**Trade-off:** Requires native module; not pure JS.

## 2026-08-14 — Language switching via i18n context
**Chose:** React Context + `i18n` utils
**Over:** React Query or local state
**Why:** Language is global UI state that affects all components; Context provides immediate propagation without re-fetch.
**Trade-off:** Context causes re-renders on language change; acceptable for infrequent changes.
