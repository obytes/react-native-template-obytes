# Testing Rules

## Rule
- **Test placement** — every directory with testable behavior gets a flat `__tests__/` folder. Tests for a file live next to it: `<dir>/__tests__/<file>.test.tsx`.
- **Root `__tests__/`** — the sole exception, holds only whole-app smoke, cross-feature, and contract tests.
- **Maestro E2E** — flows live in `.maestro/flows/`; each flow corresponds to a user journey that may span features.
- **Test helpers** — shared fixtures and `renderWithProviders` live in `src/lib/test-utils.tsx`, not in `__tests__/`.

## Rationale
Colocated tests move with their code, preventing drift. Flat `__tests__/` avoids parallel directory trees. Root `__tests__/` is explicitly scoped to whole-app concerns. Maestro flows follow user journeys, not feature boundaries.

## Examples

### Good
```
src/features/auth/
├── login-screen.tsx
├── __tests__/
│   └── login-screen.test.tsx    // ✅ Colocated, flat
└── components/
    ├── login-form.tsx
    └── __tests__/
        └── login-form.test.tsx  // ✅ Own __tests__/ in components/
```

```yaml
# .maestro/flows/auth/login.yaml
appId: com.obytes.development
---
- tapOn: "Email"
- inputText: "test@example.com"
- tapOn: "Sign in"
- assertVisible: "Home"
```

### Bad
```
src/features/auth/
├── login-screen.tsx
└── __tests__/
    └── components/
        └── login-form.test.tsx  # ❌ Nested __tests__/ mirrors source tree
```

```tsx
// ❌ Test imports bare render instead of the wrapped helpers
import { render } from '@testing-library/react-native';
render(<LoginScreen />);
```

## Enforcement
- Jest: `testMatch: ['**/?(*.)+(spec|test).ts?(x)']` — matches test files anywhere,
  so placement is a convention this file enforces by review, not by the runner
- ESLint: custom rule could flag `render` import from `@testing-library/react-native` (should be `setup` or `render` from `@/lib/test-utils`)
- Review: verify test placement matches directory structure
- Review: verify Maestro flows represent user journeys, not feature internals
