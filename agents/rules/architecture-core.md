# Architecture Core Rules

## Rule
- Code is organized in **vertical feature slices** under `src/features/<name>/`. Each slice contains its screens, components, API hooks, store, tests, and docs.
- **No cross-feature imports**. Features share code only via `src/components/ui/` or `src/lib/`.
- **Routing stays thin** — `src/app/` contains only re-exports, zero business logic.
- **No barrel files** except `src/components/ui/index.tsx`. Barrels break Fast Refresh and bloat the Metro graph.
- **UI kit promotion** — a component moves to `src/components/ui/` only when used by ≥2 features AND has no feature-specific logic.
- **State split** — server state → React Query, client state → Zustand. Never duplicate the same data in both.

## Rationale
Vertical slices keep related code together, making it easier to understand, test, and delete a feature. Cross-feature imports create hidden coupling. Thin routes enable navigation restructuring without touching business logic. Barrels harm Metro performance. The UI kit prevents duplicate components. The state split avoids synchronization bugs.

## Examples

### Good
```
src/features/auth/
├── spec.md
├── decisions.md
├── login-screen.tsx
├── use-auth-store.tsx
├── api.ts
├── components/
│   ├── login-form.tsx
│   └── __tests__/login-form.test.tsx
└── __tests__/login-screen.test.tsx
```

### Bad
```tsx
// src/features/feed/post-card.tsx
import { useAuthStore } from '@/features/auth/use-auth-store'; // ❌ Cross-feature import
import { Button } from '@/components/ui'; // ✅ OK — UI kit
```
```tsx
// src/app/(app)/feed.tsx
export { default } from '@/features/feed/feed-screen'; // ✅ Thin route
// const feedData = fetchFeed(); // ❌ Business logic in route
```

## Enforcement
- ESLint: `import/no-restricted-paths` blocks cross-feature imports
- ESLint: custom rule `local/spec-required` enforces spec.md/decisions.md
- CI: drift-check.yml blocks PR without spec updates
- Review: manual check for barrel files and route logic
