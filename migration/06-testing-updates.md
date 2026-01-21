# Testing Updates

## Overview

Update testing infrastructure to work with Expo SDK 54 and ensure latest versions:
- **Jest** - Latest version compatible with SDK 54
- **jest-expo** - SDK 54 preset
- **Testing Library** - Latest React Native Testing Library
- **Maestro** - Latest CLI version (2.0.10+, requires Java 17)

## Current Setup

- Jest ^29.7.0
- jest-expo ~53.0.7
- @testing-library/react-native ^12.7.2
- Maestro CLI (installed via script)

## Benefits

✅ **Compatibility** - Works with Expo SDK 54
✅ **Bug Fixes** - Latest testing library fixes
✅ **Performance** - Maestro 2.0 with GraalJS (faster)
✅ **Features** - New testing capabilities

---

## Step-by-Step Instructions

### 6.1 Update Jest and Testing Libraries

```bash
# Update Jest ecosystem
pnpm update -D jest@latest jest-expo@~54.0.0

# Update Testing Library
pnpm update -D @testing-library/react-native@latest @testing-library/jest-dom@latest

# Update Jest utilities
pnpm update -D jest-environment-jsdom@latest jest-junit@latest ts-jest@latest
```

**Remarks:**
- `jest-expo@~54.0.0` is specifically for Expo SDK 54
- Use the tilde (~) to lock to SDK version
- Testing Library should remain compatible

---

### 6.2 Verify jest.config.js

Your current config should work, but verify it:

```javascript
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest-setup.ts'],
  testMatch: ['**/?(*.)+(spec|test).ts?(x)'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!**/coverage/**',
    '!**/node_modules/**',
    '!**/babel.config.js',
    '!**/jest.setup.js',
    '!**/docs/**',
    '!**/cli/**',
  ],
  moduleFileExtensions: ['js', 'ts', 'tsx'],
  transformIgnorePatterns: [
    `node_modules/(?!(?:.pnpm/)?((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|@sentry/.*|native-base|react-native-svg))`,
  ],
  coverageReporters: ['json-summary', ['text', { file: 'coverage.txt' }]],
  reporters: [
    'default',
    ['github-actions', { silent: false }],
    'summary',
    [
      'jest-junit',
      {
        outputDirectory: 'coverage',
        outputName: 'jest-junit.xml',
        ancestorSeparator: ' › ',
        uniqueOutputName: 'false',
        suiteNameTemplate: '{filepath}',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
      },
    ],
  ],
  coverageDirectory: '<rootDir>/coverage/',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

**Potential Updates:**

If tests fail after updates, you may need to add new packages to `transformIgnorePatterns`:

```javascript
transformIgnorePatterns: [
  `node_modules/(?!(?:.pnpm/)?((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|@sentry/.*|native-base|react-native-svg|uniwind))`,
  //                                                                                                                                                                                                                            ^^^^^^^^ Added uniwind
],
```

---

### 6.3 Verify jest-setup.ts

Check `jest-setup.ts` is still valid:

```typescript
import '@testing-library/jest-dom';
import '@testing-library/react-native/extend-expect';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  usePathname: () => '/',
}));

// Mock React Native modules if needed
// jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

// Silence warnings
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};
```

---

### 6.4 Update Maestro CLI

```bash
# Update Maestro to latest version
curl -Ls "https://get.maestro.mobile.dev" | bash

# Verify version (should be 2.0.10 or higher)
maestro --version
```

**Expected output:**
```
Maestro version 2.0.10
```

**Remarks:**
- Maestro CLI 2.0+ requires **Java 17 or higher**
- If you don't have Java 17, install it first

---

### 6.5 Install Java 17 (If Needed)

#### macOS

```bash
# Using Homebrew
brew install openjdk@17

# Set JAVA_HOME
echo 'export JAVA_HOME=$(/usr/libexec/java_home -v 17)' >> ~/.zshrc
source ~/.zshrc

# Verify
java -version
```

#### Linux

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install openjdk-17-jdk

# Verify
java -version
```

#### Windows

