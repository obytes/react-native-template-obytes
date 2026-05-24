# SQLite Database Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a local SQLite database layer using expo-sqlite + Drizzle ORM with the Repository pattern (queries/commands separated), exposing Budget, BudgetCategory, and Transaction repositories via a React DatabaseProvider.

**Architecture:** The DB is opened with expo-sqlite's sync API and wrapped with Drizzle ORM for type-safe queries. Migrations run at app startup via drizzle-kit-generated SQL files bundled with babel-plugin-inline-import. Each entity has a repository class that delegates to pure query/command functions, and all repositories are injected via a React context.

**Tech Stack:** expo-sqlite, drizzle-orm, drizzle-kit, babel-plugin-inline-import, expo-crypto (UUIDs), TypeScript, Jest + @testing-library/react-native

**Spec:** `docs/superpowers/specs/2026-05-24-sqlite-database-layer-design.md`

---

## File Map

**Create:**
- `drizzle.config.ts`
- `src/lib/database/schema/budget-category.ts`
- `src/lib/database/schema/budget.ts`
- `src/lib/database/schema/transaction.ts`
- `src/lib/database/schema/index.ts`
- `src/lib/database/client.ts`
- `src/lib/database/repositories/_shared/types.ts`
- `src/lib/database/migrations/index.ts` *(after running drizzle-kit generate)*
- `src/lib/database/repositories/budget-category/budget-category.queries.ts`
- `src/lib/database/repositories/budget-category/budget-category.commands.ts`
- `src/lib/database/repositories/budget-category/index.ts`
- `src/lib/database/repositories/budget/budget.queries.ts`
- `src/lib/database/repositories/budget/budget.commands.ts`
- `src/lib/database/repositories/budget/index.ts`
- `src/lib/database/repositories/transaction/transaction.queries.ts`
- `src/lib/database/repositories/transaction/transaction.commands.ts`
- `src/lib/database/repositories/transaction/index.ts`
- `src/lib/database/provider.tsx`
- `src/lib/database/provider.test.tsx`

**Modify:**
- `babel.config.js` — add babel-plugin-inline-import for .sql files
- `package.json` — add db:generate script
- `src/app/_layout.tsx` — mount DatabaseProvider inside Providers component

---

## Task 1: Install dependencies

**Files:** none (installs to node_modules + package.json)

- [ ] **Step 1: Install expo-sqlite via expo CLI** (ensures version compatibility with Expo SDK)

```bash
npx expo install expo-sqlite
```

Expected: expo-sqlite added to dependencies in package.json.

- [ ] **Step 2: Install drizzle-orm runtime**

```bash
pnpm add drizzle-orm
```

- [ ] **Step 3: Install drizzle-kit and babel plugin as dev dependencies**

```bash
pnpm add -D drizzle-kit babel-plugin-inline-import
```

- [ ] **Step 4: Verify installs**

```bash
pnpm list expo-sqlite drizzle-orm drizzle-kit babel-plugin-inline-import
```

