# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a production-ready React Native starter kit built with Expo, TypeScript, and modern tooling. It's designed for building high-quality mobile applications with a focus on developer experience, performance, and code maintainability.

**Key Technologies:**

- Expo SDK 54 with Custom Dev Client and New Architecture enabled
- React Native 0.81.5 with React 19
- Expo Router (file-based routing with typed routes)
- Uniwind (TailwindCSS for React Native)
- HeroUI Native (UI component library)
- React Query (react-query-kit) for data fetching
- Zustand for global state management
- React Native MMKV for secure storage
- React Hook Form + Zod for form handling and validation

## Canonical Documentation (SOURCE OF TRUTH)

**CRITICAL:** This project uses specialized UI and styling libraries with official AI documentation. Always consult these when working with components and styling:

- **Uniwind Documentation:** https://docs.uniwind.dev/llms-full.txt
- **HeroUI Native Documentation:** https://v3.heroui.com/native/llms-full.txt

**Mandatory Rules:**

1. Use HeroUI Native components whenever possible - DO NOT recreate components already provided
2. Use Uniwind exclusively for styling (TailwindCSS-like syntax)
3. DO NOT use web-only HeroUI components (this is React Native)
4. Follow documented APIs only - do not hallucinate props or components
5. If conflict occurs: follow HeroUI Native component behavior + Uniwind styling conventions

See `llms.txt` file in the root for additional references.

## Package Manager

**CRITICAL:** This project uses `pnpm` exclusively. The `preinstall` script enforces this. Always use `pnpm` for installing dependencies.

For new packages: `npx expo install <package-name>` (which will use pnpm internally)

## Development Commands

**Start Development Server:**

```bash
pnpm start                    # Development environment
pnpm start:staging            # Staging environment
pnpm start:production         # Production environment
```

**Run on Devices:**

```bash
pnpm ios                      # iOS development
pnpm android                  # Android development
pnpm ios:staging              # iOS staging
pnpm android:staging          # Android staging
```

**Prebuild (generate native projects):**

```bash
pnpm prebuild                 # Development environment
pnpm prebuild:staging         # Staging environment
pnpm prebuild:production      # Production environment
```

**Quality Checks:**

```bash
pnpm lint                     # Run ESLint
pnpm type-check               # TypeScript type checking
pnpm lint:translations        # Validate translation files
pnpm test                     # Run Jest tests
pnpm test:watch               # Run tests in watch mode
pnpm check-all                # Run all checks (lint + type-check + translations + test)
```

**E2E Testing:**

```bash
pnpm install-maestro          # Install Maestro CLI
pnpm e2e-test                 # Run E2E tests with Maestro
```

**Utilities:**

```bash
pnpm doctor                   # Run expo-doctor for health checks
pnpm xcode                    # Open Xcode workspace
```

## Code Architecture

### Multi-Environment Configuration

The project supports three environments (development, staging, production) through an environment variable system:

1. **Environment Variables:** Managed via `env.js` and `.env.{APP_ENV}` files
2. **Environment Selection:** Set via `APP_ENV` environment variable (defaults to development)
3. **Client vs Build-time Variables:**
   - Client variables are exposed to the app via `@env` import
   - Build-time variables are only available during build process in `app.config.ts`
4. **Environment Validation:** Uses Zod schemas to validate required variables at build time

When adding new environment variables:

- Add to the appropriate schema in `env.js` (client or buildTime)
- Add the variable to the corresponding object (\_clientEnv or \_buildTimeEnv)
- Create/update the variable in all `.env.*` files

### File-Based Routing with Expo Router

The app uses Expo Router with typed routes (enabled in app.config.ts):

- **Routes are defined in `src/app/`** directory using file-system conventions
- `(app)` folder contains authenticated routes
- `_layout.tsx` files define layout hierarchies
- Route parameters are type-safe via generated types

### State Management Architecture

**Global State (Zustand):**

- Auth state managed in `src/lib/auth/index.tsx`
- Uses Zustand store with selectors pattern (via `createSelectors` utility)
- Token persistence via MMKV storage
- Hydration happens on app launch

**Server State (React Query):**

- API calls in `src/api/` directory
- Uses `react-query-kit` for strongly typed queries and mutations
- Example pattern in `src/api/posts/use-posts.ts`
- Axios client configured in `src/api/common/client.tsx` with baseURL from env

### Storage Layer

Uses react-native-mmkv for synchronous, secure key-value storage:

- Wrapper utilities in `src/lib/storage.tsx`
- `getItem<T>`, `setItem<T>`, `removeItem` provide type-safe JSON serialization
- Used for persisting auth tokens, user preferences, etc.

### Provider Hierarchy

The app wraps components in this provider order (see `src/app/_layout.tsx`):

