# CI/CD Rules

## Rule
- **CI order** — run `type-check → lint → unit tests → E2E`.
- **Drift check** — CI blocks PR if code under `features/**`, `lib/**`, `components/ui/**` changes without corresponding `spec.md` update.
- **Spec freshness** — when behavior changes, rewrite `spec.md` to reflect new reality (present tense, never append "we added X"). Append to `decisions.md` only for genuine trade-offs.

## Rationale
Fixed CI order catches type errors before lint, lint before tests. Drift check ensures documentation stays current. Spec freshness prevents stale docs from misleading agents and engineers.

## Examples

### Good (PR passes)
```yaml
# .github/workflows/ci.yml
jobs:
  check:
    steps:
      - run: pnpm type-check   # 1
      - run: pnpm lint         # 2
      - run: pnpm test         # 3
      - run: pnpm check-specs  # 4 (drift check)
```

```markdown
# spec.md (rewritten)
## Behavior
- User can sign in with email/password
- Session persists across app restarts via MMKV
- On 401, user is signed out and redirected to login
```

```markdown
# decisions.md (appended)
## 2026-08-20 — Migrated to Clerk for authentication
**Chose:** @clerk/expo + @clerk/react
**Over:** Custom JWT + MMKV token storage
**Why:** Clerk handles session management, MFA, and device verification out of the box
**Trade-off:** Additional dependency; vendor lock-in for auth
```

### Bad (PR fails)
```markdown
# spec.md (appended — WRONG)
## Behavior
- User can sign in with email/password
- We added Clerk integration in August 2026  # ❌ Never append "we added"
```

```markdown
# decisions.md (behavior description — WRONG)
## 2026-08-20
We changed auth to use Clerk because it's better.  # ❌ No trade-off, no alternatives
```

## Enforcement
- CI: `.github/workflows/drift-check.yml` blocks PR on missing spec update
- CI: `.github/workflows/ci.yml` runs in fixed order
- Review: verify spec.md rewritten (not appended), decisions.md appended only for trade-offs
- Local: `pnpm check-specs` in husky pre-commit
