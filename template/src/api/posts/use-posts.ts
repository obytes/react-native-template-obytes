import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { client, getQueryKey } from '../common';
import type { Post } from './types';

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
