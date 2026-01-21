# Dependency Updates

## Overview

Update all major dependencies to their latest stable versions for:
- **Security patches** and vulnerability fixes
- **Performance improvements**
- **New features** and capabilities
- **Better compatibility** with Expo SDK 54

## Current Major Dependencies

- @tanstack/react-query: ^5.52.1
- zustand: ^5.0.5
- react-hook-form: ^7.53.0
- axios: ^1.7.5
- zod: ^3.23.8
- @gorhom/bottom-sheet: ^5.0.5
- @shopify/flash-list: 1.7.6
- react-native-mmkv: ~3.1.0

---

## Step-by-Step Instructions

### 4.1 Update React Query

```bash
pnpm update @tanstack/react-query@latest
pnpm add -D @dev-plugins/react-query@latest
```

#### Breaking Changes from v4 to v5

If you're already on v5, this is just a version bump. If coming from v4:

| v4 | v5 | Notes |
|----|----|----|
| `isLoading` | `isPending` | Status renamed |
| `cacheTime` | `gcTime` | Garbage collection time |
| `keepPreviousData` | `placeholderData` | Merged into one option |
| Callbacks in useQuery | Removed | Use side effects instead |
| Multiple syntaxes | Object only | Must use object syntax |

#### Migration Example

```typescript
// Before (v4)
const { isLoading, data } = useQuery('posts', fetchPosts, {
  cacheTime: 5000,
  keepPreviousData: true,
  onSuccess: data => console.log(data),
});

// After (v5)
const { isPending, isFetching, data } = useQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts,
  gcTime: 5000,
  placeholderData: keepPreviousData,
});

// Handle side effects separately
useEffect(() => {
  if (data) {
    console.log(data);
  }
}, [data]);

// Note: isLoading is now defined as isPending && isFetching
const isLoading = isPending && isFetching;
```

#### Use Codemod for Auto-Migration

```bash
npx @tanstack/react-query-v5-codemod ./src
```

