import { useInfiniteQuery } from '@tanstack/react-query';

import { client } from '../common';
import { cartKeys } from './query-keys';

type Variables = {
  limit?: number | string;
  offset?: number | string;
};

const DEFAULT_LIMIT = 10;
const DEFAULT_OFFSET = 0;

const getCarts = async ({
  limit = DEFAULT_LIMIT,
  offset = DEFAULT_OFFSET,
}: Variables) => {
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  }).toString();
  const { data } = await client.get(`carts?${params}`);
  return { data, offset: Number(offset), limit: Number(limit) };
};

export const useCarts = (variables: Variables) =>
  useInfiniteQuery({
    ...cartKeys.list(variables),
    queryFn: () => getCarts(variables),
    initialPageParam: { offset: DEFAULT_OFFSET, limit: DEFAULT_LIMIT },
    getNextPageParam: (lastPage) => {
      const { offset, limit } = lastPage;
      return { offset: offset + limit, limit };
    },
  });
