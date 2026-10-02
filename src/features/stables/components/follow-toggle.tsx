import { Alert } from 'react-native';
import { Pressable, Text } from '@/components/ui';

type FollowToggleProps = {
  isFollowing: boolean;
  pending?: boolean;
  onToggle: (following: boolean) => void;
  /** Overlay variant for the horse card's photo; defaults to inline. */
  variant?: 'inline' | 'overlay';
  /**
   * When set, unfollowing (isFollowing -> false) confirms via Alert.alert
   * first instead of calling onToggle directly -- for invite-only horses,
   * where unfollowing loses access and only a club admin can add the
   * member back. Following always happens directly, regardless.
   */
  confirmBeforeUnfollow?: { horseName: string };
};

/**
 * Explicit follow/unfollow pill ("+ Follow" / "Following"), shared by the
 * Stables card (photo overlay) and the profile header. Follows the stables
 * chip convention: mono uppercase label, bg-primary when active.
 */
export function FollowToggle({
  isFollowing,
  pending = false,
  onToggle,
  variant = 'inline',
  confirmBeforeUnfollow,
}: FollowToggleProps) {
  const position = variant === 'overlay' ? 'absolute right-3 top-3' : '';
  const background = isFollowing
    ? 'bg-primary'
    : variant === 'overlay'
      ? 'bg-ink/50'
      : 'bg-muted';
  const labelColor = isFollowing
    ? 'text-on-primary'
    : variant === 'overlay'
      ? 'text-white'
      : 'text-muted-foreground';

  const handlePress = () => {
    const next = !isFollowing;
    if (!next && confirmBeforeUnfollow) {
      const { horseName } = confirmBeforeUnfollow;
      Alert.alert(
        `Leave ${horseName}?`,
        `You'll lose access to ${horseName}. Only a club admin can add you back.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Leave', style: 'destructive', onPress: () => onToggle(false) },
        ],
      );
      return;
    }
    onToggle(next);
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isFollowing }}
      accessibilityLabel={isFollowing ? 'Unfollow horse' : 'Follow horse'}
      disabled={pending}
      hitSlop={8}
      onPress={handlePress}
      className={`rounded-full px-3.5 py-2 ${position} ${background} ${pending ? 'opacity-60' : ''}`}
    >
      <Text className={`font-mono text-[10px] tracking-widest uppercase ${labelColor}`}>
        {isFollowing ? 'Following' : '+ Follow'}
      </Text>
    </Pressable>
  );
}
