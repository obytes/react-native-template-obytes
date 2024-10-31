import type { AxiosError } from 'axios';
import axios from 'axios';
import { createMutation } from 'react-query-kit';

import { Env } from '@/core/env';

import type { Post } from './types';

type Variables = { title: string; body: string; userId: number };
type Response = Post;

export const useAddPost = createMutation<Response, Variables, AxiosError>({
  mutationFn: async (variables) =>
    axios({
      url: `${Env.API_URL}posts/add`,
      method: 'POST',
      data: variables,
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => response.data),
});
