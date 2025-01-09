import { createMutation } from 'react-query-kit';

import { client } from '../common';

type Variables = {
  email: string;
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
    url: '/v1/users/sign_in',
    method: 'POST',
    data: {
      user: {
        email: variables.email,
        password: variables.password,
      },
    },
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return data;
};

export const useLogin = createMutation<Response, Variables>({
  mutationFn: (variables) => login(variables),
});
