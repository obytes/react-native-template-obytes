import type { DrizzleDB, NewTransaction, Transaction } from '../_shared/types';
import {
  createTransaction,
  deleteTransaction,
  updateTransaction,
} from './transaction.commands';
import {
  findAllTransactions,
  findTransactionById,
  findTransactionsByBudget,
} from './transaction.queries';

type CreateInput = Omit<NewTransaction, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateInput = Partial<Omit<NewTransaction, 'id' | 'createdAt'>>;

export class TransactionRepository {
  constructor(private db: DrizzleDB) {}

  findAll(): Transaction[] {
    return findAllTransactions(this.db);
  }

  findById(id: string): Transaction | undefined {
    return findTransactionById(this.db, id);
  }

  findByBudget(budgetId: string): Transaction[] {
    return findTransactionsByBudget(this.db, budgetId);
  }

  create(data: CreateInput): Transaction {
    return createTransaction(this.db, data);
  }

  update(id: string, data: UpdateInput): Transaction {
    return updateTransaction(this.db, id, data);
  }

  delete(id: string): void {
    deleteTransaction(this.db, id);
  }
}
