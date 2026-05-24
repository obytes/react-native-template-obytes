import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const accountCategories = sqliteTable('account_category', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type', { enum: ['activo', 'pasivo'] }).notNull(),
  createdAt: text('created_at').notNull(),
});
