import type { AuthUser } from '@/lib/auth/utils';

import { fireEvent, render, screen } from '@testing-library/react-native';
import * as React from 'react';

import { ComposePostScreen } from '@/features/community-posting/screens/compose-post-screen';

const mockReplace = jest.fn();
const mockPush = jest.fn();
let mockParams: { spaceId?: string } = {};

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => mockParams,
  useRouter: () => ({ replace: mockReplace, push: mockPush }),
}));

jest.mock('env', () => ({
  __esModule: true,
  default: { EXPO_PUBLIC_CLUB_ID: 'org-1' },
}));

const MEMBER: AuthUser = { id: 'member-1', email: 'jane@example.com', name: 'Jane Member' };
const mockUseAuthStoreUser = jest.fn(() => MEMBER);

jest.mock('@/features/auth/use-auth-store', () => ({
  useAuthStore: { use: { user: () => mockUseAuthStoreUser() } },
}));

const SPACES = [
  { id: 'space-1', name: 'Laska', emoji: '🐎', isHorse: true },
  { id: 'space-2', name: 'Club News', emoji: null, isHorse: false },
];

const mockRefetch = jest.fn();
const mockUsePostableSpaces = jest.fn((): {
  data: { ok: boolean; spaces: typeof SPACES } | undefined;
  refetch: typeof mockRefetch;
  isError: boolean;
  isPending: boolean;
  isSuccess: boolean;
} => ({
  data: { ok: true, spaces: SPACES },
  refetch: mockRefetch,
  isError: false,
  isPending: false,
  isSuccess: true,
}));

jest.mock('@/features/community-posting/api/use-postable-spaces', () => ({
  usePostableSpaces: () => mockUsePostableSpaces(),
}));

let mockFailure: string | null = null;
const mockCreate = jest.fn();
const mockUseCreatePost = jest.fn(() => ({ create: mockCreate, isPending: false, failure: mockFailure }));

jest.mock('@/features/community-posting/api/use-create-post', () => ({
  useCreatePost: () => mockUseCreatePost(),
}));

jest.mock('@/features/community-posting/lib/pick-image', () => ({
  pickImage: jest.fn(),
}));

const mockSetItem = jest.fn();
jest.mock('@/lib/storage', () => ({
  getItem: jest.fn(() => null),
  setItem: (...args: unknown[]) => mockSetItem(...args),
}));

jest.mock('@/components/ui', () => {
  const RN = jest.requireActual('react-native');
  return { Image: RN.Image, Pressable: RN.Pressable, Text: RN.Text, View: RN.View };
});

jest.mock('@/components/ui/modal', () => {
  const RN = jest.requireActual('react-native');
  return {
    Modal: ({ children }: { children: React.ReactNode }) => <RN.View>{children}</RN.View>,
    useModal: () => ({ ref: { current: null }, present: jest.fn(), dismiss: jest.fn() }),
  };
});

function typeEnoughBody() {
  fireEvent.changeText(screen.getByLabelText('Post body'), 'Ten characters plus');
}

describe('composePostScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParams = {};
    mockFailure = null;
    mockUseAuthStoreUser.mockReturnValue(MEMBER);
    mockUsePostableSpaces.mockReturnValue({ data: { ok: true, spaces: SPACES }, refetch: mockRefetch, isError: false, isPending: false, isSuccess: true });
    mockUseCreatePost.mockReturnValue({ create: mockCreate, isPending: false, failure: mockFailure });
  });

  it('disables Post until the title is set or the body has at least 10 characters', () => {
    render(<ComposePostScreen />);
    const submit = screen.getByTestId('compose-post-submit');
    expect(submit.props.accessibilityState).toEqual(expect.objectContaining({ disabled: true }));

    fireEvent.changeText(screen.getByLabelText('Post body'), 'short');
    expect(screen.getByTestId('compose-post-submit').props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true }),
    );

    typeEnoughBody();
    expect(screen.getByTestId('compose-post-submit').props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: false }),
    );
  });

  it('enables Post once a title is entered even with a short body', () => {
    render(<ComposePostScreen />);
    fireEvent.changeText(screen.getByLabelText('Post title'), 'A title');
    expect(screen.getByTestId('compose-post-submit').props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: false }),
    );
  });

  it('shows the blocked failure copy and keeps the typed text', async () => {
    mockFailure = 'blocked';
    mockUseCreatePost.mockReturnValue({ create: mockCreate, isPending: false, failure: 'blocked' });
    mockCreate.mockResolvedValue({ ok: false, reason: 'blocked' });

    render(<ComposePostScreen />);
    typeEnoughBody();
    fireEvent.press(screen.getByTestId('compose-post-submit'));
    await screen.findByText('Our auto-moderation held back this post. Please edit it to keep things friendly and respectful, then try again.');

    expect(screen.getByLabelText('Post body').props.value).toBe('Ten characters plus');
  });

  it('shows the rate-limited failure copy', async () => {
    mockUseCreatePost.mockReturnValue({ create: mockCreate, isPending: false, failure: 'rate_limited' });
    render(<ComposePostScreen />);
    expect(
      await screen.findByText('You\'ve posted a lot today — try again later.'),
    ).toBeOnTheScreen();
  });

  it('shows the not_allowed copy and refetches postable spaces', () => {
    mockUseCreatePost.mockReturnValue({ create: mockCreate, isPending: false, failure: 'not_allowed' });
    render(<ComposePostScreen />);
    expect(screen.getByText('You can\'t post in that space.')).toBeOnTheScreen();
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('shows the image_failed failure copy', () => {
    mockUseCreatePost.mockReturnValue({ create: mockCreate, isPending: false, failure: 'image_failed' });
    render(<ComposePostScreen />);
    expect(screen.getByText('That photo couldn\'t be uploaded.')).toBeOnTheScreen();
  });

  it.each(['network', 'circle_failed'])('shows the generic retry copy for %s', (failure) => {
    mockUseCreatePost.mockReturnValue({ create: mockCreate, isPending: false, failure });
    render(<ComposePostScreen />);
    expect(screen.getByText('Couldn\'t publish right now. Try again.')).toBeOnTheScreen();
  });

  it('navigates to the new post on success', async () => {
    mockCreate.mockResolvedValue({ ok: true, post: { circlePostId: 'post-9', spaceId: 'space-1' } });
    render(<ComposePostScreen />);
    typeEnoughBody();
    fireEvent.press(screen.getByTestId('compose-post-submit'));

    await screen.findByTestId('compose-post-submit');
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      spaceId: 'space-1',
      body: 'Ten characters plus',
    }));
    expect(mockReplace).toHaveBeenCalledWith('/post/space-1/post-9');
  });

  it('preselects the space passed as a search param', () => {
    mockParams = { spaceId: 'space-2' };
    render(<ComposePostScreen />);
    expect(screen.getByTestId('compose-post-space-trigger')).toHaveTextContent(/Club News/);
  });
});

