import type { Budget, DrizzleDB } from '../_shared/types';

import { eq } from 'drizzle-orm';
import { budgets } from '../../schema';

export function findAllBudgets(db: DrizzleDB): Budget[] {
  return db.select().from(budgets).all();
}

export function findBudgetById(db: DrizzleDB, id: string): Budget | undefined {
  return db.select().from(budgets).where(eq(budgets.id, id)).get();
}

export function findBudgetsByCategory(db: DrizzleDB, categoryId: string): Budget[] {
  return db.select().from(budgets).where(eq(budgets.budgetCategoryId, categoryId)).all();
}
