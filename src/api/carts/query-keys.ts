import { createQueryKeys } from '@lukemorales/query-key-factory';

export const cartKeys = createQueryKeys('carts', {
  list: (filters) => [filters],
  detail: (id) => [id],
});
