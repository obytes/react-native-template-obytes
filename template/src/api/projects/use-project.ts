import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import type { CharityProject } from '../charities/types';
import { client, getQueryKey } from '../common';

type Params = {
  id: number;
};

function getProject({ id }: Params): Promise<CharityProject> {
  return client({
    url: `/charity/projects/${id}/`,
    method: 'GET',
  }).then((response) => response.data);
}

export function useProject(
  { id }: Params,
  config?: UseQueryOptions<CharityProject, AxiosError>
) {
  const queryKey = getQueryKey<Params>('project', { id });
  return useQuery<CharityProject, AxiosError>(
    queryKey,
    () => getProject({ id }),
    config
  );
}
