# Feed — current behavior

## What this feature does
Displays a list of posts with infinite scroll. Users can add new posts via a modal.

## Behavior
- Feed screen fetches posts via React Query using `src/lib/api/client.tsx`.
- Infinite scroll loads more pages on reaching end of list.
- Add post button opens a modal (`add-post.tsx`) with form validation via React Hook Form + Zod.
- On successful post creation, React Query cache is invalidated to refetch feed.

## Entry points
- Route: `src/app/(app)/index.tsx` → `features/feed/feed-screen.tsx`
- State: React Query cache (server state), no client store

## Platform differences
- None.

## Out of scope
- Real-time updates (WebSockets) — not implemented.
- Post reactions/likes — deferred.
