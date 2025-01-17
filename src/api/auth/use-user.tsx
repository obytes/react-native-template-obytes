import { createMutation, createQuery } from 'react-query-kit';

import { client } from '../common';

export type User = {
  id: number;
  name: string;
  email: string;
  picture: string | null;
  birthday: Date | null;
};

export type DeleteUserVariables = {
  email: string;
};

const getUser = async () => {
  const { data } = await client({
    url: '/v1/users',
    method: 'GET',
  });
  return data;
};

const deleteUser = async (variables: DeleteUserVariables) => {
  const { data } = await client.delete('/v1/users', {
    data: variables,
  });
  return data;
};

export const useUser = createQuery<User>({
  queryKey: ['getUser'],
  fetcher: getUser,
});

export const useDeleteUser = createMutation<{}, DeleteUserVariables>({
  mutationFn: deleteUser,
});
