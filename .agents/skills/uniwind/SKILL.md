---
name: uniwind
description: >
  Uniwind — Tailwind CSS v4 styling for React Native. Use when adding, building,
  or styling components in a React Native project that uses Tailwind with className.
  Triggers on: className on RN components, Tailwind classes in RN, global.css with
  @import 'uniwind', withUniwindConfig, withUniwind, metro.config.js with Uniwind,
  useResolveClassNames, useCSSVariable, useUniwind, dark:/light: theming, platform
  selectors (ios:/android:/native:/web:/tv:), data-[prop=value], responsive breakpoints
  (sm:/md:/lg:), tailwind-variants, tv() variants, ScopedTheme, Uniwind.setTheme,
  Uniwind.updateCSSVariables, @theme, @utility, @variant, CSS variables in RN,
  colorClassName, tintColorClassName, contentContainerClassName, Uniwind Pro
  (animations, transitions, shadow tree, native insets), safe area utilities,
  gradients, hairlineWidth(), fontScale(), pixelRatio(), light-dark(), OKLCH,
  cn, tailwind-merge, HeroUI Native, react-native-reusables, Gluestack.
  Does NOT handle migration — use migrate-nativewind-to-uniwind skill.
---

# Uniwind — Complete Reference

> Uniwind 1.6.0+ / Tailwind CSS v4 / React Native 0.81+ / Expo SDK 54+

If user has lower version, recommend updating to 1.6.0+ for best experience.

Uniwind brings Tailwind CSS v4 to React Native. All core React Native components support the `className` prop out of the box. Styles are compiled at build time — no runtime overhead.

## Critical Rules

1. **Tailwind v4 only** — Use `@import 'tailwindcss'` not `@tailwind base`. Tailwind v3 is not supported.
2. **Never construct classNames dynamically** — Tailwind scans at build time. `bg-${color}-500` will NOT work. Use complete string literals, mapping objects, or ternaries.
3. **Never use `cssInterop` or `remapProps`** — Those are NativeWind APIs. Uniwind does not override global components.
4. **No `tailwind.config.js`** — All config goes in `global.css` via `@theme` and `@layer theme`.
5. **No ThemeProvider required** — Use `Uniwind.setTheme()` directly.
6. **`withUniwindConfig` must be the outermost** Metro config wrapper.
7. **NEVER wrap `react-native` or `react-native-reanimated` components with `withUniwind`** — `View`, `Text`, `Pressable`, `Image`, `TextInput`, `ScrollView`, `FlatList`, `Switch`, `Modal`, `Animated.View`, `Animated.Text`, etc. already have full `className` support built in. Wrapping them with `withUniwind` will break behavior. Only use `withUniwind` for **third-party** components (e.g., `expo-image`, `expo-blur`, `moti`).
8. **Font families: single font only** — React Native doesn't support fallbacks. Use `--font-sans: 'Roboto-Regular'` not `'Roboto', sans-serif`.
9. **All theme variants must define the same set of CSS variables** — If `light` defines `--color-primary`, then `dark` and every custom theme must too. Mismatched variables cause runtime errors.
10. **`accent-` prefix is REQUIRED for non-style color props** — This is crucial. Props like `color` (Button, ActivityIndicator), `tintColor` (Image), `thumbColor` (Switch), `placeholderTextColor` (TextInput) are NOT part of the `style` object. You MUST use the corresponding `{propName}ClassName` prop with `accent-` prefixed classes. Example: `<ActivityIndicator colorClassName="accent-blue-500" />` NOT `<ActivityIndicator className="text-blue-500" />`. Regular Tailwind color classes (like `text-blue-500`) only work on `className` (which maps to `style`). For non-style color props, always use `accent-`.
11. **rem default is 16px** — NativeWind used 14px. Set `polyfills: { rem: 14 }` in metro config if migrating.
12. **`cssEntryFile` must be a relative path string** — Use `'./global.css'` not `path.resolve(__dirname, 'global.css')`.
13. **Deduplicate with `cn()` when mixing custom CSS classes and Tailwind** — Uniwind does NOT auto-deduplicate. If a custom CSS class (`.card { padding: 16px }`) and a Tailwind utility (`p-6`) set the same property, both apply with unpredictable results. Always wrap with `cn('card', 'p-6')` when there's overlap.

## Setup

### Installation

```bash
# or other package manager
bun install uniwind tailwindcss
```

Requires **Tailwind CSS v4+**.

### global.css

Create a CSS entry file:

```css
@import 'tailwindcss';
@import 'uniwind';
```

Import in your **App component** (e.g., `App.tsx` or `app/_layout.tsx`), **NOT** in `index.ts`/`index.js` — importing there breaks hot reload:

```tsx
// app/_layout.tsx or App.tsx
import './global.css';
```

The directory containing `global.css` is the app root — Tailwind scans for classNames starting from this directory.

### Metro Configuration

```js
const { getDefaultConfig } = require('expo/metro-config');
// Bare RN: const { getDefaultConfig } = require('@react-native/metro-config');
const { withUniwindConfig } = require('uniwind/metro');

const config = getDefaultConfig(__dirname);

// withUniwindConfig MUST be the OUTERMOST wrapper
module.exports = withUniwindConfig(config, {
  cssEntryFile: './global.css',           // Required — relative path from project root
  polyfills: { rem: 16 },                // Optional — base rem value (default 16)
  extraThemes: ['ocean', 'sunset'],       // Optional — custom themes beyond light/dark
  dtsFile: './uniwind-types.d.ts',        // Optional — TypeScript types output path
  debug: true,                            // Optional — log unsupported CSS in dev
  isTV: false,                            // Optional — enable TV platform support
});
```

For most flows, keep defaults, only provide `cssEntryFile`.

Wrapper order — Uniwind must wrap everything else:

```js
// CORRECT
module.exports = withUniwindConfig(withOtherConfig(config, opts), { cssEntryFile: './global.css' });

// WRONG — Uniwind is NOT outermost
module.exports = withOtherConfig(withUniwindConfig(config, { cssEntryFile: './global.css' }), opts);
```

### Vite Configuration (v1.2.0+)

If user has storybook setup, add extra vite config:

```ts
import tailwindcss from '@tailwindcss/vite';
import { uniwind } from 'uniwind/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    uniwind({
      cssEntryFile: './src/global.css',
      dtsFile: './src/uniwind-types.d.ts',
    }),
  ],
});
```

### TypeScript

Uniwind auto-generates a `.d.ts` file (default: `./uniwind-types.d.ts`) after running Metro. Place it in `src/` or `app/` for auto-inclusion, or add to `tsconfig.json`:

```json
{ "include": ["./uniwind-types.d.ts"] }
```

If user has some typescript errors related to classNames, just run metro server to build the d.ts file.

### Expo Router Placement

```text
project/
├── app/_layout.tsx    ← import '../global.css' here
├── components/
├── global.css         ← project root (best location)
└── metro.config.js    ← cssEntryFile: './global.css'
```

If `global.css` is in `app/` dir, add `@source` for sibling directories:

```css
@import 'tailwindcss';
@import 'uniwind';
@source '../components';
```

### Tailwind IntelliSense (VS Code / Cursor / Windsurf)

```json
{
  "tailwindCSS.classAttributes": [
    "class", "className", "headerClassName",
    "contentContainerClassName", "columnWrapperClassName",
    "endFillColorClassName", "imageClassName", "tintColorClassName",
    "ios_backgroundColorClassName", "thumbColorClassName",
    "trackColorOnClassName", "trackColorOffClassName",
    "selectionColorClassName", "cursorColorClassName",
    "underlineColorAndroidClassName", "placeholderTextColorClassName",
    "selectionHandleColorClassName", "colorsClassName",
    "progressBackgroundColorClassName", "titleColorClassName",
    "underlayColorClassName", "colorClassName",
    "backdropColorClassName", "backgroundColorClassName",
    "statusBarBackgroundColorClassName", "drawerBackgroundColorClassName",
    "ListFooterComponentClassName", "ListHeaderComponentClassName"
  ],
  "tailwindCSS.classFunctions": ["useResolveClassNames"]
}
```

### Monorepo Support

Add `@source` directives in `global.css` for packages outside the CSS entry file's directory:

```css
@import 'tailwindcss';
@import 'uniwind';
@source "../../packages/ui/src";
@source "../../packages/shared/src";
```

Also needed for `node_modules` packages that contain Uniwind classes (e.g., shared UI libraries).

## Component Bindings

All core React Native components support `className` out of the box. Some have additional className props for sub-styles (like `contentContainerClassName`) and non-style color props (requiring `accent-` prefix).

### Complete Reference

**Legend**: Props marked with ⚡ require the `accent-` prefix. Props in parentheses are platform-specific.

#### View

| Prop | Maps to | Prefix |
|------|---------|--------|
| `className` | `style` | — |

#### Text

| Prop | Maps to | Prefix |
|------|---------|--------|
| `className` | `style` | — |
| `selectionColorClassName` | `selectionColor` | ⚡ `accent-` |

#### Pressable

| Prop | Maps to | Prefix |
|------|---------|--------|
| `className` | `style` | — |

Supports `active:`, `disabled:`, `focus:` state selectors.

#### Image

| Prop | Maps to | Prefix |
|------|---------|--------|
| `className` | `style` | — |
| `tintColorClassName` | `tintColor` | ⚡ `accent-` |

#### TextInput

| Prop | Maps to | Prefix |
|------|---------|--------|
| `className` | `style` | — |
| `cursorColorClassName` | `cursorColor` | ⚡ `accent-` |
| `selectionColorClassName` | `selectionColor` | ⚡ `accent-` |
| `placeholderTextColorClassName` | `placeholderTextColor` | ⚡ `accent-` |
| `selectionHandleColorClassName` | `selectionHandleColor` | ⚡ `accent-` |
| `underlineColorAndroidClassName` | `underlineColorAndroid` (Android) | ⚡ `accent-` |

