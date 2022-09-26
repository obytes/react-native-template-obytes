import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { client, getQueryKey } from '../common';
export type Post = {
  userId: number;
  id: number;
  title: string;
  body: string;
};
type Response = Post[];

function getPosts(): Promise<Response> {
  return client({
    url: `posts`,
    method: 'GET',
  }).then((response) => response.data.posts);
}

export function usePosts(config?: UseQueryOptions<Response, AxiosError>) {
  const queryKey = getQueryKey('posts');
  return useQuery<Response, AxiosError>(queryKey, getPosts, config);
}
