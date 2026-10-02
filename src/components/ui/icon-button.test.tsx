import * as React from 'react';
import { View } from 'react-native';

import { cleanup, render, screen, setup } from '@/lib/test-utils';

import { IconButton } from './icon-button';

afterEach(cleanup);

describe('icon button', () => {
  it.each([
    ['square', 'bg-primary'],
    ['square-accent', 'bg-primary-fixed'],
    ['circle', 'bg-ice-light'],
    ['circle-light', 'bg-surface'],
  ] as const)('renders the %s variant', (variant, cls) => {
    render(
      <IconButton testID="btn" variant={variant} accessibilityLabel="Wallet">
        <View />
      </IconButton>,
    );
    const btn = screen.getByTestId('btn');
    expect(btn.props.className).toContain(cls);
    expect(btn.props.accessibilityRole).toBe('button');
    expect(btn.props.accessibilityLabel).toBe('Wallet');
  });

  it('grows the 32pt circle to a 44pt hit target', () => {
    render(<IconButton testID="btn" variant="circle" accessibilityLabel="Play"><View /></IconButton>);
    expect(screen.getByTestId('btn').props.hitSlop).toEqual({ top: 6, bottom: 6, left: 6, right: 6 });
  });

  it('calls onPress, and not when disabled', async () => {
    const onPress = jest.fn();
    const { user } = setup(
      <>
        <IconButton testID="a" accessibilityLabel="A" onPress={onPress}><View /></IconButton>
        <IconButton testID="b" accessibilityLabel="B" onPress={onPress} disabled><View /></IconButton>
      </>,
    );
    await user.press(screen.getByTestId('a'));
    await user.press(screen.getByTestId('b'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