1. Download Java 17 from [Adoptium](https://adoptium.net/)
2. Run the installer
3. Add to PATH
4. Verify in PowerShell: `java -version`

---

### 6.6 Verify Maestro Flows

Test existing Maestro flows:

```bash
# Run all E2E tests
pnpm e2e-test

# Or run specific flow
maestro test .maestro/flow-name.yaml -e APP_ID=com.obytes.development
```

**Remarks:**
- Maestro 2.0 uses **GraalJS** instead of Rhino
- Expect **faster execution**
- JavaScript engine is more modern (ES6+ support)
- Review flows for any compatibility issues

---

### 6.7 Update Maestro Flows (If Needed)

If you have complex JavaScript in your flows, verify it works with GraalJS:

```yaml
# Example flow
appId: com.obytes.development
---
- launchApp

# Old Rhino syntax might need updates
- runScript: |
    // Modern JavaScript is now supported
    const data = [1, 2, 3].map(x => x * 2)
    output.value = data.join(',')

# Or use modern features
- runScript: |
    const result = await fetch('https://api.example.com/data')
    const json = await result.json()
    output.userId = json.id
```

---

### 6.8 Update package.json Scripts (If Needed)

Ensure test scripts are up to date:

```json
{
  "scripts": {
    "test": "jest",
    "test:ci": "jest --coverage",
    "test:watch": "jest --watch",
    "install-maestro": "curl -Ls 'https://get.maestro.mobile.dev' | bash",
    "e2e-test": "maestro test .maestro/ -e APP_ID=com.obytes.development"
  }
}
```

---

### 6.9 Update GitHub Actions Workflows (If Applicable)

If you have CI workflows, update them to use Node 20 and ensure Java 17:

**`.github/workflows/test.yml`:**

```yaml
name: Test

on:
  pull_request:
  push:
    branches:
      - main
      - master

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10

      - name: Install dependencies
        run: pnpm install

      - name: Run linting
        run: pnpm lint

      - name: Run type checking
        run: pnpm type-check

      - name: Run tests
        run: pnpm test:ci

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/coverage-final.json
          fail_ci_if_error: false
```

**For Maestro E2E tests:**

```yaml
name: E2E Tests

on:
  pull_request:
  push:
    branches:
      - main

jobs:
  e2e:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Java 17
        uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '17'

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10

      - name: Install dependencies
        run: pnpm install

      - name: Install Maestro
        run: curl -Ls "https://get.maestro.mobile.dev" | bash

      - name: Build app
        run: pnpm prebuild:development && pnpm ios --configuration Debug

      - name: Run Maestro tests
        run: pnpm e2e-test
```

**Remarks:**
- Update to Node 20 (LTS)
- Ensure Java 17 for Maestro
- Update action versions to latest

---

### 6.10 Run Test Suite

```bash
# Clear Jest cache
jest --clearCache

# Run all tests
pnpm test

# Run with coverage
pnpm test:ci

# Run in watch mode
pnpm test:watch
```

**Expected Results:**
- ✅ All tests pass
- ✅ No warnings
- ✅ Coverage reports generated

---

### 6.11 Update Test Utilities (If Needed)

If you have custom test utilities in `src/lib/test-utils.tsx`, ensure they work with latest Testing Library:

```typescript
import { render, RenderOptions } from '@testing-library/react-native'
import { ReactElement, ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create a test query client
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

// Wrapper with providers
function AllTheProviders({ children }: { children: ReactNode }) {
  const queryClient = createTestQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      {/* Add other providers here */}
      {children}
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything
export * from '@testing-library/react-native'
export { customRender as render }
```

---

## Verification Checklist

- [ ] Jest updated to latest
- [ ] jest-expo@~54.0.0 installed
- [ ] Testing Library updated
- [ ] jest.config.js verified
- [ ] jest-setup.ts verified
- [ ] All unit tests pass
- [ ] Coverage reports generate correctly
- [ ] Maestro CLI updated (2.0.10+)
- [ ] Java 17 installed
- [ ] Maestro flows run successfully
- [ ] E2E tests pass
- [ ] CI workflows updated (if applicable)
- [ ] No warnings in test output

---

## Common Issues

### Issue 1: Tests failing with "Cannot find module"

**Solution:**
```bash
# Clear Jest cache
jest --clearCache

# Reinstall
rm -rf node_modules
pnpm install

# Try again
pnpm test
```

### Issue 2: Transform errors with new packages

**Solution:**
```javascript
// Add problematic package to transformIgnorePatterns in jest.config.js
transformIgnorePatterns: [
  `node_modules/(?!....|uniwind|@tanstack))`,
  //                      ^^^^^^^ Add here
],
```

