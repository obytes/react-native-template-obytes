import type { FeedChip } from '@/features/member-content/types';

import { fireEvent, render, screen } from '@testing-library/react-native';
import * as React from 'react';

import { FeedChipRow } from '@/features/member-content/components/feed-chip-row';

const CHIPS: FeedChip[] = [
  { id: 'all', label: 'All', kind: 'all', spaceIds: [] },
  { id: 'horses', label: 'Horses', kind: 'horses', spaceIds: ['sp1'] },
  { id: 'polls', label: 'Polls', kind: 'polls', spaceIds: [] },
];

describe('feedChipRow', () => {
  it('renders chips in order with the selected one styled', () => {
    render(<FeedChipRow chips={CHIPS} selectedId="horses" onSelect={jest.fn()} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons.map(button => button.props.children ?? null)).toBeDefined();
    expect(screen.getByText('All')).toBeOnTheScreen();
    expect(screen.getByText('Horses')).toBeOnTheScreen();
    expect(screen.getByText('Polls')).toBeOnTheScreen();

    const selected = screen.getByRole('button', { name: 'Horses' });
    expect(selected.props.accessibilityState).toEqual(expect.objectContaining({ selected: true }));

    const unselected = screen.getByRole('button', { name: 'All' });
    expect(unselected.props.accessibilityState).toEqual(expect.objectContaining({ selected: false }));
  });

  it('calls onSelect with the pressed chip id', () => {
    const onSelect = jest.fn();
    render(<FeedChipRow chips={CHIPS} selectedId="all" onSelect={onSelect} />);

    fireEvent.press(screen.getByRole('button', { name: 'Polls' }));
    expect(onSelect).toHaveBeenCalledWith('polls');
  });

  it('renders nothing when there are no chips', () => {
    render(<FeedChipRow chips={[]} selectedId="all" onSelect={jest.fn()} />);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });
});
