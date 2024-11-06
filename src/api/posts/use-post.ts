import type { AxiosError } from 'axios';
import { createQuery } from 'react-query-kit';

import { queryFactory } from '@/api/query-factory';

import { client } from '../common';
import type { Post } from './types';

type Variables = { id: string };
type Response = Post;

const getPosts = async (variables: Variables) => {
  const { data } = await client.get(`posts/${variables.id}`);
  return data;
};

export const usePost = createQuery<Response, Variables, AxiosError>({
  ...queryFactory.posts.detail(1),
  fetcher: getPosts,
});
