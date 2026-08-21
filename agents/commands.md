# MCP Command Reference

This file lists the available MCP commands that the agent can invoke.
Each command maps to an npm script or a helper utility.

## expo

**This app cannot run in Expo Go.** It depends on native modules, so it needs a
development build. `ios/` and `android/` are generated and gitignored, so a
fresh clone must prebuild before it can run anything. Full walkthrough,
including the platform toolchain and troubleshooting:
[README — Running the app](../README.md#️-running-the-app).

- `expo:setup` – `./setup.sh` (dependencies + `.env`; safe to re-run)
- `expo:prebuild` – `pnpm prebuild:development` (generates `ios/` + `android/`;
  add `--clean` to regenerate from scratch after native dependency changes)
- `expo:dev` – `pnpm start` (needs a dev build already installed)
- `expo:ios` – `pnpm ios`
- `expo:android` – `pnpm android`
- `expo:web` – `pnpm web`
- `expo:doctor` – `pnpm doctor`
- `expo:build:ios` – `pnpm build:production:ios`
- `expo:build:android` – `pnpm build:production:android`
- `expo:submit` – EAS submit (if configured)

Preview and production variants exist for start/ios/android
(`pnpm start:preview`, `pnpm android:production`, …). Each environment has its
own bundle ID, so the three installs coexist on one device.

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
Argent drives a real simulator/emulator. It is installed as a devDependency and
registered in `.mcp.json`, so it is available after `pnpm install` — no global
install, no `argent init`. It is not invoked by name from this file; the agent
loads one of the installed skills instead:

- `argent-ios-simulator-setup` / `argent-android-emulator-setup` — boot a device
- `argent-device-interact` — tap, swipe, type, screenshot, launch apps
- `argent-test-ui-flow` — interact/screenshot/verify loops over a UI flow
- `argent-metro-debugger` — console logs, network, React tree via Metro/CDP
- `argent-react-native-profiler` / `argent-native-profiler` — performance
- `argent-qa-flows` / `argent-create-flow` — record and replay flow YAML
- `argent-screen-recording`, `argent-screenshot-diff`, `argent-lens`,
  `argent-settings-permissions`, `argent-tv-interact`

Requires a development build — this app cannot run in Expo Go. See
`agents/rules/argent.md` and `.agents/skills/<name>/SKILL.md` for details.

CLI (rarely needed directly):
- `pnpm exec argent tools` — list the MCP tool surface
- `pnpm exec argent server status` — check the shared tool-server
