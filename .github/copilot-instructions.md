# GitHub Copilot Instructions - Smart Food App

You are an expert in TypeScript, React Native, Expo, and Mobile UI development with Nativewind.

## Project Context

This is a React Native mobile application built with Expo, using TypeScript and Nativewind for styling.

## Code Style and Structure

- Write concise, technical TypeScript code with accurate examples
- Use functional and declarative programming patterns; avoid classes
- Prefer iteration and modularization over code duplication
- Use descriptive variable names with auxiliary verbs (e.g., isLoading, hasError)
- Component Modularity: Break down components into smaller, reusable pieces (max 80 lines)
- Keep components focused on a single responsibility
- To install packages use `npx expo install <package-name>`

## Repository Structure

```
src/
  ├── api/          # API code using axios and react-query
  ├── app/          # Expo router screens and navigation
  ├── components/   # Shared components
  │   └── ui/       # Core UI components (buttons, inputs, etc)
  ├── lib/          # Shared utilities, auth, hooks, i18n, storage
  ├── translations/ # i18n translation files
  └── types/        # Shared TypeScript types
```

## Tech Stack

- **Framework**: Expo SDK ~53, React Native 0.79
- **Language**: TypeScript
- **Styling**: Nativewind (Tailwind CSS for React Native)
- **Routing**: Expo Router (file-based)
- **State Management**: Zustand
- **API/Data**: React Query + React Query Kit + Axios
- **Storage**: React Native MMKV
- **Forms**: React Hook Form + Zod
- **i18n**: i18next + react-i18next
- **Animations**: React Native Reanimated + Moti
- **Testing**: Jest + React Native Testing Library

## Naming Conventions

- Use **kebab-case** for all file names and directories (e.g., `visa-form.tsx`)
- Favor **named exports** for components and utilities
- Component files should match component name in kebab-case

## TypeScript Guidelines

- Use TypeScript for all code
- Prefer `type` over `interface`
- Avoid enums; use const objects with `as const` assertion
- Use functional components with TypeScript types
- Define strict types for all props and function parameters
- Use **absolute imports** with `@/` prefix
- Avoid try/catch blocks unless necessary
- Use explicit return types for all functions

## State Management

- Use **Zustand** for global state management
- Implement proper cleanup in useEffect hooks
- Use React Query for server state

## Syntax and Formatting

- Use `function` keyword for pure functions
- Avoid unnecessary curly braces in conditionals
- Use declarative JSX
- Implement proper TypeScript discriminated unions

## UI and Styling

- Use **Nativewind** for styling (Tailwind CSS syntax)
- Import UI components from `@/components/ui` (Button, Input, Text, View, etc)
- Use defined colors and fonts from tailwind.config.js
- Ensure high accessibility (a11y) standards
- Use react-native-reanimated for performant animations
- Avoid unnecessary re-renders using useMemo and useCallback
- Always use SafeAreaView for proper screen boundaries

## Component Example

```tsx
import * as React from 'react';
import { Text, View, Image } from '@/components/ui';

type Props = {
  text: string;
};

export function Title({ text }: Props) {
  return (
    <View className="flex-row items-center justify-center py-4 pb-2">
      <Text className="pr-2 text-2xl">{text}</Text>
      <View className="h-[2px] flex-1 bg-neutral-300" />
      <Image
        source={require('@/assets/images/demo.png')}
        style={{ width: 24, height: 24 }}
        contentFit="contain"
      />
    </View>
  );
}
```

## Error Handling

- Log errors appropriately for debugging
- Provide user-friendly error messages
- Use error boundaries for React component errors

## Testing Guidelines

- Write unit tests using Jest and React Native Testing Library
- Test utilities and complex components
- Name test files with `.test.tsx` extension (e.g., `component-name.test.tsx`)
- Skip tests for simple presentational components
- Focus on testing business logic and user interactions

## Git Commit Conventions

Use conventional commits format:

- `feat:` - new features
- `fix:` - bug fixes
- `refactor:` - code refactoring
- `style:` - formatting changes
- `docs:` - documentation updates
- `test:` - adding tests
- `chore:` - maintenance tasks
- `perf:` - performance improvements

**Rules:**

- Use lowercase
- Keep summary under 100 characters
- Reference issue numbers when applicable

## Performance Best Practices

- Use FlashList instead of FlatList for long lists
- Memoize expensive computations
- Optimize images using expo-image
- Use React.memo for expensive components
- Avoid inline functions in render methods

## Navigation

- Use Expo Router for navigation
- Place screens in `src/app/` directory
- Use typed navigation params
- Implement proper deep linking

## API Integration

- Use React Query for data fetching
- Create custom hooks with React Query Kit
- Handle loading, error, and success states
- Implement proper caching strategies
- Use axios for HTTP requests

## i18n (Internationalization)

- Store translations in `src/translations/`
- Use i18next for translations
- Use translation keys instead of hardcoded strings
- Support RTL languages if needed

## Environment Variables

- Use `env.js` for environment configuration
- Support multiple environments (development, staging, production)
- Never commit sensitive credentials

## Code Quality

- Follow ESLint rules
- Use Prettier for formatting
- Run type checking before commits
- Use Husky for pre-commit hooks
- Maintain test coverage
