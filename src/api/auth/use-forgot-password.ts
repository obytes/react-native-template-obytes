import { createMutation } from 'react-query-kit';

import { client } from '../common';

type Variables = {
  email: string;
};

type Response = {
  message: string;
};

const sendForgotPasswordInstructions = async (variables: Variables) => {
  const { data } = await client({
    url: 'auth/forgot-password', // Dummy endpoint for forgot password
    method: 'POST',
    data: {
      email: variables.email,
    },
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return data;
};

export const useForgotPassword = createMutation<Response, Variables>({
  mutationFn: (variables) => sendForgotPasswordInstructions(variables),
});
