# Auth — current behavior

## What this feature does
Email/password sign-in backed by Clerk. Clerk owns session state end to end:
there is no local auth store. Once a session exists, Clerk's token cache
persists it across app restarts and `src/lib/api/client.tsx` attaches its JWT
to outgoing API requests.

## Behavior
- The login screen renders `components/login-form.tsx`: an optional Name field
  plus Email and Password, built from `@/components/ui` primitives.
- The form is validated on change by `@tanstack/react-form` against a Zod
  schema — email required and well-formed, password required and at least 6
  characters. The submit button shows a loading state while submitting.
- Submitting calls `signIn.password({ emailAddress, password })` from Clerk's
  `useSignIn()`. That call resolves with `{ error }` instead of throwing, so the
  screen branches on the returned `error` rather than using try/catch.
- On error, a flash error message is shown with the `login.failed` string. The
  user stays on the login screen; nothing else is reset.
- On success, when `signIn.status === 'complete'`, the screen calls
  `signIn.finalize({ navigate })`, which activates the session and does
  `router.replace(decorateUrl('/'))`. Without `finalize()` the status reaches
  `complete` but no session is activated and the route guard bounces back.
- The `(app)` route guard reads `isSignedIn` / `isLoaded` from Clerk's
  `useAuth()`. While `!isLoaded` it renders nothing, so an already-signed-in
  user is not redirected during Clerk's async session restore. When loaded and
  signed out, it redirects to `/login`. A first-time user is sent to
  `/onboarding` before either check.
- Sign-out lives in the settings feature; it calls Clerk's `signOut()`, and the
  route guard reacts to `isSignedIn` flipping to false.
- On a 401 API response the client interceptor calls `signOut()` once and
  rejects the promise. It does not retry the request and does not touch the
  React Query cache.

## Entry points
- Route: `src/app/login.tsx` → `features/auth/login-screen.tsx`
- Route guard: `src/app/(app)/_layout.tsx` (Clerk `useAuth()`)
- Session state: Clerk only — `ClerkProvider` in `src/app/_layout.tsx` is
  configured with `tokenCache` from `@clerk/expo/token-cache`. There is no
  Zustand auth store.

## Platform differences
- None in this feature's code. Session persistence goes through
  `expo-secure-store` (iOS Keychain / Android encrypted storage) via Clerk's
  token cache, which requires a dev-client build — the app does not run in
  Expo Go.

## Out of scope
- Sign-up, password reset, and email verification — not implemented here.
- Social login (Google, Apple) — not implemented.
- Biometric unlock — deferred.