Expected: all four packages listed with versions.

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: install expo-sqlite, drizzle-orm, drizzle-kit"
```

---

## Task 2: Configure drizzle-kit, babel, and package.json scripts

**Files:**
- Create: `drizzle.config.ts`
- Modify: `babel.config.js`
- Modify: `package.json`

- [ ] **Step 1: Create drizzle.config.ts at the repo root**

```ts
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/lib/database/schema/index.ts',
  out: './src/lib/database/migrations',
  dialect: 'sqlite',
})
```

- [ ] **Step 2: Add babel-plugin-inline-import to babel.config.js**

Current `babel.config.js`:
```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module-resolver', { ... }],
      'react-native-reanimated/plugin',
    ],
  };
};
```

Updated `babel.config.js` (add the inline-import plugin before reanimated):
```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo',
    ],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@env': './src/lib/env.js',
          },
          extensions: [
            '.ios.ts',
            '.android.ts',
            '.ts',
            '.ios.tsx',
            '.android.tsx',
            '.tsx',
            '.jsx',
            '.js',
            '.json',
          ],
        },
      ],
      ['inline-import', { extensions: ['.sql'] }],
      'react-native-reanimated/plugin',
    ],
  };
};
```

- [ ] **Step 3: Add db:generate script to package.json**

In the `"scripts"` section of `package.json`, add:
```json
"db:generate": "drizzle-kit generate"
```

- [ ] **Step 4: Commit**

```bash
git add drizzle.config.ts babel.config.js package.json
git commit -m "chore: configure drizzle-kit and babel for SQL migrations"
```

---

## Task 3: Schema — budget_category

**Files:**
- Create: `src/lib/database/schema/budget-category.ts`

- [ ] **Step 1: Create the budget-category schema file**

```ts
// src/lib/database/schema/budget-category.ts
import { sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const budgetCategories = sqliteTable('budget_category', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type', { enum: ['expense', 'income'] }).notNull(),
  icon: text('icon'),
  createdAt: text('created_at').notNull(),
})
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/database/schema/budget-category.ts
git commit -m "feat(db): add budget_category schema"
```

---

## Task 4: Schema — budget

**Files:**
- Create: `src/lib/database/schema/budget.ts`

- [ ] **Step 1: Create the budget schema file**

```ts
// src/lib/database/schema/budget.ts
import { real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

import { budgetCategories } from './budget-category'

export const budgets = sqliteTable('budget', {
  id: text('id').primaryKey(),
  budgetCategoryId: text('budget_category_id')
    .notNull()
    .references(() => budgetCategories.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  amount: real('amount').notNull(),
  period: text('period', { enum: ['monthly', 'weekly', 'yearly'] }).notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/database/schema/budget.ts
git commit -m "feat(db): add budget schema"
```

---

## Task 5: Schema — transaction + schema index

**Files:**
- Create: `src/lib/database/schema/transaction.ts`
- Create: `src/lib/database/schema/index.ts`

- [ ] **Step 1: Create the transaction schema file**

```ts
// src/lib/database/schema/transaction.ts
import { real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

import { budgets } from './budget'

export const transactions = sqliteTable('transaction', {
  id: text('id').primaryKey(),
  budgetId: text('budget_id')
    .notNull()
    .references(() => budgets.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  amount: real('amount').notNull(),
  notes: text('notes'),
  date: text('date').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})
```

- [ ] **Step 2: Create the schema index**

```ts
// src/lib/database/schema/index.ts
export * from './budget-category'
export * from './budget'
export * from './transaction'
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/database/schema/transaction.ts src/lib/database/schema/index.ts
git commit -m "feat(db): add transaction schema and schema index"
```

---

## Task 6: DB client and shared types

**Files:**
- Create: `src/lib/database/client.ts`
- Create: `src/lib/database/repositories/_shared/types.ts`

- [ ] **Step 1: Create the DB client**

`createDatabase()` opens the expo-sqlite connection and wraps it with Drizzle. The `DrizzleDB` type is inferred from the return type so it stays in sync with the schema automatically.

```ts
// src/lib/database/client.ts
import { drizzle } from 'drizzle-orm/expo-sqlite'
import { openDatabaseSync } from 'expo-sqlite'

import * as schema from './schema'

export function createDatabase() {
  const sqlite = openDatabaseSync('budget-app.db')
  return drizzle(sqlite, { schema })
}

export type DrizzleDB = ReturnType<typeof createDatabase>
```

- [ ] **Step 2: Create the shared types file**

Infer entity types directly from the schema so every repository shares the same source of truth. `DrizzleDB` is re-exported from `client.ts` (not re-defined) to avoid duplication. Feature code imports all types from here, not from the schema or client directly.

```ts
// src/lib/database/repositories/_shared/types.ts
export type { DrizzleDB } from '../../client'
import { budgetCategories, budgets, transactions } from '../../schema'

export type BudgetCategory = typeof budgetCategories.$inferSelect
export type NewBudgetCategory = typeof budgetCategories.$inferInsert

export type Budget = typeof budgets.$inferSelect
export type NewBudget = typeof budgets.$inferInsert

export type Transaction = typeof transactions.$inferSelect
export type NewTransaction = typeof transactions.$inferInsert
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
pnpm type-check
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/database/client.ts src/lib/database/repositories/_shared/types.ts
git commit -m "feat(db): add drizzle client and shared entity types"
```

---

## Task 7: Generate initial migration and create migration runner

**Files:**
- Generated: `src/lib/database/migrations/0000_*.sql` *(created by drizzle-kit)*
- Generated: `src/lib/database/migrations/meta/_journal.json` *(created by drizzle-kit)*
- Create: `src/lib/database/migrations/index.ts`

- [ ] **Step 1: Run drizzle-kit generate**

```bash
pnpm db:generate
```

Expected output (approximate):
```
Reading config file 'drizzle.config.ts'
1 tables created
  budget_category  (5 columns, 0 indexes, 0 FKs)
1 tables created
  budget  (9 columns, 0 indexes, 1 FKs)
1 tables created
  transaction  (8 columns, 0 indexes, 1 FKs)

[✓] Your SQL migration file ➜ src/lib/database/migrations/0000_<generated-name>.sql
```

- [ ] **Step 2: Note the exact filename generated**

Check what drizzle-kit created:
```bash
ls src/lib/database/migrations/
```

The SQL file will be named `0000_<random-words>.sql` (e.g. `0000_loud_longshot.sql`). Note the full filename — you'll need the tag name (filename without `.sql`) for the next step.

Also inspect the journal to confirm the tag:
```bash
cat src/lib/database/migrations/meta/_journal.json
```

The `entries[0].tag` field is the key you need (e.g. `"0000_loud_longshot"`).

- [ ] **Step 3: Create the migration runner**

Replace `0000_loud_longshot` in the example below with the actual tag from the journal:

```ts
// src/lib/database/migrations/index.ts
import { migrate } from 'drizzle-orm/expo-sqlite/migrator'

// SQL files are inlined as strings by babel-plugin-inline-import at build time.
// The key in `migrations` must match the `tag` in the journal entry exactly.
import m0000 from './0000_loud_longshot.sql'  // ← replace with actual filename
import journal from './meta/_journal.json'

import type { DrizzleDB } from '../client'

export function runMigrations(db: DrizzleDB) {
  migrate(db, {
    journal,
    migrations: {
      '0000_loud_longshot': m0000,  // ← replace key with actual tag
    },
  })
}
```

- [ ] **Step 4: Add a TypeScript declaration for SQL imports**

Create a declaration file so TypeScript accepts `.sql` imports (which babel-plugin-inline-import resolves to strings):

```ts
// src/lib/database/migrations/sql.d.ts
declare module '*.sql' {
  const content: string
  export default content
}
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
pnpm type-check
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/lib/database/migrations/
git commit -m "feat(db): add initial schema migration and migration runner"
```

---

## Task 8: BudgetCategory repository

**Files:**
- Create: `src/lib/database/repositories/budget-category/budget-category.queries.ts`
- Create: `src/lib/database/repositories/budget-category/budget-category.commands.ts`
- Create: `src/lib/database/repositories/budget-category/index.ts`

- [ ] **Step 1: Create budget-category.queries.ts**

Pure functions — no side effects, no state. Each takes `db` as first arg so they can be tested in isolation.

```ts
// src/lib/database/repositories/budget-category/budget-category.queries.ts
import { eq } from 'drizzle-orm'

import { budgetCategories } from '../../schema'
import type { BudgetCategory, DrizzleDB } from '../_shared/types'

export function findAllBudgetCategories(db: DrizzleDB): BudgetCategory[] {
  return db.select().from(budgetCategories).all()
}

export function findBudgetCategoryById(
  db: DrizzleDB,
  id: string
): BudgetCategory | undefined {
  return db.select().from(budgetCategories).where(eq(budgetCategories.id, id)).get()
}

export function findBudgetCategoriesByType(
  db: DrizzleDB,
  type: 'expense' | 'income'
): BudgetCategory[] {
  return db.select().from(budgetCategories).where(eq(budgetCategories.type, type)).all()
}
```

- [ ] **Step 2: Create budget-category.commands.ts**

Commands generate `id` and `createdAt` internally so callers don't have to.

```ts
// src/lib/database/repositories/budget-category/budget-category.commands.ts
import { eq } from 'drizzle-orm'
import { randomUUID } from 'expo-crypto'

import { budgetCategories } from '../../schema'
import type { BudgetCategory, DrizzleDB, NewBudgetCategory } from '../_shared/types'

type CreateBudgetCategoryInput = Omit<NewBudgetCategory, 'id' | 'createdAt'>

export function createBudgetCategory(
  db: DrizzleDB,
  data: CreateBudgetCategoryInput
): BudgetCategory {
  const now = new Date().toISOString()
  const result = db
    .insert(budgetCategories)
    .values({ id: randomUUID(), ...data, createdAt: now })
    .returning()
    .get()
  if (!result) throw new Error('Failed to create budget category')
  return result
}

type UpdateBudgetCategoryInput = Partial<Omit<NewBudgetCategory, 'id' | 'createdAt'>>

export function updateBudgetCategory(
  db: DrizzleDB,
  id: string,
  data: UpdateBudgetCategoryInput
): BudgetCategory {
  const result = db
    .update(budgetCategories)
    .set(data)
    .where(eq(budgetCategories.id, id))
    .returning()
    .get()
  if (!result) throw new Error(`Budget category ${id} not found`)
  return result
}

export function deleteBudgetCategory(db: DrizzleDB, id: string): void {
  db.delete(budgetCategories).where(eq(budgetCategories.id, id)).run()
}
```

- [ ] **Step 3: Create the BudgetCategoryRepository class**

```ts
// src/lib/database/repositories/budget-category/index.ts
import type { BudgetCategory, DrizzleDB, NewBudgetCategory } from '../_shared/types'
import {
  createBudgetCategory,
  deleteBudgetCategory,
  updateBudgetCategory,
} from './budget-category.commands'
import {
  findAllBudgetCategories,
  findBudgetCategoriesByType,
  findBudgetCategoryById,
} from './budget-category.queries'

type CreateInput = Omit<NewBudgetCategory, 'id' | 'createdAt'>
type UpdateInput = Partial<Omit<NewBudgetCategory, 'id' | 'createdAt'>>

export class BudgetCategoryRepository {
  constructor(private db: DrizzleDB) {}

  findAll(): BudgetCategory[] {
    return findAllBudgetCategories(this.db)
  }

  findById(id: string): BudgetCategory | undefined {
    return findBudgetCategoryById(this.db, id)
  }

  findByType(type: 'expense' | 'income'): BudgetCategory[] {
    return findBudgetCategoriesByType(this.db, type)
  }

  create(data: CreateInput): BudgetCategory {
    return createBudgetCategory(this.db, data)
  }

  update(id: string, data: UpdateInput): BudgetCategory {
    return updateBudgetCategory(this.db, id, data)
  }

  delete(id: string): void {
    deleteBudgetCategory(this.db, id)
  }
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
pnpm type-check
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/lib/database/repositories/budget-category/
git commit -m "feat(db): add BudgetCategoryRepository with queries and commands"
```

---

## Task 9: Budget repository

**Files:**
- Create: `src/lib/database/repositories/budget/budget.queries.ts`
- Create: `src/lib/database/repositories/budget/budget.commands.ts`
- Create: `src/lib/database/repositories/budget/index.ts`

- [ ] **Step 1: Create budget.queries.ts**

```ts
// src/lib/database/repositories/budget/budget.queries.ts
import { eq } from 'drizzle-orm'

import { budgets } from '../../schema'
import type { Budget, DrizzleDB } from '../_shared/types'

export function findAllBudgets(db: DrizzleDB): Budget[] {
  return db.select().from(budgets).all()
}

export function findBudgetById(db: DrizzleDB, id: string): Budget | undefined {
  return db.select().from(budgets).where(eq(budgets.id, id)).get()
}

export function findBudgetsByCategory(db: DrizzleDB, categoryId: string): Budget[] {
  return db.select().from(budgets).where(eq(budgets.budgetCategoryId, categoryId)).all()
}
```

- [ ] **Step 2: Create budget.commands.ts**

```ts
// src/lib/database/repositories/budget/budget.commands.ts
import { eq } from 'drizzle-orm'
import { randomUUID } from 'expo-crypto'

import { budgets } from '../../schema'
import type { Budget, DrizzleDB, NewBudget } from '../_shared/types'

type CreateBudgetInput = Omit<NewBudget, 'id' | 'createdAt' | 'updatedAt'>

export function createBudget(db: DrizzleDB, data: CreateBudgetInput): Budget {
  const now = new Date().toISOString()
  const result = db
    .insert(budgets)
    .values({ id: randomUUID(), ...data, createdAt: now, updatedAt: now })
    .returning()
    .get()
  if (!result) throw new Error('Failed to create budget')
  return result
}

type UpdateBudgetInput = Partial<Omit<NewBudget, 'id' | 'createdAt'>>

export function updateBudget(
  db: DrizzleDB,
  id: string,
  data: UpdateBudgetInput
): Budget {
  const now = new Date().toISOString()
  const result = db
    .update(budgets)
    .set({ ...data, updatedAt: now })
    .where(eq(budgets.id, id))
    .returning()
    .get()
  if (!result) throw new Error(`Budget ${id} not found`)
  return result
}

export function deleteBudget(db: DrizzleDB, id: string): void {
  db.delete(budgets).where(eq(budgets.id, id)).run()
}
```

- [ ] **Step 3: Create the BudgetRepository class**

```ts
// src/lib/database/repositories/budget/index.ts
import type { Budget, DrizzleDB, NewBudget } from '../_shared/types'
import { createBudget, deleteBudget, updateBudget } from './budget.commands'
import { findAllBudgets, findBudgetById, findBudgetsByCategory } from './budget.queries'

type CreateInput = Omit<NewBudget, 'id' | 'createdAt' | 'updatedAt'>
type UpdateInput = Partial<Omit<NewBudget, 'id' | 'createdAt'>>

export class BudgetRepository {
  constructor(private db: DrizzleDB) {}

  findAll(): Budget[] {
    return findAllBudgets(this.db)
  }

  findById(id: string): Budget | undefined {
    return findBudgetById(this.db, id)
  }

  findByCategory(categoryId: string): Budget[] {
    return findBudgetsByCategory(this.db, categoryId)
  }

  create(data: CreateInput): Budget {
    return createBudget(this.db, data)
  }

  update(id: string, data: UpdateInput): Budget {
    return updateBudget(this.db, id, data)
  }

  delete(id: string): void {
    deleteBudget(this.db, id)
  }
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
pnpm type-check
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/lib/database/repositories/budget/
git commit -m "feat(db): add BudgetRepository with queries and commands"
```

---

## Task 10: Transaction repository

**Files:**
- Create: `src/lib/database/repositories/transaction/transaction.queries.ts`
- Create: `src/lib/database/repositories/transaction/transaction.commands.ts`
- Create: `src/lib/database/repositories/transaction/index.ts`

- [ ] **Step 1: Create transaction.queries.ts**

```ts
// src/lib/database/repositories/transaction/transaction.queries.ts
import { eq } from 'drizzle-orm'

import { transactions } from '../../schema'
import type { DrizzleDB, Transaction } from '../_shared/types'

export function findAllTransactions(db: DrizzleDB): Transaction[] {
  return db.select().from(transactions).all()
}

export function findTransactionById(
  db: DrizzleDB,
  id: string
): Transaction | undefined {
  return db.select().from(transactions).where(eq(transactions.id, id)).get()
}

export function findTransactionsByBudget(
  db: DrizzleDB,
  budgetId: string
): Transaction[] {
  return db
    .select()
    .from(transactions)
    .where(eq(transactions.budgetId, budgetId))
    .all()
}
```

- [ ] **Step 2: Create transaction.commands.ts**

```ts
// src/lib/database/repositories/transaction/transaction.commands.ts
import { eq } from 'drizzle-orm'
import { randomUUID } from 'expo-crypto'

import { transactions } from '../../schema'
import type { DrizzleDB, NewTransaction, Transaction } from '../_shared/types'

type CreateTransactionInput = Omit<NewTransaction, 'id' | 'createdAt' | 'updatedAt'>

export function createTransaction(
  db: DrizzleDB,
  data: CreateTransactionInput
): Transaction {
  const now = new Date().toISOString()
  const result = db
    .insert(transactions)
    .values({ id: randomUUID(), ...data, createdAt: now, updatedAt: now })
    .returning()
    .get()
  if (!result) throw new Error('Failed to create transaction')
  return result
}

type UpdateTransactionInput = Partial<Omit<NewTransaction, 'id' | 'createdAt'>>

export function updateTransaction(
  db: DrizzleDB,
  id: string,
  data: UpdateTransactionInput
): Transaction {
  const now = new Date().toISOString()
  const result = db
    .update(transactions)
    .set({ ...data, updatedAt: now })
    .where(eq(transactions.id, id))
    .returning()
    .get()
  if (!result) throw new Error(`Transaction ${id} not found`)
  return result
}

export function deleteTransaction(db: DrizzleDB, id: string): void {
  db.delete(transactions).where(eq(transactions.id, id)).run()
}
```

- [ ] **Step 3: Create the TransactionRepository class**

```ts
// src/lib/database/repositories/transaction/index.ts
import type { DrizzleDB, NewTransaction, Transaction } from '../_shared/types'
import {
  createTransaction,
  deleteTransaction,
  updateTransaction,
} from './transaction.commands'
import {
  findAllTransactions,
  findTransactionById,
  findTransactionsByBudget,
} from './transaction.queries'

type CreateInput = Omit<NewTransaction, 'id' | 'createdAt' | 'updatedAt'>
type UpdateInput = Partial<Omit<NewTransaction, 'id' | 'createdAt'>>

export class TransactionRepository {
  constructor(private db: DrizzleDB) {}

  findAll(): Transaction[] {
    return findAllTransactions(this.db)
  }

  findById(id: string): Transaction | undefined {
    return findTransactionById(this.db, id)
  }

  findByBudget(budgetId: string): Transaction[] {
    return findTransactionsByBudget(this.db, budgetId)
  }

  create(data: CreateInput): Transaction {
    return createTransaction(this.db, data)
  }

  update(id: string, data: UpdateInput): Transaction {
    return updateTransaction(this.db, id, data)
  }

  delete(id: string): void {
    deleteTransaction(this.db, id)
  }
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
pnpm type-check
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/lib/database/repositories/transaction/
git commit -m "feat(db): add TransactionRepository with queries and commands"
```

---

## Task 11: DatabaseProvider and useDatabase hook

**Files:**
- Create: `src/lib/database/provider.tsx`

- [ ] **Step 1: Create the provider**

The provider initializes the DB and runs migrations in a `useEffect` (after first render). While migrating, it renders `null` so the native splash screen stays visible. Once ready, it instantiates all repositories and exposes them via context.

```tsx
// src/lib/database/provider.tsx
import * as React from 'react'

import { createDatabase } from './client'
import { runMigrations } from './migrations'
import { BudgetCategoryRepository } from './repositories/budget-category'
import { BudgetRepository } from './repositories/budget'
import { TransactionRepository } from './repositories/transaction'

type DatabaseContextValue = {
  budgetCategories: BudgetCategoryRepository
  budgets: BudgetRepository
  transactions: TransactionRepository
}

const DatabaseContext = React.createContext<DatabaseContextValue | null>(null)

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [repositories, setRepositories] =
    React.useState<DatabaseContextValue | null>(null)

  React.useEffect(() => {
    const db = createDatabase()
    runMigrations(db)
    setRepositories({
      budgetCategories: new BudgetCategoryRepository(db),
      budgets: new BudgetRepository(db),
      transactions: new TransactionRepository(db),
    })
  }, [])

  if (!repositories) return null

  return (
    <DatabaseContext.Provider value={repositories}>
      {children}
    </DatabaseContext.Provider>
  )
}

export function useDatabase(): DatabaseContextValue {
  const ctx = React.useContext(DatabaseContext)
  if (!ctx) throw new Error('useDatabase must be used inside DatabaseProvider')
  return ctx
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
pnpm type-check
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/database/provider.tsx
git commit -m "feat(db): add DatabaseProvider and useDatabase hook"
```

---

## Task 12: Tests for DatabaseProvider

**Files:**
- Create: `src/lib/database/provider.test.tsx`

- [ ] **Step 1: Write the failing tests**

The provider test mocks expo-sqlite and drizzle so no native SQLite is needed in Jest. The test verifies:
- Children render once the DB is initialized
- `useDatabase()` throws when called outside the provider

```tsx
// src/lib/database/provider.test.tsx
import { render, screen, waitFor } from '@testing-library/react-native'
import * as React from 'react'
import { Text } from 'react-native'

jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => ({})),
}))

jest.mock('drizzle-orm/expo-sqlite', () => ({
  drizzle: jest.fn(() => ({
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  })),
}))

jest.mock('drizzle-orm/expo-sqlite/migrator', () => ({
  migrate: jest.fn(),
}))

jest.mock('@/lib/database/migrations', () => ({
  runMigrations: jest.fn(),
}))

import { DatabaseProvider, useDatabase } from './provider'

describe('DatabaseProvider', () => {
  it('renders children after DB initialization', async () => {
    render(
      <DatabaseProvider>
        <Text>child</Text>
      </DatabaseProvider>
    )
    await waitFor(() => {
      expect(screen.getByText('child')).toBeTruthy()
    })
  })
})

describe('useDatabase', () => {
  it('throws when used outside DatabaseProvider', () => {
    const BrokenComponent = () => {
      useDatabase()
      return null
    }
    expect(() => render(<BrokenComponent />)).toThrow(
      'useDatabase must be used inside DatabaseProvider'
    )
  })
})
```

- [ ] **Step 2: Run tests to verify they fail (before implementation is complete)**

```bash
pnpm test src/lib/database/provider.test.tsx
```

If the provider is already implemented (Task 11 done), the tests should pass. If you're following strict TDD, write this test before Task 11.

- [ ] **Step 3: Run tests to verify they pass**

```bash
pnpm test src/lib/database/provider.test.tsx
```

Expected:
```
PASS src/lib/database/provider.test.tsx
  DatabaseProvider
    ✓ renders children after DB initialization
  useDatabase
    ✓ throws when used outside DatabaseProvider
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/database/provider.test.tsx
git commit -m "test(db): add DatabaseProvider tests"
```

---

## Task 13: Wire DatabaseProvider into _layout.tsx

**Files:**
- Modify: `src/app/_layout.tsx`

- [ ] **Step 1: Add DatabaseProvider to the Providers component**

`DatabaseProvider` must wrap the app before any feature code runs. Add it inside the existing `Providers` component in `src/app/_layout.tsx`, wrapping the children:

```tsx
// src/app/_layout.tsx
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';
import { StyleSheet } from 'react-native';
import FlashMessage from 'react-native-flash-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { useThemeConfig } from '@/components/ui/use-theme-config';
import { hydrateAuth } from '@/features/auth/use-auth-store';

import { APIProvider } from '@/lib/api';
import { DatabaseProvider } from '@/lib/database/provider';
import { loadSelectedTheme } from '@/lib/hooks/use-selected-theme';
// Import  global CSS file
import '../global.css';

export { ErrorBoundary } from 'expo-router';

// eslint-disable-next-line react-refresh/only-export-components
export const unstable_settings = {
  initialRouteName: '(app)',
};

hydrateAuth();
loadSelectedTheme();
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
// Set the animation options. This is optional.
SplashScreen.setOptions({
  duration: 500,
  fade: true,
});

export default function RootLayout() {
  return (
    <Providers>
      <Stack>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack>
    </Providers>
  );
}

function Providers({ children }: { children: React.ReactNode }) {
  const theme = useThemeConfig();
  return (
    <GestureHandlerRootView
      style={styles.container}
      // eslint-disable-next-line better-tailwindcss/no-unknown-classes
      className={theme.dark ? `dark` : undefined}
    >
      <KeyboardProvider>
        <ThemeProvider value={theme}>
          <APIProvider>
            <DatabaseProvider>
              <BottomSheetModalProvider>
                {children}
                <FlashMessage position="top" />
              </BottomSheetModalProvider>
            </DatabaseProvider>
          </APIProvider>
        </ThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
pnpm type-check
```

Expected: no errors.

- [ ] **Step 3: Run all tests**

```bash
pnpm test
```

Expected: all tests pass including the provider tests from Task 12.

- [ ] **Step 4: Commit**

```bash
git add src/app/_layout.tsx
git commit -m "feat(db): mount DatabaseProvider in root layout"
```

---

## Self-Review Checklist (for implementer)

After completing all tasks, verify:

- [ ] `pnpm type-check` passes with zero errors
- [ ] `pnpm test` passes all tests
- [ ] `pnpm db:generate` re-runs cleanly (no new migrations generated — schema matches what's in migrations)
- [ ] The three repository classes expose: `findAll`, `findById`, `create`, `update`, `delete`
- [ ] `BudgetRepository` additionally exposes `findByCategory`
- [ ] `TransactionRepository` additionally exposes `findByBudget`
- [ ] `BudgetCategoryRepository` additionally exposes `findByType`
- [ ] `useDatabase()` is the only export feature code needs to interact with the DB
