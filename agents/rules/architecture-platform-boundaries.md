# Architecture Platform Boundaries

## Rule
- Keep platform-specific code in `src/lib/` or inside feature folders. Avoid sprinkling native modules throughout the codebase.
- **iOS/Android divergence** — use `Platform.select()` or separate files (`.ios.ts`, `.android.ts`) behind a thin abstraction layer.
- **Permissions** — request permissions at the point of use, centralize checks in a hook if reused, and document rationale in the feature's `decisions.md`.

## Rationale
Platform differences are inevitable but should be isolated. Scattering `Platform.OS` checks makes code hard to read and test. Centralized permission logic ensures consistent UX and auditability.

## Examples

### Good
```tsx
// src/lib/platform/permissions.ts
export async function requestCameraPermission(): Promise<boolean> {
  if (Platform.OS === 'ios') {
    // iOS-specific logic
  }
  // Android-specific logic
}
```

```tsx
// src/features/onboarding/permissions-hook.ts
export function useOnboardingPermissions() {
  const requestNotification = useCallback(async () => {
    const granted = await requestNotificationPermission();
    if (!granted) track('permission_denied', { type: 'notification' });
    return granted;
  }, []);
  return { requestNotification };
}
```

### Bad
```tsx
// Scattered platform checks throughout components
const MyComponent = () => {
  if (Platform.OS === 'ios') { ... } // ❌ Hard to test, scattered
  return <View />;
};
```

```tsx
// Requesting permissions in random places without tracking
useEffect(() => {
  PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA); // ❌ No hook, no tracking
}, []);
```

## Enforcement
- Review: check for `Platform.OS` in component files (should be in lib/ or hooks)
- Review: verify permission requests go through centralized hooks
- ESLint: could add rule to flag `Platform.OS` outside allowed directories