Supports `focus:`, `active:`, `disabled:` state selectors.

#### ScrollView

| Prop | Maps to | Prefix |
|------|---------|--------|
| `className` | `style` | — |
| `contentContainerClassName` | `contentContainerStyle` | — |
| `endFillColorClassName` | `endFillColor` | ⚡ `accent-` |

#### FlatList

| Prop | Maps to | Prefix |
|------|---------|--------|
| `className` | `style` | — |
| `contentContainerClassName` | `contentContainerStyle` | — |
| `columnWrapperClassName` | `columnWrapperStyle` | — |
| `ListHeaderComponentClassName` | `ListHeaderComponentStyle` | — |
| `ListFooterComponentClassName` | `ListFooterComponentStyle` | — |
| `endFillColorClassName` | `endFillColor` | ⚡ `accent-` |

#### SectionList

| Prop | Maps to | Prefix |
|------|---------|--------|
| `className` | `style` | — |
| `contentContainerClassName` | `contentContainerStyle` | — |
| `ListHeaderComponentClassName` | `ListHeaderComponentStyle` | — |
| `ListFooterComponentClassName` | `ListFooterComponentStyle` | — |
| `endFillColorClassName` | `endFillColor` | ⚡ `accent-` |

#### VirtualizedList

| Prop | Maps to | Prefix |
|------|---------|--------|
| `className` | `style` | — |
| `contentContainerClassName` | `contentContainerStyle` | — |
| `ListHeaderComponentClassName` | `ListHeaderComponentStyle` | — |
| `ListFooterComponentClassName` | `ListFooterComponentStyle` | — |
| `endFillColorClassName` | `endFillColor` | ⚡ `accent-` |

#### Switch

| Prop | Maps to | Prefix |
|------|---------|--------|
| `thumbColorClassName` | `thumbColor` | ⚡ `accent-` |
| `trackColorOnClassName` | `trackColor.true` (on) | ⚡ `accent-` |
| `trackColorOffClassName` | `trackColor.false` (off) | ⚡ `accent-` |
| `ios_backgroundColorClassName` | `ios_backgroundColor` (iOS) | ⚡ `accent-` |

Note: Switch does NOT support `className` (`className?: never` in types). Use only the color-specific className props above. Supports `disabled:` state selector.

#### ActivityIndicator

| Prop | Maps to | Prefix |
|------|---------|--------|
| `className` | `style` | — |
| `colorClassName` | `color` | ⚡ `accent-` |

#### Button

| Prop | Maps to | Prefix |
|------|---------|--------|
| `colorClassName` | `color` | ⚡ `accent-` |

Note: Button does not support `className` (no `style` prop on RN Button).

#### Modal

| Prop | Maps to | Prefix |
|------|---------|--------|
| `className` | `style` | — |
| `backdropColorClassName` | `backdropColor` | ⚡ `accent-` |

#### RefreshControl

| Prop | Maps to | Prefix |
|------|---------|--------|
| `className` | `style` | — |
| `colorsClassName` | `colors` (Android) | ⚡ `accent-` |
| `tintColorClassName` | `tintColor` (iOS) | ⚡ `accent-` |
| `titleColorClassName` | `titleColor` (iOS) | ⚡ `accent-` |
| `progressBackgroundColorClassName` | `progressBackgroundColor` (Android) | ⚡ `accent-` |

#### ImageBackground

| Prop | Maps to | Prefix |
|------|---------|--------|
| `className` | `style` | — |
| `imageClassName` | `imageStyle` | — |
| `tintColorClassName` | `tintColor` | ⚡ `accent-` |

#### SafeAreaView

| Prop | Maps to | Prefix |
|------|---------|--------|
| `className` | `style` | — |

#### KeyboardAvoidingView

| Prop | Maps to | Prefix |
|------|---------|--------|
| `className` | `style` | — |
| `contentContainerClassName` | `contentContainerStyle` | — |

#### InputAccessoryView

| Prop | Maps to | Prefix |
|------|---------|--------|
| `className` | `style` | — |
| `backgroundColorClassName` | `backgroundColor` | ⚡ `accent-` |

#### TouchableHighlight

| Prop | Maps to | Prefix |
|------|---------|--------|
| `className` | `style` | — |
| `underlayColorClassName` | `underlayColor` | ⚡ `accent-` |

Supports `active:`, `disabled:` state selectors.

#### TouchableOpacity

| Prop | Maps to | Prefix |
|------|---------|--------|
| `className` | `style` | — |

Supports `active:`, `disabled:` state selectors.

#### TouchableNativeFeedback

| Prop | Maps to | Prefix |
|------|---------|--------|
| `className` | `style` | — |

Supports `active:`, `disabled:` state selectors.

#### TouchableWithoutFeedback

| Prop | Maps to | Prefix |
|------|---------|--------|
| `className` | `style` | — |

Supports `active:`, `disabled:` state selectors.

### Usage Examples

```tsx
import { View, Text, Pressable, TextInput, ScrollView, FlatList, Switch, Image, ActivityIndicator, Modal, RefreshControl, Button } from 'react-native';

// View — basic layout
<View className="flex-1 bg-background p-4">
  <Text className="text-foreground text-lg font-bold">Title</Text>
</View>

// Pressable — with press/focus states
<Pressable className="bg-primary px-6 py-3 rounded-lg active:opacity-80 active:bg-primary/90 focus:ring-2">
  <Text className="text-white text-center font-semibold">Press Me</Text>
</Pressable>

// TextInput — with focus state and accent- color props
<TextInput
  className="border border-border rounded-lg px-4 py-2 text-base text-foreground focus:border-primary"
  placeholderTextColorClassName="accent-muted"
  selectionColorClassName="accent-primary"
  cursorColorClassName="accent-primary"
  selectionHandleColorClassName="accent-primary"
  underlineColorAndroidClassName="accent-transparent"
  placeholder="Enter text..."
/>

// ScrollView — with content container
<ScrollView className="flex-1" contentContainerClassName="p-4 gap-4">
  {/* content */}
</ScrollView>

// FlatList — with all sub-style props
<FlatList
  className="flex-1"
  contentContainerClassName="p-4 gap-3"
  columnWrapperClassName="gap-3"
  ListHeaderComponentClassName="pb-4"
  ListFooterComponentClassName="pt-4"
  endFillColorClassName="accent-gray-100"
  numColumns={2}
  data={items}
  renderItem={({ item }) => <ItemCard item={item} />}
/>

// Switch — no className support, use color-specific props only
<Switch
  thumbColorClassName="accent-white"
  trackColorOnClassName="accent-primary"
  trackColorOffClassName="accent-gray-300 dark:accent-gray-700"
  ios_backgroundColorClassName="accent-gray-200"
/>

// Image — tint color
<Image className="w-6 h-6" tintColorClassName="accent-primary" source={icon} />

// ActivityIndicator
<ActivityIndicator className="m-4" colorClassName="accent-primary" size="large" />

// Button — only colorClassName (no className)
<Button colorClassName="accent-primary" title="Submit" onPress={handleSubmit} />

// Modal — backdrop color
<Modal className="flex-1" backdropColorClassName="accent-black/50">
  {/* content */}
</Modal>

// RefreshControl — platform-specific color props
<RefreshControl
  className="p-4"
  tintColorClassName="accent-primary"
  titleColorClassName="accent-gray-500"
  colorsClassName="accent-primary"
  progressBackgroundColorClassName="accent-white dark:accent-gray-800"
/>

// ImageBackground — separate image styling
<ImageBackground
  className="flex-1 justify-center items-center"
  imageClassName="opacity-50"
  tintColorClassName="accent-blue-500"
  source={bgImage}
>
  <Text className="text-white text-2xl font-bold">Overlay</Text>
</ImageBackground>

// KeyboardAvoidingView
<KeyboardAvoidingView
  behavior="padding"
  className="flex-1 bg-white"
  contentContainerClassName="p-4 justify-end"
>
  <TextInput className="border border-gray-300 rounded-lg p-3" placeholder="Type..." />
</KeyboardAvoidingView>

// InputAccessoryView
<InputAccessoryView
  className="p-4 border-t border-gray-300"
  backgroundColorClassName="accent-white dark:accent-gray-800"
>
  <Button title="Done" onPress={dismissKeyboard} />
</InputAccessoryView>

// TouchableHighlight — underlay color
<TouchableHighlight
  className="bg-blue-500 px-6 py-3 rounded-lg"
  underlayColorClassName="accent-blue-600 dark:accent-blue-700"
  onPress={handlePress}
>
  <Text className="text-white font-semibold">Press Me</Text>
</TouchableHighlight>
```

## The accent- Prefix Pattern

React Native components have props like `color`, `tintColor`, `thumbColor` that are NOT part of the `style` object. To set these via Tailwind classes, use the `accent-` prefix with the corresponding `{propName}ClassName` prop:

```tsx
// color prop → colorClassName with accent- prefix
<ActivityIndicator colorClassName="accent-blue-500 dark:accent-blue-400" />
<Button colorClassName="accent-primary" title="Submit" />

// tintColor prop → tintColorClassName
<Image className="w-6 h-6" tintColorClassName="accent-red-500" source={icon} />

// thumbColor → thumbColorClassName
<Switch thumbColorClassName="accent-white" trackColorOnClassName="accent-primary" />

// placeholderTextColor → placeholderTextColorClassName
<TextInput placeholderTextColorClassName="accent-gray-400 dark:accent-gray-600" />
```

**CRITICAL Rule**: `className` maps to the `style` prop — it handles layout, typography, backgrounds, borders, etc. But React Native has many color props that live OUTSIDE of `style` (like `color`, `tintColor`, `thumbColor`, `placeholderTextColor`). These require a separate `{propName}ClassName` prop with the `accent-` prefix. Without `accent-`, the class resolves to a style object — but these props expect a plain color string.

