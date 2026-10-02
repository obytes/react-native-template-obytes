import type { MemberContentScope } from '@/features/member-content/types';

import { useRouter } from 'expo-router';
import * as React from 'react';

import { IconButton } from '@/components/ui';
import { usePostableSpaces } from '@/features/community-posting/api/use-postable-spaces';
import { PlusGlyph } from '@/features/community-posting/components/plus-glyph';

type NewPostButtonProps = {
  scope: MemberContentScope;
};

/**
 * "New post" action in the Community header: a 52pt lilac square "+" (S13-06).
 * Hides itself when the member has nowhere postable (no spaces, or the
 * postable-spaces query errored) rather than leaving a dead-end button.
 */
export function NewPostButton({ scope }: NewPostButtonProps) {
  const router = useRouter();
  const spacesQuery = usePostableSpaces(scope);

  const hasPostableSpaces = !spacesQuery.isError && (spacesQuery.data?.spaces.length ?? 0) > 0;
  if (!hasPostableSpaces) {
    return null;
  }

  return (
    <IconButton
      testID="new-post-button"
      variant="square-accent"
      accessibilityLabel="New post"
      onPress={() => router.push('/post/new')}
      className="size-[52px] border border-on-primary-container"
    >
      <PlusGlyph />
    </IconButton>
  );
}
