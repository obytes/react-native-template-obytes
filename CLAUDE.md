# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a production-ready React Native template built with Expo, TypeScript, and NativeWind. It's designed for building mobile applications with modern best practices, focusing on developer experience and performance.

## Key Technologies

- **Expo SDK 53** with custom dev client
- **React Native 0.79.4** with React 19
- **TypeScript** with strict configuration
- **NativeWind v4** (Tailwind CSS for React Native)
- **Expo Router v5** for file-based navigation
- **React Query** with react-query-kit for data fetching
- **Zustand** for state management
- **React Native MMKV** for secure storage
- **Zod** for schema validation
- **React Hook Form** for form handling
- **i18next** for internationalization

## Development Commands

### Core Commands

- `pnpm start` - Start Expo development server
- `pnpm android` - Run on Android device/emulator
- `pnpm ios` - Run on iOS device/simulator
- `pnpm web` - Run on web browser
- `pnpm xcode` - Open iOS project in Xcode

### Environment-specific Commands

- `pnpm start:staging` - Start with staging environment
- `pnpm start:production` - Start with production environment
- `pnpm prebuild` - Generate native code
- `pnpm prebuild:staging` - Generate native code for staging
- `pnpm prebuild:production` - Generate native code for production

### Quality Assurance

- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript type checking
- `pnpm lint:translations` - Lint JSON translation files
- `pnpm test` - Run Jest tests
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:ci` - Run tests with coverage for CI
- `pnpm check-all` - Run all quality checks (lint + type-check + translations + tests)

### Build Commands

- `pnpm build:development:ios` - Build development iOS app
- `pnpm build:development:android` - Build development Android app
- `pnpm build:staging:ios` - Build staging iOS app
- `pnpm build:staging:android` - Build staging Android app
- `pnpm build:production:ios` - Build production iOS app
- `pnpm build:production:android` - Build production Android app

### Other Commands

- `pnpm doctor` - Run Expo Doctor to check project health
- `pnpm e2e-test` - Run end-to-end tests with Maestro
- `pnpm app-release` - Create app release with version bump

## Project Architecture

### Directory Structure

```
src/
├── api/              # API layer with React Query
│   ├── common/       # Shared API utilities, client config
│   └── posts/        # Example API endpoints and hooks
├── app/              # Expo Router screens (file-based routing)
│   ├── (app)/        # Authenticated app screens
│   ├── feed/         # Feed-related screens
│   ├── login.tsx     # Authentication screen
│   └── onboarding.tsx# First-time user flow
├── components/       # Shared UI components
│   ├── ui/           # Core UI components (Button, Input, Text, etc.)
│   └── settings/     # Feature-specific components
├── lib/              # Shared utilities and configuration
│   ├── auth/         # Authentication logic
│   ├── hooks/        # Custom React hooks
│   ├── i18n/         # Internationalization setup
│   ├── env.js        # Environment variable validation
│   ├── storage.tsx   # MMKV storage wrapper
│   └── utils.ts      # General utilities
├── translations/     # i18n JSON files
└── types/           # Shared TypeScript types
```

### Key Architectural Patterns

**State Management:**

- Zustand for global state (auth, settings)
- React Query for server state caching
- MMKV for persistent storage
- React Hook Form for form state

**Navigation:**

- Expo Router with file-based routing
- Typed routes enabled for type safety
- Authentication flow with route protection

**Styling:**

- NativeWind v4 with Tailwind CSS classes
- Custom color system defined in `src/components/ui/colors.js`
- Dark mode support with theme provider

**Data Fetching:**

- React Query with react-query-kit for type-safe APIs
- Axios client with interceptors in `src/api/common/client.tsx`
- Custom hooks pattern for API endpoints

## Environment Configuration

The project uses a sophisticated environment system:

- **Development:** Local development with `.env.development`
- **Staging:** Internal testing with `.env.staging`
- **Production:** App store builds with `.env.production`

Environment variables are validated using Zod schemas in `env.js`. Client variables are accessible via `@env` import alias.

## Code Standards

**File Naming:** Use kebab-case for all files and directories (e.g., `user-profile.tsx`)

**Components:**

- Use functional components with TypeScript
- Props defined as `type Props = {...}`
- Maximum 80 lines per component
- Use absolute imports with `@/` prefix

**Testing:**

- Jest with React Native Testing Library
- Test files use `.test.tsx` extension
- Focus on utilities and complex component logic
- Run tests with `pnpm test`

**Linting:**

- ESLint with custom configuration
- Prettier for code formatting
- Import sorting with simple-import-sort
- TailwindCSS class ordering
- Custom rules: max 3 params, max 70 lines per function

## Package Management

- **Package Manager:** pnpm (required - enforced by preinstall script)
- **Install Packages:** Use `npx expo install <package>` for Expo compatibility
- **Dependencies:** All managed through Expo SDK for compatibility

## Build System

**EAS Build:**

- Development builds with dev client
- Staging builds for internal testing
- Production builds for app stores
- Multi-environment support with different bundle IDs

**Native Configuration:**

- iOS: Bundle ID varies by environment (com.obytes, com.obytes.staging, etc.)
- Android: Package name follows same pattern
- App icons badged for non-production builds

## Testing Strategy

**Unit Tests:** Jest + React Native Testing Library for components and utilities
**E2E Tests:** Maestro for end-to-end user flows
**Type Safety:** Strict TypeScript with comprehensive type checking

Always run `pnpm check-all` before committing to ensure code quality.
