# Quality Standards

## Rule
- **Styling via NativeWind** — use Tailwind class names and theme tokens only. No hex values, no magic spacing numbers.
- **Internationalization** — all user-facing strings live in `src/translations/en.json` (and other locale files). Never inline text in components.

## Rationale
NativeWind ensures consistent design system usage and enables theming. Centralized translations enable multi-language support and prevent string duplication.

## Examples

### Good
```tsx
// NativeWind classes
<View className="flex-1 bg-background p-4">
  <Text className="text-lg font-semibold text-primary">{t('welcome')}</Text>
</View>
```

```json
// src/translations/en.json
{
  "welcome": "Welcome to our app",
  "login.button": "Sign in"
}
```

### Bad
```tsx
// ❌ Hard-coded styling
<View style={{ backgroundColor: '#1a1a2e', padding: 16 }}>
  <Text style={{ color: '#006eff', fontSize: 18 }}>Welcome</Text>
</View>
```

```tsx
// ❌ Inline text
<Text>Welcome to our app</Text>
```

## Enforcement
- ESLint: `better-tailwindcss` plugin flags unknown classes
- ESLint: custom rule could flag inline strings in JSX (or rely on review)
- CI: `pnpm lint:translations` validates JSON syntax and key parity
- Review: check for hard-coded colors/spacing and inline strings
