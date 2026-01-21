# NativeWind → Uniwind Migration

## Overview

Migrate from NativeWind to Uniwind for significant performance improvements:
- **2.5x faster** than NativeWind out of the box
- **Build-time compilation** - styles computed at build time, not runtime
- **Tailwind CSS v4** - Modern, CSS-first approach
- **Platform selectors** - Built-in `ios:` and `android:` prefixes
- **No tailwind.config.js** - Theme lives in `global.css`

## Current Setup

- NativeWind v4.1.21
- Tailwind CSS 3.4.4
- tailwind.config.js with custom colors
- Babel preset for NativeWind
- Custom colors in `src/components/ui/colors.js`

## Benefits

✅ **Performance** - 2.5x faster styling with build-time compilation
✅ **Modern** - Tailwind v4's CSS-first approach
✅ **Cleaner** - No JS config file needed
✅ **Platform-Aware** - Built-in ios:/android: selectors
✅ **Type-Safe** - Better TypeScript integration

---

## Step-by-Step Instructions

### 5.1 Install Uniwind

```bash
# Remove NativeWind
pnpm remove nativewind

# Install Uniwind and Tailwind v4
pnpm add uniwind
pnpm add -D tailwindcss@next @tailwindcss/cli@next
```

**Remarks:**
- Uniwind only supports Tailwind CSS v4
- Tailwind v4 is currently in beta but stable enough for production
- v4 is CSS-first (no more tailwind.config.js)

---

### 5.2 Update Metro Config

Update `metro.config.js`:

```javascript
const { getDefaultConfig } = require('expo/metro-config');
const { withUniwindMetroConfig } = require('uniwind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withUniwindMetroConfig(config);
```

**Remarks:**
- Uniwind requires deep Metro integration for build-time compilation
- This wraps Expo's default Metro config
- All Metro features remain available

---

### 5.3 Remove NativeWind from Babel

Update `babel.config.js`:

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo',
      // Removed: ['babel-preset-expo', { jsxImportSource: 'nativewind' }]
      // Removed: 'nativewind/babel'
    ],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
          },
          extensions: [
            '.ios.ts',
            '.android.ts',
            '.ts',
            '.ios.tsx',
            '.android.tsx',
            '.tsx',
            '.jsx',
            '.js',
            '.json',
          ],
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
```

**Remarks:**
- Remove NativeWind's jsxImportSource
- Remove NativeWind's babel preset
- Keep all other presets and plugins

---

### 5.4 Create global.css

Create `src/styles/global.css`:

```css
/* Import Tailwind base styles */
@import 'tailwindcss';

/* Define your theme in CSS (replaces tailwind.config.js) */
@theme {
  /* Colors - migrated from src/components/ui/colors.js */
  --color-primary: #0ea5e9;
  --color-primary-foreground: #ffffff;

  --color-background: #ffffff;
  --color-foreground: #0a0a0a;

  --color-card: #ffffff;
  --color-card-foreground: #0a0a0a;

  --color-muted: #f5f5f5;
  --color-muted-foreground: #737373;

  --color-border: #e5e5e5;
  --color-input: #e5e5e5;
  --color-ring: #0ea5e9;

  --color-destructive: #ef4444;
  --color-destructive-foreground: #ffffff;

  /* Fonts */
  --font-inter: 'Inter', sans-serif;

  /* Spacing scale (optional, Tailwind has defaults) */
  --spacing-xs: 0.5rem;
  --spacing-sm: 0.75rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
}

/* Dark mode colors */
@media (prefers-color-scheme: dark) {
  @theme {
    --color-background: #0a0a0a;
    --color-foreground: #fafafa;

    --color-card: #171717;
    --color-card-foreground: #fafafa;

    --color-muted: #262626;
    --color-muted-foreground: #a3a3a3;

    --color-border: #404040;
    --color-input: #404040;
  }
}

