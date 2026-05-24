import type { BudgetCategory, DrizzleDB, NewBudgetCategory } from '../_shared/types';
import {
  createBudgetCategory,
  deleteBudgetCategory,
  updateBudgetCategory,
} from './budget-category.commands';
import {
  findAllBudgetCategories,
  findBudgetCategoriesByType,
  findBudgetCategoryById,
} from './budget-category.queries';

type CreateInput = Omit<NewBudgetCategory, 'id' | 'createdAt'>;
type UpdateInput = Partial<Omit<NewBudgetCategory, 'id' | 'createdAt'>>;

export class BudgetCategoryRepository {
  constructor(private db: DrizzleDB) {}

  findAll(): BudgetCategory[] {
    return findAllBudgetCategories(this.db);
  }

  findById(id: string): BudgetCategory | undefined {
    return findBudgetCategoryById(this.db, id);
  }

  findByType(type: 'expense' | 'income'): BudgetCategory[] {
    return findBudgetCategoriesByType(this.db, type);
  }

  create(data: CreateInput): BudgetCategory {
    return createBudgetCategory(this.db, data);
  }

  update(id: string, data: UpdateInput): BudgetCategory {
    return updateBudgetCategory(this.db, id, data);
  }

  delete(id: string): void {
    deleteBudgetCategory(this.db, id);
  }
}
