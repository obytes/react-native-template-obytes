# Product Domain and Business Rules

- The app uses Expo Router for file‑based routing.
- Authentication is handled by Clerk (email/password, session JWT).
- State management: React Query for server state, Zustand for client state.
- Storage: encrypted MMKV for persisting tokens and settings.
- Internationalization: JSON files in src/translations/, fallback to English.
- UI primitives are defined in src/components/ui/ and promoted after use in ≥2 features.
- No business logic in src/app/; only route re‑exports.
- Tests are colocated with the code they test in flat __tests__/ folders.
- The root __tests__/ holds smoke, cross‑feature, and contract tests only.
- EAS is used for builds; profiles: development, preview, production.
