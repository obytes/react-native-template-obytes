import type { DrizzleDB } from '../client';

import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
// SQL files are inlined as strings by babel-plugin-inline-import at build time.
// The key in `migrations` must match the `tag` in the journal entry exactly.
import m0000 from './0000_gorgeous_dragon_man.sql';

import journal from './meta/_journal.json';

export function runMigrations(db: DrizzleDB) {
  migrate(db, {
    journal,
    migrations: {
      '0000_gorgeous_dragon_man': m0000,
    },
  });
}
