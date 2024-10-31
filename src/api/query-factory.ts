import {
  createQueryKeys,
  type inferQueryKeyStore,
  mergeQueryKeys,
} from '@lukemorales/query-key-factory';

// separate query keys for each service
import { cartKeys } from './carts/query-keys';
import { client } from './common';

const getPostComments = async (id: string) => {
  const { data } = await client.get(`posts/${id}/comments`);
  return data;
};

export const postKeys = createQueryKeys('posts', {
  list: (filters) => ['posts', filters],
  // list: null, // if we don't want to pass any filters
  // detail: (id) => [id], // option one
  detail: (id) => ({
    queryKey: [id], // [post, detail, id]
    contextQueries: {
      // comments become part of the contextQueries query key [post, detail, id, comments]
      comments: {
        queryKey: null,
        queryFn: () => getPostComments(id),
      },
    },
  }), // option two
  comments: (id) => [id], // [posts, id, comments]
});

export type QueryKeys = inferQueryKeyStore<typeof queryFactory>;
export const queryFactory = mergeQueryKeys(postKeys, cartKeys);
