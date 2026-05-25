/* eslint-disable react-refresh/only-export-components */
// src/lib/database/provider.tsx
import * as React from 'react';

import { createDatabase } from './client';
import { runMigrations } from './migrations';
import { AccountRepository } from './repositories/account';
import { AccountCategoryRepository } from './repositories/account-category';
import { BudgetRepository } from './repositories/budget';
import { BudgetCategoryRepository } from './repositories/budget-category';
import { CurrencyRepository } from './repositories/currency';
import { TransactionRepository } from './repositories/transaction';

type DatabaseContextValue = {
  accountCategories: AccountCategoryRepository;
  accounts: AccountRepository;
  budgetCategories: BudgetCategoryRepository;
  budgets: BudgetRepository;
  currencies: CurrencyRepository;
  transactions: TransactionRepository;
};

const DatabaseContext = React.createContext<DatabaseContextValue | null>(null);

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [repositories, setRepositories]
    = React.useState<DatabaseContextValue | null>(null);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    const db = createDatabase();
    runMigrations(db)
      .then(() => {
        if (!cancelled) {
          setRepositories({
            accountCategories: new AccountCategoryRepository(db),
            accounts: new AccountRepository(db),
            budgetCategories: new BudgetCategoryRepository(db),
            budgets: new BudgetRepository(db),
            currencies: new CurrencyRepository(db),
            transactions: new TransactionRepository(db),
          });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error)
    throw error;
  if (!repositories)
    return null;

  return (
    <DatabaseContext value={repositories}>
      {children}
    </DatabaseContext>
  );
}

export function useDatabase(): DatabaseContextValue {
  const ctx = React.use(DatabaseContext);
  if (!ctx)
    throw new Error('useDatabase must be used inside DatabaseProvider');
  return ctx;
}
