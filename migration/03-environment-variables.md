# Environment Variables - Simplification

## Overview

Simplify environment variable management by:
- Using a **single `.env` file** instead of multiple environment files
- Adopting **Expo's `EXPO_PUBLIC_*` prefix** convention
- **Keeping and simplifying `env.js`** for validation
- Managing multiple environments through **EAS Secrets** or **CI/CD**

## Current Setup

- Multiple env files: `.env.development`, `.env.staging`, `.env.production`
- Custom `env.js` with Zod validation
- Custom naming without EXPO_PUBLIC_ prefix
- `cross-env APP_ENV=...` for environment switching
- Complex environment loading logic

## Benefits

✅ **Simpler** - One .env file instead of three
✅ **Standard** - Uses Expo's official convention
✅ **Clearer** - EXPO_PUBLIC_* prefix shows what's exposed to client
✅ **Safer** - Build-time secrets stay secret
✅ **Flexible** - Still supports multiple environments via EAS/CI

---

## Step-by-Step Instructions

### 3.1 Create Single .env File

Create `.env` in project root:

```bash
# App Configuration (client-accessible with EXPO_PUBLIC_ prefix)
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_API_URL=https://api.staging.obytes.com
EXPO_PUBLIC_VAR_NUMBER=42
EXPO_PUBLIC_VAR_BOOL=true

# Build-time only (no EXPO_PUBLIC_ prefix - NOT accessible in client code)
SECRET_KEY=your-secret-key
```

