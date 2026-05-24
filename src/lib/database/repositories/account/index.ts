import type { Account, DrizzleDB, NewAccount } from '../_shared/types';

import { createAccount, deleteAccount, updateAccount } from './account.commands';
import {
  findAccountByCategory,
  findAccountById,
  findAccountsByStatus,
  findAllAccounts,
} from './account.queries';

type CreateInput = Omit<NewAccount, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateInput = Partial<Omit<NewAccount, 'id' | 'createdAt'>>;

export class AccountRepository {
  constructor(private db: DrizzleDB) {}

  findAll(): Account[] {
    return findAllAccounts(this.db);
  }

  findById(id: string): Account | undefined {
    return findAccountById(this.db, id);
  }

  findByCategory(categoryId: string): Account[] {
    return findAccountByCategory(this.db, categoryId);
  }

  findByStatus(status: 'active' | 'inactive'): Account[] {
    return findAccountsByStatus(this.db, status);
  }

  create(data: CreateInput): Account {
    return createAccount(this.db, data);
  }

  update(id: string, data: UpdateInput): Account {
    return updateAccount(this.db, id, data);
  }

  delete(id: string): void {
    deleteAccount(this.db, id);
  }
}
