# MCP Command Reference

This file lists the available MCP commands that the agent can invoke.
Each command maps to an npm script or a helper utility.

## expo
- `expo:dev` – `pnpm start`
- `expo:ios` – `pnpm ios`
- `expo:android` – `pnpm android`
- `expo:web` – `pnpm web`
- `expo:build:ios` – `pnpm build:production:ios`
- `expo:build:android` – `pnpm build:production:android`
- `expo:submit` – EAS submit (if configured)

## clerk
- `clerk:auth:url` – generate hosted sign-in URL (requires CLI tool)
- `clerk:auth:session` – fetch current session JWT
- `clerk:auth:signOut` – sign out the user
- `clerk:auth:refresh` – force token refresh

## testing
- `testing:unit` – `pnpm test`
- `testing:e2e` – `maestro test .maestro/ -e APP_ID=...`
- `testing:coverage` – `pnpm test --coverage`
- `testing:query:devtools` – toggle React Query devtools (via Expo dev menu)

## lint
- `lint:lint` – `pnpm lint`
- `lint:fix` – `pnpm lint --fix`
- `lint:typecheck` – `pnpm type-check`

## build
- `build:version:bump` – bump version (patch/minor/major)
- `build:changelog:add` – append entry to CHANGELOG.md
- `build:prepare` – run lint, type-check, tests, then tag
- `build:ios` – `pnpm build:production:ios`
- `build:android` – `pnpm build:production:android`

## argent (MCP server)
- `argent:simulator:launch` – Launch app on simulator
- `argent:simulator:tap` – Tap at coordinates
- `argent:simulator:swipe` – Swipe gesture
- `argent:debug:view-hierarchy` – Inspect view hierarchy
- `argent:debug:network` – Inspect network requests
- `argent:profile:record` – Record performance profile
