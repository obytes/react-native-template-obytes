# Verification & Testing

## Overview

After completing all upgrades, thoroughly test the application to ensure everything works correctly. This comprehensive verification guide covers all aspects of your app.

---

## Pre-Verification Checklist

Before testing, ensure you've completed all migrations:

- [ ] ESLint migration complete
- [ ] Expo SDK 54 upgrade complete
- [ ] Environment variables simplified
- [ ] Dependencies updated
- [ ] Uniwind migration complete
- [ ] Testing infrastructure updated
- [ ] All changes committed to git

---

## 1. Clean Environment

Start with a completely clean environment:

```bash
# Remove all caches and build artifacts
rm -rf node_modules .expo android ios

# Clear package manager cache
pnpm store prune

# Clear Metro cache
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-*

# Clear React Native cache
rm -rf $TMPDIR/react-*

# Reinstall dependencies
pnpm install
```

**Expected Results:**
- Clean node_modules
- No warnings during install
- All dependencies resolved

---

## 2. Run Linting

```bash
# Run ESLint
pnpm lint

# Fix auto-fixable issues
pnpm lint:fix

# Type check
pnpm type-check

# Check translations
pnpm lint:translations

# Run all checks
pnpm check-all
```

**Expected Results:**
- ✅ No linting errors
- ✅ No TypeScript errors
- ✅ All auto-formatting working via ESLint
- ✅ Translation files valid
- ✅ Imports sorted correctly
- ✅ No unused imports

**Common Issues:**
- Type errors → Check TypeScript version compatibility
- Lint errors → Run `pnpm lint:fix` to auto-fix
- Translation errors → Fix JSON formatting

---

## 3. Run Tests

```bash
# Clear Jest cache
jest --clearCache

# Run unit tests
pnpm test

# Run tests with coverage
pnpm test:ci

# Watch mode (for development)
pnpm test:watch
```

**Expected Results:**
- ✅ All tests passing
- ✅ Coverage reports generated
- ✅ No deprecation warnings
- ✅ Test snapshots updated (if needed)

**Common Issues:**
- Transform errors → Update transformIgnorePatterns in jest.config.js
- Mock errors → Update mocks for new package versions
- Timeout errors → Increase test timeout

---

## 4. Test Development Build

### iOS

```bash
# Prebuild
pnpm prebuild

# Run on simulator
pnpm ios

# Or specific device
pnpm ios --device "iPhone 15 Pro"
```

**What to check:**
- [ ] App launches successfully
- [ ] No Metro bundler errors
- [ ] No runtime errors in console
- [ ] Splash screen displays correctly
- [ ] Status bar themed correctly

### Android

```bash
# Prebuild
pnpm prebuild

# Run on emulator
pnpm android

# Or specific device
pnpm android --device emulator-5554
```

**What to check:**
- [ ] App launches successfully
- [ ] No Metro errors
- [ ] No runtime errors
- [ ] Splash screen works
- [ ] Navigation bar themed correctly

### Web

```bash
pnpm web
```

**What to check:**
- [ ] App loads in browser
- [ ] Responsive design works
- [ ] All features functional
- [ ] No console errors

---

## 5. Test Environment Variables

Add temporary logging to verify env vars:

```typescript
// Add to app entry point temporarily
console.log('=== Environment Variables ===');
console.log('API URL:', process.env.EXPO_PUBLIC_API_URL);
console.log('App Env:', process.env.EXPO_PUBLIC_APP_ENV);
console.log('Is Production:', process.env.EXPO_PUBLIC_APP_ENV === 'production');
console.log('============================');
```

**Expected Results:**
- ✅ All EXPO_PUBLIC_* variables accessible
- ✅ Correct values from .env file
- ✅ No undefined variables
- ✅ Values are strings (process.env always returns strings)

**Remove the logging after verification**

---

## 6. Test Styling (Uniwind)

Test visual appearance and styling:

### Light Mode
```bash
# Test in light mode
```

Check:
- [ ] All colors correct
- [ ] Text readable
- [ ] Buttons styled correctly
- [ ] Shadows render on iOS
- [ ] Elevation works on Android

### Dark Mode
```bash
# Switch device to dark mode
```

Check:
- [ ] Dark colors applied
- [ ] Text still readable
- [ ] Smooth transition
- [ ] All screens themed correctly
- [ ] Status bar adapts

### Platform Selectors

Check platform-specific styles:

```typescript
// Example: Different padding on iOS vs Android
<View className="p-4 ios:pt-8 android:pt-4">
```

- [ ] iOS-specific styles apply on iOS
- [ ] Android-specific styles apply on Android
- [ ] No style leaking between platforms

### Performance

Compare to pre-migration:
- [ ] App startup feels faster
- [ ] Scrolling smoother
- [ ] List rendering better
- [ ] Overall snappier

---

## 7. Test State Management

### Zustand Stores

Test all Zustand stores:

```typescript
// Auth store
- [ ] Login works
- [ ] Logout works
- [ ] Token persists
- [ ] User data loads

// Settings store (if applicable)
- [ ] Theme changes persist
- [ ] Language changes work
- [ ] Preferences save

// Other stores
- [ ] All stores functional
- [ ] No console warnings
- [ ] State updates correctly
```

