import type { Currency, DrizzleDB } from '../_shared/types';

import { eq, sql } from 'drizzle-orm';

import { accounts, currencies } from '../../schema';

export function findAllCurrencies(db: DrizzleDB): Currency[] {
  return db.select().from(currencies).all();
}

export function findEnabledCurrencies(db: DrizzleDB): Currency[] {
  return db.select().from(currencies).where(eq(currencies.isEnabled, 1)).all();
}

export function findDefaultCurrency(db: DrizzleDB): Currency | undefined {
  return db.select().from(currencies).where(eq(currencies.isDefault, 1)).get();
}

export function findCurrencyById(db: DrizzleDB, id: string): Currency | undefined {
  return db.select().from(currencies).where(eq(currencies.id, id)).get();
}

export function countAccountsByCurrency(db: DrizzleDB, currencyId: string): number {
  const result = db
    .select({ count: sql<number>`count(*)` })
    .from(accounts)
    .where(eq(accounts.currencyId, currencyId))
    .get();
  return result?.count ?? 0;
}
