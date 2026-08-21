# Feed — decisions

## 2026-08-15 — React Query for feed data
**Chose:** @tanstack/react-query for server state
**Over:** Custom fetch + Zustand store
**Why:** React Query provides caching, deduplication, background refetch, and stale-while-revalidate out of the box.
**Trade-off:** Additional dependency; learning curve for team members unfamiliar with React Query.
