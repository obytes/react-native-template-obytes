import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { client, getQueryKey } from '../common';
import type { Post } from './types';

type Params = { id: number };
type Response = Post;

function getPost({ id }: Params): Promise<Response> {
  return client({
    url: `posts/${id}`,
    method: 'GET',
  }).then((response) => response.data);
}

export function usePost(
  params: Params,
  config?: UseQueryOptions<Response, AxiosError>
) {
  const queryKey = getQueryKey<Params>('post', params);
  return useQuery<Response, AxiosError>(
    queryKey,
    () => getPost(params),
    config
  );
}
