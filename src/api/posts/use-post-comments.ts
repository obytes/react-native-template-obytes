import { createQuery } from 'react-query-kit';

import { queryFactory } from '@/api/query-factory';

import { client } from '../common';
import { type Comment } from './types';

type Variables = {
  id: number;
};

type Response = {
  comments: Comment[];
};

const getPostComments = async (id: number) => {
  const { data } = await client.get(`posts/${id}/comments`);
  return data;
};

export const usePostComments = createQuery<Response, Variables>({
  ...queryFactory.posts.detail(1)._ctx.comments,
  fetcher: (variables) => getPostComments(variables.id),
});
