# ESLint Setup - Migration to @antfu/eslint-config

## Overview

Replace the current ESLint configuration with @antfu/eslint-config, which provides:
- Modern flat config (ESLint 9+)
- Built-in formatting via ESLint Stylistic (replaces Prettier)
- Auto-detection of React/TypeScript
- Opinionated but highly customizable
- Faster and simpler than managing multiple tools

## Current Setup

- ESLint v9.28.0 with flat config
- Multiple plugins (Expo, Prettier, React Compiler, TailwindCSS, i18n-json, Testing Library, Unicorn)
- Prettier v3.3.3 for formatting
- Husky + lint-staged for pre-commit hooks

## Benefits

✅ **Single Tool** - ESLint handles both linting AND formatting
✅ **Faster** - No need to run Prettier separately
✅ **Simpler Config** - Auto-configured for React + TypeScript
✅ **Better DX** - Auto-fix on save works seamlessly
✅ **Maintained** - Anthony Fu actively maintains this config

---

## Step-by-Step Instructions

### 1.1 Install @antfu/eslint-config

```bash
# Remove Prettier and related plugins
pnpm remove eslint-config-prettier eslint-plugin-prettier prettier
pnpm remove eslint-plugin-simple-import-sort eslint-plugin-unused-imports
pnpm remove @typescript-eslint/eslint-plugin @typescript-eslint/parser typescript-eslint
pnpm remove @eslint/js @eslint/eslintrc eslint-config-expo

# Install antfu config
pnpm add -D @antfu/eslint-config
```

**Remarks:**
- We're removing Prettier entirely since @antfu/eslint-config includes ESLint Stylistic
- We remove plugins that are already included in antfu's config
- Keep project-specific plugins: i18n-json, tailwindcss, testing-library, react-compiler

---

### 1.2 Update VS Code Settings

Create or update `.vscode/settings.json`:

```json
{
  "prettier.enable": false,
  "editor.formatOnSave": false,

  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "never"
  },

  "eslint.rules.customizations": [
    { "rule": "style/*", "severity": "off", "fixable": true },
    { "rule": "format/*", "severity": "off", "fixable": true },
    { "rule": "*-indent", "severity": "off", "fixable": true },
    { "rule": "*-spacing", "severity": "off", "fixable": true },
    { "rule": "*-spaces", "severity": "off", "fixable": true },
    { "rule": "*-order", "severity": "off", "fixable": true },
    { "rule": "*-dangle", "severity": "off", "fixable": true },
    { "rule": "*-newline", "severity": "off", "fixable": true },
    { "rule": "*quotes", "severity": "off", "fixable": true },
    { "rule": "*semi", "severity": "off", "fixable": true }
  ],

  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "vue",
    "html",
    "markdown",
    "json",
    "jsonc",
    "yaml",
    "toml",
    "xml",
    "gql",
    "graphql",
    "astro",
    "css",
    "less",
    "scss",
    "pcss",
    "postcss"
  ]
}
```

**Remarks:**
- This disables Prettier completely in VS Code
- Enables ESLint auto-fix on save
- Silences stylistic rules in IDE while still auto-fixing them
- Commit this file so your team uses the same settings

---

### 1.3 Create New ESLint Config

Replace `eslint.config.mjs` with:

```javascript
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import antfu from '@antfu/eslint-config';
import i18nJsonPlugin from 'eslint-plugin-i18n-json';
import reactCompiler from 'eslint-plugin-react-compiler';
import tailwind from 'eslint-plugin-tailwindcss';
import testingLibrary from 'eslint-plugin-testing-library';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default antfu(
  {
    // Enable React and TypeScript support
    react: true,
    typescript: true,

    // Use ESLint Stylistic for formatting
    stylistic: {
      indent: 2,
      quotes: 'single',
      semi: true,
    },

    // Global ignores
    ignores: [
      'dist/*',
      'node_modules',
      '__tests__/',
      'coverage',
      '.expo',
      '.expo-shared',
      'android',
      'ios',
      '.vscode',
      'docs/',
      'cli/',
      'expo-env.d.ts',
    ],
  },

  // Custom rules
  {
    rules: {
      'max-params': ['error', 3],
      'max-lines-per-function': ['error', 70],
      'react/display-name': 'off',
      'react/no-inline-styles': 'off',
      'react/destructuring-assignment': 'off',
      'react/require-default-props': 'off',
      'unicorn/filename-case': [
        'error',
        {
          case: 'kebabCase',
          ignore: ['/android', '/ios'],
        },
      ],
      'import/no-cycle': ['error', { maxDepth: '∞' }],
      'ts/consistent-type-imports': [
        'warn',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
          disallowTypeAnnotations: true,
        },
      ],
    },
  },

  // TailwindCSS plugin
  ...tailwind.configs['flat/recommended'].map(config => ({
    ...config,
    rules: {
      ...config.rules,
      'tailwindcss/classnames-order': ['warn', { officialSorting: true }],
      'tailwindcss/no-custom-classname': 'off',
    },
  })),

  // React Compiler plugin
  {
    plugins: {
      'react-compiler': reactCompiler,
    },
    rules: {
      'react-compiler/react-compiler': 'error',
    },
  },

  // i18n JSON validation
  {
    files: ['src/translations/*.json'],
    plugins: { 'i18n-json': i18nJsonPlugin },
    processor: {
      meta: { name: '.json' },
      ...i18nJsonPlugin.processors['.json'],
    },
    rules: {
      ...i18nJsonPlugin.configs.recommended.rules,
      'i18n-json/valid-message-syntax': [
        2,
        {
          syntax: path.resolve(
            __dirname,
            './scripts/i18next-syntax-validation.js'
          ),
        },
      ],
      'i18n-json/valid-json': 2,
      'i18n-json/sorted-keys': [2, { order: 'asc', indentSpaces: 2 }],
      'i18n-json/identical-keys': [
        2,
        { filePath: path.resolve(__dirname, './src/translations/en.json') },
      ],
    },
  },

  // Testing Library rules
  {
    files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
    plugins: { 'testing-library': testingLibrary },
    rules: {
      ...testingLibrary.configs.react.rules,
    },
  }
);
```

