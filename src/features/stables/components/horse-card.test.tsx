import type { Entry, Horse } from '@/features/stables/types';

import * as React from 'react';
import { Alert } from 'react-native';

import { fireEvent, render, screen } from '@/lib/test-utils';

import { HorseCard } from './horse-card';

jest.mock('@/components/ui', () => {
  const actual = jest.requireActual('@/components/ui');
  return { ...actual, Image: 'Image' };
});

function makeHorse(overrides: Partial<Horse> = {}): Horse {
  return {
    id: 'horse-1',
    organizationId: 'org-1',
    slug: 'laska',
    name: 'Laska',
    status: 'IN_TRAINING',
    isFollowing: false,
    inviteOnly: false,
    bio: null,
    trainerNotes: null,
    photos: [],
    pedigree: null,
    ownershipBlurb: null,
    circleSpaceId: null,
    trainerId: null,
    trainer: null,
    sortOrder: 0,
    publishedAt: '2026-01-01T00:00:00.000Z',
    latestEntryId: null,
    nextEntryId: null,
    providerEntityId: null,
    providerLastSync: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function declaredEntry(): Entry {
  const postTime = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
  return {
    id: 'e1',
    status: 'DECLARED',
    draw: null,
    weightLbs: null,
    finishingPosition: null,
    beatenLengths: null,
    ratingAchieved: null,
    timeformComment: null,
    performanceRating: null,
    starRating: null,
    createdAt: postTime,
    updatedAt: postTime,
    jockey: null,
    race: {
      id: 'r1',
      name: null,
      postTime,
      raceType: null,
      distanceFurlongs: 7,
      className: null,
      goingDescription: null,
      meeting: { id: 'm1', date: postTime, course: { id: 'c1', name: 'Leopardstown', country: 'IRE' } },
    },
  };
}

describe('horseCard', () => {
  it('renders name, trainer, status pill and Follow', () => {
    render(
      <HorseCard
        horse={makeHorse({ trainer: { id: 't', name: 'G. Byrne' } })}
        onPress={jest.fn()}
        onToggleFollow={jest.fn()}
      />,
    );
    expect(screen.getByText('Laska')).toBeOnTheScreen();
    expect(screen.getByText('G. Byrne')).toBeOnTheScreen();
    expect(screen.getByText('In Training')).toBeOnTheScreen();
    expect(screen.getByText('Follow')).toBeOnTheScreen();
    expect(screen.queryByTestId('declared-pill')).toBeNull();
  });

  it('hides the profile line until S13-10 fields arrive, then shows it', () => {
    const { rerender } = render(<HorseCard horse={makeHorse()} onPress={jest.fn()} />);
    expect(screen.queryByTestId('horse-card-profile-line')).toBeNull();

    rerender(<HorseCard horse={makeHorse({ profileLine: 'Bay filly, 3 years old' })} onPress={jest.fn()} />);
    expect(screen.getByText('Bay filly, 3 years old')).toBeOnTheScreen();
  });

  it('swaps the status pill for a Declared pill when the next entry is declared', () => {
    render(<HorseCard horse={makeHorse({ entries: [declaredEntry()] })} onPress={jest.fn()} onToggleFollow={jest.fn()} />);
    expect(screen.getByTestId('declared-pill')).toBeOnTheScreen();
    expect(screen.queryByText('In Training')).toBeNull();
  });

  it('renders a Private tag when the horse is invite-only', () => {
    render(<HorseCard horse={makeHorse({ inviteOnly: true })} onPress={jest.fn()} />);
    expect(screen.getByText('Private')).toBeOnTheScreen();
  });

  it('does not render a Private tag for a regular horse', () => {
    render(<HorseCard horse={makeHorse({ inviteOnly: false })} onPress={jest.fn()} />);
    expect(screen.queryByText('Private')).not.toBeOnTheScreen();
  });

  it('follows with the horse id', () => {
    const onToggleFollow = jest.fn();
    render(<HorseCard horse={makeHorse()} onPress={jest.fn()} onToggleFollow={onToggleFollow} />);
    fireEvent.press(screen.getByLabelText('Follow horse'));
    expect(onToggleFollow).toHaveBeenCalledWith('horse-1', true);
  });

  it('confirms before unfollowing an invite-only horse', () => {
    const onToggleFollow = jest.fn();
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    render(
      <HorseCard
        horse={makeHorse({ inviteOnly: true, isFollowing: true, name: 'Laska' })}
        onPress={jest.fn()}
        onToggleFollow={onToggleFollow}
      />,
    );

    fireEvent.press(screen.getByLabelText('Unfollow horse'));

    expect(alertSpy).toHaveBeenCalledWith(
      'Leave Laska?',
      'You\'ll lose access to Laska. Only a club admin can add you back.',
      expect.any(Array),
    );
    expect(onToggleFollow).not.toHaveBeenCalled();

    alertSpy.mockRestore();
  });
});
