import type { ReportTarget } from '@/features/community-posting/types';
import type {
  MemberContentState,
  MemberPostDetail,
  PostComment,
} from '@/features/member-content/types';

import { HeaderHeightContext } from '@react-navigation/elements';
import Env from 'env';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import { Linking, Pressable, ScrollView, TextInput, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { Path, Svg } from 'react-native-svg';

import {
  ActivityIndicator,
  Button,
  Card,
  IconButton,
  Image,
  MonoLabel,
  ScreenHeader,
  Text,
} from '@/components/ui';
import colors from '@/components/ui/colors';
import { useScreenBottomPadding } from '@/components/ui/screen-layout';
import { useAuthStore } from '@/features/auth/use-auth-store';
import { PostOverflowMenu } from '@/features/community-posting/components/post-overflow-menu';
import { ReportSheet } from '@/features/community-posting/components/report-sheet';
import { useMemberPost } from '@/features/member-content/api/use-member-post';
import {
  useAddComment,
  useDeleteComment,
  usePostComments,
} from '@/features/member-content/api/use-post-comments';
import { usePostLike } from '@/features/member-content/api/use-post-like';
import { CircleTiptapRenderer } from '@/features/member-content/components/circle-tiptap-renderer';
import { ActivityRow, AuthorHeader } from '@/features/member-content/components/post-parts';
import { formatRelativeTime } from '@/features/member-content/lib/space-tag';
import { hydrateCircleDoc } from '@/features/member-content/tiptap/hydrate';
import { circleDocHasContent } from '@/features/member-content/tiptap/native-support';

const REPORT_EXCERPT_MAX = 200;

type MemberPostViewProps = {
  post: MemberPostDetail | undefined;
  contentState: MemberContentState;
  isLoading?: boolean;
  onOpenUrl?: (url: string) => void;
  onRetry?: () => void;
  /** Back action for the kicker header. */
  onBack?: () => void;
  /** Right slot of the kicker header (the post overflow menu). */
  headerRight?: React.ReactNode;
  /** Wire to flip the like; omitted → read-only count. */
  onToggleLike?: (postId: string, liked: boolean) => void;
  /** Disables the heart while the like mutation is in flight. */
  likePending?: boolean;
  /** The post's comments; undefined hides the whole comments section. */
  comments?: PostComment[];
  /** Server total for the "Replies (N)" label; falls back to the loaded count. */
  commentsTotal?: number | null;
  /** Comments failed to load (post itself may still be fine). */
  commentsUnavailable?: boolean;
  /** Wire to enable the composer; omitted → read-only comments. */
  onSubmitComment?: (postId: string, body: string) => void;
  /** Disables the composer while a comment is in flight. */
  commentSubmitting?: boolean;
  /** Set after a failed submit — 'blocked' shows inline copy and keeps the composer text; 'failed' matches the prior silent-clear behaviour. */
  commentError?: 'blocked' | 'failed' | null;
  /** Wire to enable delete on the member's own comments. */
  onDeleteComment?: (postId: string, commentId: string) => void;
  /** Dims the comment being deleted. */
  pendingDeleteCommentId?: string | null;
  /** Wire to open the report sheet for a long-pressed comment. */
  onLongPressComment?: (postId: string, comment: PostComment) => void;
};

function PostUnavailable({ onRetry, onBack }: { onRetry?: () => void; onBack?: () => void }) {
  return (
    <View testID="member-post-unavailable" className="flex-1 bg-surface">
      <ScreenHeader kicker="Community" onBack={onBack} />
      <View className="flex-1 items-center justify-center px-8">
        <Text variant="display-sm">Post unavailable</Text>
        <Text variant="body" className="mt-2 text-center text-ink-variant">
          Check your connection and try again.
        </Text>
        {onRetry
          ? (
              <Button
                variant="secondary"
                size="md"
                fullWidth={false}
                className="mt-5"
                label="Try again"
                accessibilityLabel="Retry post"
                onPress={onRetry}
              />
            )
          : null}
      </View>
    </View>
  );
}

function CommentRow({
  postId,
  comment,
  onDeleteComment,
  pendingDeleteCommentId,
  onLongPressComment,
  isReply = false,
}: {
  postId: string;
  comment: PostComment;
  onDeleteComment?: (postId: string, commentId: string) => void;
  pendingDeleteCommentId?: string | null;
  onLongPressComment?: (postId: string, comment: PostComment) => void;
  isReply?: boolean;
}) {
  const authorName = comment.authorName?.trim() || 'Rionna member';
  const deleting = pendingDeleteCommentId === comment.id;
  // A staff/trainer answer is highlighted lilac (frame 11); hidden until S13-11 sends authorRole.
  const highlighted = Boolean(comment.authorRole);
  return (
    <View className={isReply ? 'ml-6 gap-3' : 'gap-3'}>
      <Pressable
        accessibilityLabel={`Comment by ${authorName}`}
        onLongPress={onLongPressComment ? () => onLongPressComment(postId, comment) : undefined}
        style={deleting ? { opacity: 0.4 } : null}
      >
        <Card
          variant="white"
          className={highlighted ? 'gap-3 border border-outline-variant bg-primary-fixed' : 'gap-3'}
        >
          <AuthorHeader
            name={authorName}
            avatarUrl={comment.authorAvatarUrl}
            time={formatRelativeTime(comment.createdAt)}
            role={comment.authorRole}
            showSpaceTag={false}
          />
          {comment.bodyText
            ? <Text variant="body-lg" className="text-ink-variant">{comment.bodyText}</Text>
            : null}
          {comment.canDelete && onDeleteComment
            ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Delete comment"
                  disabled={deleting}
                  hitSlop={8}
                  className="self-start"
                  onPress={() => onDeleteComment(postId, comment.id)}
                >
                  <Text variant="body-sm" className="text-ink-muted">Delete</Text>
                </Pressable>
              )
            : null}
        </Card>
      </Pressable>
      {comment.replies.map(reply => (
        <CommentRow
          key={reply.id}
          postId={postId}
          comment={reply}
          onDeleteComment={onDeleteComment}
          pendingDeleteCommentId={pendingDeleteCommentId}
          onLongPressComment={onLongPressComment}
          isReply
        />
      ))}
    </View>
  );
}

