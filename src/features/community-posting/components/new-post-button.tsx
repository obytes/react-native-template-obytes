import type { MemberContentScope } from '@/features/member-content/types';

import { useRouter } from 'expo-router';
import * as React from 'react';
import { Pressable } from 'react-native';
import { Path, Svg } from 'react-native-svg';

import colors from '@/components/ui/colors';
import { useTabBarContentPadding } from '@/components/ui/tab-bar-layout';
import { usePostableSpaces } from '@/features/community-posting/api/use-postable-spaces';

type NewPostButtonProps = {
  scope: MemberContentScope;
};

/**
 * Floating "New post" action on the Community tab. Hides itself when the
 * member has nowhere postable (no spaces, or the postable-spaces query
 * errored) rather than leaving a dead-end button on screen.
 */
export function NewPostButton({ scope }: NewPostButtonProps) {
  const router = useRouter();
  const spacesQuery = usePostableSpaces(scope);
  const bottomOffset = useTabBarContentPadding(16);

  const hasPostableSpaces = !spacesQuery.isError && (spacesQuery.data?.spaces.length ?? 0) > 0;
  if (!hasPostableSpaces) {
    return null;
  }

  return (
    <Pressable
      testID="new-post-button"
      accessibilityRole="button"
      accessibilityLabel="New post"
      onPress={() => router.push('/post/new')}
      style={{ bottom: bottomOffset }}
      className="absolute right-6 size-14 items-center justify-center rounded-full bg-primary shadow-lg"
    >
      <Svg width={26} height={26} viewBox="0 0 24 24" accessibilityElementsHidden>
        <Path d="M12 5v14M5 12h14" stroke={colors.onPrimary} strokeWidth={2.5} strokeLinecap="round" />
      </Svg>
    </Pressable>
  );
}
