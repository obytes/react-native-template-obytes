import type { DrizzleDB } from '../_shared/types';

import { eq } from 'drizzle-orm';
import { currencies } from '../../schema';
import { countAccountsByCurrency } from './currency.queries';

export function enableCurrency(db: DrizzleDB, id: string): void {
  db.update(currencies).set({ isEnabled: 1 }).where(eq(currencies.id, id)).run();
}

export function disableCurrency(db: DrizzleDB, id: string): void {
  const count = countAccountsByCurrency(db, id);
  if (count > 0)
    throw new Error(`Cannot disable currency: ${count} account(s) use it`);
  db.update(currencies).set({ isEnabled: 0 }).where(eq(currencies.id, id)).run();
}

export function setDefaultCurrency(db: DrizzleDB, id: string): void {
  db.transaction((tx) => {
    tx.update(currencies).set({ isDefault: 0 }).where(eq(currencies.isDefault, 1)).run();
    tx.update(currencies).set({ isDefault: 1, isEnabled: 1 }).where(eq(currencies.id, id)).run();
  });
}

export function updateExchangeRate(db: DrizzleDB, id: string, rate: number): void {
  db.update(currencies).set({ exchangeRate: rate }).where(eq(currencies.id, id)).run();
}
