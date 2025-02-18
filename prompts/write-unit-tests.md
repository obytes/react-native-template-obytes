You are an expert in TypeScript, React Native, Expo, Testing with Jest and React Native testing library.

You are given a React Native component and you are tasked with writing unit tests for it.

## Steps

Follow the following steps one by one:

1. Component Analysis:
   Before writing tests, analyze your component by answering these questions:

   - What is the primary purpose of this component?
   - What props does it accept?
   - What user interactions does it handle?
   - What state management does it use?
   - What external dependencies does it have?

2. Extract and document all possible scenarios for testing while following the Testing Hierarchy:

   - Test basic rendering first
   - Test props and their effects
   - Test user interactions
   - Test state changes
   - Test error handling
   - Test edge cases

3. Write the unit tests while following the guidelines of React Native testing library and Jest and make sure:

   - Test file should be named like `component-name.test.tsx`
   - Use meaningful test descriptions
   - Keep tests focused and isolated
   - Use proper cleanup in afterEach/afterAll blocks
   - Add testID props for reliable element selection
   - Test both success and failure scenarios
   - Avoid testing implementation details
   - Avoid using multiple assertions within a waitFor callback
   - While mocking functions, make sure to mock the function with the correct type and arguments

4. Run the tests for the file with test coverage: `pnpm test <component-name> -- --coverage --coverageReporters="text"`

5. Check Tests Results and Coverage:

   - If the tests fail, analyze the issue and fix it.
   - If the test coverage lines for the component is low, analyze the code and add missed tests.

## Example

Here is an example of how a unit tests should look like:

```tsx
import React from 'react';

import { cleanup, screen, setup, waitFor } from '@/lib/test-utils';
afterEach(cleanup);

const onSubmitMock: jest.Mock<LoginFormProps['onSubmit']> = jest.fn();

describe('ComponentName', () => {
  // Setup section
  beforeAll(() => {
    // Global setup
  });

  beforeEach(() => {
    // Reset mocks and state
    jest.clearAllMocks();
  });

  // Test cases grouped by functionality
  describe('Rendering', () => {
    test('renders correctly with default props', async () => {
      setup(<ComponentName />);
      expect(await screen.findByTestId('component-name')).toBeOnTheScreen();
    });
    test('renders correctly with custom props', async () => {});
  });

  describe('Interactions', () => {
    test('handles user input correctly', async () => {
      const { user } = setup(<ComponentName />);
      const input = screen.getByTestId('input-id');
      await user.type(input, 'test');
      expect(input).toHaveValue('test');
    });
    test('triggers appropriate callbacks', async () => {});
  });

  describe('State Management', () => {
    test('updates state correctly', async () => {});
    test('handles side effects', async () => {});
  });
});
```

Refer to the official documentation of the React Native Testing Library and Jest for more information: https://callstack.github.io/react-native-testing-library/
