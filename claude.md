> This project was generated from the [Obytes React Native Template](https://github.com/obytes/react-native-template-obytes), a production-ready React Native starter with modern tooling and best practices.

## What: Technology Stack

- **Expo SDK 57** with React Native 0.86 and React 19.2 - Managed React Native development
- **TypeScript** - Strict type safety throughout
- **Expo Router** - File-based routing (like Next.js). Import navigation APIs from `expo-router` or `expo-router/react-navigation`, never from `@react-navigation/*`
- **TailwindCSS** via Uniwind - Utility-first styling for React Native
- **Zustand** - Lightweight global state management
- **React Query** - Server state and data fetching
- **TanStack Form + Zod** - Type-safe form handling and validation
- **MMKV** - Encrypted local storage
- **Jest + React Testing Library** - Unit testing

## What: Project Structure

```
src/
├── app/              # Expo Router file-based routes (add new routes here)
├── features/         # Feature modules - auth, feed, settings are EXAMPLES
├── components/ui/    # Pre-built UI components (button, input, modal, etc.)
├── lib/              # Pre-configured utilities (api, auth, i18n, storage)
├── translations/     # i18n files (en.json, ar.json - add more languages)
└── global.css        # TailwindCSS configuration

Root Files:
├── env.ts           # Environment config (CUSTOMIZE bundle IDs, API URLs)
├── app.config.ts    # Expo configuration
└── README.md        # Project-specific documentation
```

## How: Development Workflow

**Essential Commands:**
```bash
bun start               # Start dev server
bun ios / bun android   # Run on platform
bun run lint            # ESLint check
bun run type-check      # TypeScript validation
bun run test            # Run Jest tests
bun run check-all       # All quality checks
```

**Environment-Specific:**
```bash
bun run start:preview           # Preview environment
bun run ios:production          # Production iOS
bun run build:production:ios    # EAS production build
```

## How: Key Patterns

- **Create features**: New folder in `src/features/[your-feature]/` with screens, components, API hooks
- **Add routes**: Create files in `src/app/` (file-based routing)
- **Forms**: Use TanStack Form + Zod (see `src/features/auth/components/login-form.tsx`)
- **Data fetching**: Use React Query (see `src/features/feed/api.ts`)
- **Global state**: Use Zustand (see `src/features/auth/use-auth-store.tsx`)
- **Styling**: NativeWind/Tailwind classes (see `src/components/ui/button.tsx`)
- **Storage**: Use MMKV via `src/lib/storage.tsx` for sensitive data
- **Imports**: Always use `@/` prefix, never relative imports

## How: Essential Rules

- ✅ **DO** use absolute imports: `@/components/ui/button`
- ✅ **DO** follow feature-based structure: `src/features/[name]/`
- ✅ **DO** use TanStack Form for forms (not react-hook-form)
- ✅ **DO** use MMKV storage for sensitive data (not AsyncStorage)
- ✅ **DO** use Bun for installs and scripts (`bun install`, `bun add`, `bun run <script>`). Use `bun run test`, not `bun test`, which starts Bun's own test runner instead of Jest
- ✅ **DO** use EAS Build for production: `bun run build:production:ios`
- ✅ **DO** prefix env vars with `EXPO_PUBLIC_*` for app access
- ❌ **DO NOT** modify `android/` or `ios/` directly (use Expo config plugins)

## How: Verify UI Changes on Devices (Argent, opt-in)

[Argent](https://argent.swmansion.com) lets AI assistants drive iOS simulators and Android emulators. It is not installed by default. Set it up with `bun run argent:setup`.

When Argent's MCP tools are available:

- Verify any change to visible UI, navigation or styling on a simulator or emulator, not only with tests
- Start Metro with `bun start`, then build with `bun ios` or `bun android`
- Prefer Argent's React Native component tree for tap targets, since screens expose `testID`s
- Keep reusable QA flows in `.argent/flows/` and commit them. Never commit `.argent/secrets.env`
