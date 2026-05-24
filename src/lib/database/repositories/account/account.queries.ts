import type { Account, DrizzleDB } from '../_shared/types';

import { eq } from 'drizzle-orm';
import { accounts } from '../../schema';

export function findAllAccounts(db: DrizzleDB): Account[] {
  return db.select().from(accounts).all();
}

export function findAccountById(db: DrizzleDB, id: string): Account | undefined {
  return db.select().from(accounts).where(eq(accounts.id, id)).get();
}

export function findAccountByCategory(db: DrizzleDB, categoryId: string): Account[] {
  return db.select().from(accounts).where(eq(accounts.accountCategoryId, categoryId)).all();
}

export function findAccountsByStatus(
  db: DrizzleDB,
  status: 'active' | 'inactive',
): Account[] {
  return db.select().from(accounts).where(eq(accounts.status, status)).all();
}
