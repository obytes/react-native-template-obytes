import type { DrizzleDB, Transaction } from '../_shared/types';

import { eq } from 'drizzle-orm';
import { transactions } from '../../schema';

export function findAllTransactions(db: DrizzleDB): Transaction[] {
  return db.select().from(transactions).all();
}

export function findTransactionById(
  db: DrizzleDB,
  id: string,
): Transaction | undefined {
  return db.select().from(transactions).where(eq(transactions.id, id)).get();
}

export function findTransactionsByBudget(
  db: DrizzleDB,
  budgetId: string,
): Transaction[] {
  return db
    .select()
    .from(transactions)
    .where(eq(transactions.budgetId, budgetId))
    .all();
}
