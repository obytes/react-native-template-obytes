import {
  createQueryKeys,
  mergeQueryKeys,
} from '@lukemorales/query-key-factory';

type Filters = {
  limit?: number;
  offset?: number;
};
export const postKeys = createQueryKeys('posts', {
  list: (filters: Filters) => [filters],
  detail: (id) => ({
    queryKey: [id],
    contextQueries: {
      comments: {
        queryKey: null,
      },
    },
  }),
});

const productsKeys = createQueryKeys('products', {
  list: (filters) => [filters],
  detail: (id) => [id],
});

export const queryFactory = mergeQueryKeys(postKeys, productsKeys);