### React Query

Test data fetching:

```typescript
// Queries
- [ ] Data fetches successfully
- [ ] Loading states show
- [ ] Error states display
- [ ] Caching works
- [ ] Refetch works

// Mutations
- [ ] Create operations work
- [ ] Update operations work
- [ ] Delete operations work
- [ ] Optimistic updates work
- [ ] Error handling works
```

### Persistence (MMKV)

Test data persistence:

```bash
# 1. Set some data (login, change settings)
# 2. Force close app
# 3. Reopen app
```

- [ ] User remains logged in
- [ ] Settings persisted
- [ ] Data survives app restart

---

## 8. Test Navigation

Test all navigation flows:

### Tab Navigation
- [ ] All tabs accessible
- [ ] Tab icons display
- [ ] Active tab highlighted
- [ ] Tab persistence works

### Stack Navigation
- [ ] Push navigation works
- [ ] Back navigation works
- [ ] Deep linking works (if applicable)
- [ ] Modal screens work

### Drawer Navigation (if applicable)
- [ ] Drawer opens/closes
- [ ] Menu items work
- [ ] Drawer persists state

---

## 9. Test Forms

Test all forms in your app:

### Input Fields
- [ ] Text input works
- [ ] Number input works
- [ ] Email validation works
- [ ] Password input toggles visibility
- [ ] Focus states correct
- [ ] Error states display

### Form Validation (Zod + React Hook Form)
- [ ] Required fields validated
- [ ] Email format validated
- [ ] Custom validation rules work
- [ ] Error messages display
- [ ] Submit disabled when invalid

### Form Submission
- [ ] Submit button works
- [ ] Loading state shows
- [ ] Success handling works
- [ ] Error handling works
- [ ] Form resets after success

---

## 10. Test API Integration

### API Calls
- [ ] GET requests work
- [ ] POST requests work
- [ ] PUT/PATCH requests work
- [ ] DELETE requests work
- [ ] Headers sent correctly
- [ ] Auth tokens included

### Error Handling
- [ ] Network errors caught
- [ ] 400 errors handled
- [ ] 401 errors redirect to login
- [ ] 500 errors displayed
- [ ] Timeout errors handled

### Loading States
- [ ] Loading indicators show
- [ ] Skeleton screens display
- [ ] Retry mechanisms work

---

## 11. Test Features

### Authentication
- [ ] Login flow works
- [ ] Logout works
- [ ] Sign up works (if applicable)
- [ ] Password reset works (if applicable)
- [ ] Token refresh works
- [ ] Protected routes work

### Core Features
Test each major feature of your app:

- [ ] Feature 1: [Description]
- [ ] Feature 2: [Description]
- [ ] Feature 3: [Description]
- [ ] ...

### Push Notifications (if applicable)
- [ ] Permissions requested
- [ ] Notifications received
- [ ] Notification tap opens app
- [ ] Deep linking from notification works

### Analytics (if applicable)
- [ ] Events tracking
- [ ] Screen views logging
- [ ] User properties set

---

## 12. Test Platform-Specific Features

### iOS Specific
- [ ] Safe area handling (notch, Dynamic Island)
- [ ] Keyboard avoidance works
- [ ] Pull to refresh works
- [ ] Haptic feedback works
- [ ] Share sheet works

### Android Specific
- [ ] Back button handling
- [ ] Status bar/navigation bar styling
- [ ] Pull to refresh works
- [ ] Share intent works
- [ ] Deep links work

---

## 13. Test Performance

### App Startup
```bash
# Time app launch
# Should be under 3 seconds on device
```

### List Rendering
```bash
# Test FlashList with 1000+ items
# Should scroll smoothly at 60fps
```

### Memory Usage
```bash
# Monitor memory in Xcode/Android Studio
# Should not leak memory
# Should stay under reasonable limits
```

### Bundle Size
```bash
# Check bundle size
npx expo export

# Compare to pre-migration
# Should be similar or smaller (Uniwind reduces size)
```

---

## 14. Run E2E Tests

### Maestro Tests

```bash
# Build for testing
pnpm prebuild:development

# Run iOS simulator
pnpm ios

# In another terminal, run Maestro
pnpm e2e-test

# Or run specific flow
maestro test .maestro/login-flow.yaml -e APP_ID=com.obytes.development
```

**Expected Results:**
- ✅ All E2E flows pass
- ✅ No Maestro errors
- ✅ App behavior correct
- ✅ Faster execution than before (Maestro 2.0)

---

## 15. Test Production Build

### Local Production Build

```bash
# iOS
pnpm prebuild:production
pnpm ios --configuration Release

# Android
pnpm prebuild:production
pnpm android --variant release
```

**What to check:**
- [ ] Builds successfully
- [ ] No console logs in production
- [ ] Performance optimized
- [ ] Bundle size reasonable
- [ ] No debug tools visible

### EAS Build (Recommended)