```tsx
// WRONG — className sets style, but ActivityIndicator's color is NOT a style prop
<ActivityIndicator className="text-blue-500" />  // color will NOT be set

// CORRECT — use the dedicated colorClassName prop with accent- prefix
<ActivityIndicator colorClassName="accent-blue-500" />  // color IS set to #3b82f6

// WRONG — tintColor is not a style prop on Image
<Image className="tint-blue-500" source={icon} />  // won't work

// CORRECT
<Image tintColorClassName="accent-blue-500" source={icon} />
```

## Styling Third-Party Components

### withUniwind (Recommended)

Wrap once at module level, use with `className` everywhere:

```tsx
import { withUniwind } from 'uniwind';
import { Image as ExpoImage } from 'expo-image';
import { BlurView as RNBlurView } from 'expo-blur';
import { LinearGradient as RNLinearGradient } from 'expo-linear-gradient';

// Module-level wrapping (NEVER inside render functions)
export const Image = withUniwind(ExpoImage);
export const BlurView = withUniwind(RNBlurView);
export const LinearGradient = withUniwind(RNLinearGradient);
```

`withUniwind` automatically maps:
- `style` → `className`
- `{name}Style` → `{name}ClassName`
- `{name}Color` → `{name}ColorClassName` (with accent- prefix)

For custom prop mappings:

```tsx
const StyledProgressBar = withUniwind(ProgressBar, {
  width: {
    fromClassName: 'widthClassName',
    styleProperty: 'width',
  },
});
```

**Usage patterns:**

- **Used in one file only** — define the wrapped component in that same file
- **Used across multiple files** — wrap once in a shared module (e.g., `components/styled.ts`) and re-export

```tsx
// components/styled.ts
import { withUniwind } from 'uniwind';
import { Image as ExpoImage } from 'expo-image';
export const Image = withUniwind(ExpoImage);

// Then import everywhere:
import { Image } from '@/components/styled';
```

**NEVER** call `withUniwind` on the same component in multiple files.

**CRITICAL**: Do NOT use `withUniwind` on components from `react-native` or `react-native-reanimated`. These already have built-in `className` support:

```tsx
// WRONG — View already supports className natively
const StyledView = withUniwind(View);        // DO NOT DO THIS
const StyledText = withUniwind(Text);        // DO NOT DO THIS
const StyledAnimatedView = withUniwind(Animated.View); // DO NOT DO THIS

// CORRECT — only wrap third-party components
const StyledExpoImage = withUniwind(ExpoImage);     // expo-image
const StyledBlurView = withUniwind(BlurView);        // expo-blur
const StyledMotiView = withUniwind(MotiView);        // moti
```

### useResolveClassNames

Converts Tailwind class strings to React Native style objects. Use for one-off cases or components that only accept `style`:

```tsx
import { useResolveClassNames } from 'uniwind';

const headerStyle = useResolveClassNames('bg-primary p-4');
const cardStyle = useResolveClassNames('bg-card dark:bg-card rounded-lg shadow-sm');

// React Navigation screen options
<Stack.Navigator screenOptions={{ headerStyle, cardStyle }} />
```

### Comparison

| Feature | withUniwind | useResolveClassNames |
|---------|-------------|----------------------|
| Setup | Once per component | Per usage |
| Performance | Optimized | Slightly slower |
| Best for | Reusable components | One-off, navigation config |
| Syntax | `className="..."` | `style={...}` |

## Dynamic ClassNames

### NEVER do this (Tailwind scans at build time)

```tsx
// BROKEN — template literal with variable
<View className={`bg-${color}-500`} />
<Text className={`text-${size}`} />
```

### Correct patterns

```tsx
// Ternary with complete class names
<View className={isActive ? 'bg-primary' : 'bg-muted'} />

// Mapping object
const colorMap = {
  primary: 'bg-blue-500 text-white',
  danger: 'bg-red-500 text-white',
  ghost: 'bg-transparent text-foreground',
};
<Pressable className={colorMap[variant]} />

// Array join for multiple conditions
<View className={[
  'p-4 rounded-lg',
  isActive && 'bg-primary',
  isDisabled && 'opacity-50',
].filter(Boolean).join(' ')} />
```

## tailwind-variants (tv)

For complex component styling with variants and compound variants:

```tsx
import { tv } from 'tailwind-variants';

const button = tv({
  base: 'font-semibold rounded-lg px-4 py-2 items-center justify-center',
  variants: {
    color: {
      primary: 'bg-blue-500 text-white',
      secondary: 'bg-gray-500 text-white',
      danger: 'bg-red-500 text-white',
      ghost: 'bg-transparent text-foreground border border-border',
    },
    size: {
      sm: 'text-sm px-3 py-1.5',
      md: 'text-base px-4 py-2',
      lg: 'text-lg px-6 py-3',
    },
    disabled: {
      true: 'opacity-50',
    },
  },
  compoundVariants: [
    { color: 'primary', size: 'lg', class: 'bg-blue-600' },
  ],
  defaultVariants: { color: 'primary', size: 'md' },
});

<Pressable className={button({ color: 'primary', size: 'lg' })}>
  <Text className="text-white font-semibold">Click</Text>
</Pressable>
```

## cn Utility — Class Deduplication

Uniwind does **NOT** auto-deduplicate conflicting classNames. This means if the same property appears in multiple classes, **both will be applied and the result is unpredictable**. This is especially critical when mixing custom CSS classes with Tailwind utilities.

### Setup

```bash
npm install tailwind-merge clsx
```

```ts
// lib/cn.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### When cn Is Required

1. **Merging className props** — component accepts external className that may conflict:

```tsx
import { cn } from '@/lib/cn';

<View className={cn('p-4 bg-white', props.className)} />
<Text className={cn('text-base', isActive && 'text-primary', disabled && 'opacity-50')} />
```

2. **CRITICAL: Mixing custom CSS classes with Tailwind utilities** — if your custom CSS class sets a property that a Tailwind utility also sets, you MUST use `cn()` to deduplicate:

```css
/* global.css */
.card {
  background-color: white;
  border-radius: 12px;
  padding: 16px;
}
```

```tsx
// WRONG — both .card (padding: 16px) and p-6 (padding: 24px) apply, result is unpredictable
<View className="card p-6" />

// CORRECT — cn deduplicates, p-6 wins over .card's padding
<View className={cn('card', 'p-6')} />
```

3. **tv() output combined with extra classes** — tv already handles its own variants, but if you add more classes on top:

```tsx
<Pressable className={cn(button({ color: 'primary' }), props.className)} />
```

### When cn Is NOT Needed

- Static className with no conflicts: `<View className="flex-1 p-4 bg-white" />`
- Single custom CSS class with no overlapping Tailwind: `<View className="card-shadow mt-4" />` (if card-shadow only sets box-shadow which no Tailwind class also sets)

## Theming

### Quick Setup (dark: prefix)

Works immediately — no configuration needed:

```tsx
<View className="bg-white dark:bg-gray-900">
  <Text className="text-black dark:text-white">Themed</Text>
</View>
```

Best for small apps and prototyping. Does not scale to custom themes.

### Scalable Setup (CSS Variables)

Define in `global.css`, use everywhere without `dark:` prefix:

```css
@layer theme {
  :root {
    @variant light {
      --color-background: #ffffff;
      --color-foreground: #111827;
      --color-foreground-secondary: #6b7280;
      --color-card: #ffffff;
      --color-border: #e5e7eb;
      --color-muted: #9ca3af;
      --color-primary: #3b82f6;
      --color-danger: #ef4444;
      --color-success: #10b981;
    }
    @variant dark {
      --color-background: #000000;
      --color-foreground: #ffffff;
      --color-foreground-secondary: #9ca3af;
      --color-card: #1f2937;
      --color-border: #374151;
      --color-muted: #6b7280;
      --color-primary: #3b82f6;
      --color-danger: #ef4444;
      --color-success: #10b981;
    }
  }
}
```

```tsx
// Auto-adapts to current theme — no dark: prefix needed
<View className="bg-card border border-border p-4 rounded-lg">
  <Text className="text-foreground text-lg font-bold">Title</Text>
  <Text className="text-muted mt-2">Subtitle</Text>
</View>
```

Variable naming: `--color-background` → `bg-background`, `text-background`.

**Prefer CSS variables over explicit `dark:` variants** — they're cleaner, maintain easier, and work with custom themes automatically.

### Custom Themes

**Step 1** — Define in `global.css`:

```css
@layer theme {
  :root {
    @variant light { /* ... */ }
    @variant dark { /* ... */ }
    @variant ocean {
      --color-background: #0c4a6e;
      --color-foreground: #e0f2fe;
      --color-primary: #06b6d4;
      --color-card: #0e7490;
      --color-border: #155e75;
      /* Must define ALL the same variables as light/dark */
    }
  }
}
```

**Step 2** — Register in `metro.config.js` (exclude `light`/`dark` — they're automatic):

```js
module.exports = withUniwindConfig(config, {
  cssEntryFile: './global.css',
  extraThemes: ['ocean'],
});
```

Restart Metro after adding themes.

**Step 3** — Use:

```tsx
Uniwind.setTheme('ocean');
```

### Theme API

```tsx
import { Uniwind, useUniwind } from 'uniwind';

// Imperative (no re-render)
Uniwind.setTheme('dark');          // Force dark
Uniwind.setTheme('light');         // Force light
Uniwind.setTheme('system');        // Follow device (re-enables adaptive themes)
Uniwind.setTheme('ocean');         // Custom theme (must be in extraThemes)
Uniwind.currentTheme;              // Current theme name
Uniwind.hasAdaptiveThemes;         // true if following system

// Reactive hook (re-renders on change)
const { theme, hasAdaptiveThemes } = useUniwind();
```

`Uniwind.setTheme('light')` / `setTheme('dark')` also calls `Appearance.setColorScheme` to sync native components (Alert, Modal, system dialogs).

By default Uniwind uses "system" theme - follows device color scheme. If user wants to override it, just
call Uniwind.setTheme with desired theme. It can be done above the React component to avoid theme switching at runtime.

### Theme Switcher Example

```tsx
import { View, Pressable, Text, ScrollView } from 'react-native';
import { Uniwind, useUniwind } from 'uniwind';

