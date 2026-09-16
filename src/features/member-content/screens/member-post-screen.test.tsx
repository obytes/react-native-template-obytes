import type { MemberPostDetail, PostComment } from '@/features/member-content/types';

import { HeaderHeightContext } from '@react-navigation/elements';
import { fireEvent, render, screen } from '@testing-library/react-native';
import * as React from 'react';
import { Alert } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

import { PostOverflowMenu } from '@/features/community-posting/components/post-overflow-menu';
import { MemberPostView } from '@/features/member-content/screens/member-post-screen';

jest.mock('@/components/ui', () => ({
  Image: 'Image',
}));

jest.mock('@/components/ui/screen-layout', () => ({
  useScreenTopPadding: () => 70,
  useScreenBottomPadding: () => 34,
}));

jest.mock('react-native-webview', () => ({
  WebView: 'WebView',
}));

jest.mock('@/components/ui/modal', () => {
  const RN = jest.requireActual('react-native');
  return {
    Modal: ({ children }: { children: React.ReactNode }) => <RN.View>{children}</RN.View>,
    useModal: () => ({ ref: { current: null }, present: jest.fn(), dismiss: jest.fn() }),
  };
});

const mockRemove = jest.fn();
let mockDeletePending = false;

jest.mock('@/features/community-posting/api/use-delete-post', () => ({
  useDeletePost: () => ({ remove: (...args: unknown[]) => mockRemove(...args), isPending: mockDeletePending }),
}));

const SCOPE = { organizationId: 'org-1', memberId: 'member-1' };

const POST: MemberPostDetail = {
  id: 'post-1',
  spaceId: 'space-1',
  title: 'Laska morning update',
  bodyHtml: null,
  bodyText: 'Plain text fallback',
  imageUrl: null,
  tiptapDoc: {
    type: 'doc',
    content: [{
      type: 'paragraph',
      content: [{ type: 'text', text: 'Native rich content' }],
    }],
  },
  embeds: {},
  inlineAttachments: [],
  authorName: 'Rionna Racing',
  authorAvatarUrl: 'https://images.example/author.jpg',
  spaceName: 'Laska',
  createdAt: '2026-07-13T08:00:00.000Z',
  commentCount: 2,
  likeCount: 5,
  isLiked: false,
  url: null,
};

