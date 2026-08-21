#!/usr/bin/env bash
#
# One-shot setup for this Expo app.
#
#   ./setup.sh            install dependencies and create .env
#   ./setup.sh --verify   ...then run lint, type-check, tests and expo-doctor
#   ./setup.sh --help     usage
#
# Safe to re-run: an existing .env is never overwritten.

set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"

RED=$'\033[0;31m'; GREEN=$'\033[0;32m'; YELLOW=$'\033[0;33m'; BOLD=$'\033[1m'; OFF=$'\033[0m'
step() { printf '\n%s==>%s %s%s\n' "$BOLD" "$OFF" "$1" "$OFF"; }
ok()   { printf '  %s✓%s %s\n' "$GREEN" "$OFF" "$1"; }
warn() { printf '  %s!%s %s\n' "$YELLOW" "$OFF" "$1"; }
die()  { printf '  %s✗%s %s\n' "$RED" "$OFF" "$1" >&2; exit 1; }

VERIFY=0
for arg in "$@"; do
  case "$arg" in
    --verify) VERIFY=1 ;;
    --help|-h) sed -n '2,10p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) die "unknown option: $arg (try --help)" ;;
  esac
done

# ---------------------------------------------------------------- prerequisites
step 'Checking prerequisites'

command -v node >/dev/null || die 'node is not installed. Install Node.js 20 or newer: https://nodejs.org'

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [ "$NODE_MAJOR" -lt 20 ]; then
  die "Node 20+ required, found $(node --version). CI builds on Node 20."
fi
ok "node $(node --version)"

# package.json pins the pnpm version via "packageManager"; corepack honours it.
PNPM_PIN="$(node -p "require('./package.json').packageManager || ''")"
if ! command -v pnpm >/dev/null; then
  step 'Enabling pnpm via corepack'
  command -v corepack >/dev/null || die 'pnpm not found and corepack unavailable. Install pnpm: https://pnpm.io/installation'
  corepack enable >/dev/null 2>&1 || warn 'corepack enable failed (may need sudo); continuing'
  corepack prepare "${PNPM_PIN:-pnpm@latest}" --activate >/dev/null 2>&1 \
    || die 'could not activate pnpm. Install it manually: https://pnpm.io/installation'
fi
ok "pnpm $(pnpm --version)${PNPM_PIN:+ (pinned: ${PNPM_PIN#pnpm@})}"

# --------------------------------------------------------------------- env file
step 'Setting up .env'

if [ -f .env ]; then
  ok '.env already exists, leaving it untouched'
else
  [ -f .env.example ] || die '.env.example is missing; cannot create .env'
  cp .env.example .env
  ok 'created .env from .env.example'
fi

# env.ts validates these with Zod. A missing one only bites at prebuild time
# (STRICT_ENV_VALIDATION=1), which is a confusing place to discover it.
MISSING=''
while read -r key; do
  [ -n "$key" ] || continue
  grep -qE "^${key}=" .env || MISSING="${MISSING} ${key}"
done < <(grep -oE '^[A-Z_]+' .env.example || true)

if [ -n "$MISSING" ]; then
  warn "missing from your .env:${MISSING}"
  warn 'copy them from .env.example, or prebuild will fail validation'
fi

if grep -q '^EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here' .env 2>/dev/null; then
  warn 'EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is still the placeholder'
  warn 'the app builds, but sign-in will not work until you set a real key'
  warn 'get one at https://dashboard.clerk.com -> Settings -> API Keys'
fi

# ----------------------------------------------------------------- dependencies
step 'Installing dependencies'
# --frozen-lockfile matches CI, so a lockfile that drifted fails here rather
# than silently resolving to different versions than everyone else has.
if ! pnpm install --frozen-lockfile; then
  warn 'frozen install failed — the lockfile is out of sync with package.json'
  die  'run `pnpm install` to update it, then commit the lockfile'
fi
ok 'dependencies installed (git hooks registered via the prepare script)'

# ----------------------------------------------------------------- verification
if [ "$VERIFY" -eq 1 ]; then
  step 'Verifying'
  pnpm run lint        && ok 'lint'
  pnpm run type-check  && ok 'type-check'
  pnpm run test        && ok 'tests'
  pnpm run check-specs && ok 'specs'
  npx expo-doctor@latest || warn 'expo-doctor reported issues (see above)'
fi

# ----------------------------------------------------------------------- next
cat <<'NEXT'

Setup complete.

  pnpm start          start the dev server
  pnpm ios            build and run on iOS
  pnpm android        build and run on Android
  pnpm check-all      lint + type-check + translations + tests + specs

This app uses native modules (@clerk/expo, expo-secure-store, MMKV), so it
cannot run in Expo Go. You need a development build:

  pnpm prebuild:development
  pnpm ios            # or: pnpm android

See AGENTS.md for the codebase guide and agents/commands.md for all commands.
NEXT
