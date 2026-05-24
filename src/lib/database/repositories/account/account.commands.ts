import type { Account, DrizzleDB, NewAccount } from '../_shared/types';

import { eq } from 'drizzle-orm';
import { randomUUID } from 'expo-crypto';
import { accounts } from '../../schema';

type CreateAccountInput = Omit<NewAccount, 'id' | 'createdAt' | 'updatedAt'>;

export function createAccount(db: DrizzleDB, data: CreateAccountInput): Account {
  const now = new Date().toISOString();
  const result = db
    .insert(accounts)
    .values({ id: randomUUID(), ...data, createdAt: now, updatedAt: now })
    .returning()
    .get();
  if (!result)
    throw new Error('Failed to create account');
  return result;
}

type UpdateAccountInput = Partial<Omit<NewAccount, 'id' | 'createdAt'>>;

export function updateAccount(
  db: DrizzleDB,
  id: string,
  data: UpdateAccountInput,
): Account {
  const now = new Date().toISOString();
  const result = db
    .update(accounts)
    .set({ ...data, updatedAt: now })
    .where(eq(accounts.id, id))
    .returning()
    .get();
  if (!result)
    throw new Error(`Account ${id} not found`);
  return result;
}

export function deleteAccount(db: DrizzleDB, id: string): void {
  db.delete(accounts).where(eq(accounts.id, id)).run();
}
