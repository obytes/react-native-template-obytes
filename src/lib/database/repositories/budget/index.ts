import type { Budget, DrizzleDB, NewBudget } from '../_shared/types';
import { createBudget, deleteBudget, updateBudget } from './budget.commands';
import { findAllBudgets, findBudgetById, findBudgetsByCategory } from './budget.queries';

type CreateInput = Omit<NewBudget, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateInput = Partial<Omit<NewBudget, 'id' | 'createdAt'>>;

export class BudgetRepository {
  constructor(private db: DrizzleDB) {}

  findAll(): Budget[] {
    return findAllBudgets(this.db);
  }

  findById(id: string): Budget | undefined {
    return findBudgetById(this.db, id);
  }

  findByCategory(categoryId: string): Budget[] {
    return findBudgetsByCategory(this.db, categoryId);
  }

  create(data: CreateInput): Budget {
    return createBudget(this.db, data);
  }

  update(id: string, data: UpdateInput): Budget {
    return updateBudget(this.db, id, data);
  }

  delete(id: string): void {
    deleteBudget(this.db, id);
  }
}
