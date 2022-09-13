import type { UseInfiniteQueryOptions } from '@tanstack/react-query';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import type { CharityProject } from '../charities/types';
import {
  client,
  DEFAULT_LIMIT,
  getNextPageParam,
  getQueryKey,
} from '../common';
import type { PaginateQuery } from '../types';

type Params = {
  pageParam?: number;
};

type Response = PaginateQuery<CharityProject>;

function getProjects({ pageParam }: Params): Promise<Response> {
  return client({
    url: `/charity/projects/`,
    method: 'GET',
    params: {
      limit: DEFAULT_LIMIT,
      offset: pageParam,
    },
  }).then((response) => response.data);
}

export function useProjectsInfinite(
  config?: UseInfiniteQueryOptions<Response, AxiosError>
) {
  const queryKey = getQueryKey('projects');
  return useInfiniteQuery<Response, AxiosError>(
    queryKey,
    ({ pageParam = 0 }) => getProjects({ pageParam }),
    { ...config, getNextPageParam }
  );
}