### Issue 3: Maestro not found after install

**Solution:**
```bash
# Check PATH
echo $PATH

# Reinstall Maestro
curl -Ls "https://get.maestro.mobile.dev" | bash

# Add to PATH if needed (macOS/Linux)
export PATH="$HOME/.maestro/bin:$PATH"

# Restart terminal and try again
maestro --version
```

### Issue 4: Maestro requires Java 17 error

**Solution:**
```bash
# Check Java version
java -version

# If < 17, install Java 17 (see section 6.5)
```

### Issue 5: Tests timeout

**Solution:**
```javascript
// Increase timeout in jest.config.js
module.exports = {
  // ... other config
  testTimeout: 10000, // 10 seconds instead of 5
};

// Or per test
test('slow test', async () => {
  // ...
}, 10000); // 10 second timeout
```

---

## Testing Best Practices

### Unit Tests

```typescript
import { render, screen, fireEvent } from '@/lib/test-utils'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeOnTheScreen()
  })

  it('handles press events', () => {
    const onPress = jest.fn()
    render(<Button onPress={onPress}>Click me</Button>)

    fireEvent.press(screen.getByText('Click me'))
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('shows loading state', () => {
    render(<Button loading>Click me</Button>)
    expect(screen.getByTestId('loading-indicator')).toBeOnTheScreen()
  })
})
```

### Integration Tests

```typescript
import { render, screen, waitFor } from '@/lib/test-utils'
import { LoginScreen } from '@/app/login'

describe('LoginScreen', () => {
  it('logs in successfully', async () => {
    render(<LoginScreen />)

    // Fill form
    fireEvent.changeText(screen.getByPlaceholderText('Email'), 'test@example.com')
    fireEvent.changeText(screen.getByPlaceholderText('Password'), 'password123')

    // Submit
    fireEvent.press(screen.getByText('Login'))

    // Wait for success
    await waitFor(() => {
      expect(screen.getByText('Welcome back!')).toBeOnTheScreen()
    })
  })
})
```

### E2E Tests (Maestro)

```yaml
appId: com.obytes.development
---
- launchApp
- assertVisible: Welcome

# Test login flow
- tapOn: Login
- inputText: Email
  text: test@example.com
- inputText: Password
  text: password123
- tapOn: Submit

# Verify success
- assertVisible: Dashboard
```

---

## Performance Testing

### Test Performance

```bash
# Run tests with timing
pnpm test --verbose

# Check slow tests
pnpm test --listTests
```

### Maestro Performance

**Maestro 2.0 improvements:**
- Faster JavaScript execution (GraalJS)
- Better resource management
- Improved stability

**You should notice:**
- Faster flow execution
- More reliable tests
- Better error messages

---

## Useful Links

### Jest
- [Jest Documentation](https://jestjs.io/)
- [Jest Expo Documentation](https://docs.expo.dev/develop/unit-testing/)
- [jest-expo npm](https://www.npmjs.com/package/jest-expo)

### Testing Library
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Testing Library Docs](https://testing-library.com/)
- [Common Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

### Maestro
- [Maestro Documentation](https://maestro.mobile.dev/)
- [Maestro GitHub](https://github.com/mobile-dev-inc/Maestro)
- [Maestro Releases](https://github.com/mobile-dev-inc/maestro/releases)
- [Maestro 2.0 Announcement](https://maestro.mobile.dev/blog)

---

## Next Steps

After completing testing updates:

1. ✅ Verify all tests pass
2. ✅ Run E2E tests locally
3. ✅ Commit changes
4. ➡️ Continue to `07-verification.md` for comprehensive testing

---

**Estimated Time:** 20-30 minutes
**Difficulty:** Low
**Impact:** Low (mostly version updates)
