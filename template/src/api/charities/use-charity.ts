import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { client, getQueryKey } from '../common';
import type { Charity } from './types';

type Params = {
  id: number;
};

function getCharity({ id }: Params): Promise<Charity> {
  return client({
    url: `charity/charity/${id}/`,
    method: 'GET',
  }).then((response) => response.data);
}

export function useCharity(
  params: Params,
  config?: UseQueryOptions<Charity, AxiosError>
) {
  const queryKey = getQueryKey<Params>('charity', params);
  return useQuery<Charity, AxiosError>(
    queryKey,
    () => getCharity(params),
    config
  );
}
