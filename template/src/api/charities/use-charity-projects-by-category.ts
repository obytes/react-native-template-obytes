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
import type { Charity } from './types';

type Params = {
  pageParam?: number;
  id: number;
  categoryId: number;
};

type Response = PaginateQuery<Charity>;

function getCharityProjectsByCategory({
  pageParam,
  id,
  categoryId,
}: Params): Promise<Response> {
  return client({
    url: `/charity/projects/?categories=${categoryId}&charity=${id}`,
    method: 'GET',
    params: {
      limit: DEFAULT_LIMIT,
      offset: pageParam,
    },
  }).then((response) => response.data);
}

export function useCharityProjectsByCategoryInfinite(
  params: Params,
  config?: UseInfiniteQueryOptions<Response, AxiosError>
) {
  const queryKey = getQueryKey('charity-projects-by-category', params);
  return useInfiniteQuery<Response, AxiosError>(
    queryKey,
    ({ pageParam = 0 }) =>
      getCharityProjectsByCategory({ ...params, pageParam }),
    { ...config, getNextPageParam }
  );
}
