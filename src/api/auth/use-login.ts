import { createMutation } from 'react-query-kit';

import { client } from '../common';

type Variables = {
  username: string;
  password: string;
  expiresInMins?: number;
};

type Response = {
  id: number;
  username: string;
  email: string;
  accessToken: string;
  refreshToken: string;
};

const login = async (variables: Variables) => {
  const { data } = await client({
    url: 'auth/login',
    method: 'POST',
    data: variables,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return data;
};

export const useLogin = createMutation<Response, Variables, Error>({
  mutationFn: (variables) => login(variables),
});
