import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

import * as schema from './schema';

export function createDatabase() {
  const sqlite = openDatabaseSync('budget-app.db');
  return drizzle(sqlite, { schema });
}

export type DrizzleDB = ReturnType<typeof createDatabase>;
