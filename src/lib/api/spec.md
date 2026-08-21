# API Client — current behavior

## What this feature does
A single Axios instance with interceptors that attach the Clerk JWT to every
request and drop an invalid session on 401, plus the React Query provider that
the rest of the app queries through.

## Behavior
- `client` is an Axios instance with `baseURL` from `Env.EXPO_PUBLIC_API_URL`.
- The Clerk instance is resolved lazily inside `getClerk()`, with an explicit
  `publishableKey` from `Env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`. This module is
  imported during app startup, before `ClerkProvider` has initialized the
  singleton, and a bare module-scope `getClerkInstance()` call in that window
  throws `MissingPublishableKeyError`.
- Request interceptor: if `getClerk().session` exists, it calls
  `session.getToken({ template: Env.EXPO_PUBLIC_CLERK_JWT_TEMPLATE })` (the
  template is optional) and sets `Authorization: Bearer <token>`. Any failure is
  caught and logged with `console.warn`, and the request proceeds without an
  auth header so public endpoints still work.
- Response interceptor: on a 401 it calls `getClerk().signOut()` once and
  rejects the original error. There is no retry and no `_retry` flag — the
  per-request config object is never reused, so the flag was meaningless. The
  React Query cache is not cleared; the route guard handles the redirect once
  Clerk reports the user as signed out. A failing `signOut()` is caught and
  logged, and the original error is still rejected.
- `src/lib/api/index.ts` re-exports `client`, the `APIProvider` /`queryClient`
  from `provider.tsx`, and the pagination helpers in `utils.tsx`
  (`getQueryKey`, `normalizePages`, `getNextPageParam`, `getPreviousPageParam`,
  `PaginateQuery`, `DEFAULT_LIMIT`).

## Entry points
- Used by feature API modules (e.g. `features/feed/api.ts`).
- `APIProvider` wraps the app in `src/app/_layout.tsx`.

## Platform differences
- None.

## Out of scope
- Request retry / refresh-then-retry logic — not implemented.
- Request/response logging beyond the `console.warn`/`console.error` above.