describe('composePostScreen spaces status', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParams = {};
    mockFailure = null;
    mockUseAuthStoreUser.mockReturnValue(MEMBER);
    mockUsePostableSpaces.mockReturnValue({ data: { ok: true, spaces: SPACES }, refetch: mockRefetch, isError: false, isPending: false, isSuccess: true });
    mockUseCreatePost.mockReturnValue({ create: mockCreate, isPending: false, failure: mockFailure });
  });

  it('shows an empty-state message and no form when there are no postable spaces', () => {
    mockUsePostableSpaces.mockReturnValue({ data: { ok: true, spaces: [] }, refetch: mockRefetch, isError: false, isPending: false, isSuccess: true });
    render(<ComposePostScreen />);

    expect(screen.getByText('You can\'t post in any spaces yet.')).toBeOnTheScreen();
    expect(screen.queryByTestId('compose-post-space-trigger')).toBeNull();
    expect(screen.getByTestId('compose-post-submit').props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true }),
    );
  });

  it('shows a retry message and no form when the postable-spaces query errors', () => {
    mockUsePostableSpaces.mockReturnValue({ data: undefined, refetch: mockRefetch, isError: true, isPending: false, isSuccess: false });
    render(<ComposePostScreen />);

    expect(screen.getByText('Couldn\'t load your spaces. Pull to retry.')).toBeOnTheScreen();
    expect(screen.queryByTestId('compose-post-space-trigger')).toBeNull();

    fireEvent.press(screen.getByTestId('compose-post-spaces-retry'));
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('shows neither empty-state nor error copy while the postable-spaces query is still pending', () => {
    mockUsePostableSpaces.mockReturnValue({ data: undefined, refetch: mockRefetch, isError: false, isPending: true, isSuccess: false });
    render(<ComposePostScreen />);

    expect(screen.queryByText('You can\'t post in any spaces yet.')).toBeNull();
    expect(screen.queryByText('Couldn\'t load your spaces. Pull to retry.')).toBeNull();
    expect(screen.queryByTestId('compose-post-space-trigger')).toBeNull();
    expect(screen.getByTestId('compose-post-submit').props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true }),
    );
  });
});

describe('composePostScreen last-used space', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParams = {};
    mockFailure = null;
    mockUseAuthStoreUser.mockReturnValue(MEMBER);
    mockUsePostableSpaces.mockReturnValue({ data: { ok: true, spaces: SPACES }, refetch: mockRefetch, isError: false, isPending: false, isSuccess: true });
    mockUseCreatePost.mockReturnValue({ create: mockCreate, isPending: false, failure: mockFailure });
  });

  it('does not remember the space just from picking it', () => {
    render(<ComposePostScreen />);
    fireEvent.press(screen.getByTestId('compose-post-space-trigger'));
    fireEvent.press(screen.getByTestId('compose-post-space-space-2'));
    expect(mockSetItem).not.toHaveBeenCalled();
  });

  it('remembers the posted space only after a successful post', async () => {
    mockCreate.mockResolvedValue({ ok: true, post: { circlePostId: 'post-9', spaceId: 'space-1' } });
    render(<ComposePostScreen />);
    typeEnoughBody();
    fireEvent.press(screen.getByTestId('compose-post-submit'));

    await screen.findByTestId('compose-post-submit');
    expect(mockSetItem).toHaveBeenCalledWith('community-posting:last-space:member-1', 'space-1');
  });

  it('does not remember the space when the post is blocked', async () => {
    mockFailure = 'blocked';
    mockUseCreatePost.mockReturnValue({ create: mockCreate, isPending: false, failure: 'blocked' });
    mockCreate.mockResolvedValue({ ok: false, reason: 'blocked' });

    render(<ComposePostScreen />);
    typeEnoughBody();
    fireEvent.press(screen.getByTestId('compose-post-submit'));
    await screen.findByText('Our auto-moderation held back this post. Please edit it to keep things friendly and respectful, then try again.');

    expect(mockSetItem).not.toHaveBeenCalled();
  });
});