**Remarks:**
- antfu config auto-includes: import sorting, unused imports removal, TypeScript rules
- We keep project-specific plugins: i18n-json, tailwindcss, testing-library, react-compiler
- Stylistic rules are now handled by ESLint Stylistic instead of Prettier
- The config is more concise and maintainable

---

### 1.4 Remove Prettier Files

```bash
rm -f .prettierrc.js .prettierignore
```

**Remarks:**
- These files are no longer needed
- ESLint Stylistic handles all formatting now

---

### 1.5 Update package.json Scripts

Update the scripts in `package.json`:

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "type-check": "tsc --noemit",
    "lint:translations": "eslint ./src/translations/ --fix --ext .json",
    "check-all": "pnpm run lint && pnpm run type-check && pnpm run lint:translations && pnpm run test"
  }
}
```

**Changes:**
- Removed `--ext .js,.jsx,.ts,.tsx` flag (not needed with flat config)
- Added `lint:fix` command for manual formatting
- Kept all other scripts the same

---

### 1.6 Update lint-staged Config

Update `package.json` lint-staged configuration:

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix"
    ],
    "*.json": [
      "eslint --fix"
    ]
  }
}
```

**Remarks:**
- Removed separate Prettier command
- All formatting is now done via `eslint --fix`
- Both code and JSON files are handled by ESLint

Ensure `.husky/pre-commit` looks like this:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm exec lint-staged
```

---

### 1.7 Test the Setup

```bash
# Run linting
pnpm lint

# Auto-fix all issues
pnpm lint:fix

# Type check
pnpm type-check

# Run all checks
pnpm check-all
```

**Expected Results:**
- ✅ No linting errors (after fix)
- ✅ Code is properly formatted
- ✅ Imports are sorted
- ✅ Unused imports removed

---

### 1.8 Restart VS Code

```bash
# Close VS Code, then reopen
# Or use Command Palette: "Developer: Reload Window"
```

**Remarks:**
- VS Code needs to reload ESLint extension
- Format-on-save should now work via ESLint
- Prettier should be completely disabled

---

## Verification Checklist

After completing the migration:

- [ ] `pnpm lint` runs without errors
- [ ] `pnpm lint:fix` auto-fixes formatting
- [ ] VS Code auto-fixes on save (Cmd+S / Ctrl+S)
- [ ] No Prettier warnings/errors in VS Code
- [ ] Pre-commit hooks work correctly
- [ ] Import sorting works
- [ ] Unused imports are removed
- [ ] TypeScript errors are caught
- [ ] Custom rules (max-params, filename-case) work

---

## Common Issues

### Issue 1: VS Code still using Prettier

**Solution:**
```json
// .vscode/settings.json
{
  "prettier.enable": false,
  "editor.formatOnSave": false,
  "editor.defaultFormatter": "dbaeumer.vscode-eslint"
}
```

### Issue 2: Auto-fix not working on save

**Solution:**
```json
// .vscode/settings.json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

### Issue 3: Import sorting conflicts

**Solution:**
- antfu includes import sorting by default
- Remove any custom import sorting plugins
- Use `// eslint-disable-next-line` if needed

### Issue 4: Too many errors after migration

**Solution:**
```bash
# Auto-fix most issues
pnpm lint:fix

# Commit the auto-fixed code
git add .
git commit -m "chore: migrate to @antfu/eslint-config"
```

---

## Customization

### Change Indentation

```javascript
// eslint.config.mjs
export default antfu({
  stylistic: {
    indent: 4, // or 'tab'
  },
});
```

### Change Quotes

```javascript
// eslint.config.mjs
export default antfu({
  stylistic: {
    quotes: 'double', // or 'single'
  },
});
```

### Disable Specific Rules

```javascript
// eslint.config.mjs
export default antfu(
  {
    // ... config
  },
  {
    rules: {
      'no-console': 'off',
      'unicorn/filename-case': 'off',
    },
  }
);
```

---

## Benefits You'll Notice

✅ **Faster Workflow** - One tool instead of two
✅ **Consistent Formatting** - No more Prettier vs ESLint conflicts
✅ **Better Imports** - Auto-sorted and organized
✅ **Cleaner Codebase** - Auto-removal of unused imports
✅ **TypeScript Integration** - Better type checking
✅ **Easier Maintenance** - Less configuration to manage

---

## Useful Links

- [@antfu/eslint-config GitHub](https://github.com/antfu/eslint-config)
- [@antfu/eslint-config npm](https://www.npmjs.com/package/@antfu/eslint-config)
- [ESLint Stylistic](https://eslint.style/)
- [Migration from Prettier](https://github.com/antfu/eslint-config#migrate-from-prettier)
- [ESLint Flat Config](https://eslint.org/docs/latest/use/configure/configuration-files-new)

---

## Next Steps

After completing this migration:

1. ✅ Commit your changes
2. ➡️ Move to next migration: `03-environment-variables.md` (easier) or `02-expo-sdk-54-upgrade.md` (bigger)
3. ✅ Notify your team about the new linting setup
4. ✅ Update team documentation/wiki

---

**Estimated Time:** 30-45 minutes
**Difficulty:** Medium
**Impact:** High (affects entire codebase)
