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
};

type Response = PaginateQuery<Charity>;

function getCharities({ pageParam }: Params): Promise<Response> {
  return client({
    url: '/charity/charity/',
    method: 'GET',
    params: {
      limit: DEFAULT_LIMIT,
      offset: pageParam,
    },
  }).then((response) => response.data);
}

export function useCharitiesInfinite(
  config?: UseInfiniteQueryOptions<Response, AxiosError>
) {
  const queryKey = getQueryKey('charities');
  return useInfiniteQuery<Response, AxiosError>(
    queryKey,
    ({ pageParam = 0 }) => getCharities({ pageParam }),
    { ...config, getNextPageParam }
  );
}