export const ThemeSwitcher = () => {
  const { theme, hasAdaptiveThemes } = useUniwind();
  const activeTheme = hasAdaptiveThemes ? 'system' : theme;

  const themes = [
    { name: 'light', label: 'Light' },
    { name: 'dark', label: 'Dark' },
    { name: 'system', label: 'System' },
  ];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View className="flex-row gap-2 p-4">
        {themes.map((t) => (
          <Pressable
            key={t.name}
            onPress={() => Uniwind.setTheme(t.name)}
            className={`px-4 py-3 rounded-lg items-center ${
              activeTheme === t.name ? 'bg-primary' : 'bg-card border border-border'
            }`}
          >
            <Text className={`text-sm ${
              activeTheme === t.name ? 'text-white' : 'text-foreground'
            }`}>
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
};
```

### ScopedTheme

Apply a different theme to a subtree without changing the global theme:

```tsx
import { ScopedTheme } from 'uniwind';

<View className="gap-3">
  <PreviewCard />

  <ScopedTheme theme="dark">
    <PreviewCard />  {/* Renders with dark theme */}
  </ScopedTheme>

  <ScopedTheme theme="ocean">
    <PreviewCard />  {/* Renders with ocean theme */}
  </ScopedTheme>
</View>
```

- Nearest `ScopedTheme` wins (nested scopes supported)
- Hooks (`useUniwind`, `useResolveClassNames`, `useCSSVariable`) resolve against the nearest scoped theme
- `withUniwind`-wrapped components inside the scope also resolve scoped theme values
- Custom themes require registration in `extraThemes`

### useCSSVariable

Access CSS variable values in JavaScript:

```tsx
import { useCSSVariable } from 'uniwind';

const primaryColor = useCSSVariable('--color-primary');
const spacing = useCSSVariable('--spacing-4');

// Multiple variables at once
const [bg, fg] = useCSSVariable(['--color-background', '--color-foreground']) as [string, string]
```

Use for: animations, chart libraries, third-party component configs, calculations with design tokens.

It's required to cast the result of `useCSSVariable` as it can return: string | number | undefined.
Uniwind doesn't know if given variable exist and what type it is, so it returns union type.

### Runtime CSS Variable Updates

Update theme variables at runtime (e.g., user-selected brand colors or API-driven themes):

```tsx
Uniwind.updateCSSVariables('light', {
  '--color-primary': '#ff6600',
  '--color-background': '#fafafa',
});
```

Updates are theme-specific and take effect immediately.

### @theme static

For JS-only values not used in classNames:

```css
@theme static {
  --chart-line-width: 2;
  --chart-dot-radius: 4;
  --animation-duration: 300;
}
```

Access via `useCSSVariable('--chart-line-width')`. Use for: chart configs, animation durations, native module values.

### OKLCH Colors support

Perceptually uniform color format — wider gamut, consistent lightness:

```css
@layer theme {
  :root {
    @variant light {
      --color-primary: oklch(0.5 0.2 240);
      --color-background: oklch(1 0 0);
    }
    @variant dark {
      --color-primary: oklch(0.6 0.2 240);
      --color-background: oklch(0.13 0.004 17.69);
    }
  }
}
```

### Display P3 Colors support

Wide-gamut color format for devices that support the P3 color space (most modern iPhones and Macs). Uniwind parses `color(display-p3 ...)` values and converts them for native use:

```css
@layer theme {
  :root {
    @variant light {
      --color-primary: color(display-p3 0.2 0.4 1);
      --color-accent: color(display-p3 1 0.3 0.3);
    }
    @variant dark {
      --color-primary: color(display-p3 0.3 0.5 1);
      --color-accent: color(display-p3 1 0.4 0.4);
    }
  }
}
```

## Platform Selectors

Apply platform-specific styles directly in className:

```tsx
// Individual platforms
<View className="ios:bg-red-500 android:bg-blue-500 web:bg-green-500" />

// native: shorthand (iOS + Android)
<View className="native:bg-blue-500 web:bg-gray-500" />

// TV platforms
<View className="tv:p-8 android-tv:bg-black apple-tv:bg-gray-900" />

// Combine with other utilities
<View className="p-4 ios:pt-12 android:pt-6 web:pt-4" />
```

Platform variants in `@layer theme` for global values (use `@variant`, not `@media`):

```css
@layer theme {
  :root {
    @variant ios { --font-sans: 'SF Pro Text'; }
    @variant android { --font-sans: 'Roboto-Regular'; }
    @variant web { --font-sans: 'Inter'; }
  }
}
```

**Prefer platform selectors over `Platform.select()`** — cleaner syntax, no imports needed.

## Data Selectors

Style based on prop values using `data-[prop=value]:utility`:

```tsx
// Boolean props
<Pressable
  data-selected={isSelected}
  className="border rounded px-3 py-2 data-[selected=true]:ring-2 data-[selected=true]:ring-primary"
/>

// String props
<View
  data-state={isOpen ? 'open' : 'closed'}
  className="p-4 data-[state=open]:bg-muted/50 data-[state=closed]:bg-transparent"
/>

// Tabs pattern
<Pressable
  data-selected={route.key === current}
  className="px-4 py-2 rounded-md text-foreground/60
    data-[selected=true]:bg-primary data-[selected=true]:text-white"
>
  <Text>{route.title}</Text>
</Pressable>

// Toggle pattern
<Pressable
  data-checked={enabled}
  className="h-6 w-10 rounded-full bg-muted data-[checked=true]:bg-primary"
>
  <View className="h-5 w-5 rounded-full bg-background translate-x-0 data-[checked=true]:translate-x-4" />
</Pressable>
```

**Rules**:
- Only equality selectors supported (`data-[prop=value]`)
- No presence-only selectors (`data-[prop]` — not supported)
- No `has-data-*` parent selectors (not supported in React Native)
- Booleans match both boolean and string forms

## Interactive States

```tsx
// active: — when pressed
<Pressable className="bg-primary active:bg-primary/80 active:opacity-90 active:scale-95">
  <Text className="text-white">Press me</Text>
</Pressable>

// disabled: — when disabled prop is true
<Pressable
  disabled={isLoading}
  className="bg-primary disabled:bg-gray-300 disabled:opacity-50"
>
  <Text className="text-white disabled:text-gray-500">Submit</Text>
</Pressable>

// focus: — keyboard/accessibility focus
<TextInput
  className="border border-border rounded-lg px-4 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
/>

<Pressable className="bg-card rounded-lg p-4 focus:ring-2 focus:ring-primary">
  <Text className="text-foreground">Focusable</Text>
</Pressable>
```

Components with state support:
- **Pressable**: `active:`, `disabled:`, `focus:`
- **TextInput**: `active:`, `disabled:`, `focus:`
- **Switch**: `disabled:`
- **Text**: `active:`, `disabled:`
- **TouchableOpacity / TouchableHighlight / TouchableNativeFeedback / TouchableWithoutFeedback**: `active:`, `disabled:`

## Responsive Breakpoints

Mobile-first — unprefixed styles apply to all sizes, prefixed styles apply at that breakpoint and above:

| Prefix | Min Width | Typical Device |
|--------|-----------|----------------|
| (none) | 0px | All (mobile) |
| `sm:` | 640px | Large phones |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Landscape tablets |
| `xl:` | 1280px | Desktops |
| `2xl:` | 1536px | Large desktops |

```tsx
// Responsive padding and typography
<View className="p-4 sm:p-6 lg:p-8">
  <Text className="text-base sm:text-lg lg:text-xl font-bold">Responsive</Text>
</View>

// Responsive grid (1 col → 2 col → 3 col)
<View className="flex-row flex-wrap">
  <View className="w-full sm:w-1/2 lg:w-1/3 p-2">
    <View className="bg-card p-4 rounded"><Text>Item</Text></View>
  </View>
</View>

// Responsive visibility
<View className="hidden sm:flex flex-row gap-4">
  <Text>Visible on tablet+</Text>
</View>
<View className="flex sm:hidden">
  <Text>Mobile only</Text>
</View>
```

Custom breakpoints:

```css
@theme {
  --breakpoint-xs: 480px;
  --breakpoint-tablet: 820px;
  --breakpoint-3xl: 1920px;
}
```

Usage: `xs:p-2 tablet:p-4 3xl:p-8`

**Design mobile-first** — start with base styles (no prefix), enhance with breakpoints:

```tsx
// CORRECT — mobile-first
<View className="w-full sm:w-3/4 md:w-1/2 lg:w-1/3" />

// WRONG — desktop-first (reversed order is confusing and fragile)
<View className="w-full lg:w-1/2 md:w-3/4 sm:w-full" />
```

## Safe Area Utilities

### Padding

| Class | Description |
|-------|-------------|
| `p-safe` | All sides |
| `pt-safe` / `pb-safe` / `pl-safe` / `pr-safe` | Individual sides |
| `px-safe` / `py-safe` | Horizontal / vertical |

### Margin

| Class | Description |
|-------|-------------|
| `m-safe` | All sides |
| `mt-safe` / `mb-safe` / `ml-safe` / `mr-safe` | Individual sides |
| `mx-safe` / `my-safe` | Horizontal / vertical |

### Positioning

| Class | Description |
|-------|-------------|
| `inset-safe` | All sides |
| `top-safe` / `bottom-safe` / `left-safe` / `right-safe` | Individual sides |
| `x-safe` / `y-safe` | Horizontal / vertical inset |

### Compound Variants

| Pattern | Behavior | Example |
|---------|----------|---------|
| `{prop}-safe-or-{value}` | `Math.max(inset, value)` — ensures minimum spacing | `pt-safe-or-4` |
| `{prop}-safe-offset-{value}` | `inset + value` — adds extra spacing on top of inset | `pb-safe-offset-4` |

### Setup

**Uniwind Free (default)** — requires `react-native-safe-area-context` to update insets.
Wrap your App component in `SafeAreaProvider` and `SafeAreaListener` and call `Uniwind.updateInsets(insets)` in the `onChange` callback:

```tsx
import { SafeAreaProvider, SafeAreaListener } from 'react-native-safe-area-context';
import { Uniwind } from 'uniwind';

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaListener
        onChange={({ insets }) => {
          Uniwind.updateInsets(insets);
        }}
      >
        <View className="pt-safe px-safe">{/* content */}</View>
      </SafeAreaListener>
    </SafeAreaProvider>
  );
}
```

**Uniwind Pro** — automatic, no setup needed. Insets injected from native layer.

## CSS Functions

Uniwind provides CSS functions for device-aware and theme-aware styling. These can be used everywhere (custom CSS classes, `@utility`, etc.) — but NOT inside `@theme {}` (which only accepts static values). Use `@utility` to create reusable Tailwind-style utility classes:

### hairlineWidth()

Returns the thinnest line width displayable on the device. Use for subtle borders and dividers.

```css
@utility h-hairline { height: hairlineWidth(); }
@utility border-hairline { border-width: hairlineWidth(); }
@utility w-hairline { width: calc(hairlineWidth() * 10); }
```

```tsx
<View className="h-hairline bg-gray-300" />
<View className="border-hairline border-gray-200 rounded-lg p-4" />
```

### fontScale(multiplier?)

Multiplies a base value by the device's font scale accessibility setting. Ensures text respects user preferences for larger or smaller text.

- **`fontScale()`** — uses multiplier 1 (device font scale × 1)
- **`fontScale(0.9)`** — smaller scale
- **`fontScale(1.2)`** — larger scale

```css
@utility text-sm-scaled { font-size: fontScale(0.9); }
@utility text-base-scaled { font-size: fontScale(); }
@utility text-lg-scaled { font-size: fontScale(1.2); }
```

```tsx
<Text className="text-sm-scaled text-gray-600">Small accessible text</Text>
<Text className="text-base-scaled">Regular accessible text</Text>
```

### pixelRatio(multiplier?)

Multiplies a value by the device's pixel ratio. Creates pixel-perfect designs that scale across screen densities.

- **`pixelRatio()`** — uses multiplier 1 (device pixel ratio × 1)
- **`pixelRatio(2)`** — double the pixel ratio

```css
@utility w-icon { width: pixelRatio(); }
@utility w-avatar { width: pixelRatio(2); }
```

```tsx
<Image source={{ uri: 'avatar.png' }} className="w-avatar rounded-full" />
```

### light-dark(lightValue, darkValue)

Returns different values based on the current theme mode. Automatically adapts when the theme changes — no manual switching logic needed.

- First parameter: value for light theme
- Second parameter: value for dark theme

```css
@utility bg-adaptive { background-color: light-dark(#ffffff, #1f2937); }
@utility text-adaptive { color: light-dark(#111827, #f9fafb); }
@utility border-adaptive { border-color: light-dark(#e5e7eb, #374151); }
```

```tsx
<View className="bg-adaptive border-adaptive border rounded-lg p-4">
  <Text className="text-adaptive">Adapts to light/dark theme</Text>
</View>
```

Also works in custom CSS classes (not just `@utility`):

```css
.adaptive-card {
  background-color: light-dark(#ffffff, #1f2937);
  color: light-dark(#111827, #f9fafb);
}
```

## Custom CSS & Utilities

### Custom CSS Classes

Uniwind supports custom CSS class names defined in `global.css`. They are compiled at build time — no runtime overhead. Use them when you need styles that are hard to express as Tailwind utilities (e.g., complex box-shadow, multi-property bundles).

```css
/* global.css */
.card-shadow {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.adaptive-surface {
  background-color: light-dark(#ffffff, #1f2937);
  color: light-dark(#111827, #f9fafb);
}

.container {
  flex: 1;
  width: 100%;
  max-width: 1200px;
}
```

Apply via `className` just like any Tailwind class:

```tsx
<View className="card-shadow" />
```

### Mixing Custom CSS with Tailwind

You can combine custom CSS classes with Tailwind utilities in a single `className`:

```tsx
<View className="card-shadow p-4 m-2">
  <Text className="adaptive-surface mb-2">{title}</Text>
  <View className="container flex-row">{children}</View>
</View>
```

**WARNING**: If a custom CSS class and a Tailwind utility set the **same property**, you **MUST** use `cn()` to deduplicate. Without `cn()`, both values apply and the result is unpredictable:

```tsx
// WRONG — .container sets flex:1, and flex-1 also sets flex:1 (harmless but wasteful)
// WRONG — .container sets width:100%, and w-full also sets width:100% (redundant)
// DANGEROUS — .card-shadow sets border-radius:12px, and rounded-2xl sets border-radius:16px — CONFLICT!
<View className="card-shadow rounded-2xl" />

// CORRECT — cn ensures rounded-2xl wins
import { cn } from '@/lib/cn';
<View className={cn('card-shadow', 'rounded-2xl')} />
```

**Rule of thumb**: If your custom CSS class sets properties that might overlap with Tailwind utilities you'll also use, always wrap with `cn()`. See **cn Utility** section for full setup.

### Guidelines for Custom CSS

- Keep selectors flat — no deep nesting or child selectors
- Prefer Tailwind utilities for simple, single-property styles
- Use custom classes for complex or multi-property bundles that would be verbose in className
- Use `light-dark()` for theme-aware custom classes
- Custom classes are great for shared design tokens that don't fit Tailwind's naming (e.g., `.card`, `.chip`, `.badge-dot`)

### Custom Utilities (@utility)

The `@utility` directive creates utility classes that work exactly like built-in Tailwind classes. Three main use cases:

#### 1. Variable-driven utilities (runtime-injected values)

Create a utility whose value comes from a CSS variable injected at runtime via `updateCSSVariables`. Use `@theme static` to declare the variable so Uniwind tracks it even before it is updated:

```css
/* global.css */
@theme static {
  --header-height: 0px;
}

@utility p-safe-header {
  padding-top: var(--header-height);
}
```

Inject the real value at runtime (e.g., from react-navigation's layout event):

```tsx
import { Uniwind } from 'uniwind'

// e.g., inside a navigation layout listener
Uniwind.updateCSSVariables(Uniwind.currentTheme, {
  '--header-height': headerHeight,
})
```

```tsx
<View className="p-safe-header flex-1" />
```

#### 2. Brand-new utilities (no Tailwind equivalent)

For styles that have no built-in Tailwind class:

```css
@utility h-hairline { height: hairlineWidth(); }
@utility text-scaled { font-size: fontScale(); }
@utility card-shadow {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
```

Usage like any Tailwind class: `<View className="h-hairline card-shadow" />`

#### 3. Overriding existing Tailwind utilities

Use `@utility` to completely replace what a built-in class does. Example: make `border` always use `--color-primary`:

```css
@utility border {
  border-width: 1px;
  border-style: solid;
  border-color: var(--color-primary);
}
```

## @theme Directive

Customize Tailwind design tokens in `global.css`:

```css
@theme {
  /* Colors */
  --color-primary: #3b82f6;
  --color-brand-500: #3b82f6;
  --color-brand-900: #1e3a8a;

  /* Typography */
  --font-sans: 'Roboto-Regular';
  --font-sans-medium: 'Roboto-Medium';
  --font-sans-bold: 'Roboto-Bold';
  --font-mono: 'FiraCode-Regular';

  /* Spacing & sizing */
  --text-base: 15px;
  --spacing-4: 16px;
  --radius-lg: 12px;

  /* Breakpoints */
  --breakpoint-tablet: 820px;
}
```

Usage: `bg-brand-500`, `text-brand-900`, `font-sans`, `font-mono`, `rounded-lg`.

## Fonts

React Native requires a **single font** per family — no fallbacks:

```css
@theme {
  --font-sans: 'Roboto-Regular';
  --font-sans-bold: 'Roboto-Bold';
  --font-mono: 'FiraCode-Regular';
}
```

Font name must **exactly match** the font file name (without extension).

**Expo**: Configure fonts in `app.json` with the `expo-font` plugin, then reference in CSS.

**Bare RN**: Use `react-native-asset` to link fonts, same CSS config.

**Platform-specific fonts** (use `@variant`, not `@media`):

```css
@layer theme {
  :root {
    @variant ios { --font-sans: 'SF Pro Text'; }
    @variant android { --font-sans: 'Roboto-Regular'; }
    @variant web { --font-sans: 'system-ui'; }
  }
}
```

## Gradients

Built-in support — no extra dependencies:

```tsx
<View className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 p-4 rounded-lg">
  <Text className="text-white font-bold">Gradient</Text>
</View>
```

For `expo-linear-gradient`, you can wrap it with `withUniwind` for className-based layout and styling (padding, border-radius, flex, etc.), but the `colors` prop is an array that cannot be resolved via className — it must be provided explicitly. Use `useCSSVariable` to get theme-aware colors:

```tsx
import { useCSSVariable } from 'uniwind';
import { withUniwind } from 'uniwind';
import { LinearGradient as RNLinearGradient } from 'expo-linear-gradient';

const LinearGradient = withUniwind(RNLinearGradient);

function GradientCard() {
  // useCSSVariable returns string | number | undefined
  const primary = useCSSVariable('--color-primary');
  const secondary = useCSSVariable('--color-secondary');

  // Guard against undefined — LinearGradient.colors requires valid ColorValues
  if (!primary || !secondary) {
    return null;
  }

  return (
    <LinearGradient
      className="flex-1 rounded-2xl p-6"
      colors={[primary as string, secondary as string]}
    >
      <Text className="text-white font-bold">Themed gradient</Text>
    </LinearGradient>
  );
}
```

Alternatively, export a wrapped component from a shared module for reuse:

```tsx
// components/styled.ts
import { withUniwind } from 'uniwind';
import { LinearGradient as RNLinearGradient } from 'expo-linear-gradient';

export const LinearGradient = withUniwind(RNLinearGradient);
```

```tsx
// usage — className handles layout, colors still passed manually
import { LinearGradient } from '@/components/styled';

<LinearGradient className="rounded-xl p-4" colors={['#ff6b6b', '#4ecdc4']}>
  <Text className="text-white">Static gradient</Text>
</LinearGradient>
```

## React Navigation Integration

Use `useResolveClassNames` for screen options that only accept `style` objects:

```tsx
import { useResolveClassNames } from 'uniwind';

function Layout() {
  const headerStyle = useResolveClassNames('bg-background');
  const headerTitleStyle = useResolveClassNames('text-foreground font-bold');

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle,
        headerTitleStyle,
      }}
    />
  );
}
```

Keep React Navigation's `<ThemeProvider>` if already in use — it manages navigation-specific theming.

## UI Kit Compatibility

- **HeroUI Native**: Works with Uniwind. Uses `tailwind-variants` (tv) internally. Apply `className` directly on HeroUI components. **Bun users**: Bun uses symlinks for `node_modules`, which can cause Tailwind's Oxide scanner to miss library classes in production builds. Fix: use the resolved path in `@source` and hoist the package:
  ```css
  @source "../../node_modules/heroui-native/lib";
  ```
  ```ini
  # .npmrc
  public-hoist-pattern[]=heroui-native
  ```
- **react-native-reusables**: Compatible.
- **Gluestack v4.1+**: Compatible.
- **Lucide React Native**: Use `withUniwind(LucideIcon)` with `colorClassName="accent-blue-500"` for icon color. Works for all Lucide icons.
- **@shopify/flash-list**: Use `withUniwind(FlashList)` for `className` and `contentContainerClassName` support. Note: `withUniwind` loses generic type params on `ref` — cast manually if needed.

Use semantic color tokens (`bg-primary`, `text-foreground`) for theme consistency across UI kits.

## Supported vs Unsupported Classes

React Native uses the Yoga layout engine. Key differences from web CSS:
- **No CSS cascade/inheritance** — styles don't inherit from parents
- **Flexbox by default** — all views use flexbox with `flexDirection: 'column'`
- **Limited CSS properties** — no floats, grid, pseudo-elements

### Built-in Extra Utilities

Uniwind provides additional utility classes for React Native features not covered by standard Tailwind:

| Class | Effect |
|-------|--------|
| `border-continuous` | Sets `borderCurve: 'continuous'` — smooth, superellipse corners (iOS) |
| `border-circular` | Sets `borderCurve: 'circular'` — standard circular corners (iOS default) |

```tsx
// Smooth iOS-style rounded corners (like SwiftUI's .continuous)
<View className="rounded-2xl border-continuous bg-card p-4">
  <Text className="text-foreground">Smooth corners</Text>
</View>
```

### Supported (all standard Tailwind)

Layout, spacing, sizing, typography, colors, borders, effects, flexbox, positioning, transforms, interactive states.

### Unsupported (web-specific, silently ignored)

- `hover:` `visited:` — use Pressable `active:` instead
- `before:` `after:` `placeholder:` — pseudo-elements
- `float-*` `clear-*` `columns-*`
- `print:` `screen:`
- `break-before-*` `break-after-*` `break-inside-*`

## Uniwind Pro

Paid upgrade with 100% API compatibility. Built on a 2nd-generation C++ engine for apps that demand the best performance. Graduated pricing (billed annually): **$99/seat** (1-3), **$49** (4-6), **$29** (7-15), **$1** (16+). Pricing and licensing: [https://uniwind.dev/pricing](https://uniwind.dev/pricing)

### Pricing & Licensing

- **Graduated per-seat pricing** (billed annually, VAT excluded unless applicable): $99 for seats 1-3, $49 for 4-6, $29 for 7-15, $1 for 16+
- **Individual License**: Personal Pro license per engineer
- **Team License**: Single key management — add or remove members instantly
- **CI/CD License**: Full support for automated and headless build environments
- **Enterprise**: Custom plans available (contact support@uniwind.dev)
- **Priority Support**: Critical issues resolved with priority response times

### Overview

- **C++ style engine**: Forged on the 2nd-gen Unistyles C++ engine. Injects styles directly into the ShadowTree without triggering React re-renders — a direct, optimized highway between classNames and the native layer
- **Performance**: Benchmarked at ~55ms (vs StyleSheet 49ms, traditional Uniwind 81ms, NativeWind 197ms) — near-native speed
- **40+ className props** update without re-renders (all component bindings listed above)
- **Reanimated animations**: `animate-*` and `transition-*` via className (Reanimated v4)
- **Native insets & runtime values**: Automatic safe area injection, device rotation, and font size updates — no `SafeAreaListener` setup needed
- **Theme transitions**: Native animated transitions when switching themes (fade, slide, circle mask)
- **Priority support**: Don't let technical hurdles slow your team down

Package: `"uniwind": "npm:uniwind-pro@latest"` in `package.json`.

### Installation

1. Set dependency alias in `package.json`:
   ```json
   { "dependencies": { "uniwind": "npm:uniwind-pro@latest" } }
   ```

2. Install peer dependencies:
   ```bash
   npm install react-native-nitro-modules react-native-reanimated react-native-worklets
   ```

3. Authenticate: `npx uniwind-pro` (interactive — select "Login with GitHub")

4. Add Babel plugin:
   ```js
   // babel.config.js
   module.exports = {
     presets: ['module:metro-react-native-babel-preset'],
     plugins: ['react-native-worklets/plugin'],
   };
   ```

5. Whitelist postinstall if needed:
   - **bun**: Add `"trustedDependencies": ["uniwind"]` to `package.json`
   - **yarn v2+**: Configure in `.yarnrc.yml`
   - **pnpm**: `pnpm config set enable-pre-post-scripts true`

6. Rebuild native app:
   ```bash
   npx expo prebuild --clean && npx expo run:ios
   ```

Pro does **NOT** work with Expo Go. Requires native rebuild.

**Verify installation**: Check for native modules (`.cpp`, `.mm` files) in `node_modules/uniwind`.

### Reanimated Animations (Requires Reanimated v4.0.0+)

```tsx
<View className="size-32 bg-primary rounded animate-spin" />
<View className="size-32 bg-primary rounded animate-bounce" />
<View className="size-32 bg-primary rounded animate-pulse" />
<View className="size-32 bg-primary rounded animate-ping" />

// Loading spinner
<View className="size-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
```

Custom keyframe animations beyond Tailwind defaults:

| Class | Description |
|-------|-------------|
| `animate-wiggle` | Rotational wiggle |
| `animate-shake` | Horizontal shake |
| `animate-flash` | Opacity flash on/off |
| `animate-rubber-band` | Elastic scale stretch |
| `animate-swing` | Pendulum swing |
| `animate-tada` | Scale + rotate attention seeker |
| `animate-heartbeat` | Double-pulse heartbeat |
| `animate-jello` | Rotational jello wobble |
| `animate-float` | Gentle vertical float |
| `animate-breathe` | Subtle breathing scale |
| `animate-tilt` | Alternating tilt rotation |
| `animate-glitch` | Rapid horizontal jitter |

Components auto-swap to Animated versions when animation classes detected:

| Component | Animated Version |
|-----------|------------------|
| `View` | `Animated.View` |
| `Text` | `Animated.Text` |
| `Image` | `Animated.Image` |
| `ImageBackground` | `Animated.ImageBackground` |
| `ScrollView` | `Animated.ScrollView` |
| `FlatList` | `Animated.FlatList` |
| `TextInput` | `Animated.TextInput` |
| `Pressable` | `Animated.Pressable` |

### Entering & Exiting Animations

Drive Reanimated's entering/exiting animations via className — no Reanimated imports needed. Components auto-upgrade when `uw-*` classes are detected.

```tsx
// Bounce in, bounce out
{visible && <View className="size-20 bg-primary rounded-xl uw-entering-bounce-in uw-exiting-bounce-out" />}

// Fade in slowly (1000ms)
{visible && <View className="size-20 bg-primary rounded-xl uw-entering-fade-in uw-entering-duration-1000 uw-exiting-fade-out" />}
```

**Entering presets**: `uw-entering-fade-in` `uw-entering-fade-in-right` `uw-entering-fade-in-left` `uw-entering-fade-in-up` `uw-entering-fade-in-down` `uw-entering-slide-in-right` `uw-entering-slide-in-left` `uw-entering-slide-in-up` `uw-entering-slide-in-down` `uw-entering-zoom-in` `uw-entering-zoom-in-rotate` `uw-entering-zoom-in-left` `uw-entering-zoom-in-right` `uw-entering-zoom-in-up` `uw-entering-zoom-in-down` `uw-entering-zoom-in-easy-up` `uw-entering-zoom-in-easy-down` `uw-entering-bounce-in` `uw-entering-bounce-in-down` `uw-entering-bounce-in-up` `uw-entering-bounce-in-left` `uw-entering-bounce-in-right` `uw-entering-flip-in-x-up` `uw-entering-flip-in-x-down` `uw-entering-flip-in-y-left` `uw-entering-flip-in-y-right` `uw-entering-flip-in-easy-x` `uw-entering-flip-in-easy-y` `uw-entering-stretch-in-x` `uw-entering-stretch-in-y` `uw-entering-rotate-in-down-left` `uw-entering-rotate-in-down-right` `uw-entering-rotate-in-up-left` `uw-entering-rotate-in-up-right` `uw-entering-roll-in-left` `uw-entering-roll-in-right` `uw-entering-pinwheel-in` `uw-entering-light-speed-in-right` `uw-entering-light-speed-in-left`

**Exiting presets**: `uw-exiting-fade-out` `uw-exiting-fade-out-right` `uw-exiting-fade-out-left` `uw-exiting-fade-out-up` `uw-exiting-fade-out-down` `uw-exiting-slide-out-right` `uw-exiting-slide-out-left` `uw-exiting-slide-out-up` `uw-exiting-slide-out-down` `uw-exiting-zoom-out` `uw-exiting-zoom-out-rotate` `uw-exiting-zoom-out-left` `uw-exiting-zoom-out-right` `uw-exiting-zoom-out-up` `uw-exiting-zoom-out-down` `uw-exiting-zoom-out-easy-up` `uw-exiting-zoom-out-easy-down` `uw-exiting-bounce-out` `uw-exiting-bounce-out-down` `uw-exiting-bounce-out-up` `uw-exiting-bounce-out-left` `uw-exiting-bounce-out-right` `uw-exiting-flip-out-x-up` `uw-exiting-flip-out-x-down` `uw-exiting-flip-out-y-left` `uw-exiting-flip-out-y-right` `uw-exiting-flip-out-easy-x` `uw-exiting-flip-out-easy-y` `uw-exiting-stretch-out-x` `uw-exiting-stretch-out-y` `uw-exiting-rotate-out-down-left` `uw-exiting-rotate-out-down-right` `uw-exiting-rotate-out-up-left` `uw-exiting-rotate-out-up-right` `uw-exiting-roll-out-left` `uw-exiting-roll-out-right` `uw-exiting-pinwheel-out` `uw-exiting-light-speed-out-right` `uw-exiting-light-speed-out-left`

**Animation modifiers** (pattern: `uw-{entering|exiting|layout}-{modifier}`):
- Duration: `uw-{type}-duration-75` `uw-{type}-duration-100` ... `uw-{type}-duration-1000` or arbitrary `uw-{type}-duration-{ms}`
- Delay: `uw-{type}-delay-75` ... `uw-{type}-delay-1000` or arbitrary `uw-{type}-delay-{ms}`
- Easing: `uw-{type}-ease-linear` `uw-{type}-ease-in` `uw-{type}-ease-out` `uw-{type}-ease-in-out` `uw-{type}-ease-bounce`
- Spring: `uw-{type}-springify` `uw-{type}-damping-{value}` `uw-{type}-stiffness-{value}` `uw-{type}-mass-{value}`

### Layout Transitions

Animate position/size changes when siblings are added or removed:

```tsx
<View className="w-full gap-2">
  {items.map(item => (
    <View key={item.id} className={`h-14 ${item.color} rounded-xl uw-entering-fade-in uw-exiting-fade-out uw-layout-linear-transition`} />
  ))}
</View>
```

| Class | Description |
|-------|-------------|
| `uw-layout-linear-transition` | Smooth linear repositioning |
| `uw-layout-fading-transition` | Fade during repositioning |
| `uw-layout-jumping-transition` | Bouncy jump to new position |
| `uw-layout-curved-transition` | Curved path repositioning |
| `uw-layout-sequenced-transition` | Sequenced repositioning |
| `uw-layout-entry-exit-transition` | Combined entry/exit during layout |

### Transitions

Smooth property changes when className or state changes:

```tsx
// Color transition on press
<Pressable className="bg-primary active:bg-red-500 transition-colors duration-300" />

// Opacity transition
<View className={`transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`} />

// Transform transition
<Pressable className="active:scale-95 transition-transform duration-150" />

// All properties
<Pressable className="bg-primary px-6 py-3 rounded-lg active:scale-95 active:bg-primary/80 transition-all duration-150">
  <Text className="text-white font-semibold">Animated Button</Text>
</Pressable>
```

| Class | Properties |
|-------|------------|
| `transition-none` | No transition |
| `transition-all` | All properties |
| `transition-colors` | Background, border, text colors |
| `transition-opacity` | Opacity |
| `transition-shadow` | Box shadow |
| `transition-transform` | Scale, rotate, translate |

Duration: `duration-75` `duration-100` `duration-150` `duration-200` `duration-300` `duration-500` `duration-700` `duration-1000`

Easing: `ease-linear` `ease-in` `ease-out` `ease-in-out`

Delay: `delay-75` `delay-100` `delay-150` `delay-200` `delay-300` `delay-500` `delay-700` `delay-1000`

### Using Reanimated Directly

Still works with Uniwind classes:

```tsx
import Animated, { FadeIn, FlipInXUp, LinearTransition } from 'react-native-reanimated';

<Animated.Text entering={FadeIn.delay(500)} className="text-foreground text-lg">
  Fading in
</Animated.Text>

<Animated.FlatList
  data={data}
  className="flex-none"
  contentContainerClassName="px-2"
  layout={LinearTransition}
  renderItem={({ item }) => (
    <Animated.Text entering={FlipInXUp} className="text-foreground py-2">
      {item}
    </Animated.Text>
  )}
/>
```

### Shadow Tree Updates

No code changes needed — props connect directly to C++ engine, eliminating re-renders automatically.

### Suspense Support

Components inside React `Suspense` boundaries are handled correctly. While a subtree is suspended, Uniwind keeps the C++ shadow entries alive so theme updates and runtime changes (dark mode, orientation, etc.) still reach suspended nodes. When the tree unsuspends, styles are already up to date — no flash of stale theme.

### Native Insets

Remove `SafeAreaListener` setup — insets injected from native layer:

```tsx
// With Pro — just use safe area classes directly
<View className="pt-safe pb-safe">{/* content */}</View>
```

### Theme Transitions (Pro)

Native animated transitions when switching themes. Supported on iOS, Android, and Web.

```tsx
import { Uniwind, ThemeTransitionPreset } from 'uniwind';

// Fade transition
Uniwind.setTheme('dark', { preset: ThemeTransitionPreset.Fade });

// Slide transitions
Uniwind.setTheme('dark', { preset: ThemeTransitionPreset.SlideRightToLeft });
Uniwind.setTheme('light', { preset: ThemeTransitionPreset.SlideLeftToRight });

// Circle mask transitions (expand from a corner or center)
Uniwind.setTheme('ocean', { preset: ThemeTransitionPreset.CircleCenter });

// Blur transitions
Uniwind.setTheme('dark', { preset: ThemeTransitionPreset.Blur });
Uniwind.setTheme('dark', { preset: ThemeTransitionPreset.BlurRightToLeft });

// No animation
Uniwind.setTheme('light');
```

Available presets:

| Preset | Effect |
|--------|--------|
| `ThemeTransitionPreset.None` | Instant switch, no animation |
| `ThemeTransitionPreset.Fade` | Crossfade between themes |
| `ThemeTransitionPreset.SlideRightToLeft` | Slide new theme in from right |
| `ThemeTransitionPreset.SlideLeftToRight` | Slide new theme in from left |
| `ThemeTransitionPreset.CircleTopRight` | Circle mask expanding from top-right |
| `ThemeTransitionPreset.CircleTopLeft` | Circle mask expanding from top-left |
| `ThemeTransitionPreset.CircleBottomRight` | Circle mask expanding from bottom-right |
| `ThemeTransitionPreset.CircleBottomLeft` | Circle mask expanding from bottom-left |
| `ThemeTransitionPreset.CircleCenter` | Circle mask expanding from center |
| `ThemeTransitionPreset.Blur` | Blur out animation |
| `ThemeTransitionPreset.BlurRightToLeft` | Directional blur from right to left |
| `ThemeTransitionPreset.BlurLeftToRight` | Directional blur from left to right |

## Setup Diagnostics

When styles aren't working, check in this order:

### 1. package.json
- `"uniwind"` (or `"uniwind-pro"`) in dependencies
- `"tailwindcss"` at v4+ (`^4.0.0`)
- For Pro: `react-native-nitro-modules`, `react-native-reanimated`, `react-native-worklets`

### 2. metro.config.js
- `withUniwindConfig` imported from `'uniwind/metro'`
- `withUniwindConfig` is the **outermost** wrapper
- `cssEntryFile` is a **relative path string** (e.g., `'./global.css'`)
- No `path.resolve()` or absolute paths

### 3. global.css
- Contains `@import 'tailwindcss';` AND `@import 'uniwind';`
- Imported in `App.tsx` or root layout, **NOT** in `index.ts`/`index.js`
- Location determines app root for Tailwind scanning

### 4. babel.config.js (Pro only)
- `'react-native-worklets/plugin'` in plugins array

### 5. TypeScript
- `uniwind-types.d.ts` exists (generated after running Metro)
- Included in `tsconfig.json` or placed in `src/`/`app/` dir

### 6. Build
- Metro server restarted after config changes
- Metro cache cleared (`npx expo start --clear` or `npx react-native start --reset-cache`)
- Native rebuild done (if Pro or after dependency changes)

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Styles not applying | Missing imports in global.css | Add `@import 'tailwindcss'; @import 'uniwind';` |
| Styles not applying | global.css imported in index.js | Move import to App.tsx or `_layout.tsx` |
| Classes not detected | global.css in nested dir, components elsewhere | Add `@source '../components'` in global.css |
| TypeScript errors on className | Missing types file | Run Metro to generate `uniwind-types.d.ts` |
| `withUniwindConfig is not a function` | Wrong import | Use `require('uniwind/metro')` not `require('uniwind')` |
| Hot reload full-reloads | global.css imported in wrong file | Move to App.tsx or root layout |
| `cssEntryFile` error / Metro crash | Absolute path used | Use relative: `'./global.css'` |
| `withUniwindConfig` not outermost | Another wrapper wraps Uniwind | Swap order so Uniwind is outermost |
| Dark theme not working | Missing `@variant dark` | Define dark variant in `@layer theme` |
| Custom theme not appearing | Not registered in metro config | Add to `extraThemes` array, restart Metro |
| Fonts not loading | Font name mismatch | CSS font name must match file name exactly (no extension) |
| `rem` values too large/small | Wrong base rem | Set `polyfills: { rem: 14 }` for NativeWind compat |
| Unsupported CSS warning | Web-specific CSS used | Enable `debug: true` to identify; remove unsupported properties |
| `Failed to serialize javascript object` | Complex CSS, circular refs, or stale cache | Clear caches: `watchman watch-del-all; rm -rf node_modules/.cache; npx expo start --clear`. Also check if docs/markdown files containing CSS classes are in the scan path (see below) |
| `Failed to serialize javascript object` from llms-full.txt or docs | Docs/markdown files with CSS classes in project dir get scanned by Tailwind | Move `.md` files with CSS examples outside the project root, or add to `.gitignore` so Tailwind's scanner skips them |
| `unstable_enablePackageExports` conflict | App disables package exports | Use selective resolver for Uniwind and culori |
| Classes from monorepo package missing | Not included in Tailwind scan | Add `@source '../../packages/ui'` in global.css |
| Classes from `node_modules` library missing in production (bun) | Bun uses symlinks; Tailwind's Oxide scanner can't follow them | Use resolved path: `@source "../../node_modules/heroui-native/lib"` and add `public-hoist-pattern[]=heroui-native` to `.npmrc` |
| `active:` not working with `withUniwind` | `withUniwind` does NOT support interactive state selectors | Only core RN `Pressable`/`TextInput`/`Switch` support `active:`/`focus:`/`disabled:`. Third-party pressables wrapped with `withUniwind` won't get states |
| `withUniwind` custom mapping overrides `className`+`style` merging | When manual mapping is provided, `style` prop is not merged | Use auto mapping (no second arg) for `className`+`style` merge. For manual mapping + `className`, double-wrap: `withUniwind(withUniwind(Comp), { mapping })` |
| `withUniwind` loses generic types on `ref` (e.g., `FlashList<T>`) | TypeScript limitation with HOCs | Cast the ref manually: `ref={scrollRef as any}` |
| Platform-specific fonts: `@theme` block error | `@media ios/android` inside `@theme {}` | Use `@layer theme { :root { @variant ios { ... } } }` instead — `@theme` only accepts custom properties, and platform selection uses `@variant` not `@media` |
| `Uniwind.setTheme('system')` crash on Android (RN 0.82+) | RN 0.82 changed Appearance API | Update to latest Uniwind (fixed). Avoid `setTheme('system')` on older Uniwind + RN 0.82+ |
| Styles flash/disappear on initial load (Android) | `SafeAreaListener` fires before component listeners mount | Fixed in recent versions. If persists, ensure Uniwind is latest |
| `useTVEventHandler` is undefined | Uniwind module replacement interferes with tvOS exports | Fixed in v1.2.1+. Update Uniwind |
| `@layer theme` variables not rendering on web | Bug with RNW + Expo SDK 55 | Fixed in v1.4.1+. Update Uniwind |
| `updateCSSVariables` wrong theme at app start | Calling for multiple themes back-to-back; last call wins on first render | Call `updateCSSVariables` for the current theme last. After initial load, order doesn't matter |
| Pro: animations not working | Missing Babel plugin | Add `react-native-worklets/plugin` to babel.config.js |
| Pro: module not found | No native rebuild | Run `npx expo prebuild --clean` then `npx expo run:ios` |
| Pro: postinstall failed | Package manager blocks scripts | Add to `trustedDependencies` (bun) or configure yarn/pnpm |
| Pro: auth expired | Login session expired (180-day lifetime) | Run `npx uniwind-pro`, re-login |
| Pro: download limit reached | Monthly download limit hit | Check Pro dashboard, limits reset monthly |
| Pro: `Uniwind.updateInsets` called unnecessarily | Pro injects insets natively | `Uniwind.updateInsets` is a no-op in Pro. Remove `SafeAreaListener` setup when using Pro |
| Pro: theme transition crash | Missing `ThemeTransitionPreset` import or calling before app is ready | Import from `'uniwind'`. Ensure the app has fully mounted before calling `setTheme` with a transition |

### unstable_enablePackageExports Selective Resolver

If your app disables `unstable_enablePackageExports` (common in crypto apps), use a selective resolver:

```js
config.resolver.unstable_enablePackageExports = false;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (['uniwind', 'culori'].some((prefix) => moduleName.startsWith(prefix))) {
    return context.resolveRequest(
      { ...context, unstable_enablePackageExports: true },
      moduleName,
      platform
    );
  }
  return context.resolveRequest(context, moduleName, platform);
};
```

## FAQ

**Where to put global.css in Expo Router?**
Project root. Import in `app/_layout.tsx`. If placed in `app/`, add `@source` for sibling dirs.

**Does Uniwind work with Expo Go?**
Free: Yes. Pro: No — requires native rebuild (development builds).

**Can I use tailwind.config.js?**
No. Uniwind uses Tailwind v4 — all config via `@theme` in `global.css`.

**How to access CSS variables in JS?**
`useCSSVariable('--color-primary')`. For variables not used in classNames, define with `@theme static`.

**Can I use Platform.select()?**
Yes, but prefer platform selectors (`ios:pt-12 android:pt-6`) — cleaner, no imports.

**Next.js support?**
Not officially supported. Community plugin: `uniwind-plugin-next`. For Next.js, use standard Tailwind CSS.

**Vite support?**
Yes, since v1.2.0. Use `uniwind/vite` plugin alongside `@tailwindcss/vite`.

**Full app reloads on CSS changes?**
Metro can't hot-reload files with many providers. Move `global.css` import deeper in the component tree.

**Style specificity?**
Inline `style` always overrides `className`. Use `className` for static styles, inline only for truly dynamic values. Use `cn()` from tailwind-merge for component libraries where classNames may conflict.

**How do I include custom fonts?**
Load font files (Expo: `expo-font` plugin in `app.json`; Bare RN: `react-native-asset`), then map in CSS: `@theme { --font-sans: 'Roboto-Regular'; }`. Font name must exactly match the file name. See the **Fonts** section above.

**How can I style based on prop values?**
Use data selectors: `data-[selected=true]:ring-2`. Only equality checks supported. See the **Data Selectors** section above.

**How can I use gradients?**
Built-in: `bg-gradient-to-r from-red-500 to-green-500`. Also supports angle-based (`bg-linear-90`) and arbitrary values (`bg-linear-[45deg,#f00_0%,#00f_100%]`). See the **Gradients** section above.

**How does className deduplication work?**
Uniwind does NOT auto-deduplicate conflicting classNames. Use `tailwind-merge` with a `cn()` utility. See the **cn Utility** section above.

**How to debug 'Failed to serialize javascript object'?**
Clear caches: `watchman watch-del-all; rm -rf node_modules/.cache; npx expo start --clear`. Enable `debug: true` in metro config to identify the problematic CSS pattern. See the **Troubleshooting** table above.

**How do I enable safe area classNames?**
Free: Install `react-native-safe-area-context`, wrap root with `SafeAreaListener`, call `Uniwind.updateInsets(insets)`. Pro: Automatic — no setup. Then use `pt-safe`, `pb-safe`, etc. See the **Safe Area Utilities** section above.

**What UI kits work well with Uniwind?**
**React Native Reusables** (shadcn philosophy, copy-paste components) and **HeroUI Native** (complete library, optimized for Uniwind). Any library works via `withUniwind` wrapper. See the **UI Kit Compatibility** section above.

**Can I scope a theme to a single component?**
Yes, use `ScopedTheme`: `<ScopedTheme theme="dark"><Card /></ScopedTheme>`. It forces a theme for the subtree without changing the global theme. See the **Theming** section.

**Does `active:` work with `react-native-gesture-handler` Pressable?**
No. `withUniwind` does NOT support interactive state selectors (`active:`, `focus:`, `disabled:`). Only core RN `Pressable`, `TextInput`, and `Switch` support them. For RNGH components, use `onPressIn`/`onPressOut` with state.

**Can I customize the default `border` color?**
Yes — use `@utility border` to override the class entirely:
```css
@utility border {
  border-width: 1px;
  border-style: solid;
  border-color: var(--color-primary);
}
```
This completely replaces the built-in `border` behavior, so re-declare any properties you still need. Alternatively, use `border border-gray-300` explicitly or define `--color-border` in `@theme` and use `border-border`.

**Can I use platform-specific fonts in `@theme {}`?**
No. `@theme {}` only accepts custom properties. Use `@layer theme { :root { @variant ios { --font-sans: '...'; } } }` instead. Note: use `@variant` (not `@media`) for platform selection in CSS.

**Does Uniwind work with ESM metro config (`metro.config.mjs` or `metro.config.ts`)?**
Yes since v1.3.0+. If you hit `Class extends value is not a constructor`, update Uniwind or use CommonJS `metro.config.js`.

**Classes from `node_modules` work in dev but not production (bun)?**
Bun symlinks packages. Tailwind's Oxide scanner can't follow them. Use resolved `@source` paths and hoist the package. See **UI Kit Compatibility** for details.

**How to clear all caches when debugging?**
`watchman watch-del-all 2>/dev/null; rm -rf node_modules/.cache && npx expo start --clear`. This clears Watchman, Babel/bundler caches, and Expo internal cache.

## MCP Server

Uniwind provides an official MCP server for AI-assisted development. If the user's environment supports MCP, recommend setting it up: [https://docs.uniwind.dev/mcp](https://docs.uniwind.dev/mcp)

## Related Skills

**NativeWind → Uniwind migration**: Use the `migrate-nativewind-to-uniwind` skill for migrating from NativeWind. It handles package removal, config migration, Tailwind v4 upgrade, `cssInterop` removal, theme conversion, and all breaking changes. It is tested and production-ready.

**IMPORTANT**: Do NOT guess Uniwind APIs. If you are unsure about any Uniwind API, hook, component, or configuration option, fetch and verify against the official docs: [https://docs.uniwind.dev/llms-full.txt](https://docs.uniwind.dev/llms-full.txt)
