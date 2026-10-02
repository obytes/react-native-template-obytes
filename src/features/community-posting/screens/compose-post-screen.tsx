import type { CreatePostFailure, CreatePostInput, PostableSpace, PostImage } from '@/features/community-posting/types';

import Env from 'env';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import { ScrollView, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

import { ActivityIndicator, Button, ChipRow, FormField, MonoLabel, ScreenHeader, Text } from '@/components/ui';
import { useAuthStore } from '@/features/auth/use-auth-store';
import { useCreatePost } from '@/features/community-posting/api/use-create-post';
import { usePostableSpaces } from '@/features/community-posting/api/use-postable-spaces';
import { ComposeImageRow } from '@/features/community-posting/components/compose-image-row';
import { pickImage } from '@/features/community-posting/lib/pick-image';
import { getItem, setItem } from '@/lib/storage';

const TITLE_MAX = 120;
const BODY_MAX = 2000;
const MIN_BODY_LENGTH = 10;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

const FAILURE_COPY: Record<CreatePostFailure | 'network', string> = {
  blocked:
    'Our auto-moderation held back this post. Please edit it to keep things friendly and respectful, then try again.',
  rate_limited: 'You\'ve posted a lot today — try again later.',
  not_allowed: 'You can\'t post in that space.',
  image_failed: 'That photo couldn\'t be uploaded.',
  circle_failed: 'Couldn\'t publish right now. Try again.',
  network: 'Couldn\'t publish right now. Try again.',
};

function lastSpaceKey(memberId: string) {
  return `community-posting:last-space:${memberId}`;
}

function canSubmitPost(title: string, body: string) {
  return title.trim().length > 0 || body.trim().length >= MIN_BODY_LENGTH;
}

/**
 * Resolves the initially-selected space: the `spaceId` search param, then the
 * member's last-used space (MMKV), then the first postable space.
 */
function useInitialSpaceId(
  memberId: string | undefined,
  paramSpaceId: string | undefined,
  spaces: PostableSpace[],
) {
  const [selectedSpaceId, setSelectedSpaceId] = React.useState<string | null>(paramSpaceId ?? null);

  React.useEffect(() => {
    if (selectedSpaceId || spaces.length === 0) {
      return;
    }
    const lastUsed = memberId ? getItem<string>(lastSpaceKey(memberId)) : null;
    const fallback = lastUsed && spaces.some(space => space.id === lastUsed) ? lastUsed : spaces[0]?.id;
    const initial = paramSpaceId ?? fallback ?? null;
    if (initial) {
      setSelectedSpaceId(initial);
    }
  }, [spaces, selectedSpaceId, memberId, paramSpaceId]);

  return [selectedSpaceId, setSelectedSpaceId] as const;
}

type ComposeFieldsProps = {
  title: string;
  onChangeTitle: (value: string) => void;
  body: string;
  onChangeBody: (value: string) => void;
};

function ComposeFields({ title, onChangeTitle, body, onChangeBody }: ComposeFieldsProps) {
  return (
    <View>
      <FormField
        accessibilityLabel="Post title"
        placeholder="Title (optional)"
        value={title}
        onChangeText={onChangeTitle}
        maxLength={TITLE_MAX}
      />
      <FormField
        accessibilityLabel="Post body"
        placeholder="What's on your mind?"
        value={body}
        onChangeText={onChangeBody}
        maxLength={BODY_MAX}
        multiline
        textAlignVertical="top"
        className="min-h-40"
      />
    </View>
  );
}

function SpaceChips({
  spaces,
  selectedSpaceId,
  onSelect,
}: {
  spaces: PostableSpace[];
  selectedSpaceId: string | null;
  onSelect: (space: PostableSpace) => void;
}) {
  const items = React.useMemo(
    () => spaces.map(space => ({ key: space.id, label: `${space.emoji ? `${space.emoji} ` : ''}${space.name}` })),
    [spaces],
  );
  return (
    <View className="mb-4 gap-2">
      <MonoLabel>Post in</MonoLabel>
      <View className="-mx-4">
        <ChipRow
          testID="compose-post-space"
          items={items}
          selectedKey={selectedSpaceId ?? undefined}
          contentInset={16}
          onSelect={(key) => {
            const space = spaces.find(candidate => candidate.id === key);
            if (space) {
              onSelect(space);
            }
          }}
        />
      </View>
    </View>
  );
}

type SpacesStatusProps = {
  isError: boolean;
  isEmpty: boolean;
  onRetry: () => void;
};

/** Replaces the composer's form with copy when there's nothing postable to show — no dead form. */
function SpacesStatus({ isError, isEmpty, onRetry }: SpacesStatusProps) {
  if (isError) {
    return (
      <View className="mb-4 gap-3 rounded-lg bg-white p-4">
        <Text variant="body" className="text-ink-variant">Couldn&apos;t load your spaces. Pull to retry.</Text>
        <Button
          testID="compose-post-spaces-retry"
          variant="secondary"
          size="md"
          fullWidth={false}
          label="Retry"
          onPress={onRetry}
        />
      </View>
    );
  }
  if (isEmpty) {
    return (
      <View className="mb-4 rounded-lg bg-white p-4">
        <Text variant="body" className="text-ink-variant">You can&apos;t post in any spaces yet.</Text>
      </View>
    );
  }
  return null;
}

type ComposeFooterProps = {
  errorMessage: string | null;
  isPending: boolean;
  canSubmit: boolean;
  onSubmit: () => void;
};

function ComposeFooter({ errorMessage, isPending, canSubmit, onSubmit }: ComposeFooterProps) {
  return (
    <View className="mt-4 gap-3">
      {errorMessage
        ? <Text variant="body" className="text-plum">{errorMessage}</Text>
        : null}
      <Button
        testID="compose-post-submit"
        size="lg"
        label={isPending ? 'Posting…' : 'Post'}
        accessibilityLabel="Post"
        disabled={!canSubmit || isPending}
        onPress={onSubmit}
      />
    </View>
  );
}

function useComposeImageState() {
  const [image, setImage] = React.useState<PostImage | null>(null);
  const [imageError, setImageError] = React.useState<string | null>(null);

  const onPickImage = React.useCallback(async () => {
    const picked = await pickImage();
    if (!picked) {
      return;
    }
    if (picked.fileSize > MAX_IMAGE_BYTES) {
      setImageError('Choose a photo under 10 MB.');
      return;
    }
    setImageError(null);
    setImage(picked);
  }, []);

  const onRemoveImage = React.useCallback(() => {
    setImage(null);
    setImageError(null);
  }, []);

  return { image, imageError, onPickImage, onRemoveImage };
}

export function ComposePostScreen() {
  const params = useLocalSearchParams<{ spaceId?: string }>();
  const router = useRouter();
  const member = useAuthStore.use.user();

  const scope = React.useMemo(
    () => ({ organizationId: Env.EXPO_PUBLIC_CLUB_ID, memberId: member?.id ?? '' }),
    [member?.id],
  );

  const spacesQuery = usePostableSpaces(scope);
  const { create, isPending, failure } = useCreatePost(scope);
  const spaces = React.useMemo(() => spacesQuery.data?.spaces ?? [], [spacesQuery.data]);

  const [selectedSpaceId, setSelectedSpaceId] = useInitialSpaceId(member?.id, params.spaceId, spaces);
  const [title, setTitle] = React.useState('');
  const [body, setBody] = React.useState('');
  const { image, imageError, onPickImage, onRemoveImage } = useComposeImageState();

  const refetchSpacesRef = React.useRef(spacesQuery.refetch);
  refetchSpacesRef.current = spacesQuery.refetch;

  React.useEffect(() => {
    if (failure === 'not_allowed') {
      void refetchSpacesRef.current();
    }
  }, [failure]);

  const onSelectSpace = React.useCallback(
    (space: PostableSpace) => {
      setSelectedSpaceId(space.id);
    },
    [setSelectedSpaceId],
  );

  const onSubmit = React.useCallback(async () => {
    if (!selectedSpaceId) {
      return;
    }
    const input: CreatePostInput = {
      spaceId: selectedSpaceId,
      title: title.trim() || undefined,
      body: body.trim(),
      image: image ?? undefined,
    };
    const result = await create(input);
    if (result?.ok === true) {
      if (member?.id) {
        void setItem(lastSpaceKey(member.id), result.post.spaceId);
      }
      router.replace(`/post/${result.post.spaceId}/${result.post.circlePostId}`);
    }
  }, [selectedSpaceId, title, body, image, create, router, member?.id]);

  if (!member) {
    return null;
  }

  const spacesEmpty = spacesQuery.isSuccess && spaces.length === 0;
  const spacesUnusable = spacesQuery.isError || spacesEmpty;
  const spacesLoading = !spacesQuery.isError && !spacesQuery.isSuccess;

  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1 bg-surface">
      <ScreenHeader kicker="New post" onBack={() => router.back()} backLabel="Cancel" className="pb-4" />
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
      >
        {spacesLoading
          ? (
              <View className="mb-4 items-center justify-center py-6" testID="compose-post-spaces-loading">
                <ActivityIndicator />
              </View>
            )
          : spacesUnusable
            ? (
                <SpacesStatus
                  isError={spacesQuery.isError}
                  isEmpty={spacesEmpty}
                  onRetry={() => void spacesQuery.refetch()}
                />
              )
            : (
                <>
                  <SpaceChips spaces={spaces} selectedSpaceId={selectedSpaceId} onSelect={onSelectSpace} />
                  <ComposeFields title={title} onChangeTitle={setTitle} body={body} onChangeBody={setBody} />
                  <View className="mt-1">
                    <ComposeImageRow
                      image={image}
                      imageError={imageError}
                      onPickImage={() => void onPickImage()}
                      onRemoveImage={onRemoveImage}
                    />
                  </View>
                </>
              )}
        <ComposeFooter
          errorMessage={failure ? FAILURE_COPY[failure] : null}
          isPending={isPending}
          canSubmit={canSubmitPost(title, body) && Boolean(selectedSpaceId)}
          onSubmit={() => void onSubmit()}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
