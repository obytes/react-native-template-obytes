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
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

import { Image } from '@/components/ui';
import { Heart } from '@/components/ui/icons';
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
import { formatCount, formatMemberContentDate } from '@/features/member-content/lib/content-format';
import { hydrateCircleDoc } from '@/features/member-content/tiptap/hydrate';
import { circleDocHasContent } from '@/features/member-content/tiptap/native-support';

const REPORT_EXCERPT_MAX = 200;

type MemberPostViewProps = {
  post: MemberPostDetail | undefined;
  contentState: MemberContentState;
  isLoading?: boolean;
  onOpenUrl?: (url: string) => void;
  onRetry?: () => void;
  /** Wire to flip the like; omitted → read-only count. */
  onToggleLike?: (postId: string, liked: boolean) => void;
  /** Disables the heart while the like mutation is in flight. */
  likePending?: boolean;
  /** The post's comments; undefined hides the whole comments section. */
  comments?: PostComment[];
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

function PostUnavailable({ onRetry }: { onRetry?: () => void }) {
  return (
    <View testID="member-post-unavailable" className="flex-1 items-center justify-center bg-neutral-100 px-8">
      <Text className="font-sans text-xl font-semibold text-neutral-950">Post unavailable</Text>
      <Text className="mt-2 text-center font-sans text-sm/5 text-neutral-600">
        Check your connection and try again.
      </Text>
      {onRetry
        ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Retry post"
              className="mt-5 h-11 items-center justify-center rounded-xl border border-violet-700 bg-white px-6"
              onPress={onRetry}
            >
              <Text className="font-sans text-sm font-semibold text-violet-800">Try again</Text>
            </Pressable>
          )
        : null}
    </View>
  );
}

function PostAuthor({ post }: { post: MemberPostDetail }) {
  const authorName = post.authorName?.trim() || 'Rionna member';
  return (
    <View className="mt-5 flex-row items-center gap-3">
      {post.authorAvatarUrl
        ? (
            <Image
              source={{ uri: post.authorAvatarUrl }}
              className="size-10 rounded-full bg-neutral-200"
              contentFit="cover"
              cachePolicy="memory-disk"
              accessibilityLabel={`${authorName} avatar`}
            />
          )
        : (
            <View className="size-10 items-center justify-center rounded-full border border-neutral-300 bg-neutral-100">
              <Text className="font-sans text-sm font-semibold text-neutral-800">
                {authorName.slice(0, 1).toUpperCase()}
              </Text>
            </View>
          )}
      <Text className="font-sans text-sm font-medium text-neutral-800">{authorName}</Text>
    </View>
  );
}

function PostLikeControl({
  post,
  onToggleLike,
  likePending = false,
}: {
  post: MemberPostDetail;
  onToggleLike?: (postId: string, liked: boolean) => void;
  likePending?: boolean;
}) {
  const countLabel = formatCount(post.likeCount, 'like', 'likes');
  if (!onToggleLike) {
    return <Text className="font-sans text-xs text-neutral-500">{countLabel}</Text>;
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={post.isLiked ? 'Unlike post' : 'Like post'}
      disabled={likePending}
      hitSlop={8}
      onPress={() => onToggleLike(post.id, !post.isLiked)}
      className="flex-row items-center gap-1.5"
    >
      <Heart
        width={16}
        height={16}
        filled={post.isLiked}
        color={post.isLiked ? '#BE123C' : '#737373'}
      />
      <Text
        className={
          post.isLiked
            ? 'font-sans text-xs font-medium text-rose-700'
            : 'font-sans text-xs text-neutral-500'
        }
      >
        {countLabel}
      </Text>
    </Pressable>
  );
}

function CommentAvatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  if (avatarUrl) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        className="size-8 rounded-full bg-neutral-200"
        contentFit="cover"
        cachePolicy="memory-disk"
        accessibilityLabel={`${name} avatar`}
      />
    );
  }
  return (
    <View className="size-8 items-center justify-center rounded-full border border-neutral-300 bg-neutral-100">
      <Text className="font-sans text-xs font-semibold text-neutral-800">
        {name.slice(0, 1).toUpperCase()}
      </Text>
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
  return (
    <Pressable
      accessibilityLabel={`Comment by ${authorName}`}
      onLongPress={onLongPressComment ? () => onLongPressComment(postId, comment) : undefined}
      className={isReply ? 'mt-3 ml-10' : 'mt-4'}
      style={deleting ? { opacity: 0.4 } : null}
    >
      <View className="flex-row items-center gap-2.5">
        <CommentAvatar name={authorName} avatarUrl={comment.authorAvatarUrl} />
        <View className="flex-1 flex-row items-center gap-2">
          <Text className="font-sans text-xs font-semibold text-neutral-800">{authorName}</Text>
          {comment.createdAt
            ? (
                <Text className="font-sans text-[10px] text-neutral-500">
                  {formatMemberContentDate(comment.createdAt)}
                </Text>
              )
            : null}
        </View>
        {comment.canDelete && onDeleteComment
          ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Delete comment"
                disabled={deleting}
                hitSlop={8}
                onPress={() => onDeleteComment(postId, comment.id)}
              >
                <Text className="font-sans text-xs text-neutral-500">Delete</Text>
              </Pressable>
            )
          : null}
      </View>
      {comment.bodyText
        ? (
            <Text className="mt-1.5 ml-[42px] font-sans text-sm/5 text-neutral-900">
              {comment.bodyText}
            </Text>
          )
        : null}
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
    </Pressable>
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
    <View
      className="gap-2 border-t border-neutral-200 bg-white px-4 pt-3"
      style={{ paddingBottom: bottomPadding + 12 }}
    >
      {commentError === 'blocked'
        ? (
            <Text className="font-sans text-xs text-red-600">
              Our auto-moderation held back this comment. Please edit it and try again.
            </Text>
          )
        : null}
      <View className="flex-row items-end gap-2">
        <TextInput
          accessibilityLabel="Write a comment"
          placeholder="Write a comment…"
          placeholderTextColor="#737373"
          value={text}
          onChangeText={setText}
          editable={!commentSubmitting}
          multiline
          className="max-h-28 flex-1 rounded-2xl border border-neutral-300 bg-neutral-50 px-4 py-2.5 font-sans text-sm text-neutral-900"
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Send comment"
          disabled={commentSubmitting || trimmed.length === 0}
          onPress={submit}
          className={
            trimmed.length > 0 && !commentSubmitting
              ? 'h-10 items-center justify-center rounded-full bg-violet-700 px-5'
              : 'h-10 items-center justify-center rounded-full bg-neutral-300 px-5'
          }
        >
          <Text className="font-sans text-sm font-semibold text-white">Send</Text>
        </Pressable>
      </View>
    </View>
  );
}

