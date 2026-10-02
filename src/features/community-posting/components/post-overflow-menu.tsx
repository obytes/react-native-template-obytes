import type { MemberContentScope } from '@/features/member-content/types';

import * as React from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import { Modal, useModal } from '@/components/ui/modal';
import { useDeletePost } from '@/features/community-posting/api/use-delete-post';

type PostOverflowMenuProps = {
  scope: MemberContentScope;
  postId: string;
  spaceId: string | null;
  /** Whether the signed-in member authored the post — gates the Delete post option. */
  isOwn: boolean;
  onReportPost: () => void;
  /** Called once the post has actually been deleted. */
  onDeleted: () => void;
};

/**
 * Post "···" overflow menu: always offers Report post, and Delete post when
 * the member owns the post. Owns its own delete mutation and confirm/error
 * alerts, the same way `ReportSheet` owns `useReportContent`.
 */
export function PostOverflowMenu({ scope, postId, spaceId, isOwn, onReportPost, onDeleted }: PostOverflowMenuProps) {
  const modal = useModal();
  const { remove, isPending } = useDeletePost(scope);

  const onReport = React.useCallback(() => {
    modal.dismiss();
    onReportPost();
  }, [modal, onReportPost]);

  const runDelete = React.useCallback(async () => {
    if (!spaceId) {
      Alert.alert('Couldn\'t delete that post. Try again.');
      return;
    }
    const ok = await remove({ spaceId, postId });
    if (ok) {
      onDeleted();
    }
    else {
      Alert.alert('Couldn\'t delete that post. Try again.');
    }
  }, [spaceId, postId, remove, onDeleted]);

  const onDelete = React.useCallback(() => {
    modal.dismiss();
    Alert.alert(
      'Delete this post?',
      'This can\'t be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => void runDelete() },
      ],
    );
  }, [modal, runDelete]);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Post options"
        hitSlop={8}
        onPress={modal.present}
        testID="post-overflow-trigger"
      >
        <Text className="px-2 font-sans text-xl font-semibold text-ink">···</Text>
      </Pressable>
      <Modal ref={modal.ref} snapPoints={[isOwn ? '36%' : '28%']}>
        <View className="px-4 pb-6">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Report post"
            onPress={onReport}
            className="border-b border-outline-variant py-3.5"
          >
            <Text className="font-sans text-base text-ink">Report post</Text>
          </Pressable>
          {isOwn
            ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Delete post"
                  disabled={isPending}
                  onPress={onDelete}
                  className="py-3.5"
                >
                  <Text className="font-sans text-base text-danger-700">Delete post</Text>
                </Pressable>
              )
            : null}
        </View>
      </Modal>
    </>
  );
}
