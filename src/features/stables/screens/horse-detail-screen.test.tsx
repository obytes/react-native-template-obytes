import type { Entry, HorseDetail, HorseUpdate } from '@/features/stables/types';

import { act, fireEvent, render, screen } from '@testing-library/react-native';
import * as React from 'react';
import { Alert, Share } from 'react-native';

import HorseProfileScreen from '@/app/stables/[horse-id]';

const mockToggleFollow = jest.fn();
const mockRouter = { push: jest.fn(), back: jest.fn(), replace: jest.fn(), canGoBack: jest.fn(() => true) };

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ 'horse-id': 'horse-1' }),
  useRouter: () => mockRouter,
  Stack: { Screen: () => null },
}));

jest.mock('@/components/ui', () => {
  const actual = jest.requireActual('@/components/ui');
  return { ...actual, Image: 'Image', FocusAwareStatusBar: () => null };
});

jest.mock('@/components/ui/screen-layout', () => ({
  useScreenTopPadding: () => 0,
  useScreenBottomPadding: () => 0,
}));

jest.mock('@/features/stables/api/use-horse-follow', () => ({
  useFollowHorse: () => ({ toggleFollow: mockToggleFollow, pendingHorseId: null }),
}));

function baseHorse(overrides: Partial<HorseDetail> = {}): HorseDetail {
  return {
    id: 'horse-1',
    organizationId: 'org-1',
    slug: 'laska',
    name: 'Laska',
    status: 'IN_TRAINING',
    isFollowing: false,
    inviteOnly: false,
    bio: null,
    story: null,
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
    entries: [],
    ...overrides,
  };
}

function makeEntry({ id, status, daysFromNow, ...overrides }: Partial<Entry> & { id: string; status: Entry['status']; daysFromNow: number }): Entry {
  const postTime = new Date(Date.now() + daysFromNow * 24 * 3600 * 1000).toISOString();
  return {
    id,
    status,
    draw: null,
    weightLbs: null,
    finishingPosition: status === 'RAN' ? 3 : null,
    beatenLengths: null,
    ratingAchieved: null,
    timeformComment: null,
    performanceRating: null,
    starRating: null,
    createdAt: postTime,
    updatedAt: postTime,
    jockey: null,
    race: {
      id: `race-${id}`,
      name: null,
      postTime,
      raceType: 'Maiden',
      distanceFurlongs: 7,
      className: null,
      goingDescription: null,
      meeting: { id: 'm', date: postTime, course: { id: 'c', name: 'Leopardstown', country: 'IRE' } },
    },
    ...overrides,
  };
}

function update(id: string, updateType: HorseUpdate['updateType'], title: string): HorseUpdate {
  return { id, updateType, title, bodyText: `${title} body.`, publishedAt: '2026-07-10T12:00:00.000Z', circlePostId: null };
}

const mockUseHorse = jest.fn();
const mockUseHorseUpdates = jest.fn();

jest.mock('@/features/stables/api/use-horse', () => ({
  useHorse: (...args: unknown[]) => mockUseHorse(...args),
}));

jest.mock('@/features/stables/api/use-horse-updates', () => ({
  useHorseUpdates: (...args: unknown[]) => mockUseHorseUpdates(...args),
}));

function withHorse(horse: HorseDetail) {
  mockUseHorse.mockReturnValue({ data: horse, isLoading: false, isError: false, refetch: jest.fn(), isRefetching: false });
}

function layout(testID: string, y: number) {
  fireEvent(screen.getByTestId(testID), 'layout', { nativeEvent: { layout: { x: 0, y, width: 390, height: 300 } } });
}

function scrollTo(y: number, contentHeight = 3000) {
  fireEvent.scroll(screen.getByTestId('horse-detail-scroll'), {
    nativeEvent: {
      contentOffset: { x: 0, y },
      layoutMeasurement: { width: 390, height: 800 },
      contentSize: { width: 390, height: contentHeight },
    },
  });
}

