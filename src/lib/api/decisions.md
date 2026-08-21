# API Client — decisions

## 2026-08-14 — Axios over fetch
**Chose:** Axios with interceptors
**Over:** Native fetch + custom wrapper
**Why:** Axios provides built-in interceptors, request/response transformation, and better TypeScript support for our use case.
**Trade-off:** Larger bundle than fetch; additional dependency.

## 2026-08-20 — Clerk JWT attachment in interceptor
**Chose:** Attach token in request interceptor via `clerk.session.getToken()`
**Over:** Attach token manually in each API call
**Why:** Centralized auth logic; ensures all requests have token without developer effort.
**Trade-off:** Slight overhead on every request (token retrieval); interceptor fails silently if no session (intentional for public endpoints).

## 2026-08-20 — 401 triggers sign-out
**Chose:** Auto sign-out on 401
**Over:** Token refresh attempt then sign-out
**Why:** Clerk manages token refresh internally; 401 indicates session is invalid/unrecoverable.
**Trade-off:** User may be signed out unexpectedly if clock skew or network issue causes false 401.

## 2026-08-21 — Lazy Clerk resolution with an explicit publishable key
**Chose:** Resolve the Clerk singleton inside a `getClerk()` helper, calling `getClerkInstance({ publishableKey })` per use
**Over:** A module-scope `getClerkInstance()` call, or injecting a token getter into the client from `ClerkProvider`
**Why:** `client.tsx` is imported during app startup, before `ClerkProvider` initializes the singleton; a bare call in that window throws `MissingPublishableKeyError` and takes the app down before the first render. Passing the key explicitly makes the call safe whenever it happens, and keeps the client a plain module that non-React code can import.
**Trade-off:** The publishable key is now named in two places (root layout and API client) and must stay in sync, and the client reaches around React context for the session instead of receiving it — so it cannot be swapped out per-provider in tests without mocking `@clerk/expo`.
