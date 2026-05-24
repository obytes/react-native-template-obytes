// src/lib/database/provider.tsx
import * as React from 'react';

import { createDatabase } from './client';
import { runMigrations } from './migrations';
import { BudgetRepository } from './repositories/budget';
import { BudgetCategoryRepository } from './repositories/budget-category';
import { TransactionRepository } from './repositories/transaction';

type DatabaseContextValue = {
  budgetCategories: BudgetCategoryRepository;
  budgets: BudgetRepository;
  transactions: TransactionRepository;
};

const DatabaseContext = React.createContext<DatabaseContextValue | null>(null);

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [repositories, setRepositories]
    = React.useState<DatabaseContextValue | null>(null);

  React.useEffect(() => {
    const db = createDatabase();
    runMigrations(db);
    setRepositories({
      budgetCategories: new BudgetCategoryRepository(db),
      budgets: new BudgetRepository(db),
      transactions: new TransactionRepository(db),
    });
  }, []);

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