**Remarks:**
- Variables with `EXPO_PUBLIC_` prefix are accessible in client code via `process.env`
- Variables without the prefix are only available at build time (`app.config.ts`)
- Never commit this file (it's in `.gitignore`)

---

### 3.2 Update .gitignore

Ensure `.env` files are ignored:

```bash
# Environment
.env
.env.local
.env*.local

# Keep example file
!.env.example
```

**Remarks:**
- `.env` contains sensitive data and should never be committed
- `.env.example` is committed as a reference for the team

---

### 3.3 Create .env.example

Create `.env.example` for team reference:

```bash
# Example environment variables - copy this to .env and fill in real values

# App Configuration
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_API_URL=https://api.example.com
EXPO_PUBLIC_VAR_NUMBER=42
EXPO_PUBLIC_VAR_BOOL=true

# Build-time only
SECRET_KEY=your-secret-key-here
```

**Remarks:**
- This file shows team members what variables are needed
- Commit this file to the repository
- Don't include real/sensitive values here

---

### 3.4 Simplify env.js

Update `env.js` to work with Expo's default loading:

```javascript
/* eslint-env node */
const z = require('zod');
const packageJSON = require('./package.json');

/**
 * Simplified env.js that works with Expo's default .env loading
 * Client variables use EXPO_PUBLIC_* prefix and are automatically available
 */

// Static app configuration
const BUNDLE_ID = 'com.obytes';
const PACKAGE = 'com.obytes';
const NAME = 'ObytesApp';
const EXPO_ACCOUNT_OWNER = 'obytes';
const EAS_PROJECT_ID = 'c3e1075b-6fe7-4686-aa49-35b46a229044';
const SCHEME = 'obytesApp';

const APP_ENV = process.env.EXPO_PUBLIC_APP_ENV ?? 'development';

function withEnvSuffix(name) {
  return APP_ENV === 'production' ? name : `${name}.${APP_ENV}`;
}

// Client env schema (EXPO_PUBLIC_* variables)
const client = z.object({
  EXPO_PUBLIC_APP_ENV: z.enum(['development', 'staging', 'production']),
  EXPO_PUBLIC_API_URL: z.string().url(),
  EXPO_PUBLIC_VAR_NUMBER: z.string().transform(Number),
  EXPO_PUBLIC_VAR_BOOL: z.string().transform(val => val === 'true'),
});

// Build-time env schema
const buildTime = z.object({
  SECRET_KEY: z.string().min(1),
});

// Parse and validate
const _clientEnv = {
  EXPO_PUBLIC_APP_ENV: APP_ENV,
  EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
  EXPO_PUBLIC_VAR_NUMBER: process.env.EXPO_PUBLIC_VAR_NUMBER,
  EXPO_PUBLIC_VAR_BOOL: process.env.EXPO_PUBLIC_VAR_BOOL,
};

const _buildTimeEnv = {
  SECRET_KEY: process.env.SECRET_KEY,
};

const _env = {
  ..._clientEnv,
  ..._buildTimeEnv,
};

const merged = buildTime.merge(client);
const parsed = merged.safeParse(_env);

if (parsed.success === false) {
  console.error(
    '❌ Invalid environment variables:',
    parsed.error.flatten().fieldErrors,
    '\n❌ Missing variables in .env file. Make sure all required variables are defined.',
    '\n💡 Tip: Check .env.example for reference.'
  );
  throw new Error('Invalid environment variables');
}

// For app.config.ts
const Env = {
  ...parsed.data,
  // Static values with environment suffix
  BUNDLE_ID: withEnvSuffix(BUNDLE_ID),
  PACKAGE: withEnvSuffix(PACKAGE),
  NAME,
  SCHEME,
  EXPO_ACCOUNT_OWNER,
  EAS_PROJECT_ID,
  VERSION: packageJSON.version,
};

// For client-side usage (via process.env.EXPO_PUBLIC_*)
const ClientEnv = client.parse(_clientEnv);

module.exports = {
  Env,
  ClientEnv,
  withEnvSuffix,
};
```

**Remarks:**
- Simplified to work with Expo's default .env loading
- Still provides Zod validation for type safety
- No more custom dotenv loading with APP_ENV switching
- EXPO_PUBLIC_* variables are automatically available

---

### 3.5 Update Client-Side Usage

#### Option A: Direct Process.env Usage

```typescript
// Before (using @env)
import { API_URL } from '@env';

// After (using process.env.EXPO_PUBLIC_*)
const apiUrl = process.env.EXPO_PUBLIC_API_URL;
const isProduction = process.env.EXPO_PUBLIC_APP_ENV === 'production';
```

**OR**

#### Option B: Create Typed Helper (Recommended)

Create `src/lib/env.ts`:

```typescript
// Type-safe access to environment variables
export const Env = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL as string,
  appEnv: process.env.EXPO_PUBLIC_APP_ENV as 'development' | 'staging' | 'production',
  varNumber: Number(process.env.EXPO_PUBLIC_VAR_NUMBER),
  varBool: process.env.EXPO_PUBLIC_VAR_BOOL === 'true',
} as const;

// Helper functions
export const isDevelopment = Env.appEnv === 'development';
export const isStaging = Env.appEnv === 'staging';
export const isProduction = Env.appEnv === 'production';
```

Usage:

```typescript
import { Env, isProduction } from '@/lib/env';

console.log(Env.apiUrl);
console.log(isProduction);
```

**Remarks:**
- Option B provides better type safety
- Centralized env access makes refactoring easier
- Consider adding runtime validation if needed

---

### 3.6 Remove Old Environment Files

```bash
# Remove old env files
rm -f .env.development .env.staging .env.production
```

**Remarks:**
- These are no longer needed
- Single `.env` file handles all cases now

---

### 3.7 Update package.json Scripts

Simplify scripts by removing environment-specific commands:

```json
{
  "scripts": {
    "start": "expo start",
    "prebuild": "expo prebuild",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "web": "expo start --web"

    // Remove these:
    // "start:staging": "cross-env APP_ENV=staging pnpm run start",
    // "start:production": "cross-env APP_ENV=production pnpm run start",
    // etc.
  }
}
```

**Remarks:**
- Remove all `cross-env EXPO_NO_DOTENV=1` flags
- Remove all `cross-env APP_ENV=...` patterns
- Keep only the basic commands
- Environment switching now happens via EAS or CI/CD

---

### 3.8 Update babel.config.js

Remove `@env` alias since we use `process.env` directly:

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            // Removed: '@env': './src/lib/env.js',
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
- No more custom `@env` alias needed
- Use standard `process.env.EXPO_PUBLIC_*` instead

---

### 3.9 Update tsconfig.json (Optional)

If you had TypeScript types for `@env`, remove them:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
      // Removed: "@env": ["./src/lib/env.js"]
    }
  }
}
```

---

## Managing Multiple Environments

### For Local Development

**Option 1: Use single .env and change values**
```bash
# Switch to production locally
# Edit .env and change EXPO_PUBLIC_APP_ENV=production
```

**Option 2: Use .env.local to override**
```bash
# Create .env.local (gitignored)
EXPO_PUBLIC_APP_ENV=staging
EXPO_PUBLIC_API_URL=https://api.staging.obytes.com

# .env.local overrides .env
```

---

### For CI/CD (GitHub Actions)

Set environment variables in workflow files:

```yaml
# .github/workflows/build-staging.yml
name: Build Staging