```bash
# Production builds
pnpm build:production:ios
pnpm build:production:android

# Or staging
pnpm build:staging:ios
pnpm build:staging:android
```

**Monitor build:**
- Go to https://expo.dev
- Check build logs
- Download IPA/APK when complete
- Install on physical device
- Test thoroughly

---

## 16. Check for Warnings

### Expo Doctor

```bash
npx expo-doctor
```

**Expected:** ✅ No critical warnings

### Outdated Packages

```bash
pnpm outdated
```

**Review:** Major updates you might have missed

### Security Audit

```bash
pnpm audit
```

**Expected:** No high/critical vulnerabilities

### Console Warnings

Run app and check for:
- [ ] No React warnings
- [ ] No deprecation warnings
- [ ] No performance warnings
- [ ] No third-party library warnings

---

## 17. Stress Testing

### Heavy Load
- [ ] Open all screens rapidly
- [ ] Scroll long lists
- [ ] Rapid navigation
- [ ] Background/foreground repeatedly
- [ ] App remains stable

### Edge Cases
- [ ] Empty states display
- [ ] Error states display
- [ ] No network scenario
- [ ] Slow network scenario
- [ ] Large data sets

### Device Rotation
- [ ] Landscape mode works
- [ ] Portrait mode works
- [ ] Rotation transitions smooth
- [ ] No layout issues

---

## 18. Accessibility Testing

### Screen Reader
- [ ] VoiceOver works (iOS)
- [ ] TalkBack works (Android)
- [ ] All interactive elements accessible
- [ ] Labels correct

### Font Scaling
```bash
# Increase device font size
# Settings > Display > Font Size > Largest
```

- [ ] Text scales appropriately
- [ ] No text truncation
- [ ] Layout doesn't break

### Color Contrast
- [ ] Text readable in light mode
- [ ] Text readable in dark mode
- [ ] Sufficient contrast ratios
- [ ] Color-blind friendly (if applicable)

---

## 19. Internationalization (i18n)

If you support multiple languages:

```typescript
// Switch language
i18n.changeLanguage('fr');
```

- [ ] Language switches correctly
- [ ] All strings translated
- [ ] RTL support (if applicable)
- [ ] Number/date formatting correct
- [ ] Pluralization works

---

## 20. Final Checklist

### Build & Deploy
- [ ] Development build works
- [ ] Staging build works
- [ ] Production build works
- [ ] iOS build succeeds
- [ ] Android build succeeds
- [ ] Web build succeeds (if applicable)

### Code Quality
- [ ] All lint checks pass
- [ ] All tests pass
- [ ] Type checking passes
- [ ] No console errors
- [ ] No warnings
- [ ] Code formatted correctly

### Functionality
- [ ] All features work
- [ ] Navigation works
- [ ] Authentication works
- [ ] API calls work
- [ ] State management works
- [ ] Persistence works

### Performance
- [ ] App startup fast
- [ ] Smooth scrolling
- [ ] No memory leaks
- [ ] Bundle size reasonable
- [ ] Network requests optimized

### Visual
- [ ] Light mode correct
- [ ] Dark mode correct
- [ ] Platform-specific styles work
- [ ] Responsive design works
- [ ] Animations smooth

### Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing complete

### Documentation
- [ ] README updated (if needed)
- [ ] Team notified
- [ ] .env.example created
- [ ] Migration notes documented

---

## Post-Verification Actions

### If Everything Passes ✅

1. **Create a final commit:**
   ```bash
   git add .
   git commit -m "chore: complete template upgrade to v8.1.0

   - Migrate ESLint to @antfu/eslint-config
   - Upgrade to Expo SDK 54
   - Simplify environment variables
   - Update all dependencies
   - Migrate to Uniwind
   - Update testing infrastructure
   "
   ```

2. **Tag the release:**
   ```bash
   git tag -a v8.1.0 -m "Template upgrade complete"
   git push origin v8.1.0
   ```

3. **Merge to main:**
   ```bash
   git checkout main
   git merge upgrade/react-native-template
   git push
   ```

4. **Deploy to staging:**
   ```bash
   pnpm build:staging:ios
   pnpm build:staging:android
   ```

5. **Test on staging**

6. **Deploy to production:**
   ```bash
   pnpm build:production:ios
   pnpm build:production:android
   ```

---

### If Issues Found ⚠️

1. **Document the issue**
2. **Check the rollback plan** (`09-rollback-plan.md`)
3. **Fix or rollback** depending on severity
4. **Re-run verification**

---

## Useful Links

- [Expo Doctor](https://docs.expo.dev/more/expo-cli/#doctor)
- [React Native Debugging](https://reactnative.dev/docs/debugging)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [Flipper](https://fbflipper.com/)

---

## Next Steps

After verification:

1. ✅ All tests passed
2. ✅ Manual testing complete
3. ➡️ Review `08-summary.md` for changes overview
4. ➡️ Keep `09-rollback-plan.md` handy just in case

---

**Estimated Time:** 2-3 hours (comprehensive testing)
**Difficulty:** Medium
**Impact:** Critical (ensures everything works)
