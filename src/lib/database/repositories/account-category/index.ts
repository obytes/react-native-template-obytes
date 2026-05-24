import type { AccountCategory, DrizzleDB, NewAccountCategory } from '../_shared/types';

import {
  createAccountCategory,
  deleteAccountCategory,
  updateAccountCategory,
} from './account-category.commands';
import {
  findAccountCategoriesByType,
  findAccountCategoryById,
  findAllAccountCategories,
} from './account-category.queries';

type CreateInput = Omit<NewAccountCategory, 'id' | 'createdAt'>;
type UpdateInput = Partial<Omit<NewAccountCategory, 'id' | 'createdAt'>>;

export class AccountCategoryRepository {
  constructor(private db: DrizzleDB) {}

  findAll(): AccountCategory[] {
    return findAllAccountCategories(this.db);
  }

  findById(id: string): AccountCategory | undefined {
    return findAccountCategoryById(this.db, id);
  }

  findByType(type: 'activo' | 'pasivo'): AccountCategory[] {
    return findAccountCategoriesByType(this.db, type);
  }

  create(data: CreateInput): AccountCategory {
    return createAccountCategory(this.db, data);
  }

  update(id: string, data: UpdateInput): AccountCategory {
    return updateAccountCategory(this.db, id, data);
  }

  delete(id: string): void {
    deleteAccountCategory(this.db, id);
  }
}