describe('horseDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseHorseUpdates.mockReturnValue({ data: [] });
  });

  it('renders story, updates and wellbeing sections with matching chips', () => {
    withHorse(baseHorse({ story: 'A long and storied career on the flat.', pedigree: { sire: 'Galileo', dam: 'Urban Sea' } }));
    mockUseHorseUpdates.mockReturnValue({ data: [update('u1', 'wellbeing', 'Vet check — all clear'), update('u2', 'trainer', 'Strong gallop')] });

    render(<HorseProfileScreen />);

    expect(screen.getByText('Story & pedigree')).toBeOnTheScreen();
    expect(screen.getByText('A long and storied career on the flat.')).toBeOnTheScreen();
    expect(screen.getByText('Dam')).toBeOnTheScreen();
    expect(screen.getByTestId('updates-section')).toBeOnTheScreen();
    expect(screen.getByTestId('wellbeing-row-u1')).toBeOnTheScreen();
    expect(screen.getByTestId('horse-section-chips-story')).toBeOnTheScreen();
    expect(screen.getByTestId('horse-section-chips-updates')).toBeOnTheScreen();
    expect(screen.getByTestId('horse-section-chips-wellbeing')).toBeOnTheScreen();
    // No entries → no Racing section or chip.
    expect(screen.queryByTestId('horse-section-chips-racing')).toBeNull();
    expect(screen.queryByTestId('racing-section')).toBeNull();
  });

  it('falls back to bio for the story', () => {
    withHorse(baseHorse({ bio: 'Short bio.' }));
    render(<HorseProfileScreen />);
    expect(screen.getByText('Short bio.')).toBeOnTheScreen();
  });

  it('never crashes and omits sections and chips for an empty horse', () => {
    withHorse(baseHorse());

    render(<HorseProfileScreen />);

    expect(screen.getByText('Laska')).toBeOnTheScreen();
    expect(screen.queryByTestId('horse-section-chips')).toBeNull();
    expect(screen.queryByText('Story & pedigree')).toBeNull();
    expect(screen.queryByTestId('wellbeing-section')).toBeNull();
    // No photos → navy pattern fallback in the isolated photo view.
    expect(screen.getByTestId('horse-hero-photo')).toBeOnTheScreen();
    expect(screen.getByTestId('horse-hero-fallback')).toBeOnTheScreen();
    expect(screen.getByText('L')).toBeOnTheScreen();
  });

  it('shows page dots over the hero only with several photos', () => {
    withHorse(baseHorse({ photos: [{ url: 'https://cdn.test/a.jpg' }] }));
    const { rerender } = render(<HorseProfileScreen />);
    expect(screen.queryByTestId('horse-hero-dots')).toBeNull();

    withHorse(baseHorse({ photos: [{ url: 'https://cdn.test/a.jpg' }, { url: 'https://cdn.test/b.jpg' }] }));
    rerender(<HorseProfileScreen />);
    expect(screen.getByTestId('horse-hero-dots')).toBeOnTheScreen();
  });

  it('shows the trainer alone until S13-10 adds a location and profile line', () => {
    withHorse(baseHorse({ trainer: { id: 't', name: 'G. Byrne' } }));
    const { rerender } = render(<HorseProfileScreen />);
    expect(screen.getByText('G. Byrne')).toBeOnTheScreen();
    expect(screen.queryByTestId('horse-hero-profile-line')).toBeNull();

    withHorse(baseHorse({ trainer: { id: 't', name: 'G. Byrne', location: 'Kildare' }, profileLine: 'Bay filly, 3 years old' }));
    rerender(<HorseProfileScreen />);
    expect(screen.getByText('G. Byrne, Kildare')).toBeOnTheScreen();
    expect(screen.getByText('Bay filly, 3 years old')).toBeOnTheScreen();
  });

  it('renders racing with a declared next entry and results', () => {
    withHorse(baseHorse({
      entries: [
        makeEntry({ id: 'next', status: 'DECLARED', daysFromNow: 5 }),
        makeEntry({ id: 'r1', status: 'RAN', daysFromNow: -20, replayUrl: 'https://video.example/r1' }),
      ],
    }));

    render(<HorseProfileScreen />);

    expect(screen.getByTestId('racing-section')).toBeOnTheScreen();
    expect(screen.getByText('Next — Leopardstown, 7f mdn')).toBeOnTheScreen();
    expect(screen.getByTestId('next-entry-declared')).toBeOnTheScreen();
    expect(screen.getByText('Leopardstown, 7f mdn — 3rd')).toBeOnTheScreen();
    expect(screen.getByText('Watch Replay')).toBeOnTheScreen();
    // Hero swaps the status pill for the Declared pill.
    expect(screen.getByTestId('declared-pill')).toBeOnTheScreen();
    expect(screen.getByTestId('horse-section-chips-racing')).toBeOnTheScreen();
  });

  it('shows the status pill for a retired horse with no entries', () => {
    withHorse(baseHorse({ status: 'RETIRED' }));
    render(<HorseProfileScreen />);
    expect(screen.getByText('Retired')).toBeOnTheScreen();
    expect(screen.queryByTestId('declared-pill')).toBeNull();
  });
});