on:
  push:
    branches: [staging]

jobs:
  build:
    runs-on: ubuntu-latest
    env:
      EXPO_PUBLIC_APP_ENV: staging
      EXPO_PUBLIC_API_URL: https://api.staging.obytes.com
      SECRET_KEY: ${{ secrets.STAGING_SECRET_KEY }}
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install
      - run: pnpm build:staging
```

---

### For EAS Builds

**Option 1: Use EAS Secrets (Recommended)**

```bash
# Create secrets for each environment
eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value https://api.production.com --type string
eas secret:create --scope project --name SECRET_KEY --value prod-secret --type string
```

**Option 2: Use eas.json env config**

Update `eas.json`:

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_APP_ENV": "production",
        "EXPO_PUBLIC_API_URL": "https://api.production.com"
      }
    },
    "staging": {
      "env": {
        "EXPO_PUBLIC_APP_ENV": "staging",
        "EXPO_PUBLIC_API_URL": "https://api.staging.com"
      }
    },
    "development": {
      "env": {
        "EXPO_PUBLIC_APP_ENV": "development",
        "EXPO_PUBLIC_API_URL": "https://api.dev.com"
      }
    }
  }
}
```

Then build with:

```bash
# Production build uses production env
eas build --profile production

# Staging build uses staging env
eas build --profile staging
```

**Remarks:**
- EAS Secrets are more secure (not in git)
- eas.json env is simpler but less secure
- Combine both: secrets for sensitive data, eas.json for non-sensitive

---

## Verification Checklist

After completing the migration:

- [ ] `.env` file created and ignored by git
- [ ] `.env.example` created and committed
- [ ] `env.js` updated and working
- [ ] All client code uses `process.env.EXPO_PUBLIC_*`
- [ ] `@env` imports removed/replaced
- [ ] babel.config.js updated
- [ ] package.json scripts simplified
- [ ] App starts successfully
- [ ] Env variables are accessible in app
- [ ] Build-time secrets stay secret (not in bundle)
- [ ] TypeScript errors resolved

---

## Common Issues

### Issue 1: Env variables are undefined

**Solution:**
```bash
# Ensure .env file exists and has values
cat .env

# Restart Metro bundler
expo start -c
```

### Issue 2: Old @env imports cause errors

**Solution:**
```bash
# Find all @env imports
grep -r "from '@env'" src/

# Replace with process.env.EXPO_PUBLIC_*
```

### Issue 3: Variables not updating

**Solution:**
```bash
# Clear Metro cache
rm -rf $TMPDIR/metro-*
expo start -c
```

### Issue 4: TypeScript errors with process.env

**Solution:**
```typescript
// Add type assertion
const apiUrl = process.env.EXPO_PUBLIC_API_URL as string;

// Or create typed helper (recommended)
// See section 3.5 Option B
```

---

## Security Best Practices

✅ **DO:**
- Use `EXPO_PUBLIC_*` only for non-sensitive data
- Keep API keys, secrets in build-time variables (no prefix)
- Use EAS Secrets for production secrets
- Add `.env` to `.gitignore`
- Create `.env.example` for team reference

❌ **DON'T:**
- Commit `.env` to git
- Put sensitive keys in `EXPO_PUBLIC_*` variables
- Hardcode secrets in source code
- Share `.env` files via Slack/email

---

## Testing

Test that env variables work correctly:

```typescript
// Add temporary logging
console.log('API URL:', process.env.EXPO_PUBLIC_API_URL);
console.log('App Env:', process.env.EXPO_PUBLIC_APP_ENV);
console.log('Is Production:', process.env.EXPO_PUBLIC_APP_ENV === 'production');

// Should show values, not undefined
```

**Expected output:**
```
API URL: https://api.staging.obytes.com
App Env: development
Is Production: false
```

---

## Useful Links

- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
- [EAS Secrets](https://docs.expo.dev/build-reference/variables/#using-secrets-in-environment-variables)
- [Expo Config with Env Variables](https://docs.expo.dev/workflow/configuration/)
- [Zod Validation](https://zod.dev/)

---

## Next Steps

After completing this migration:

1. ✅ Test env variables in development
2. ✅ Test env variables in EAS builds
3. ✅ Update team documentation
4. ➡️ Continue to `04-dependency-updates.md`

---

**Estimated Time:** 30 minutes
**Difficulty:** Easy
**Impact:** Medium (changes env access pattern)
