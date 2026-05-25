import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const currencies = sqliteTable('currency', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  symbol: text('symbol').notNull(),
  exchangeRate: real('exchange_rate').notNull().default(1.0),
  isEnabled: integer('is_enabled').notNull().default(0),
  isDefault: integer('is_default').notNull().default(0),
  createdAt: text('created_at').notNull(),
});