describe('horseDetailScreen section chips', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseHorseUpdates.mockReturnValue({ data: [] });
  });

  it('tracks the scroll position with the selected section chip and scrolls on tap', () => {
    jest.useFakeTimers();
    withHorse(baseHorse({
      story: 'Story.',
      entries: [makeEntry({ id: 'r1', status: 'RAN', daysFromNow: -20 })],
    }));
    mockUseHorseUpdates.mockReturnValue({ data: [update('u1', 'wellbeing', 'Vet check'), update('u2', 'trainer', 'Gallop')] });

    render(<HorseProfileScreen />);

    layout('section-story', 500);
    layout('section-racing', 1100);
    layout('section-updates', 1500);
    layout('section-wellbeing', 2200);

    expect(screen.getByTestId('horse-section-chips-story')).toBeSelected();

    scrollTo(900); // line = 900 + 240 → racing
    expect(screen.getByTestId('horse-section-chips-racing')).toBeSelected();

    scrollTo(1400);
    expect(screen.getByTestId('horse-section-chips-updates')).toBeSelected();

    scrollTo(2200, 3000); // bottom of content → last section
    expect(screen.getByTestId('horse-section-chips-wellbeing')).toBeSelected();

    fireEvent.press(screen.getByTestId('horse-section-chips-story'));
    expect(screen.getByTestId('horse-section-chips-story')).toBeSelected();
    // The animated scroll's intermediate events don't move the chip while locked.
    scrollTo(1400);
    expect(screen.getByTestId('horse-section-chips-story')).toBeSelected();
    act(() => {
      jest.advanceTimersByTime(700);
    });
    scrollTo(1400);
    expect(screen.getByTestId('horse-section-chips-updates')).toBeSelected();
    jest.useRealTimers();
  });
});

describe('horseDetailScreen hero and states', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseHorseUpdates.mockReturnValue({ data: [] });
  });

  it('shares the horse with the club link', () => {
    const shareSpy = jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction' });
    withHorse(baseHorse());

    render(<HorseProfileScreen />);
    fireEvent.press(screen.getByTestId('horse-hero-share'));

    expect(shareSpy).toHaveBeenCalledWith({ message: expect.stringContaining('https://rionna.com') });
    expect(shareSpy.mock.calls[0][0].message).toContain('Laska');
    shareSpy.mockRestore();
  });

  it('goes back from the hero', () => {
    withHorse(baseHorse());
    render(<HorseProfileScreen />);
    fireEvent.press(screen.getByTestId('horse-hero-back'));
    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('does not render horse content while the horse is loading', () => {
    mockUseHorse.mockReturnValue({ data: undefined, isLoading: true, isError: false });

    render(<HorseProfileScreen />);

    expect(screen.queryByText('Laska')).toBeNull();
  });

  it('shows an error state with retry', () => {
    const refetch = jest.fn();
    mockUseHorse.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch, isRefetching: false });

    render(<HorseProfileScreen />);
    fireEvent.press(screen.getByText('Try again'));

    expect(refetch).toHaveBeenCalled();
  });

  it('renders a Private tag and confirms before unfollowing an invite-only horse', () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    withHorse(baseHorse({ inviteOnly: true, isFollowing: true, name: 'Laska' }));

    render(<HorseProfileScreen />);

    expect(screen.getByText('Private')).toBeOnTheScreen();

    fireEvent.press(screen.getByLabelText('Unfollow horse'));

    expect(alertSpy).toHaveBeenCalledWith(
      'Leave Laska?',
      'You\'ll lose access to Laska. Only a club admin can add you back.',
      expect.any(Array),
    );
    expect(mockToggleFollow).not.toHaveBeenCalled();

    alertSpy.mockRestore();
  });

  it('follows directly for a regular horse', () => {
    withHorse(baseHorse({ inviteOnly: false }));

    render(<HorseProfileScreen />);

    expect(screen.queryByText('Private')).toBeNull();
    fireEvent.press(screen.getByLabelText('Follow horse'));
    expect(mockToggleFollow).toHaveBeenCalledWith({ horseId: 'horse-1', following: true });
  });
});
