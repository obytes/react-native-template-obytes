import type { AccountCategory, DrizzleDB } from '../_shared/types';

import { eq } from 'drizzle-orm';
import { accountCategories } from '../../schema';

export function findAllAccountCategories(db: DrizzleDB): AccountCategory[] {
  return db.select().from(accountCategories).all();
}

export function findAccountCategoryById(
  db: DrizzleDB,
  id: string,
): AccountCategory | undefined {
  return db.select().from(accountCategories).where(eq(accountCategories.id, id)).get();
}

export function findAccountCategoriesByType(
  db: DrizzleDB,
  type: 'activo' | 'pasivo',
): AccountCategory[] {
  return db.select().from(accountCategories).where(eq(accountCategories.type, type)).all();
}
