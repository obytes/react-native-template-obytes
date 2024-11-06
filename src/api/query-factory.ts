import {
  createQueryKeys,
  mergeQueryKeys,
} from '@lukemorales/query-key-factory';

import { cartKeys } from './carts/query-keys';

export const postKeys = createQueryKeys('posts', {
  list: (filters) => [filters],
  detail: (id) => ({
    queryKey: [id],
    contextQueries: {
      comments: {
        queryKey: null,
      },
    },
  }),
});

export const queryFactory = mergeQueryKeys(postKeys, cartKeys);
