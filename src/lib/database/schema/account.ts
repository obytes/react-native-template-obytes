import { real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { accountCategories } from './account-category';

export const accounts = sqliteTable('account', {
  id: text('id').primaryKey(),
  accountCategoryId: text('account_category_id')
    .notNull()
    .references(() => accountCategories.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  initialBalance: real('initial_balance').notNull(),
  currentBalance: real('current_balance').notNull(),
  status: text('status', { enum: ['active', 'inactive'] }).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});