function CommentComposer({
  postId,
  onSubmitComment,
  commentSubmitting = false,
  commentError = null,
}: {
  postId: string;
  onSubmitComment: (postId: string, body: string) => void;
  commentSubmitting?: boolean;
  commentError?: 'blocked' | 'failed' | null;
}) {
  const [text, setText] = React.useState('');
  const bottomPadding = useScreenBottomPadding();
  const lastSubmittedRef = React.useRef('');
  const trimmed = text.trim();

  React.useEffect(() => {
    if (commentError === 'blocked' && lastSubmittedRef.current) {
      setText(lastSubmittedRef.current);
    }
  }, [commentError]);

  const submit = () => {
    if (!trimmed || commentSubmitting) {
      return;
    }
    lastSubmittedRef.current = trimmed;
    onSubmitComment(postId, trimmed);
    setText('');
  };

  return (
    <View className="gap-2 bg-surface px-4 pt-2" style={{ paddingBottom: bottomPadding + 8 }}>
      {commentError === 'blocked'
        ? (
            <Text variant="body-sm" className="text-plum">
              Our auto-moderation held back this comment. Please edit it and try again.
            </Text>
          )
        : null}
      <View className="flex-row items-end gap-3 rounded-xl border border-outline-variant bg-white p-3">
        <TextInput
          accessibilityLabel="Write a comment"
          placeholder="Write a reply…"
          placeholderTextColor={colors.inkMuted}
          value={text}
          onChangeText={setText}
          editable={!commentSubmitting}
          multiline
          className="max-h-28 min-h-[46px] flex-1 font-sans-medium text-sm/5 text-ink"
          textAlignVertical="center"
        />
        <IconButton
          variant="square-accent"
          accessibilityLabel="Send comment"
          disabled={commentSubmitting || trimmed.length === 0}
          onPress={submit}
        >
          <SendArrow />
        </IconButton>
      </View>
    </View>
  );
}

function SendArrow() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" accessibilityElementsHidden>
      <Path
        d="M12 19V5M5.5 11.5L12 5l6.5 6.5"
        stroke={colors.plum}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

