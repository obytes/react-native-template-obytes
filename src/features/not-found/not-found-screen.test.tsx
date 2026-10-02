import { fireEvent, render, screen } from '@testing-library/react-native';
import * as React from 'react';

import { NotFoundScreen } from '@/features/not-found/not-found-screen';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
  Stack: { Screen: () => null },
}));
jest.mock('@/components/ui/screen-layout', () => ({ useScreenTopPadding: () => 0 }));
jest.mock('@/components/ui', () => {
  const actual = jest.requireActual('@/components/ui');
  return { ...actual, FocusAwareStatusBar: () => null };
});

describe('notFoundScreen', () => {
  it('shows the bolted copy and routes home', () => {
    render(<NotFoundScreen />);
    expect(screen.getByText('This page has bolted')).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId('not-found-action'));
    expect(mockReplace).toHaveBeenCalledWith('/');
  });
});