**Remarks:**
- React Query v5 requires React 18+
- Test all queries and mutations after update
- Review [official migration guide](https://tanstack.com/query/latest/docs/framework/react/guides/migrating-to-v5)

---

### 4.2 Update Zustand

```bash
pnpm update zustand@latest
```

#### Best Practices to Check

Zustand v5 has no major breaking changes from v4, but ensure you're following best practices:

**✅ Good Patterns:**

```typescript
// Always use selectors
// Shallow comparison for objects
import { shallow } from 'zustand/shallow';

const token = useAuthStore(state => state.token);

// Custom hooks for cleaner interfaces
export const useToken = () => useAuthStore(state => state.token);
export const useUser = () => useAuthStore(state => state.user);
const { user, token } = useAuthStore(
  state => ({ user: state.user, token: state.token }),
  shallow
);

// Actions in the store
const useAuthStore = create(set => ({
  token: null,
  user: null,
  login: async (credentials) => {
    const { token, user } = await api.login(credentials);
    set({ token, user });
  },
  logout: () => set({ token: null, user: null }),
}));
```

**❌ Bad Patterns:**

```typescript
// Don't subscribe to entire store (causes unnecessary re-renders)
const store = useAuthStore();

// Don't put business logic in components
async function handleLogin() {
  const result = await api.login(credentials);
  useAuthStore.setState({ token: result.token });
}
```

**Remarks:**
- Zustand v5 is stable and production-ready
- No breaking changes from v4 to v5
- Review [best practices](https://tkdodo.eu/blog/working-with-zustand)

---

### 4.3 Update Other Core Dependencies

```bash
# Forms
pnpm update react-hook-form@latest @hookform/resolvers@latest zod@latest

# HTTP Client
pnpm update axios@latest

# UI Libraries
pnpm update @gorhom/bottom-sheet@latest @shopify/flash-list@latest

# Storage
pnpm update react-native-mmkv@latest

# Gesture & Animation (handled in Expo upgrade)
# react-native-gesture-handler and react-native-reanimated are managed by Expo

# Other Utilities
pnpm update lodash.memoize@latest tailwind-variants@latest
pnpm update react-error-boundary@latest react-query-kit@latest

# i18n
pnpm update i18next@latest react-i18next@latest

# Navigation (managed by Expo)
# expo-router is managed by Expo SDK
```

**Remarks:**
- These updates should be non-breaking
- Test forms, API calls, and UI components after update
- Check release notes for any breaking changes

---

### 4.4 Update Development Dependencies

```bash
# Testing
pnpm update -D jest@latest @testing-library/react-native@latest @testing-library/jest-dom@latest

# TypeScript
pnpm update -D typescript@latest

# Type Definitions
pnpm update -D @types/react@latest @types/jest@latest @types/lodash.memoize@latest

# Build Tools
pnpm update -D @babel/core@latest cross-env@latest

# Git Hooks
pnpm update -D husky@latest lint-staged@latest
pnpm update -D @commitlint/cli@latest @commitlint/config-conventional@latest

# (Tailwind will be updated in Uniwind migration)
```

**Remarks:**
- Dev dependency updates are usually safe
- May need to update test configurations
- Check TypeScript version compatibility

---

### 4.5 Run Compatibility Checks

```bash
# Check for outdated packages
pnpm outdated

# Check for security vulnerabilities
pnpm audit

# Run Expo doctor
npx expo-doctor
```

**What to look for:**
- ⚠️ Major version updates you might have missed
- 🔴 High/critical security vulnerabilities
- ⚠️ Incompatibilities flagged by expo-doctor

---

### 4.6 Update package.json Version Ranges

Review `package.json` and update pinned versions to use ranges:

```json
{
  "dependencies": {
    // ✅ Good - allows automatic minor/patch updates
    "@shopify/flash-list": "^1.7.6",
    "@tanstack/react-query": "^5.60.0",
    "zustand": "^5.0.10",

    // ⚠️ Consider updating these from ~ to ^
    "react-native-mmkv": "^3.2.0", // was ~3.1.0

    // ✅ Expo packages should use ~
    "expo": "~54.0.0",
    "expo-router": "~5.1.0"
  }
}
```

**Version Range Guide:**
- `^` - Allow minor and patch updates (recommended for most packages)
- `~` - Allow patch updates only (use for Expo packages)
- No prefix - Exact version (avoid unless necessary)

---

### 4.7 Test Core Functionality

After updating dependencies, test:

**Forms:**
```typescript
// Test react-hook-form + zod validation
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const { control, handleSubmit } = useForm({
  resolver: zodResolver(schema),
});
```

**State Management:**
```typescript
// Test Zustand stores
const token = useAuthStore(state => state.token);
const login = useAuthStore(state => state.login);
```

**Data Fetching:**
```typescript
// Test React Query
const { isPending, data, error } = useQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts,
});
```

**API Calls:**
```typescript
// Test axios
const response = await axios.get('/api/endpoint');
```

---

## Verification Checklist

- [ ] All dependencies updated
- [ ] `pnpm outdated` shows no major updates available
- [ ] `pnpm audit` shows no high/critical vulnerabilities
- [ ] `npx expo-doctor` passes
- [ ] Forms work (react-hook-form + zod)
- [ ] State management works (Zustand)
- [ ] Data fetching works (React Query)
- [ ] API calls work (axios)
- [ ] UI components render correctly
- [ ] Animations work
- [ ] Storage/persistence works (MMKV)
- [ ] i18n/translations work
- [ ] No console errors/warnings
- [ ] Tests pass

---

## Common Issues

### Issue 1: React Query isLoading undefined

**Solution:**
```typescript
// Update to use isPending
const { isPending, isFetching, data } = useQuery(...)

// Or create isLoading
const isLoading = isPending && isFetching
```

### Issue 2: Type errors after TypeScript update

**Solution:**
```bash
# Regenerate types
pnpm type-check

# Update tsconfig.json if needed
# Check for deprecated compiler options
```

### Issue 3: Tests failing after updates

**Solution:**
```bash
# Update test utils
# Check jest.config.js
# Update transformIgnorePatterns if needed

# Clear Jest cache
jest --clearCache
pnpm test
```

### Issue 4: Bottom sheet not working

**Solution:**
```bash
# Ensure gesture-handler is properly installed
pnpm prebuild

# Check that GestureHandlerRootView wraps your app
```

---

## React Query v5 - Detailed Changes

### Status Changes

```typescript
// v4
isLoading; // loading for first time
isFetching; // loading (including refetches)

// v5
isPending; // loading for first time (renamed from isLoading)
isFetching; // loading (including refetches)
isLoading; // computed: isPending && isFetching
```

### Configuration Changes

```typescript
// v4
cacheTime: 5000; // how long unused data stays in cache

// v5
gcTime: 5000; // renamed from cacheTime
```

### Previous Data

```typescript
// v4
keepPreviousData: true;

// v5
placeholderData: keepPreviousData; // special function
// or
placeholderData: previousData => previousData;
```

### Callbacks Removed

```typescript
// v4
useQuery('key', fn, {
  onSuccess: (data) => {},
  onError: (error) => {},
  onSettled: () => {},
});

// v5 - Use useEffect instead
const { data, error } = useQuery({ queryKey: ['key'], queryFn: fn });

useEffect(() => {
  if (data) {
    // onSuccess
  }
}, [data]);

useEffect(() => {
  if (error) {
    // onError
  }
}, [error]);
```

---

## Zustand Best Practices

### 1. Always Use Selectors

```typescript
// ❌ Bad - subscribes to entire store
const store = useAuthStore();

// ✅ Good - subscribes only to what you need
const token = useAuthStore(state => state.token);
const user = useAuthStore(state => state.user);
```

### 2. Create Custom Hooks

```typescript
// Store
export const useAuthStore = create(set => ({
  token: null,
  user: null,
  login: async (credentials) => { /* ... */ },
}));

// Custom hooks
export const useToken = () => useAuthStore(state => state.token);
export const useUser = () => useAuthStore(state => state.user);
export const useIsAuthenticated = () => useAuthStore(state => !!state.token);

// Usage
const token = useToken();
const isAuthenticated = useIsAuthenticated();
```

### 3. Use Shallow Comparison for Objects

```typescript
import { shallow } from 'zustand/shallow';

// ❌ Creates new object every render
const { user, token } = useAuthStore(state => ({
  user: state.user,
  token: state.token
}));

// ✅ Uses shallow comparison
const { user, token } = useAuthStore(
  state => ({ user: state.user, token: state.token }),
  shallow
);
```

### 4. Keep Business Logic in Store

```typescript
// ✅ Good - logic in store
const useAuthStore = create((set, get) => ({
  token: null,
  login: async (credentials) => {
    const { token, user } = await api.login(credentials);
    set({ token, user });
    // Store analytics event
    analytics.track('login');
  },
  logout: () => {
    set({ token: null, user: null });
    // Clear persisted data
    storage.delete('token');
  },
}));

// ❌ Bad - logic in component
function Component() {
  const handleLogin = async () => {
    const result = await api.login(credentials);
    useAuthStore.setState({ token: result.token });
    analytics.track('login');
  };
}
```

---

## Useful Links

### React Query
- [TanStack Query v5 Migration](https://tanstack.com/query/latest/docs/framework/react/guides/migrating-to-v5)
- [React Query Docs](https://tanstack.com/query/latest)
- [React Query Examples](https://tanstack.com/query/latest/docs/framework/react/examples)

### Zustand
- [Zustand GitHub](https://github.com/pmndrs/zustand)
- [Zustand Best Practices](https://www.projectrules.ai/rules/zustand)
- [Working with Zustand (Blog)](https://tkdodo.eu/blog/working-with-zustand)

### Other Libraries
- [React Hook Form Docs](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)
- [Axios Documentation](https://axios-http.com/)
- [Flash List Documentation](https://shopify.github.io/flash-list/)
- [MMKV Documentation](https://github.com/mrousavy/react-native-mmkv)

### Tools
- [Expo Doctor](https://docs.expo.dev/more/expo-cli/#doctor)
- [npm-check-updates](https://www.npmjs.com/package/npm-check-updates)

---

## Next Steps

After completing dependency updates:

1. ✅ Run full test suite
2. ✅ Test all features manually
3. ✅ Commit changes
4. ➡️ Continue to `05-uniwind-migration.md`

---

**Estimated Time:** 45-60 minutes
**Difficulty:** Medium
**Impact:** Medium (may require code changes for breaking changes)
