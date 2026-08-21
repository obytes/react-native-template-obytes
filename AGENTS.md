# Mobile App — Agent Guide

You are a senior React Native engineer working in an Expo app.
TypeScript strict. Small, reviewable diffs. Match surrounding code.

## Where things live

src/app/          Expo Router. Routing ONLY — every file is a re-export.
src/features/     Vertical slices. One folder per capability.
src/components/ui Design system primitives.
src/lib/          Cross-cutting infra: api, auth, i18n, hooks, test-utils.
src/translations/ All user-facing strings.
__tests__/        One per directory that has something to test.
                  The ROOT one is the exception: whole-app tests only.
.maestro/         E2E flows, by user journey.

## Read before you write  ← do this first, every task

| If the task touches…                    | Open first                                    |
|-----------------------------------------|-----------------------------------------------|
| a feature                               | src/features/<f>/spec.md  then  decisions.md |
| creating a new feature                  | .templates/spec.md → src/features/<f>/spec.md |
| modifying feature behavior              | src/features/<f>/spec.md  then  decisions.md |
| changing API client / auth / i18n       | src/lib/<mod>/spec.md  +  decisions.md        |
| adding UI component                     | src/components/ui/spec.md  (inventory)        |
| any UI at all                           | src/components/ui/spec.md   (the inventory)   |
| network / API calls                     | src/lib/api/spec.md                           |
| login, tokens, session                  | src/lib/auth/spec.md + decisions.md           |
| copy, locales, RTL                      | src/lib/i18n/spec.md                          |
| writing any test                        | src/lib/test-utils.tsx                        |
| commands / scripts                      | agents/commands.md                            |
| product or domain rules                 | agents/knowledge-base.md                      |

`spec.md` = what it does today (present tense, always current).
`decisions.md` = why it's that way, and what was rejected. Append-only.
If a spec contradicts the code, the code is right and the spec is a bug —
fix the spec in the same change.

## Do

- **Every feature/lib/UI module with testable behavior MUST have `spec.md` and `decisions.md`**
- **When behavior changes, rewrite `spec.md` in the same PR — never append "we added X"**
- **Append to `decisions.md` only for genuine trade-offs (chose A over B for reason)**
- **Run `pnpm check-specs` before committing if you touched feature/lib/UI code**
- Routes in src/app/ contain a re-export and nothing else.
- **Never create a new UI primitive before reading components/ui/spec.md.**
  If something there fits, use it. This is the most common mistake.
- **Tests go in a `__tests__/` folder in the SAME directory as the file under
  test.** `features/auth/login-screen.tsx` → `features/auth/__tests__/
  login-screen.test.tsx`. Create the folder if it does not exist yet.
- **Keep every `__tests__/` flat.** It covers only its immediate parent
  directory. Never put a subdirectory inside it — a file in `components/`
  is tested from `components/__tests__/`, not from the parent's.
- Directories with nothing to test — src/app/, translations/, types/ — get
  no `__tests__/`. Never create an empty one to satisfy the pattern.
- The ROOT `__tests__/` is the one exception to the directory rule, and holds
  whole-app tests only: smoke, cross-feature integration, contracts. If your
  describe block names one module, the test belongs in that module's directory.
- Render components with `setup` (userEvent + providers) or `render` from
  lib/test-utils, not RNTL's bare `render`.
- Server state → React Query. Client state → Zustand. Never the same data in both.
- All strings → src/translations/en.json. Never inline user-facing text.
- Import with @/ absolute paths. No barrel files except components/ui.
- Styling via NativeWind classes and theme tokens. No hex values, no magic spacing.
- Use `Text` from components/ui, never React Native's `Text`.

## Don't

- **Don't create a new feature folder without `spec.md` + `decisions.md`**
- **Don't modify behavior without updating the module's `spec.md`**
- **Don't skip the drift-check CI — it will block the PR**
- Cross-feature imports. features/a must not import from features/b.
  Share via components/ui or lib.
- Business logic in src/app/.
- Hand-rolled fetch. Use the client in lib/api.
- Test implementation details. Assert what a user or caller can observe.
- Put helpers or fixtures inside `__tests__/` — those go in lib/test-utils.
- New dependency, native module, or config change without asking.

## Ask first

- Adding a native module (requires a new dev client build — say so explicitly)
- Changes to app.config.ts, eas.json, or env.js
- Adding any dependency
- Deleting a feature folder (its spec.md, decisions.md, and __tests__/ go with it)

## Definition of done

1. `pnpm lint && pnpm type-check` succeeds.
2. New behavior has a test in the `__tests__/` folder of the directory that implements it.
3. **Update the `spec.md` of every feature or lib module whose behavior changed. Rewrite it to describe the new reality — never append "we added X".**
4. **Append to `decisions.md` only if a real fork in the road was taken (chose A over B for a reason someone could question later). Date it. Put it where the code it constrains lives.**
5. If you added a component to components/ui, add its row to that inventory.
6. **`pnpm check-specs` passes — CI drift check verifies spec updated for every feature/lib/UI change.**

## Detail (load on demand)

- agents/rules/       — engineering rules, one file per topic
- agents/commands.md  — full command reference
- agents/knowledge-base.md — product domain and business rules
