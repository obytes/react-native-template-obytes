import { createQueryKeys } from '@lukemorales/query-key-factory';

export const cartKeys = createQueryKeys('carts', {
  list: (filters) => ['carts', filters],
  detail: (id) => [id],
});
