import * as React from 'react';
import { Alert } from 'react-native';

import { Button } from '@/components/ui';
import { tx } from '@/features/stables/lib/tx';

import { translate } from '@/lib/i18n';

type FollowToggleProps = {
  isFollowing: boolean;
  pending?: boolean;
  onToggle: (following: boolean) => void;
  /**
   * `card` (Stables list): `secondary` "Follow" / `primary` "Following".
   * `hero` (Horse detail photo): white-outline "Follow" / ice-filled "Following".
   */
  tone?: 'card' | 'hero';
  /**
   * When set, unfollowing (isFollowing -> false) confirms via Alert.alert
   * first instead of calling onToggle directly -- for invite-only horses
   * (S9-05), where unfollowing loses access and only a club admin can add
   * the member back. Following always happens directly, regardless.
   */
  confirmBeforeUnfollow?: { horseName: string };
  className?: string;
  testID?: string;
};

/**
 * Follow / Following button (S13-04). The mutation is optimistic, so the
 * label flips immediately; while it's in flight presses are ignored rather
 * than dimming the button.
 */
export function FollowToggle({
  isFollowing,
  pending = false,
  onToggle,
  tone = 'card',
  confirmBeforeUnfollow,
  className,
  testID,
}: FollowToggleProps) {
  const handlePress = () => {
    if (pending)
      return;
    const next = !isFollowing;
    if (!next && confirmBeforeUnfollow) {
      const { horseName } = confirmBeforeUnfollow;
      Alert.alert(
        tx('stables.follow.leaveTitle', { name: horseName }),
        tx('stables.follow.leaveBody', { name: horseName }),
        [
          { text: translate('stables.follow.leaveCancel'), style: 'cancel' },
          { text: translate('stables.follow.leaveConfirm'), style: 'destructive', onPress: () => onToggle(false) },
        ],
      );
      return;
    }
    onToggle(next);
  };

  const hero = tone === 'hero';
  const variant = hero
    ? (isFollowing ? 'on-dark' : 'ghost-on-dark')
    : (isFollowing ? 'primary' : 'secondary');

  return (
    <Button
      testID={testID}
      size="md"
      variant={variant}
      label={translate(isFollowing ? 'stables.follow.following' : 'stables.follow.follow')}
      // Ice fill for the hero's "Following" (Figma frame 7).
      className={[hero && isFollowing ? 'bg-ice' : '', className ?? ''].join(' ').trim()}
      accessibilityLabel={translate(isFollowing ? 'stables.follow.unfollowA11y' : 'stables.follow.followA11y')}
      accessibilityState={{ selected: isFollowing, busy: pending }}
      onPress={handlePress}
    />
  );
}
