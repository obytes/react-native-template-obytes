import type { AxiosError } from 'axios';
import { createQuery } from 'react-query-kit';

import { queryFactory } from '@/api/query-factory';

import { client } from '../common';
import type { Post } from './types';

type Response = Post[];
type Variables = void; // as react-query-kit is strongly typed, we need to specify the type of the variables as void in case we don't need them

export const usePosts = createQuery<Response, Variables, AxiosError>({
  // old queryKey: ['posts'],
  ...queryFactory.posts.list({}), // this translates to ['posts', filters]
  fetcher: () => client.get(`posts`).then((response) => response.data.posts),
});
