import type { AccountCategory, DrizzleDB, NewAccountCategory } from '../_shared/types';

import { eq } from 'drizzle-orm';
import { randomUUID } from 'expo-crypto';
import { accountCategories } from '../../schema';

type CreateAccountCategoryInput = Omit<NewAccountCategory, 'id' | 'createdAt'>;

export function createAccountCategory(
  db: DrizzleDB,
  data: CreateAccountCategoryInput,
): AccountCategory {
  const now = new Date().toISOString();
  const result = db
    .insert(accountCategories)
    .values({ id: randomUUID(), ...data, createdAt: now })
    .returning()
    .get();
  if (!result)
    throw new Error('Failed to create account category');
  return result;
}

type UpdateAccountCategoryInput = Partial<Omit<NewAccountCategory, 'id' | 'createdAt'>>;

export function updateAccountCategory(
  db: DrizzleDB,
  id: string,
  data: UpdateAccountCategoryInput,
): AccountCategory {
  const result = db
    .update(accountCategories)
    .set(data)
    .where(eq(accountCategories.id, id))
    .returning()
    .get();
  if (!result)
    throw new Error(`Account category ${id} not found`);
  return result;
}

export function deleteAccountCategory(db: DrizzleDB, id: string): void {
  db.delete(accountCategories).where(eq(accountCategories.id, id)).run();
}
