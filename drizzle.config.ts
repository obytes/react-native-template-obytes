import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/lib/database/schema/index.ts',
  out: './src/lib/database/migrations',
  dialect: 'sqlite',
});
