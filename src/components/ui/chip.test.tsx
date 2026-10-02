import * as React from 'react';

import { cleanup, render, screen, setup } from '@/lib/test-utils';

import { Chip, ChipRow } from './chip';

afterEach(cleanup);

describe('chip', () => {
  it('renders the label and a count badge', () => {
    render(<Chip testID="chip" label="Race day" count={3} />);
    expect(screen.getByText('Race day')).toBeOnTheScreen();
    expect(screen.getByTestId('chip-count')).toHaveTextContent('3');
    expect(screen.getByTestId('chip').props.accessibilityLabel).toBe('Race day, 3');
  });

  it('uses lilac when selected and white otherwise, with matching badges', () => {
    render(
      <>
        <Chip testID="on" label="A" count={1} selected />
        <Chip testID="off" label="B" count={1} />
      </>,
    );
    expect(screen.getByTestId('on').props.className).toContain('bg-primary-fixed');
    expect(screen.getByTestId('on').props.accessibilityState).toEqual({ selected: true });
    expect(screen.getByTestId('on-count').props.className).toContain('bg-white');
    expect(screen.getByTestId('off').props.className).toContain('bg-white');
    expect(screen.getByTestId('off-count').props.className).toContain('bg-secondary-container');
  });

  it('pads the 32pt chip to a 44pt hit target', () => {
    render(<Chip testID="chip" label="A" />);
    expect(screen.getByTestId('chip').props.hitSlop).toEqual({ top: 6, bottom: 6 });
  });
});

describe('chip row', () => {
  const items = [
    { key: 'story', label: 'Story' },
    { key: 'racing', label: 'Racing', count: 2 },
  ];

  it('marks the selected key and reports presses', async () => {
    const onSelect = jest.fn();
    const { user } = setup(<ChipRow testID="row" items={items} selectedKey="story" onSelect={onSelect} />);
    expect(screen.getByTestId('row-story').props.accessibilityState).toEqual({ selected: true });
    expect(screen.getByTestId('row-racing').props.accessibilityState).toEqual({ selected: false });
    await user.press(screen.getByTestId('row-racing'));
    expect(onSelect).toHaveBeenCalledWith('racing');
  });
});
