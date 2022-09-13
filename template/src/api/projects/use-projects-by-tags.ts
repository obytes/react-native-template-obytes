import type { UseInfiniteQueryOptions } from '@tanstack/react-query';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import {
  client,
  DEFAULT_LIMIT,
  getNextPageParam,
  getQueryKey,
} from '../common';
import type { PaginateQuery } from '../types';
import type { CharityTag } from './types';

type Params = {
  pageParam?: number;
};

type Response = PaginateQuery<CharityTag>;

function getProjectsByType({ pageParam }: Params): Promise<Response> {
  return client({
    url: '/charity/tags/',
    method: 'GET',
    params: {
      limit: DEFAULT_LIMIT,
      offset: pageParam,
    },
  }).then((response) => response.data);
}

export function useProjectsByTagsInfinite(
  config?: UseInfiniteQueryOptions<Response, AxiosError>
) {
  const queryKey = getQueryKey('projects-by-type');
  return useInfiniteQuery<Response, AxiosError>(
    queryKey,
    ({ pageParam = 0 }) => getProjectsByType({ pageParam }),
    { ...config, getNextPageParam }
  );
}
