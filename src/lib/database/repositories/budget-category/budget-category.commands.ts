import type { BudgetCategory, DrizzleDB, NewBudgetCategory } from '../_shared/types';
import { eq } from 'drizzle-orm';

import { randomUUID } from 'expo-crypto';
import { budgetCategories } from '../../schema';

type CreateBudgetCategoryInput = Omit<NewBudgetCategory, 'id' | 'createdAt'>;

export function createBudgetCategory(
  db: DrizzleDB,
  data: CreateBudgetCategoryInput,
): BudgetCategory {
  const now = new Date().toISOString();
  const result = db
    .insert(budgetCategories)
    .values({ id: randomUUID(), ...data, createdAt: now })
    .returning()
    .get();
  if (!result)
    throw new Error('Failed to create budget category');
  return result;
}

type UpdateBudgetCategoryInput = Partial<Omit<NewBudgetCategory, 'id' | 'createdAt'>>;

export function updateBudgetCategory(
  db: DrizzleDB,
  id: string,
  data: UpdateBudgetCategoryInput,
): BudgetCategory {
  const result = db
    .update(budgetCategories)
    .set(data)
    .where(eq(budgetCategories.id, id))
    .returning()
    .get();
  if (!result)
    throw new Error(`Budget category ${id} not found`);
  return result;
}

export function deleteBudgetCategory(db: DrizzleDB, id: string): void {
  db.delete(budgetCategories).where(eq(budgetCategories.id, id)).run();
}
