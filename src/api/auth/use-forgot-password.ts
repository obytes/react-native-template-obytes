import { createMutation } from 'react-query-kit';

import { client } from '../common';

type Variables = {
  email: string;
};

type Response = {
  message: string;
};

// Should be replaced with the app's web url.
const redirectUrl = 'https://example.com';

const sendForgotPasswordInstructions = async (variables: Variables) => {
  const { data } = await client({
    url: '/v1/users/password', // Dummy endpoint for forgot password
    method: 'POST',
    data: {
      email: variables.email,
      redirect_url: redirectUrl,
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
