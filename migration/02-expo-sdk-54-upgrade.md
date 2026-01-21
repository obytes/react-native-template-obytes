# Expo SDK 54 Upgrade

## Overview

Upgrade from Expo SDK 53 to SDK 54, which includes:
- **React Native 0.81** (from 0.79.4)
- **React 19.1** (from 19.0.0)
- **Faster iOS builds** with precompiled XCFrameworks
- **iOS 26 & Android 16 support**
- **Reanimated v4** (requires New Architecture)
- **New expo-file-system API**

## Major Breaking Changes

⚠️ **Important:** Review these before upgrading

1. **Reanimated v4** - Only supports New Architecture (or stay on v3 for Legacy)
2. **expo-file-system** - Legacy API moved to `expo-file-system/legacy`
3. **Metro internal imports** - Changed from `metro/src/..` to `metro/private/..`
4. **expo-notifications** - Deprecated function exports removed
5. **@expo/vector-icons** - Icon families updated (some icons renamed/removed)
6. **locales config** - iOS-specific translations now under `locales.ios` key

---

## Step-by-Step Instructions

### 2.1 Run Expo Upgrade Command

```bash
# Upgrade to SDK 54
npx expo install expo@~54.0.0 --fix

# This will automatically update all Expo packages to SDK 54 compatible versions
```

**What this does:**
- Updates `expo` package to SDK 54
- Updates all `expo-*` packages to compatible versions
- Updates `expo-router`, `expo-dev-client`, `expo-splash-screen`, etc.
- Checks for compatibility issues

**Remarks:**
- The `--fix` flag automatically resolves version conflicts
- Review the changes before committing
- This may take a few minutes

---

### 2.2 Update React Native and React

```bash
pnpm add react@19.1.0 react-native@0.81.0 react-dom@19.1.0
```

**Remarks:**
- React 19.1 includes stability improvements
- React Native 0.81 includes performance improvements
- react-dom is needed for web support

---

### 2.3 Update Reanimated (Choose Your Path)

You have two options:

#### Option A: Keep Legacy Architecture (Stay on Reanimated v3) ✅ Recommended for Most

```bash
# No action needed - continue using react-native-reanimated@~3.17.5
```

**When to choose this:**
- You're not ready for New Architecture
- You want a stable, proven solution
- You don't need Reanimated v4 features

---

#### Option B: Enable New Architecture (Upgrade to Reanimated v4) ⚠️ Experimental

```bash
pnpm add react-native-reanimated@^4.0.0 react-native-worklets@^1.0.0
```

Update `app.config.ts`:

```typescript
export default {
  // ... other config
  newArchEnabled: true, // Enable New Architecture
  plugins: [
    // ... other plugins
    [
      'react-native-reanimated',
      {
        enableNewArchitecture: true,
      },
    ],
  ],
};
```

**When to choose this:**
- You want cutting-edge performance
- You're willing to deal with potential issues
- You need Reanimated v4 specific features

