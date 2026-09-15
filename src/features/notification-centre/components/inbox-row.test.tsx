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
  it('renders title, body and relative time', () => {
    render(<InboxRow item={BASE} onPress={jest.fn()} />);
    expect(screen.getByText('Club update')).toBeOnTheScreen();
    expect(screen.getByText('Something happened at the club.')).toBeOnTheScreen();
    expect(screen.getByText('Just now')).toBeOnTheScreen();
  });

  it('shows the unread dot when unread', () => {
    render(<InboxRow item={BASE} onPress={jest.fn()} />);
    expect(screen.getByTestId('inbox-unread-dot')).toBeOnTheScreen();
  });

  it('does not show the unread dot when read', () => {
    render(<InboxRow item={{ ...BASE, unread: false }} onPress={jest.fn()} />);
    expect(screen.queryByTestId('inbox-unread-dot')).not.toBeOnTheScreen();
  });

  it('renders an image when icon is horse and imageUrl is set', () => {
    render(<InboxRow item={{ ...BASE, icon: 'horse', imageUrl: 'https://example.com/horse.jpg' }} onPress={jest.fn()} />);
    expect(screen.getByTestId('inbox-row-item-1')).toBeOnTheScreen();
    const image = screen.UNSAFE_getByType('Image' as never);
    expect(image.props.source).toEqual({ uri: 'https://example.com/horse.jpg' });
  });

  it('renders the club monogram when icon is club', () => {
    render(<InboxRow item={BASE} onPress={jest.fn()} />);
    expect(screen.getByText('R')).toBeOnTheScreen();
  });

  it('calls onPress with the item when pressed', () => {
    const onPress = jest.fn();
    render(<InboxRow item={BASE} onPress={onPress} />);
    fireEvent.press(screen.getByTestId('inbox-row-item-1'));
    expect(onPress).toHaveBeenCalledWith(BASE);
  });
});