/* Custom utilities (if needed) */
@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
```

**Remarks:**
- This replaces `tailwind.config.js`
- All theme configuration is now in CSS
- Use CSS custom properties for dynamic theming
- Easier to maintain than JS config

---

### 5.5 Migrate Colors from colors.js

Open `src/components/ui/colors.js` and convert to CSS variables:

```javascript
// Before (colors.js)
module.exports = {
  primary: '#0ea5e9',
  background: '#ffffff',
  foreground: '#0a0a0a',
  // ... more colors
};
```

```css
/* After (in global.css @theme block) */
@theme {
  --color-primary: #0ea5e9;
  --color-background: #ffffff;
  --color-foreground: #0a0a0a;
  /* ... more colors */
}
```

**Optional:** You can keep `colors.js` if other code depends on it, but update it to reference CSS variables:

```javascript
module.exports = {
  primary: 'var(--color-primary)',
  background: 'var(--color-background)',
  // ... more colors
};
```

---

### 5.6 Remove tailwind.config.js

```bash
rm tailwind.config.js
```

**Remarks:**
- No longer needed with Tailwind v4
- All config is now in `global.css`

---

### 5.7 Import global.css in App Entry

Update `src/app/_layout.tsx` (or your app entry point):

```typescript
// Rest of your imports
import { Stack } from 'expo-router';

import '../styles/global.css'; // Add this import at the top
// ...

export default function RootLayout() {
  // ... rest of your layout
}
```

**Remarks:**
- Import at the very top of your root layout
- This loads the CSS before any components render
- Only import once in your app's entry point

---

### 5.8 Update Component Usage (If Needed)

The `className` prop should work the same, but if you used NativeWind-specific features:

```typescript
// Before (if you used styled wrapper)
import { styled } from 'nativewind'
const StyledView = styled(View)
<StyledView className="bg-primary p-4" />

// After - Just use className directly
<View className="bg-primary p-4" />
```

**Remarks:**
- Uniwind provides `className` bindings out of the box
- No need for `styled()` wrapper
- All React Native core components support `className`
- Your existing className usages should work without changes

---

### 5.9 Use Platform Selectors

Uniwind includes built-in platform selectors:

```typescript
// Before (conditional className)
<View className={Platform.OS === 'ios' ? 'pt-8' : 'pt-4'}>
  {/* content */}
</View>

// After (platform selectors)
<View className="p-4 ios:pt-8 android:pt-4">
  {/* Different padding-top for iOS and Android */}
</View>
```

**More examples:**

```typescript
// Platform-specific backgrounds
<View className="bg-white ios:bg-gray-50 android:bg-gray-100">

// Platform-specific spacing
<View className="px-4 ios:px-6">

// Platform-specific text
<Text className="text-base ios:text-lg android:text-sm">
```

**Remarks:**
- Use `ios:` and `android:` prefixes
- More elegant than `Platform.select()` or conditional logic
- Better for maintainability

---

### 5.10 Test and Validate

```bash
# Clear all caches
rm -rf node_modules .expo android ios

# Reinstall dependencies
pnpm install

# Rebuild native directories
pnpm prebuild

# Test on iOS
pnpm ios

# Test on Android
pnpm android
```

**What to test:**
- All screens render correctly
- Styles applied correctly
- Dark mode works
- Platform-specific styles work
- Performance feels snappier

---

### 5.11 Update ESLint Config (If Using Tailwind Plugin)

If you're using `eslint-plugin-tailwindcss`:

#### Option A: Remove it (Recommended)

```bash
pnpm remove eslint-plugin-tailwindcss
```

Update ESLint config to remove tailwindcss rules:

```javascript
// eslint.config.mjs
export default antfu(
  {
    // ... config
  },
  // Remove TailwindCSS plugin section
);
```

#### Option B: Keep it but update config

Since Tailwind v4 uses CSS instead of JS config, the plugin may have limitations.

---

## Verification Checklist

- [ ] Uniwind installed successfully
- [ ] NativeWind removed
- [ ] Metro config updated
- [ ] Babel config updated
- [ ] global.css created with theme
- [ ] Colors migrated to CSS
- [ ] tailwind.config.js removed
- [ ] global.css imported in root layout
- [ ] App builds on iOS
- [ ] App builds on Android
- [ ] All styles render correctly
- [ ] Dark mode works
- [ ] Platform selectors work
- [ ] Performance improved (noticeable)

---

## Common Issues

### Issue 1: Styles not applying

**Solution:**
```bash
# Ensure global.css is imported in root layout
# Check src/app/_layout.tsx has: import '../styles/global.css'

# Clear Metro cache
rm -rf $TMPDIR/metro-*
expo start -c
```

### Issue 2: Build fails with "Cannot find module 'uniwind'"

**Solution:**
```bash
# Reinstall
rm -rf node_modules
pnpm install

# Rebuild
pnpm prebuild
```

### Issue 3: Colors not working

**Solution:**
```css
/* Ensure CSS variables are properly defined in global.css */
@theme {
  --color-primary: #0ea5e9;  /* Not 'primary' but '--color-primary' */
}
```

Usage:
```typescript
<View className="bg-primary" />  {/* Use 'primary', not 'color-primary' */}
```

### Issue 4: Dark mode not working

**Solution:**
```typescript
// Ensure your app uses ColorScheme
import { useColorScheme } from 'react-native'

