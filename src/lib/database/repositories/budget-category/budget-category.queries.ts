import type { BudgetCategory, DrizzleDB } from '../_shared/types';

import { eq } from 'drizzle-orm';
import { budgetCategories } from '../../schema';

export function findAllBudgetCategories(db: DrizzleDB): BudgetCategory[] {
  return db.select().from(budgetCategories).all();
}

export function findBudgetCategoryById(
  db: DrizzleDB,
  id: string,
): BudgetCategory | undefined {
  return db.select().from(budgetCategories).where(eq(budgetCategories.id, id)).get();
}

export function findBudgetCategoriesByType(
  db: DrizzleDB,
  type: 'expense' | 'income',
): BudgetCategory[] {
  return db.select().from(budgetCategories).where(eq(budgetCategories.type, type)).all();
}
