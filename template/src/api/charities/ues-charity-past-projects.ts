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
import type { CharityProject } from './types';

type Params = {
  id: string;
  pageParam?: number;
};

type Response = PaginateQuery<CharityProject>;

function getCharityPastProjects({ id, pageParam }: Params): Promise<Response> {
  return client({
    url: `/charities/${id}/past-projects`,
    method: 'GET',
    params: {
      limit: DEFAULT_LIMIT,
      offset: pageParam,
    },
  }).then((response) => response.data);
}

export function useCharityPastProjectsInfinite(
  params: Params,
  config?: UseInfiniteQueryOptions<Response, AxiosError>
) {
  const queryKey = getQueryKey('charity-past-projects', params);
  return useInfiniteQuery<Response, AxiosError>(
    queryKey,
    ({ pageParam = 0 }) => getCharityPastProjects({ ...params, pageParam }),
    { ...config, getNextPageParam }
  );
}
