import type { InboxItem } from '@/features/notification-centre/types';

import { fireEvent, render, screen } from '@testing-library/react-native';
import * as React from 'react';

import { InboxRow } from '@/features/notification-centre/components/inbox-row';

jest.mock('@/components/ui', () => {
  const actual = jest.requireActual('@/components/ui');
  return { ...actual, Image: 'Image' };
});

const BASE: InboxItem = {
  id: 'item-1',
  kind: 'news',
  icon: 'club',
  title: 'Club update',
  body: 'Something happened at the club.',
  imageUrl: null,
  actorAvatarUrl: null,
  data: { screen: 'insideTrack' },
  unread: true,
  updatedAt: new Date().toISOString(),
};

describe('inboxRow', () => {
  it('renders the title, relative time and category tag', () => {
    render(<InboxRow item={BASE} onPress={jest.fn()} />);
    expect(screen.getByText('Club update')).toBeOnTheScreen();
    expect(screen.getByText('Just now')).toBeOnTheScreen();
    expect(screen.getByText('Club')).toBeOnTheScreen();
  });

  it('tags race kinds as Racing', () => {
    render(<InboxRow item={{ ...BASE, kind: 'race_declared' }} onPress={jest.fn()} />);
    expect(screen.getByText('Racing')).toBeOnTheScreen();
  });

  it('uses SemiBold title when unread and regular when read', () => {
    const { rerender } = render(<InboxRow item={BASE} onPress={jest.fn()} />);
    expect(screen.getByText('Club update').props.className).toContain('font-sans-semibold');
    rerender(<InboxRow item={{ ...BASE, unread: false }} onPress={jest.fn()} />);
    expect(screen.getByText('Club update').props.className).not.toContain('font-sans-semibold');
  });

  it('shows the unread dot when unread', () => {
    render(<InboxRow item={BASE} onPress={jest.fn()} />);
    expect(screen.getByTestId('inbox-unread-dot')).toBeOnTheScreen();
  });

  it('does not show the unread dot when read', () => {
    render(<InboxRow item={{ ...BASE, unread: false }} onPress={jest.fn()} />);
    expect(screen.queryByTestId('inbox-unread-dot')).not.toBeOnTheScreen();
  });

  it('renders the right-hand image when imageUrl is set', () => {
    render(<InboxRow item={{ ...BASE, imageUrl: 'https://example.com/horse.jpg' }} onPress={jest.fn()} />);
    const image = screen.UNSAFE_getByType('Image' as never);
    expect(image.props.source).toEqual({ uri: 'https://example.com/horse.jpg' });
  });

  it('goes full width with no image, and ignores the actor avatar', () => {
    render(<InboxRow item={{ ...BASE, icon: 'actor', actorAvatarUrl: 'https://example.com/a.jpg' }} onPress={jest.fn()} />);
    expect(screen.queryByTestId('inbox-image-item-1')).toBeNull();
    expect(screen.UNSAFE_queryByType('Image' as never)).toBeNull();
  });

  it('calls onPress with the item when pressed', () => {
    const onPress = jest.fn();
    render(<InboxRow item={BASE} onPress={onPress} />);
    fireEvent.press(screen.getByTestId('inbox-row-item-1'));
    expect(onPress).toHaveBeenCalledWith(BASE);
  });
});
