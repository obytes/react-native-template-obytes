// src/lib/database/provider.test.tsx
import { render, screen, waitFor } from '@testing-library/react-native';
import * as React from 'react';
import { Text } from 'react-native';

import { DatabaseProvider, useDatabase } from './provider';

jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => ({})),
}));

jest.mock('drizzle-orm/expo-sqlite', () => ({
  drizzle: jest.fn(() => ({
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  })),
}));

jest.mock('drizzle-orm/expo-sqlite/migrator', () => ({
  migrate: jest.fn(),
}));

jest.mock('@/lib/database/migrations', () => ({
  runMigrations: jest.fn(() => Promise.resolve()),
}));

describe('databaseProvider', () => {
  it('renders children after DB initialization', async () => {
    render(
      <DatabaseProvider>
        <Text>child</Text>
      </DatabaseProvider>,
    );
    await waitFor(() => {
      expect(screen.getByText('child')).toBeTruthy();
    });
  });
});

describe('useDatabase', () => {
  it('throws when used outside DatabaseProvider', () => {
    const BrokenComponent = () => {
      useDatabase();
      return null;
    };
    expect(() => render(<BrokenComponent />)).toThrow(
      'useDatabase must be used inside DatabaseProvider',
    );
  });
});