describe('memberPostView', () => {
  it('renders hydrated TipTap content natively with read-only counts', () => {
    render(<MemberPostView post={POST} contentState="fresh" />);

    expect(screen.getByText('Native rich content')).toBeOnTheScreen();
    expect(screen.queryByText('Plain text fallback')).not.toBeOnTheScreen();
    expect(screen.getByText('5 likes')).toBeOnTheScreen();
    expect(screen.getByText('2 comments')).toBeOnTheScreen();
    expect(screen.getByLabelText('Rionna Racing avatar')).toBeOnTheScreen();
  });

  it('falls back to body text when the TipTap document is unusable', () => {
    render(
      <MemberPostView
        post={{ ...POST, tiptapDoc: null, bodyText: 'Readable saved update' }}
        contentState="saved"
      />,
    );

    expect(screen.getByText('Showing saved content')).toBeOnTheScreen();
    expect(screen.getByText('Readable saved update')).toBeOnTheScreen();
  });

  it('renders a retry action when the post is unavailable', () => {
    const onRetry = jest.fn();
    render(
      <MemberPostView
        post={undefined}
        contentState="unavailable"
        onRetry={onRetry}
      />,
    );
    fireEvent.press(screen.getByRole('button', { name: 'Retry post' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('likes the post from the heart control', () => {
    const onToggleLike = jest.fn();
    render(<MemberPostView post={POST} contentState="fresh" onToggleLike={onToggleLike} />);

    fireEvent.press(screen.getByLabelText('Like post'));
    expect(onToggleLike).toHaveBeenCalledWith('post-1', true);
  });

  it('unlikes a liked post and disables the heart while in flight', () => {
    const onToggleLike = jest.fn();
    render(
      <MemberPostView
        post={{ ...POST, isLiked: true }}
        contentState="fresh"
        onToggleLike={onToggleLike}
        likePending
      />,
    );

    fireEvent.press(screen.getByLabelText('Unlike post'));
    expect(onToggleLike).not.toHaveBeenCalled();
  });

  it('keeps the like count read-only when no handler is wired', () => {
    render(<MemberPostView post={POST} contentState="fresh" />);
    expect(screen.queryByLabelText('Like post')).not.toBeOnTheScreen();
    expect(screen.getByText('5 likes')).toBeOnTheScreen();
  });

  it('renders the loading state', () => {
    render(
      <MemberPostView
        post={undefined}
        contentState="unavailable"
        isLoading={true}
      />,
    );
    expect(screen.getByTestId('member-post-loading')).toBeOnTheScreen();
  });
});

function comment(overrides: Partial<PostComment> = {}): PostComment {
  return {
    id: 'c-1',
    parentCommentId: null,
    bodyText: 'What a run!',
    tiptapDoc: null,
    authorName: 'Jane Member',
    authorAvatarUrl: null,
    createdAt: '2026-07-27T10:00:00.000Z',
    likeCount: 0,
    isLiked: false,
    canDelete: false,
    replies: [],
    ...overrides,
  };
}

describe('memberPostView comments', () => {
  it('renders comments with authors and one level of replies', () => {
    render(
      <MemberPostView
        post={POST}
        contentState="fresh"
        comments={[
          comment({
            replies: [comment({ id: 'r-1', parentCommentId: 'c-1', bodyText: 'Agreed!', authorName: 'Sam' })],
          }),
          comment({ id: 'c-2', bodyText: 'Great going.', authorName: 'Pat Owner' }),
        ]}
      />,
    );
    expect(screen.getByText('What a run!')).toBeOnTheScreen();
    expect(screen.getByText('Jane Member')).toBeOnTheScreen();
    expect(screen.getByText('Agreed!')).toBeOnTheScreen();
    expect(screen.getByText('Great going.')).toBeOnTheScreen();
  });

  it('shows the empty state when there are no comments yet', () => {
    render(<MemberPostView post={POST} contentState="fresh" comments={[]} />);
    expect(screen.getByText('No comments yet')).toBeOnTheScreen();
  });

  it('shows the unavailable state when comments failed to load', () => {
    render(
      <MemberPostView post={POST} contentState="fresh" commentsUnavailable />,
    );
    expect(screen.getByTestId('post-comments-unavailable')).toBeOnTheScreen();
  });

  it('submits the composer text and ignores empty submissions', () => {
    const onSubmitComment = jest.fn();
    render(
      <MemberPostView
        post={POST}
        contentState="fresh"
        comments={[]}
        onSubmitComment={onSubmitComment}
      />,
    );

    fireEvent.press(screen.getByLabelText('Send comment'));
    expect(onSubmitComment).not.toHaveBeenCalled();

    fireEvent.changeText(screen.getByLabelText('Write a comment'), '  Well done!  ');
    fireEvent.press(screen.getByLabelText('Send comment'));
    expect(onSubmitComment).toHaveBeenCalledWith('post-1', 'Well done!');
  });

  it('disables the composer while a comment is submitting', () => {
    const onSubmitComment = jest.fn();
    render(
      <MemberPostView
        post={POST}
        contentState="fresh"
        comments={[]}
        onSubmitComment={onSubmitComment}
        commentSubmitting
      />,
    );
    fireEvent.changeText(screen.getByLabelText('Write a comment'), 'Hi');
    fireEvent.press(screen.getByLabelText('Send comment'));
    expect(onSubmitComment).not.toHaveBeenCalled();
  });

  it('offers delete only on the member own comments', () => {
    const onDeleteComment = jest.fn();
    render(
      <MemberPostView
        post={POST}
        contentState="fresh"
        comments={[comment({ canDelete: true }), comment({ id: 'c-2', bodyText: 'Not mine' })]}
        onDeleteComment={onDeleteComment}
      />,
    );
    const deleteButtons = screen.getAllByLabelText('Delete comment');
    expect(deleteButtons).toHaveLength(1);
    fireEvent.press(deleteButtons[0]!);
    expect(onDeleteComment).toHaveBeenCalledWith('post-1', 'c-1');
  });

  it('renders no comments section when the feature is not wired', () => {
    render(<MemberPostView post={POST} contentState="fresh" />);
    expect(screen.queryByText('No comments yet')).not.toBeOnTheScreen();
    expect(screen.queryByLabelText('Write a comment')).not.toBeOnTheScreen();
  });
});

describe('memberPostView keyboard avoidance', () => {
  it('offsets the composer by the native header height so the keyboard does not cover it', () => {
    render(
      <HeaderHeightContext value={88}>
        <MemberPostView post={POST} contentState="fresh" comments={[]} />
      </HeaderHeightContext>,
    );

    const avoidingView = screen.UNSAFE_getByType(KeyboardAvoidingView);
    expect(avoidingView.props.behavior).toBe('padding');
    expect(avoidingView.props.keyboardVerticalOffset).toBe(88);
  });

  it('falls back to a zero keyboard offset outside a navigator header context', () => {
    render(<MemberPostView post={POST} contentState="fresh" comments={[]} />);

    const avoidingView = screen.UNSAFE_getByType(KeyboardAvoidingView);
    expect(avoidingView.props.keyboardVerticalOffset).toBe(0);
  });
});

describe('memberPostView blocked comments', () => {
  it('shows the blocked copy and keeps the composer text instead of clearing it', () => {
    const onSubmitComment = jest.fn();
    const { rerender } = render(
      <MemberPostView
        post={POST}
        contentState="fresh"
        comments={[]}
        onSubmitComment={onSubmitComment}
        commentError={null}
      />,
    );

    fireEvent.changeText(screen.getByLabelText('Write a comment'), 'Bad words here');
    fireEvent.press(screen.getByLabelText('Send comment'));
    expect(onSubmitComment).toHaveBeenCalledWith('post-1', 'Bad words here');

    rerender(
      <MemberPostView
        post={POST}
        contentState="fresh"
        comments={[]}
        onSubmitComment={onSubmitComment}
        commentError="blocked"
      />,
    );

    expect(screen.getByText('Our auto-moderation held back this comment. Please edit it and try again.')).toBeOnTheScreen();
    expect(screen.getByLabelText('Write a comment').props.value).toBe('Bad words here');
  });

  it('shows no inline copy for a plain failure', () => {
    render(
      <MemberPostView
        post={POST}
        contentState="fresh"
        comments={[]}
        onSubmitComment={jest.fn()}
        commentError="failed"
      />,
    );
    expect(screen.queryByText('Our auto-moderation held back this comment. Please edit it and try again.')).not.toBeOnTheScreen();
  });
});

describe('memberPostView comment long-press', () => {
  it('reports the pressed comment via the long-press handler', () => {
    const onLongPressComment = jest.fn();
    render(
      <MemberPostView
        post={POST}
        contentState="fresh"
        comments={[comment()]}
        onLongPressComment={onLongPressComment}
      />,
    );

    fireEvent(screen.getByLabelText('Comment by Jane Member'), 'longPress');
    expect(onLongPressComment).toHaveBeenCalledWith('post-1', expect.objectContaining({ id: 'c-1' }));
  });
});

describe('postOverflowMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDeletePending = false;
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  it('offers Delete post only when the member owns the post', () => {
    render(
      <PostOverflowMenu
        scope={SCOPE}
        postId="post-1"
        spaceId="space-1"
        isOwn={false}
        onReportPost={jest.fn()}
        onDeleted={jest.fn()}
      />,
    );
    expect(screen.getByLabelText('Report post')).toBeOnTheScreen();
    expect(screen.queryByLabelText('Delete post')).not.toBeOnTheScreen();
  });

  it('shows Delete post for the member own post and calls onReportPost for Report post', () => {
    const onReportPost = jest.fn();
    render(
      <PostOverflowMenu
        scope={SCOPE}
        postId="post-1"
        spaceId="space-1"
        isOwn
        onReportPost={onReportPost}
        onDeleted={jest.fn()}
      />,
    );
    expect(screen.getByLabelText('Delete post')).toBeOnTheScreen();

    fireEvent.press(screen.getByLabelText('Report post'));
    expect(onReportPost).toHaveBeenCalledTimes(1);
  });

  it('confirms before deleting, then removes the post and calls onDeleted on success', () => {
    mockRemove.mockResolvedValue(true);
    const onDeleted = jest.fn();
    render(
      <PostOverflowMenu
        scope={SCOPE}
        postId="post-1"
        spaceId="space-1"
        isOwn
        onReportPost={jest.fn()}
        onDeleted={onDeleted}
      />,
    );

    fireEvent.press(screen.getByLabelText('Delete post'));
    expect(Alert.alert).toHaveBeenCalledWith(
      'Delete this post?',
      expect.any(String),
      expect.arrayContaining([
        expect.objectContaining({ text: 'Cancel' }),
        expect.objectContaining({ text: 'Delete', style: 'destructive' }),
      ]),
    );

    const [, , buttons] = (Alert.alert as jest.Mock).mock.calls[0];
    const deleteButton = buttons.find((button: { text: string }) => button.text === 'Delete');
    deleteButton.onPress();

    expect(mockRemove).toHaveBeenCalledWith({ spaceId: 'space-1', postId: 'post-1' });
  });

  it('shows a failure alert when the delete does not succeed', async () => {
    mockRemove.mockResolvedValue(false);
    const onDeleted = jest.fn();
    render(
      <PostOverflowMenu
        scope={SCOPE}
        postId="post-1"
        spaceId="space-1"
        isOwn
        onReportPost={jest.fn()}
        onDeleted={onDeleted}
      />,
    );

    fireEvent.press(screen.getByLabelText('Delete post'));
    const [, , buttons] = (Alert.alert as jest.Mock).mock.calls[0];
    const deleteButton = buttons.find((button: { text: string }) => button.text === 'Delete');
    await deleteButton.onPress();

    expect(onDeleted).not.toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalledWith('Couldn\'t delete that post. Try again.');
  });
});