function CommentsSection({
  postId,
  comments,
  commentsUnavailable = false,
  onDeleteComment,
  pendingDeleteCommentId,
  onLongPressComment,
}: {
  postId: string;
  comments?: PostComment[];
  commentsUnavailable?: boolean;
  onDeleteComment?: (postId: string, commentId: string) => void;
  pendingDeleteCommentId?: string | null;
  onLongPressComment?: (postId: string, comment: PostComment) => void;
}) {
  return (
    <View className="mt-4 rounded-2xl border border-neutral-300 bg-white p-5">
      <Text className="font-mono text-[10px] tracking-widest text-neutral-500 uppercase">
        Comments
      </Text>
      {commentsUnavailable
        ? (
            <View testID="post-comments-unavailable" className="mt-3">
              <Text className="font-sans text-sm text-neutral-600">
                Comments couldn’t load. Pull down to try again.
              </Text>
            </View>
          )
        : null}
      {!commentsUnavailable && comments && comments.length === 0
        ? (
            <View className="mt-3">
              <Text className="font-sans text-sm font-medium text-neutral-800">No comments yet</Text>
              <Text className="mt-1 font-sans text-xs text-neutral-500">
                Be the first to join the conversation.
              </Text>
            </View>
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
  meta,
  hydratedDoc,
  onOpenUrl,
  onToggleLike,
  likePending,
}: {
  post: MemberPostDetail;
  meta: string;
  hydratedDoc: ReturnType<typeof hydrateCircleDoc>;
  onOpenUrl?: (url: string) => void;
  onToggleLike?: (postId: string, liked: boolean) => void;
  likePending?: boolean;
}) {
  return (
    <View className="overflow-hidden rounded-2xl border border-neutral-300 bg-white">
      {post.imageUrl
        ? (
            <Image
              source={{ uri: post.imageUrl }}
              className="aspect-video w-full bg-neutral-200"
              contentFit="cover"
              cachePolicy="memory-disk"
              accessibilityLabel={post.title}
            />
          )
        : null}
      <View className="p-5">
        {meta
          ? (
              <Text className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase">
                {meta}
              </Text>
            )
          : null}
        <Text className="mt-3 font-sans text-3xl/9 font-semibold text-neutral-950">
          {post.title}
        </Text>
        <PostAuthor post={post} />
        <View className="mt-4 flex-row items-center gap-4 border-b border-neutral-200 pb-5">
          <PostLikeControl post={post} onToggleLike={onToggleLike} likePending={likePending} />
          <Text className="font-sans text-xs text-neutral-500">
            {formatCount(post.commentCount, 'comment', 'comments')}
          </Text>
        </View>
        <View className="mt-5">
          {circleDocHasContent(hydratedDoc)
            ? <CircleTiptapRenderer doc={hydratedDoc} onOpenUrl={onOpenUrl} />
            : (
                <Text className="font-sans text-base/6 text-neutral-900">
                  {post.bodyText ?? 'This post has no readable content yet.'}
                </Text>
              )}
        </View>
      </View>
    </View>
  );
}

export function MemberPostView({
  post,
  contentState,
  isLoading = false,
  onOpenUrl,
  onRetry,
  onToggleLike,
  likePending,
  comments,
  commentsUnavailable = false,
  onSubmitComment,
  commentSubmitting,
  commentError,
  onDeleteComment,
  pendingDeleteCommentId,
  onLongPressComment,
}: MemberPostViewProps) {
  // The route renders under a native stack header, so the KeyboardAvoidingView's
  // own frame (measured relative to its parent, not the screen) undercounts the
  // space the header takes up. Without this offset the composer stays partly
  // hidden behind the keyboard instead of being pushed fully above it.
  // Falls back to 0 outside a navigator header context (e.g. unit tests).
  const headerHeight = React.use(HeaderHeightContext) ?? 0;

  if (isLoading && !post) {
    return (
      <View testID="member-post-loading" className="flex-1 items-center justify-center bg-neutral-100">
        <ActivityIndicator color="#6D28D9" />
        <Text className="mt-3 font-sans text-sm text-neutral-600">Loading post…</Text>
      </View>
    );
  }

  if (!post) {
    return <PostUnavailable onRetry={onRetry} />;
  }

  const hydratedDoc = hydrateCircleDoc({
    body: post.tiptapDoc,
    sgids_to_object_map: post.embeds,
    inline_attachments: post.inlineAttachments,
  });
  const meta = [post.spaceName, formatMemberContentDate(post.createdAt)]
    .filter(Boolean)
    .join(' · ');
  const showComments = comments !== undefined || commentsUnavailable;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior="padding"
      keyboardVerticalOffset={headerHeight}
    >
      <ScrollView
        className="flex-1 bg-neutral-100"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 48 }}
      >
        {contentState === 'saved'
          ? (
              <View className="mb-4 rounded-xl border border-violet-300 bg-violet-50 px-4 py-3">
                <Text className="font-sans text-sm font-medium text-violet-900">
                  Showing saved content
                </Text>
              </View>
            )
          : null}

        <PostCard
          post={post}
          meta={meta}
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
      <Stack.Screen
        options={{
          headerRight: postData
            ? () => (
                <PostOverflowMenu
                  scope={scope}
                  postId={postData.id}
                  spaceId={postData.spaceId}
                  isOwn={postData.isOwn ?? false}
                  onReportPost={reportPost}
                  onDeleted={() => router.back()}
                />
              )
            : undefined,
        }}
      />
      <MemberPostView
        post={post.data}
        contentState={post.contentState}
        isLoading={post.isLoading}
        onOpenUrl={url => void Linking.openURL(url)}
        onRetry={() => void post.refetch()}
        onToggleLike={(likedPostId, liked) => like.toggleLike({ postId: likedPostId, liked })}
        likePending={like.isPending}
        comments={comments.data?.comments}
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
