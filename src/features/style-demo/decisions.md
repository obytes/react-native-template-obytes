# Style Demo — decisions

## 2026-08-14 — Kept as internal demo feature
**Chose:** Keep in `src/features/style-demo/` for design system verification
**Over:** Delete or move to Storybook
**Why:** Quick way to verify NativeWind components on device without Storybook setup.
**Trade-off:** Adds a route and bundle size in development; should be removed or gated in production.
