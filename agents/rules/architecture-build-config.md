# Architecture Build Configuration

## Rule
- **EAS profiles** — use `development`, `preview`, `production` profiles in `eas.json`. Never hard-code values in `app.config.ts` or `env.js`.
- **Environment variables** — all vars go through `env.ts` (Zod schema). Public vars prefixed with `EXPO_PUBLIC_`.

## Rationale
EAS profiles provide reproducible builds per environment. Centralized env validation prevents runtime crashes from missing/invalid config. The `EXPO_PUBLIC_` prefix distinguishes client-safe vars from server-only secrets.

## Examples

### Good
```json
// eas.json
{
  "build": {
    "development": { "developmentClient": true },
    "preview": { "channel": "preview" },
    "production": { "channel": "production" }
  }
}
```

```ts
// env.ts
export const Env = z.object({
  EXPO_PUBLIC_API_URL: z.string().url(),
  EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
  EXPO_PRIVATE_API_KEY: z.string().optional(), // server-only, not bundled
}).parse(process.env);
```

### Bad
```ts
// app.config.ts
export default {
  extra: {
    apiUrl: process.env.API_URL || 'http://localhost:3000', // ❌ No validation, no prefix
  },
};
```

```ts
// Hard-coded in component
const response = await fetch('https://api.example.com/users'); // ❌ Bypasses env
```

## Enforcement
- ESLint: `no-restricted-imports` can block direct `process.env` usage
- CI: `pnpm type-check` validates `env.ts` schema
- Review: verify all new env vars added to `env.ts` with Zod
