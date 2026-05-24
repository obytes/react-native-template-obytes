import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const budgetCategories = sqliteTable('budget_category', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type', { enum: ['expense', 'income'] }).notNull(),
  icon: text('icon'),
  createdAt: text('created_at').notNull(),
});
