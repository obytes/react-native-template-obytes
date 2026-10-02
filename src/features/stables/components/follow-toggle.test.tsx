import * as React from 'react';
import { Alert } from 'react-native';

import { render, screen, setup } from '@/lib/test-utils';

import { FollowToggle } from './follow-toggle';

describe('followToggle', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('toggles unfollow directly when confirmBeforeUnfollow is not set (regression)', async () => {
    const onToggle = jest.fn();
    const alertSpy = jest.spyOn(Alert, 'alert');
    const { user } = setup(<FollowToggle isFollowing onToggle={onToggle} />);

    await user.press(screen.getByLabelText('Unfollow horse'));

    expect(onToggle).toHaveBeenCalledWith(false);
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it('toggles follow directly even when confirmBeforeUnfollow is set (only unfollow confirms)', async () => {
    const onToggle = jest.fn();
    const alertSpy = jest.spyOn(Alert, 'alert');
    const { user } = setup(
      <FollowToggle
        isFollowing={false}
        onToggle={onToggle}
        confirmBeforeUnfollow={{ horseName: 'Laska' }}
      />,
    );

    await user.press(screen.getByLabelText('Follow horse'));

    expect(onToggle).toHaveBeenCalledWith(true);
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it('shows a confirm alert instead of toggling when unfollowing with confirmBeforeUnfollow set', async () => {
    const onToggle = jest.fn();
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { user } = setup(
      <FollowToggle
        isFollowing
        onToggle={onToggle}
        confirmBeforeUnfollow={{ horseName: 'Laska' }}
      />,
    );

    await user.press(screen.getByLabelText('Unfollow horse'));

    expect(onToggle).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledTimes(1);
    expect(alertSpy).toHaveBeenCalledWith(
      'Leave Laska?',
      'You\'ll lose access to Laska. Only a club admin can add you back.',
      expect.any(Array),
    );
  });

  it('only calls onToggle(false) when the destructive Leave button is pressed, not Cancel', async () => {
    const onToggle = jest.fn();
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { user } = setup(
      <FollowToggle
        isFollowing
        onToggle={onToggle}
        confirmBeforeUnfollow={{ horseName: 'Laska' }}
      />,
    );

    await user.press(screen.getByLabelText('Unfollow horse'));

    const buttons = alertSpy.mock.calls[0]?.[2] ?? [];
    const cancelButton = buttons.find(b => b.text === 'Cancel');
    const leaveButton = buttons.find(b => b.text === 'Leave');

    expect(cancelButton?.style).toBe('cancel');
    expect(leaveButton?.style).toBe('destructive');

    cancelButton?.onPress?.();
    expect(onToggle).not.toHaveBeenCalled();

    leaveButton?.onPress?.();
    expect(onToggle).toHaveBeenCalledWith(false);
  });

  it('ignores presses while the mutation is pending', async () => {
    const onToggle = jest.fn();
    const { user } = setup(<FollowToggle isFollowing={false} pending onToggle={onToggle} />);

    await user.press(screen.getByLabelText('Follow horse'));

    expect(onToggle).not.toHaveBeenCalled();
  });

  it('renders Follow / Following labels', () => {
    const { rerender } = render(<FollowToggle isFollowing={false} onToggle={jest.fn()} />);
    expect(screen.getByText('Follow')).toBeOnTheScreen();
    rerender(<FollowToggle isFollowing tone="hero" onToggle={jest.fn()} />);
    expect(screen.getByText('Following')).toBeOnTheScreen();
  });
});
