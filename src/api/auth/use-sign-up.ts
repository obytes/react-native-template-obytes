import { createMutation } from 'react-query-kit';

import { client } from '../common';

type Variables = {
  email: string;
  name: string;
  password: string;
  passwordConfirmation: string;
};

type Response = {
  status: string;
  data: {
    id: string;
    email: string;
    name: string;
    provider: string;
    uid: string;
    allowPasswordChange: boolean;
    createdAt: string;
    updatedAt: string;
    nickname?: string;
    image?: string;
    birthday?: string;
  };
};

const signUp = async (variables: Variables) => {
  const { data } = await client({
    url: '/v1/users',
    method: 'POST',
    data: {
      user: variables,
    },
  });

  return data;
};

export const useSignUp = createMutation<Response, Variables>({
  mutationFn: (variables) => signUp(variables),
});