export default function App() {
  const colorScheme = useColorScheme()

  return (
    <View className={colorScheme === 'dark' ? 'dark' : ''}>
      {/* Your app */}
    </View>
  )
}
```

### Issue 5: Metro bundler slow after migration

**Solution:**
```bash
# Uniwind compiles at build time, first build may be slower
# Subsequent builds should be faster

# Clear cache if it persists
rm -rf .expo
rm -rf $TMPDIR/metro-*
expo start -c
```

---

## Performance Comparison

**Before (NativeWind):**
- Runtime style computation
- Style injection on every render
- Performance depends on number of className instances

**After (Uniwind):**
- Build-time style computation
- Pre-computed StyleSheet
- Near-native StyleSheet performance
- **2.5x faster** than NativeWind

**You should notice:**
- Faster app startup
- Smoother scrolling
- Better FPS in lists
- Smaller JS bundle size

---

## Advanced: Accessing CSS Variables in JS

If you need to access CSS variables in JavaScript:

```typescript
import { useResolveClassNames } from 'uniwind'

function MyComponent() {
  const styles = useResolveClassNames('bg-primary text-white p-4')

  // styles is a React Native StyleSheet object
  console.log(styles)

  return <View style={styles} />
}
```

**Remarks:**
- Rarely needed - use className instead
- Useful for dynamic styles or animations
- Returns proper React Native StyleSheet

---

## Customization

### Add Custom Colors

```css
/* global.css */
@theme {
  --color-brand: #ff6b6b;
  --color-accent: #4ecdc4;
}
```

Usage:
```typescript
<View className="bg-brand text-accent" />
```

### Add Custom Spacing

```css
/* global.css */
@theme {
  --spacing-xxs: 0.25rem;
  --spacing-custom: 3.5rem;
}
```

Usage:
```typescript
<View className="p-[var(--spacing-custom)]" />
```

### Custom Utilities

```css
/* global.css */
@layer utilities {
  .shadow-custom {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .text-shadow {
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
}
```

---

## Migration Checklist by Component Type

### Button Component
- [ ] className props work
- [ ] Variants render correctly
- [ ] Hover/press states work
- [ ] Disabled state works

### Input Component
- [ ] Border styles correct
- [ ] Focus state works
- [ ] Error state renders
- [ ] Dark mode colors correct

### Card Component
- [ ] Shadow renders on iOS
- [ ] Elevation works on Android
- [ ] Dark mode background correct

### Text Component
- [ ] Font sizes correct
- [ ] Line heights preserved
- [ ] Text colors correct in both modes

---

## Useful Links

- [Uniwind Official Website](https://uniwind.dev/)
- [Uniwind GitHub](https://github.com/uni-stack/uniwind)
- [Uniwind Documentation](https://docs.uniwind.dev/)
- [Migration from NativeWind Guide](https://docs.uniwind.dev/migration-from-nativewind)
- [Uniwind Quickstart](https://docs.uniwind.dev/quickstart)
- [Tailwind CSS v4 Docs](https://tailwindcss.com/)
- [Tailwind CSS v4 Beta](https://tailwindcss.com/blog/tailwindcss-v4-beta)

---

## Before & After Comparison

### Configuration

**Before (NativeWind):**
```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: require('./src/components/ui/colors'),
    },
  },
};
```

**After (Uniwind):**
```css
/* src/styles/global.css */
@import 'tailwindcss';

@theme {
  --color-primary: #0ea5e9;
  --color-background: #ffffff;
}
```

### Babel Configuration

**Before:**
```javascript
presets: [
  ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
  'nativewind/babel',
];
```

**After:**
```javascript
presets: ['babel-preset-expo'];
```

### Usage

**Before and After are the same:**
```typescript
<View className="bg-primary p-4 rounded-lg shadow-md" />
```

**But with platform selectors (new):**
```typescript
<View className="bg-primary p-4 ios:pt-8 android:pt-4" />
```

---

## Next Steps

After completing Uniwind migration:

1. ✅ Test all screens thoroughly
2. ✅ Verify dark mode works
3. ✅ Check performance improvements
4. ✅ Commit changes
5. ➡️ Continue to `06-testing-updates.md`

---

**Estimated Time:** 1-1.5 hours
**Difficulty:** Medium-High
**Impact:** High (changes entire styling system, but improves performance)