function CommentsSection({
  postId,
  comments,
  total,
  commentsUnavailable = false,
  onDeleteComment,
  pendingDeleteCommentId,
  onLongPressComment,
}: {
  postId: string;
  comments?: PostComment[];
  total: number;
  commentsUnavailable?: boolean;
  onDeleteComment?: (postId: string, commentId: string) => void;
  pendingDeleteCommentId?: string | null;
  onLongPressComment?: (postId: string, comment: PostComment) => void;
}) {
  return (
    <View className="mt-4 gap-3">
      <MonoLabel>{`Replies (${total})`}</MonoLabel>
      {commentsUnavailable
        ? (
            <View testID="post-comments-unavailable">
              <Text variant="body" className="text-ink-variant">
                Comments couldn’t load. Pull down to try again.
              </Text>
            </View>
          )
        : null}
      {!commentsUnavailable && comments && comments.length === 0
        ? (
            <Card>
              <Text variant="title">No comments yet</Text>
              <Text variant="body-sm" className="mt-1 text-ink-muted">
                Be the first to join the conversation.
              </Text>
            </Card>
          )
        : null}
      {comments?.map(comment => (
        <CommentRow
          key={comment.id}
          postId={postId}
          comment={comment}
          onDeleteComment={onDeleteComment}
          pendingDeleteCommentId={pendingDeleteCommentId}
          onLongPressComment={onLongPressComment}
        />
      ))}
    </View>
  );
}

function PostCard({
  post,
  hydratedDoc,
  onOpenUrl,
  onToggleLike,
  likePending,
}: {
  post: MemberPostDetail;
  hydratedDoc: ReturnType<typeof hydrateCircleDoc>;
  onOpenUrl?: (url: string) => void;
  onToggleLike?: (postId: string, liked: boolean) => void;
  likePending?: boolean;
}) {
  return (
    <Card className="gap-4 border border-on-primary-container">
      <AuthorHeader
        name={post.authorName}
        avatarUrl={post.authorAvatarUrl}
        time={formatRelativeTime(post.createdAt)}
        spaceName={post.spaceName}
        spaceId={post.spaceId}
        role={post.authorRole}
      />
      {post.title ? <Text variant="display-sm">{post.title}</Text> : null}
      {post.imageUrl
        ? (
            <Image
              source={{ uri: post.imageUrl }}
              className="aspect-video w-full rounded-md bg-secondary-container"
              contentFit="cover"
              cachePolicy="memory-disk"
              accessibilityLabel={post.title}
            />
          )
        : null}
      {circleDocHasContent(hydratedDoc)
        ? <CircleTiptapRenderer doc={hydratedDoc} onOpenUrl={onOpenUrl} />
        : (
            <Text variant="body-lg" className="text-ink-variant">
              {post.bodyText ?? 'This post has no readable content yet.'}
            </Text>
          )}
      <ActivityRow
        likeCount={post.likeCount}
        commentCount={post.commentCount}
        isLiked={post.isLiked}
        likePending={likePending}
        onToggleLike={onToggleLike ? () => onToggleLike(post.id, !post.isLiked) : undefined}
      />
    </Card>
  );
}

export function MemberPostView({
  post,
  contentState,
  isLoading = false,
  onOpenUrl,
  onRetry,
  onBack,
  headerRight,
  onToggleLike,
  likePending,
  comments,
  commentsTotal,
  commentsUnavailable = false,
  onSubmitComment,
  commentSubmitting,
  commentError,
  onDeleteComment,
  pendingDeleteCommentId,
  onLongPressComment,
}: MemberPostViewProps) {
  // Offset for any native header above the screen (0 when the kicker header
  // replaces it, and outside a navigator, e.g. unit tests).
  const headerHeight = React.use(HeaderHeightContext) ?? 0;

  if (isLoading && !post) {
    return (
      <View testID="member-post-loading" className="flex-1 bg-surface">
        <ScreenHeader kicker="Community" onBack={onBack} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
          <Text variant="body" className="mt-3 text-ink-variant">Loading post…</Text>
        </View>
      </View>
    );
  }

  if (!post) {
    return <PostUnavailable onRetry={onRetry} onBack={onBack} />;
  }

  const hydratedDoc = hydrateCircleDoc({
    body: post.tiptapDoc,
    sgids_to_object_map: post.embeds,
    inline_attachments: post.inlineAttachments,
  });
  const showComments = comments !== undefined || commentsUnavailable;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.surface }}
      behavior="padding"
      keyboardVerticalOffset={headerHeight}
    >
      <ScreenHeader kicker="Community" onBack={onBack} right={headerRight} className="pb-3" />
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 }}
      >
        {contentState === 'saved'
          ? (
              <View className="mb-3 rounded-lg bg-primary-fixed px-4 py-3">
                <Text variant="body-sm" className="font-sans-medium">Showing saved content</Text>
              </View>
            )
          : null}

        <PostCard
          post={post}
          hydratedDoc={hydratedDoc}
          onOpenUrl={onOpenUrl}
          onToggleLike={onToggleLike}
          likePending={likePending}
        />

        {showComments
          ? (
              <CommentsSection
                postId={post.id}
                comments={comments}
                total={commentsTotal ?? comments?.length ?? 0}
                commentsUnavailable={commentsUnavailable}
                onDeleteComment={onDeleteComment}
                pendingDeleteCommentId={pendingDeleteCommentId}
                onLongPressComment={onLongPressComment}
              />
            )
          : null}
      </ScrollView>
      {showComments && onSubmitComment
        ? (
            <CommentComposer
              postId={post.id}
              onSubmitComment={onSubmitComment}
              commentSubmitting={commentSubmitting}
              commentError={commentError}
            />
          )
        : null}
    </KeyboardAvoidingView>
  );
}

