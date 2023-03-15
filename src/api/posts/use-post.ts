import type { AxiosError } from 'axios';
import { createQuery } from 'react-query-kit';

import { client } from '../common';
import type { Post } from './types';

type Variables = { id: number };
type Response = Post;

export const usePost = createQuery<Response, Variables, AxiosError>(
  'posts',
  ({ queryKey: [primaryKey, variables] }) => {
    return client
      .get(`${primaryKey}/${variables.id}`)
      .then((response) => response.data);
  }
);
