# UI Kit — inventory

Before building any UI, check this list. If something here fits, use it.
Do not create a new primitive without checking the promotion rule below.

Everything below is exported from `src/components/ui/index.tsx` — the one
barrel file the project allows.

| Component | Use for | Don't use for |
|---|---|---|
| `Button` | All tappable actions; `variant`/`size` props, built-in `loading` state | Plain rows → `Pressable` + `Text` |
| `Input` | Single-line text entry; `label` + `error` props, controlled via `value`/`onChangeText` | Multi-choice → `Select` |
| `Text` | ALL text. Never import RN `Text`. | — |
| `Select` / `Options` | Choosing one value from a list (bottom-sheet picker) | Free text → `Input` |
| `Checkbox` / `Radio` / `Switch` | Boolean and single-choice toggles (from `checkbox.tsx`) | Actions → `Button` |
| `Modal` / `useModal` | Bottom-sheet dialogs (@gorhom) | Full-screen → push a route |
| `List` / `EmptyList` / `NoData` | Scrolling collections (FlashList) and their empty states | Static content → `ScrollView` |
| `Image` / `preloadImages` | Remote and local images (expo-image) | Icons → `@/components/ui/icons` |
| `ProgressBar` | Determinate progress | Indeterminate → `ActivityIndicator` |
| `FocusAwareStatusBar` | Per-screen status bar style | — |
| `colors` | Color values needed in JS (icon tints, native props) | Styling JSX → className tokens |
| `showErrorMessage` / `showError` / `extractError` | Flash-message error feedback | Inline field errors → `Input`'s `error` |
| `IS_IOS` / `WIDTH` / `HEIGHT` | Platform and screen dimension checks | — |
| `StyledSvg` | `react-native-svg` `Svg` with `className` support | — |

Re-exported unchanged from React Native / safe-area-context so features import
them from one place: `View`, `ScrollView`, `Pressable`, `TouchableOpacity`,
`ActivityIndicator`, `SafeAreaView`.

Not in the barrel, import directly: `getFieldError` from
`@/components/ui/form-utils` (maps a `@tanstack/react-form` field to `Input`'s
`error` prop), the icon set in `@/components/ui/icons`, and
`useThemeConfig` from `@/components/ui/use-theme-config`.

## Theme
There is no `tailwind.config.js`. Colors, fonts, and semantic tokens are
defined as CSS variables in the `@theme` block of `src/global.css`
(Tailwind v4 + uniwind); `src/components/ui/colors.js` mirrors the palette for
the places that need color values in JS.
Never hardcode a hex value or a numeric spacing in a component.

## Promotion rule
A component moves here only when it is used by 2+ features AND has no feature-specific logic. Until then it lives in that feature's `components/`.