/** First `REPORT_EXCERPT_MAX` characters of the reported text, defaulting to an empty excerpt. */
function reportExcerpt(text: string | null | undefined) {
  return (text ?? '').slice(0, REPORT_EXCERPT_MAX);
}

function SignedInMemberPost({
  memberId,
  spaceId,
  postId,
}: {
  memberId: string;
  spaceId: string;
  postId: string;
}) {
  const router = useRouter();
  const scope = React.useMemo(
    () => ({ organizationId: Env.EXPO_PUBLIC_CLUB_ID, memberId }),
    [memberId],
  );
  const post = useMemberPost(scope, spaceId, postId);
  const like = usePostLike(scope);
  const memberName = useAuthStore.use.user()?.name ?? null;
  const comments = usePostComments(scope, postId);
  const addComment = useAddComment(scope, memberName);
  const deleteComment = useDeleteComment(scope);
  const [reportTarget, setReportTarget] = React.useState<ReportTarget | null>(null);

  const reportPost = React.useCallback(() => {
    if (!post.data) {
      return;
    }
    setReportTarget({
      surface: 'post',
      postId: post.data.id,
      spaceId: post.data.spaceId ?? undefined,
      excerpt: reportExcerpt(post.data.bodyText ?? post.data.title),
      authorName: post.data.authorName ?? undefined,
    });
  }, [post.data]);

  const reportComment = React.useCallback((commentPostId: string, comment: PostComment) => {
    setReportTarget({
      surface: 'comment',
      postId: commentPostId,
      commentId: comment.id,
      spaceId: post.data?.spaceId ?? undefined,
      excerpt: reportExcerpt(comment.bodyText),
      authorName: comment.authorName ?? undefined,
    });
  }, [post.data?.spaceId]);

  const postData = post.data;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <MemberPostView
        post={post.data}
        contentState={post.contentState}
        isLoading={post.isLoading}
        onOpenUrl={url => void Linking.openURL(url)}
        onRetry={() => void post.refetch()}
        onBack={() => router.back()}
        headerRight={postData
          ? (
              <PostOverflowMenu
                scope={scope}
                postId={postData.id}
                spaceId={postData.spaceId}
                isOwn={postData.isOwn ?? false}
                onReportPost={reportPost}
                onDeleted={() => router.back()}
              />
            )
          : undefined}
        onToggleLike={(likedPostId, liked) => like.toggleLike({ postId: likedPostId, liked })}
        likePending={like.isPending}
        comments={comments.data?.comments}
        commentsTotal={comments.data?.totalCount}
        commentsUnavailable={comments.isError}
        onSubmitComment={(commentPostId, body) => addComment.addComment({ postId: commentPostId, body })}
        commentSubmitting={addComment.isPending}
        commentError={addComment.lastError}
        onDeleteComment={(commentPostId, commentId) =>
          deleteComment.deleteComment({ postId: commentPostId, commentId })}
        pendingDeleteCommentId={deleteComment.pendingCommentId}
        onLongPressComment={reportComment}
      />
      <ReportSheet scope={scope} target={reportTarget} onClose={() => setReportTarget(null)} />
    </>
  );
}

export function MemberPostScreen() {
  const member = useAuthStore.use.user();
  const params = useLocalSearchParams<{
    'space-id'?: string;
    'post-id'?: string;
  }>();
  const spaceId = params['space-id'];
  const postId = params['post-id'];
  if (!member || typeof spaceId !== 'string' || typeof postId !== 'string') {
    return (
      <MemberPostView
        post={undefined}
        contentState="unavailable"
      />
    );
  }
  return <SignedInMemberPost memberId={member.id} spaceId={spaceId} postId={postId} />;
}
