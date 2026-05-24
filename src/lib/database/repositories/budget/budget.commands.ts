import type { Budget, DrizzleDB, NewBudget } from '../_shared/types';
import { eq } from 'drizzle-orm';

import { randomUUID } from 'expo-crypto';
import { budgets } from '../../schema';

type CreateBudgetInput = Omit<NewBudget, 'id' | 'createdAt' | 'updatedAt'>;

export function createBudget(db: DrizzleDB, data: CreateBudgetInput): Budget {
  const now = new Date().toISOString();
  const result = db
    .insert(budgets)
    .values({ id: randomUUID(), ...data, createdAt: now, updatedAt: now })
    .returning()
    .get();
  if (!result)
    throw new Error('Failed to create budget');
  return result;
}

type UpdateBudgetInput = Partial<Omit<NewBudget, 'id' | 'createdAt'>>;

export function updateBudget(
  db: DrizzleDB,
  id: string,
  data: UpdateBudgetInput,
): Budget {
  const now = new Date().toISOString();
  const result = db
    .update(budgets)
    .set({ ...data, updatedAt: now })
    .where(eq(budgets.id, id))
    .returning()
    .get();
  if (!result)
    throw new Error(`Budget ${id} not found`);
  return result;
}

export function deleteBudget(db: DrizzleDB, id: string): void {
  db.delete(budgets).where(eq(budgets.id, id)).run();
}
