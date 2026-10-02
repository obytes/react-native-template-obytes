import * as React from 'react';
import { Switch } from 'react-native';

import { cleanup, render, screen, setup } from '@/lib/test-utils';

import { ListRow } from './list-row';

afterEach(cleanup);

describe('list row', () => {
  it('renders label, value and a divider', () => {
    render(<ListRow testID="row" label="Sire" value="Sea The Stars" />);
    expect(screen.getByText('Sire')).toBeOnTheScreen();
    expect(screen.getByText('Sea The Stars')).toBeOnTheScreen();
    expect(screen.getByTestId('row').props.className).toContain('border-outline-variant');
  });

  it('drops the divider on the last row', () => {
    render(<ListRow testID="row" label="Dam" divider={false} />);
    expect(screen.getByTestId('row').props.className).not.toContain('border-b');
  });

  it('is a pressable button with a chevron when onPress is set', async () => {
    const onPress = jest.fn();
    const { user } = setup(<ListRow testID="row" label="Personal details" chevron onPress={onPress} />);
    const row = screen.getByTestId('row');
    expect(row.props.accessibilityRole).toBe('button');
    expect(screen.getByTestId('row-chevron')).toBeOnTheScreen();
    await user.press(row);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders an accessory in place of the value', () => {
    render(<ListRow label="Race alerts" value="ignored" accessory={<Switch testID="switch" value />} />);
    expect(screen.getByTestId('switch')).toBeOnTheScreen();
    expect(screen.queryByText('ignored')).toBeNull();
  });
});
