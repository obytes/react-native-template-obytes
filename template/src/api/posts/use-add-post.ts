import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { client } from '../common';
import type { Post } from './types';

type Input = { title: string; body: string; userId: number };

type Response = Post;

const addPost = (input: Input): Promise<Response> => {
  return client({
    url: 'posts/add',
    method: 'POST',
    data: input,
  }).then((response) => response.data);
};

export function useAddPost(
  config?: UseMutationOptions<Response, AxiosError, Input>
) {
  return useMutation<Response, AxiosError, Input>(addPost, config);
}
