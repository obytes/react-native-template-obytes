import { createQuery } from 'react-query-kit';

import { client } from '../common';

export type User = {
  id: number;
  name: string;
  email: string;
  picture: string | null;
  birthday: Date | null;
};

const getUser = async () => {
  const { data } = await client({
    url: '/v1/users',
    method: 'GET',
  });
  return data;
};

export const useUser = createQuery<User>({
  queryKey: ['getUser'],
  fetcher: getUser,
});
