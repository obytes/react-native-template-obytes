import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { createQuery } from 'react-query-kit';

import { queryFactory } from '@/api/query-factory';

import { client } from '../common';
import type { Post } from './types';

type Variables = { id: string };
type Response = Post;

export const usePost = createQuery<Response, Variables, AxiosError>({
  // old queryKey: ['posts', 1],
  // ...queryFactory.posts.get(1), // this translates to ['posts', 1]
  ...queryFactory.posts.detail(1), // this translates to ['posts', 1]
  fetcher: (variables) =>
    client.get(`posts/${variables.id}`).then((response) => response.data),
});

export const usePostComments = (postId: number) =>
  useQuery({
    ...queryFactory.posts.detail(postId)._ctx.comments,
    enabled: !!postId,
  });
