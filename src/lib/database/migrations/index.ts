import type { DrizzleDB } from '../client';

import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import m0000 from './0000_gorgeous_dragon_man.sql';
import m0001 from './0001_accounts.sql';
import journal from './meta/_journal.json';

export function runMigrations(db: DrizzleDB): Promise<void> {
  return migrate(db, {
    journal,
    migrations: {
      m0000,
      m0001,
    },
  });
}