1. GestureHandlerRootView (gesture support)
2. KeyboardProvider (keyboard handling)
3. AppThemeProvider (theme management with system/light/dark modes)
4. HeroUINativeProvider (UI component context)
5. APIProvider (React Query setup)
6. BottomSheetModalProvider (bottom sheet modals)

### Form Handling Pattern

Forms use react-hook-form + zod + react-native-keyboard-controller:

```tsx
const schema = z.object({
  /* validation */
});
type FormType = z.infer<typeof schema>;

export const MyForm = ({ onSubmit }: { onSubmit: SubmitHandler<FormType> }) => {
  const { handleSubmit, control } = useForm<FormType>({
    resolver: zodResolver(schema),
  });

  return (
    <KeyboardAvoidingView behavior="padding">
      <ControlledInput control={control} name="fieldName" label="Label" />
      <Button onPress={handleSubmit(onSubmit)} />
    </KeyboardAvoidingView>
  );
};
```

### Internationalization (i18n)

- Translation files in `src/translations/` (JSON format)
- i18next with react-i18next integration
- ESLint validates translation files (identical keys, sorted keys, valid syntax)
- Translations are type-safe via custom TypeScript definitions

## Code Standards (from .cursor/rules)

### File Organization

```
src/
  ├── api/          # API layer: axios client, react-query hooks, types
  ├── app/          # Expo Router screens and navigation (_layout.tsx files)
  ├── components/   # Shared components
  │   └── ui/       # Core UI components (buttons, inputs, etc.)
  ├── lib/          # Utilities: auth, env, hooks, i18n, storage, test-utils, utils
  ├── translations/ # i18n JSON files
  └── types/        # Shared TypeScript types
```

### Naming Conventions

- **Files and directories:** kebab-case (e.g., `visa-form.tsx`)
- **Components:** PascalCase, named exports preferred
- **Maximum 80 lines per component** - break into smaller pieces if longer
- **Variables:** descriptive names with auxiliary verbs (isLoading, hasError)

### TypeScript

- Use TypeScript for all code
- Prefer `type` over `interface`
- Avoid `enum` - use const objects with `as const` assertion
- Use absolute imports: `@/...` (configured in tsconfig.json)
- Define explicit return types for functions
- Avoid try/catch blocks unless necessary to handle errors at that abstraction level

### React Patterns

- Use functional components only (no classes)
- Use `function` keyword for pure functions
- Props defined at top of component file
- Avoid unnecessary re-renders with `useMemo` and `useCallback`
- Keep components focused on single responsibility

### Styling

- Use Uniwind (TailwindCSS) for all styling with `className` prop
- Use built-in components from `@/components/ui` (Button, Input, Text, View, Image, etc.)
- Use defined colors and fonts from tailwind config
- Note: Animated.View doesn't support `className`, use `style` prop instead

### ESLint Rules

Key enforced rules (see eslint.config.mjs):

- `max-params`: Maximum 3 parameters per function
- `max-lines-per-function`: Maximum 70 lines
- `unicorn/filename-case`: Enforce kebab-case filenames
- `simple-import-sort/imports`: Auto-sort imports
- `unused-imports/no-unused-imports`: Remove unused imports
- `@typescript-eslint/consistent-type-imports`: Use `import type` syntax

### Testing

- Jest + React Native Testing Library
- Test files: `component-name.test.tsx` (same location as component)
- Only test utilities and complex components (skip simple presentational components)
- Test patterns in `src/lib/test-utils.tsx`

### Git Commit Messages

Use conventional commit format with lowercase:

- `feat:` - new features
- `fix:` - bug fixes
- `perf:` - performance improvements
- `docs:` - documentation changes
- `style:` - formatting changes
- `refactor:` - code refactoring
- `test:` - adding tests
- `chore:` - maintenance tasks

Maximum 100 characters for summary line.

## Important Implementation Notes

1. **Avoid over-engineering:** Only make requested changes. Don't add extra features, refactoring, or "improvements" unless explicitly asked.

2. **No unnecessary abstractions:** Don't create helpers or utilities for one-time operations. Three similar lines are better than premature abstraction.

3. **Minimal error handling:** Only validate at system boundaries (user input, external APIs). Trust internal code and framework guarantees.

4. **Delete unused code completely:** No backwards-compatibility hacks like `_unused` variables, re-exports, or `// removed` comments.

5. **Read before modifying:** Always read a file before proposing changes. Understand existing patterns.

6. **Component size:** Keep components under 80 lines. Break down larger components.

7. **React Compiler enabled:** The project uses React Compiler (experimental), so avoid manual memoization unless profiling shows it's needed.

8. **New Architecture:** The project has `newArchEnabled: true` in app.config.ts. Be aware of New Architecture compatibility when adding libraries.
