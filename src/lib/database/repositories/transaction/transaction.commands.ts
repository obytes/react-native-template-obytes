import type { DrizzleDB, NewTransaction, Transaction } from '../_shared/types';
import { eq } from 'drizzle-orm';

import { randomUUID } from 'expo-crypto';
import { transactions } from '../../schema';

type CreateTransactionInput = Omit<NewTransaction, 'id' | 'createdAt' | 'updatedAt'>;

export function createTransaction(
  db: DrizzleDB,
  data: CreateTransactionInput,
): Transaction {
  const now = new Date().toISOString();
  const result = db
    .insert(transactions)
    .values({ id: randomUUID(), ...data, createdAt: now, updatedAt: now })
    .returning()
    .get();
  if (!result)
    throw new Error('Failed to create transaction');
  return result;
}

type UpdateTransactionInput = Partial<Omit<NewTransaction, 'id' | 'createdAt'>>;

export function updateTransaction(
  db: DrizzleDB,
  id: string,
  data: UpdateTransactionInput,
): Transaction {
  const now = new Date().toISOString();
  const result = db
    .update(transactions)
    .set({ ...data, updatedAt: now })
    .where(eq(transactions.id, id))
    .returning()
    .get();
  if (!result)
    throw new Error(`Transaction ${id} not found`);
  return result;
}

export function deleteTransaction(db: DrizzleDB, id: string): void {
  db.delete(transactions).where(eq(transactions.id, id)).run();
}
