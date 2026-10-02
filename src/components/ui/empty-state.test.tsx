import * as React from 'react';

import { cleanup, render, screen, setup } from '@/lib/test-utils';

import { EmptyState, ErrorState } from './empty-state';

afterEach(cleanup);

describe('empty state', () => {
  it('renders kicker, title and body', () => {
    render(<EmptyState kicker="My horses" title="No horses yet" body="Follow one from Stables." />);
    expect(screen.getByText('My horses')).toBeOnTheScreen();
    expect(screen.getByText('No horses yet')).toBeOnTheScreen();
    expect(screen.getByText('Follow one from Stables.')).toBeOnTheScreen();
  });

  it('renders the action when it has a handler', async () => {
    const onAction = jest.fn();
    const { user } = setup(<EmptyState testID="es" title="Empty" actionLabel="Browse" onAction={onAction} />);
    await user.press(screen.getByTestId('es-action'));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('omits the action without a handler', () => {
    render(<EmptyState testID="es" title="Empty" actionLabel="Browse" />);
    expect(screen.queryByTestId('es-action')).toBeNull();
  });
});

describe('error state', () => {
  it('defaults the copy and wires retry', async () => {
    const onRetry = jest.fn();
    const { user } = setup(<ErrorState testID="err" onRetry={onRetry} />);
    expect(screen.getByText('Something went wrong')).toBeOnTheScreen();
    expect(screen.getByText('Try again')).toBeOnTheScreen();
    await user.press(screen.getByTestId('err-action'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