**Remarks:**
- New Architecture is still experimental
- Some third-party libraries may not support it yet
- Test thoroughly on all platforms
- Review [Reanimated 3.x to 4.x migration guide](https://docs.swmansion.com/react-native-reanimated/docs/guides/migration)

---

### 2.4 Update expo-file-system Imports

If you're using `expo-file-system` in your app, you need to update imports.

#### Quick Migration (Recommended)

Find and replace all imports using legacy version:

```bash
# For macOS/Linux
find ./src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec sed -i '' "s|from 'expo-file-system'|from 'expo-file-system/legacy'|g" {} +
find ./src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec sed -i '' 's|from "expo-file-system"|from "expo-file-system/legacy"|g' {} +

# For Windows (use PowerShell)
Get-ChildItem -Path ./src -Recurse -Include *.ts,*.tsx,*.js,*.jsx | ForEach-Object { (Get-Content $_.FullName) -replace "from 'expo-file-system'", "from 'expo-file-system/legacy'" | Set-Content $_.FullName }
```

**OR**

#### Gradual Migration (Migrate at Your Own Pace)

```typescript
// New API (modern, recommended for new code)
import { Directory, File } from 'expo-file-system';

// Old API (via legacy)
import * as FileSystem from 'expo-file-system/legacy';
```

**Remarks:**
- Legacy API maintains full backward compatibility
- New API is more modern, type-safe, and Promise-based
- You can use both side-by-side during migration
- See [expo-file-system docs](https://docs.expo.dev/versions/latest/sdk/filesystem/) for new API

---

### 2.5 Update app.config.ts for Locales (If Applicable)

If you have iOS-specific locale configurations, update the structure:

```typescript
// Before
export default {
  locales: {
    en: './path/to/en.json',
    fr: './path/to/fr.json',
  },
};

// After
export default {
  locales: {
    en: './path/to/en.json',
    fr: './path/to/fr.json',
    ios: {
      // iOS-specific translations
      CFBundleDisplayName: {
        en: 'My App',
        fr: 'Mon App',
      },
      CFBundleName: {
        en: 'MyApp',
        fr: 'MonApp',
      },
    },
  },
};
```

**Remarks:**
- Only needed if you have iOS-specific localization
- Android locales remain at the root level
- Check `app.config.ts` to see if you use this feature

---

### 2.6 Update expo-notifications

Remove any deprecated function exports.

**Check your code for:**
```typescript
// Deprecated patterns (if you're using any)
import { setNotificationHandler } from 'expo-notifications';
```

**Update to:**
```typescript
// Modern pattern
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});
```

**Remarks:**
- Review [expo-notifications changelog](https://github.com/expo/expo/blob/main/packages/expo-notifications/CHANGELOG.md)
- Most apps won't need changes here
- Only update if you see errors

---

### 2.7 Update @expo/vector-icons

Run TypeScript check to find renamed/removed icons:

```bash
pnpm type-check
```

**If you see icon errors:**
- Check the [vector-icons changelog](https://github.com/oblador/react-native-vector-icons/blob/master/CHANGELOG.md)
- Find the new icon name
- Update your code

**Example:**
```typescript
// If an icon was renamed
<Ionicons name="md-settings" />  // Old
<Ionicons name="settings" />     // New
```

**Remarks:**
- Most icon names remain the same
- Only a small subset was renamed or removed
- TypeScript will catch these errors

---

### 2.8 Update jest-expo

```bash
pnpm add -D jest-expo@~54.0.0
```

**Remarks:**
- This ensures Jest works with SDK 54
- Use tilde (~) to lock to SDK version
- Tests should continue working without changes

---

### 2.9 Clean and Rebuild

```bash
# Clear all caches and build artifacts
rm -rf node_modules .expo android ios

# Reinstall dependencies
pnpm install

# Prebuild native directories
pnpm prebuild

# Test on iOS
pnpm ios

# Test on Android
pnpm android
```

**Remarks:**
- Always do a clean rebuild after major SDK upgrades
- Test on both platforms
- Watch for deprecation warnings in the console
- Check that all features work as expected

---

## Verification Checklist

After completing the upgrade:

- [ ] `npx expo-doctor` shows no critical issues
- [ ] App builds successfully on iOS
- [ ] App builds successfully on Android
- [ ] App runs on web (if applicable)
- [ ] No deprecation warnings in console
- [ ] All navigation works
- [ ] All API calls work
- [ ] Animations work (Reanimated)
- [ ] File system operations work (if used)
- [ ] Push notifications work (if used)
- [ ] All third-party libraries work

---

## Common Issues

### Issue 1: Build fails with "Cannot find module"

**Solution:**
```bash
# Clear everything and reinstall
rm -rf node_modules .expo android ios
pnpm install
pnpm prebuild
```

### Issue 2: Metro bundler hangs or crashes

**Solution:**
```bash
# Clear Metro cache
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-*

# Start with cache clear
expo start -c
```

### Issue 3: Reanimated errors after upgrade

**Solution:**
- If on v4: Check New Architecture is enabled in `app.config.ts`
- If on v3: Ensure you didn't accidentally upgrade to v4
- Clear caches and rebuild

### Issue 4: iOS build fails with "pods not found"

**Solution:**
```bash
cd ios
rm -rf Pods Podfile.lock
pod install --repo-update
cd ..
```

### Issue 5: TypeScript errors with expo-router

**Solution:**
```bash
# Regenerate types
npx expo customize tsconfig.json
pnpm type-check
```

---

## Performance Improvements

You should notice:

- ✅ **Faster iOS builds** (precompiled XCFrameworks)
- ✅ **Faster Metro bundler** (improved caching)
- ✅ **Better animations** (if using Reanimated v4)
- ✅ **Improved stability** (bug fixes in React Native 0.81)

---

## Testing Your App

After upgrade, test these areas thoroughly:

### Core Features
- [ ] App launches successfully
- [ ] Navigation works (all screens accessible)
- [ ] Authentication flow works
- [ ] Data fetching/API calls work

### Platform-Specific
- [ ] iOS: Notch/safe area handling
- [ ] Android: Back button behavior
- [ ] Both: Deep links work
- [ ] Both: App backgrounding/foregrounding

### Third-Party Integrations
- [ ] Analytics events fire correctly
- [ ] Push notifications work
- [ ] In-app purchases (if applicable)
- [ ] Social auth (if applicable)

---

## Useful Links

- [Expo SDK 54 Changelog](https://expo.dev/changelog/sdk-54)
- [Expo SDK 54 Migration Guide](https://expo.dev/blog/expo-sdk-upgrade-guide)
- [Upgrading Expo SDK Documentation](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/)
- [Expo SDK 54 Breaking Changes (Medium)](https://diko-dev99.medium.com/upgrading-to-expo-sdk-54-common-issues-and-how-to-fix-them-1b78ac6b19d3)
- [React Native 0.81 Release Notes](https://reactnative.dev/blog)
- [Reanimated Migration Guide](https://docs.swmansion.com/react-native-reanimated/docs/guides/migration)

---

## Next Steps

After completing this upgrade:

1. ✅ Commit your changes
2. ✅ Test thoroughly on all platforms
3. ➡️ Continue to `04-dependency-updates.md`
4. ✅ Deploy to staging for full QA testing

---

**Estimated Time:** 1-2 hours (including testing)
**Difficulty:** High
**Impact:** High (major framework upgrade)
