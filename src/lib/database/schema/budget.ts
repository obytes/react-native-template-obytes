import { real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { budgetCategories } from './budget-category';

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
});
