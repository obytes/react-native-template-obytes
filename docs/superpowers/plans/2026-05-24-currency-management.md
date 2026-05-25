# Currency Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar soporte multimoneda: catálogo pre-poblado de 15 monedas, habilitación/configuración manual de tipo de cambio en Settings, símbolo propio por cuenta, y totales de Activos/Pasivos convertidos a la moneda principal.

**Architecture:** Nueva tabla `currency` en SQLite pre-poblada con 15 monedas en migración 0002. La tabla `account` agrega columna `currency_id` FK. Un `CurrencyRepository` sigue el mismo patrón que `AccountRepository`. La conversión a moneda default usa `balance / exchange_rate`. Los totales de sección en `AccountsScreen` se calculan en la moneda principal.

**Tech Stack:** Drizzle ORM + expo-sqlite, @gorhom/bottom-sheet (ya configurado en root _layout.tsx), @tanstack/react-form, zod, react-native-flash-message, expo-router, i18next.

---

## Archivo map

| Archivo | Acción |
|---------|--------|
| `src/lib/database/schema/currency.ts` | Crear |
| `src/lib/database/schema/account.ts` | Modificar (agregar currencyId) |
| `src/lib/database/schema/index.ts` | Modificar (exportar currency) |
| `src/lib/database/repositories/_shared/types.ts` | Modificar (Currency, NewCurrency) |
| `src/lib/database/migrations/0002_currencies.sql` | Crear |
| `src/lib/database/migrations/meta/_journal.json` | Modificar |
| `src/lib/database/migrations/index.ts` | Modificar |
| `src/lib/database/repositories/currency/currency.queries.ts` | Crear |
| `src/lib/database/repositories/currency/currency.queries.test.ts` | Crear |
| `src/lib/database/repositories/currency/currency.commands.ts` | Crear |
| `src/lib/database/repositories/currency/currency.commands.test.ts` | Crear |
| `src/lib/database/repositories/currency/index.ts` | Crear |
| `src/lib/database/provider.tsx` | Modificar |
| `src/lib/currency/conversion.ts` | Crear |
| `src/lib/currency/conversion.test.ts` | Crear |
| `src/translations/es.json` | Modificar |
| `src/translations/en.json` | Modificar |
| `src/translations/ar.json` | Modificar |
| `src/app/(app)/monedas/_layout.tsx` | Crear |
| `src/app/(app)/monedas/index.tsx` | Crear |
| `src/app/(app)/_layout.tsx` | Modificar (registrar ruta monedas) |
| `src/features/currencies/currencies-screen.tsx` | Crear |
| `src/features/currencies/components/currency-row.tsx` | Crear |
| `src/features/currencies/components/currency-bottom-sheet.tsx` | Crear |
| `src/features/settings/settings-screen.tsx` | Modificar |
| `src/features/accounts/account-form-screen.tsx` | Modificar |
| `src/features/accounts/accounts-screen.tsx` | Modificar |

---

## Task 1: i18n — agregar claves de moneda

**Files:**
- Modify: `src/translations/es.json`
- Modify: `src/translations/en.json`
- Modify: `src/translations/ar.json`

- [ ] **Step 1: Actualizar es.json**

Abrir `src/translations/es.json` y agregar dentro del objeto raíz, al nivel de `"settings"`:

```json
{
  "settings": {
    "accounts": "Cuentas",
    "currencies": "Monedas",
    "finances": "Finanzas"
  },
  "currencies": {
    "title": "Monedas",
    "section_enabled": "HABILITADAS",
    "section_available": "DISPONIBLES",
    "default_badge": "PRINCIPAL",
    "enabled_badge": "Habilitada",
    "disabled_badge": "Deshabilitada",
    "exchange_rate_label": "Tipo de cambio",
    "exchange_rate_hint": "1 {{default}} equivale a",
    "save_rate": "Guardar tipo de cambio",
    "set_default": "Establecer como moneda principal",
    "set_default_confirm_title": "Cambiar moneda principal",
    "set_default_confirm_message": "¿Establecer {{code}} como moneda principal? Los totales de activos y pasivos se mostrarán en esta moneda.",
    "disable": "Deshabilitar moneda",
    "enable": "Habilitar moneda",
    "disable_blocked": "No se puede deshabilitar: {{count}} cuenta(s) la usan.",
    "default_info": "Esta es la moneda principal. El tipo de cambio siempre es 1.",
    "account_currency_label": "Moneda",
    "rate_saved": "Tipo de cambio actualizado"
  }
}
```

El archivo completo resultante de `src/translations/es.json`:

```json
{
  "onboarding": {
    "message": "Bienvenido a la app"
  },
  "settings": {
    "about": "Acerca de",
    "accounts": "Cuentas",
    "app_name": "Nombre de la app",
    "arabic": "Árabe",
    "currencies": "Monedas",
    "english": "Inglés",
    "finances": "Finanzas",
    "generale": "General",
    "github": "Github",
    "language": "Idioma",
    "links": "Enlaces",
    "logout": "Cerrar sesión",
    "more": "Más",
    "privacy": "Política de privacidad",
    "rate": "Calificar",
    "share": "Compartir",
    "support": "Soporte",
    "support_us": "Apóyanos",
    "terms": "Términos de servicio",
    "theme": {
      "dark": "Oscuro",
      "light": "Claro",
      "system": "Sistema",
      "title": "Tema"
    },
    "title": "Configuración",
    "version": "Versión",
    "website": "Sitio web"
  },
  "currencies": {
    "title": "Monedas",
    "section_enabled": "HABILITADAS",
    "section_available": "DISPONIBLES",
    "default_badge": "PRINCIPAL",
    "enabled_badge": "Habilitada",
    "disabled_badge": "Deshabilitada",
    "exchange_rate_label": "Tipo de cambio",
    "exchange_rate_hint": "1 {{default}} equivale a",
    "save_rate": "Guardar tipo de cambio",
    "set_default": "Establecer como moneda principal",
    "set_default_confirm_title": "Cambiar moneda principal",
    "set_default_confirm_message": "¿Establecer {{code}} como moneda principal? Los totales de activos y pasivos se mostrarán en esta moneda.",
    "disable": "Deshabilitar moneda",
    "enable": "Habilitar moneda",
    "disable_blocked": "No se puede deshabilitar: {{count}} cuenta(s) la usan.",
    "default_info": "Esta es la moneda principal. El tipo de cambio siempre es 1.",
    "account_currency_label": "Moneda",
    "rate_saved": "Tipo de cambio actualizado"
  },
  "welcome": "Bienvenido"
}
```

- [ ] **Step 2: Agregar las mismas claves en español a en.json y ar.json**

Las traducciones de monedas solo existen en español. Para satisfacer el sistema de tipos (`TxKeyPath` se infiere de los tres archivos), las mismas claves en español se añaden como fallback a en.json y ar.json. Solo se agregan las claves de `currencies` y `settings.currencies` — el resto del archivo se mantiene igual.

Agregar al final del objeto raíz de `src/translations/en.json`, después de `"settings"`:

```json
"currencies": {
  "title": "Monedas",
  "section_enabled": "HABILITADAS",
  "section_available": "DISPONIBLES",
  "default_badge": "PRINCIPAL",
  "enabled_badge": "Habilitada",
  "disabled_badge": "Deshabilitada",
  "exchange_rate_label": "Tipo de cambio",
  "exchange_rate_hint": "1 {{default}} equivale a",
  "save_rate": "Guardar tipo de cambio",
  "set_default": "Establecer como moneda principal",
  "set_default_confirm_title": "Cambiar moneda principal",
  "set_default_confirm_message": "¿Establecer {{code}} como moneda principal? Los totales de activos y pasivos se mostrarán en esta moneda.",
  "disable": "Deshabilitar moneda",
  "enable": "Habilitar moneda",
  "disable_blocked": "No se puede deshabilitar: {{count}} cuenta(s) la usan.",
  "default_info": "Esta es la moneda principal. El tipo de cambio siempre es 1.",
  "account_currency_label": "Moneda",
  "rate_saved": "Tipo de cambio actualizado"
}
```

También agregar `"currencies": "Monedas"` dentro del objeto `"settings"` de en.json.

Hacer lo mismo en `src/translations/ar.json` (mismas claves y valores en español).

- [ ] **Step 3: Verificar type-check**

```bash
pnpm type-check
```

Expected: sin errores.

- [ ] **Step 4: Commit**

```bash
git add src/translations/es.json src/translations/en.json src/translations/ar.json
git commit -m "feat(i18n): add currency management translation keys (es only)"
```

---

## Task 2: Currency schema + tipos compartidos

**Files:**
- Create: `src/lib/database/schema/currency.ts`
- Modify: `src/lib/database/schema/account.ts`
- Modify: `src/lib/database/schema/index.ts`
- Modify: `src/lib/database/repositories/_shared/types.ts`

- [ ] **Step 1: Crear `src/lib/database/schema/currency.ts`**

```typescript
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
```

- [ ] **Step 2: Modificar `src/lib/database/schema/account.ts`** — agregar `currencyId`

```typescript
import { real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { accountCategories } from './account-category';
import { currencies } from './currency';

export const accounts = sqliteTable('account', {
  id: text('id').primaryKey(),
  accountCategoryId: text('account_category_id')
    .notNull()
    .references(() => accountCategories.id, { onDelete: 'cascade' }),
  currencyId: text('currency_id')
    .notNull()
    .references(() => currencies.id),
  name: text('name').notNull(),
  initialBalance: real('initial_balance').notNull(),
  currentBalance: real('current_balance').notNull(),
  status: text('status', { enum: ['active', 'inactive'] }).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});
```

- [ ] **Step 3: Modificar `src/lib/database/schema/index.ts`** — exportar currency

```typescript
export * from './account';
export * from './account-category';
export * from './budget';
export * from './budget-category';
export * from './currency';
export * from './transaction';
```

- [ ] **Step 4: Modificar `src/lib/database/repositories/_shared/types.ts`** — agregar tipos Currency

```typescript
import type { accountCategories, accounts, budgetCategories, budgets, currencies, transactions } from '../../schema';

export type { DrizzleDB } from '../../client';

export type BudgetCategory = typeof budgetCategories.$inferSelect;
export type NewBudgetCategory = typeof budgetCategories.$inferInsert;

export type Budget = typeof budgets.$inferSelect;
export type NewBudget = typeof budgets.$inferInsert;

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;

export type AccountCategory = typeof accountCategories.$inferSelect;
export type NewAccountCategory = typeof accountCategories.$inferInsert;

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

export type Currency = typeof currencies.$inferSelect;
export type NewCurrency = typeof currencies.$inferInsert;
```

- [ ] **Step 5: Verificar type-check**

```bash
pnpm type-check
```

Expected: sin errores. Si aparecen errores sobre `currencyId` en `AccountRepository` o `account-form-screen.tsx`, es porque el tipo `Account` ahora incluye el campo — se corregirán en tareas posteriores.

- [ ] **Step 6: Commit**

```bash
git add src/lib/database/schema/currency.ts src/lib/database/schema/account.ts src/lib/database/schema/index.ts src/lib/database/repositories/_shared/types.ts
git commit -m "feat(db): add currency schema and update account schema with currencyId"
```

---

## Task 3: Migración 0002_currencies

**Files:**
- Create: `src/lib/database/migrations/0002_currencies.sql`
- Modify: `src/lib/database/migrations/meta/_journal.json`
- Modify: `src/lib/database/migrations/index.ts`

- [ ] **Step 1: Crear `src/lib/database/migrations/0002_currencies.sql`**

```sql
CREATE TABLE `currency` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL UNIQUE,
	`name` text NOT NULL,
	`symbol` text NOT NULL,
	`exchange_rate` real NOT NULL DEFAULT 1.0,
	`is_enabled` integer NOT NULL DEFAULT 0,
	`is_default` integer NOT NULL DEFAULT 0,
	`created_at` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `currency` (`id`, `code`, `name`, `symbol`, `exchange_rate`, `is_enabled`, `is_default`, `created_at`) VALUES
	('00000000-0000-0000-0000-000000000001', 'USD', 'Dólar Estadounidense', '$', 1.0, 0, 0, '2026-01-01T00:00:00.000Z'),
	('00000000-0000-0000-0000-000000000002', 'EUR', 'Euro', '€', 1.0, 0, 0, '2026-01-01T00:00:00.000Z'),
	('00000000-0000-0000-0000-000000000003', 'MXN', 'Peso Mexicano', '$', 1.0, 0, 0, '2026-01-01T00:00:00.000Z'),
	('00000000-0000-0000-0000-000000000004', 'GTQ', 'Quetzal Guatemalteco', 'Q', 1.0, 0, 0, '2026-01-01T00:00:00.000Z'),
	('00000000-0000-0000-0000-000000000005', 'COP', 'Peso Colombiano', '$', 1.0, 0, 0, '2026-01-01T00:00:00.000Z'),
	('00000000-0000-0000-0000-000000000006', 'ARS', 'Peso Argentino', '$', 1.0, 0, 0, '2026-01-01T00:00:00.000Z'),
	('00000000-0000-0000-0000-000000000007', 'BRL', 'Real Brasileño', 'R$', 1.0, 0, 0, '2026-01-01T00:00:00.000Z'),
	('00000000-0000-0000-0000-000000000008', 'CLP', 'Peso Chileno', '$', 1.0, 0, 0, '2026-01-01T00:00:00.000Z'),
	('00000000-0000-0000-0000-000000000009', 'PEN', 'Sol Peruano', 'S/', 1.0, 0, 0, '2026-01-01T00:00:00.000Z'),
	('00000000-0000-0000-0000-000000000010', 'BOB', 'Boliviano', 'Bs.', 1.0, 1, 1, '2026-01-01T00:00:00.000Z'),
	('00000000-0000-0000-0000-000000000011', 'PYG', 'Guaraní Paraguayo', '₲', 1.0, 0, 0, '2026-01-01T00:00:00.000Z'),
	('00000000-0000-0000-0000-000000000012', 'UYU', 'Peso Uruguayo', '$', 1.0, 0, 0, '2026-01-01T00:00:00.000Z'),
	('00000000-0000-0000-0000-000000000013', 'CRC', 'Colón Costarricense', '₡', 1.0, 0, 0, '2026-01-01T00:00:00.000Z'),
	('00000000-0000-0000-0000-000000000014', 'HNL', 'Lempira Hondureño', 'L', 1.0, 0, 0, '2026-01-01T00:00:00.000Z'),
	('00000000-0000-0000-0000-000000000015', 'NIO', 'Córdoba Nicaragüense', 'C$', 1.0, 0, 0, '2026-01-01T00:00:00.000Z');
--> statement-breakpoint
ALTER TABLE `account` ADD COLUMN `currency_id` text NOT NULL DEFAULT '00000000-0000-0000-0000-000000000010';
```

- [ ] **Step 2: Actualizar `src/lib/database/migrations/meta/_journal.json`**

Agregar la entrada al array `entries`:

```json
{
  "version": "7",
  "dialect": "sqlite",
  "entries": [
    {
      "idx": 0,
      "version": "6",
      "when": 1779649652108,
      "tag": "0000_gorgeous_dragon_man",
      "breakpoints": true
    },
    {
      "idx": 1,
      "version": "6",
      "when": 1779656147000,
      "tag": "0001_accounts",
      "breakpoints": true
    },
    {
      "idx": 2,
      "version": "6",
      "when": 1779674897000,
      "tag": "0002_currencies",
      "breakpoints": true
    }
  ]
}
```

- [ ] **Step 3: Actualizar `src/lib/database/migrations/index.ts`**

```typescript
import type { DrizzleDB } from '../client';

import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import m0000 from './0000_gorgeous_dragon_man.sql';
import m0001 from './0001_accounts.sql';
import m0002 from './0002_currencies.sql';
import journal from './meta/_journal.json';

export function runMigrations(db: DrizzleDB): Promise<void> {
  return migrate(db, {
    journal,
    migrations: {
      m0000,
      m0001,
      m0002,
    },
  });
}
```

- [ ] **Step 4: Verificar type-check**

```bash
pnpm type-check
```

Expected: sin errores.

- [ ] **Step 5: Commit**

```bash
git add src/lib/database/migrations/0002_currencies.sql src/lib/database/migrations/meta/_journal.json src/lib/database/migrations/index.ts
git commit -m "feat(db): add migration 0002 for currency table and account.currency_id"
```

---

## Task 4: Currency queries + tests (TDD)

**Files:**
- Create: `src/lib/database/repositories/currency/currency.queries.ts`
- Create: `src/lib/database/repositories/currency/currency.queries.test.ts`

- [ ] **Step 1: Escribir el test**

Crear `src/lib/database/repositories/currency/currency.queries.test.ts`:

```typescript
import type { DrizzleDB } from '../_shared/types';
import {
  countAccountsByCurrency,
  findAllCurrencies,
  findCurrencyById,
  findDefaultCurrency,
  findEnabledCurrencies,
} from './currency.queries';

function makeMockChain(opts: { allResult?: any[]; getResult?: any } = {}) {
  const chain: any = {};
  ['select', 'from', 'where'].forEach((m) => {
    chain[m] = jest.fn(() => chain);
  });
  chain.all = jest.fn(() => opts.allResult ?? []);
  chain.get = jest.fn(() => opts.getResult ?? undefined);
  return chain as DrizzleDB;
}

const sampleCurrency = {
  id: '00000000-0000-0000-0000-000000000001',
  code: 'USD',
  name: 'Dólar Estadounidense',
  symbol: '$',
  exchangeRate: 1.0,
  isEnabled: 1,
  isDefault: 1,
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('findAllCurrencies', () => {
  it('returns all currencies', () => {
    const db = makeMockChain({ allResult: [sampleCurrency] });
    expect(findAllCurrencies(db)).toEqual([sampleCurrency]);
  });

  it('returns empty array when none exist', () => {
    const db = makeMockChain({ allResult: [] });
    expect(findAllCurrencies(db)).toEqual([]);
  });
});

describe('findEnabledCurrencies', () => {
  it('returns only enabled currencies', () => {
    const db = makeMockChain({ allResult: [sampleCurrency] });
    expect(findEnabledCurrencies(db)).toEqual([sampleCurrency]);
  });
});

describe('findDefaultCurrency', () => {
  it('returns the default currency', () => {
    const db = makeMockChain({ getResult: sampleCurrency });
    expect(findDefaultCurrency(db)).toEqual(sampleCurrency);
  });

  it('returns undefined when no default set', () => {
    const db = makeMockChain({ getResult: undefined });
    expect(findDefaultCurrency(db)).toBeUndefined();
  });
});

describe('findCurrencyById', () => {
  it('returns currency when found', () => {
    const db = makeMockChain({ getResult: sampleCurrency });
    expect(findCurrencyById(db, '00000000-0000-0000-0000-000000000001')).toEqual(sampleCurrency);
  });

  it('returns undefined when not found', () => {
    const db = makeMockChain({ getResult: undefined });
    expect(findCurrencyById(db, 'missing')).toBeUndefined();
  });
});

describe('countAccountsByCurrency', () => {
  it('returns the count of accounts using the currency', () => {
    const db = makeMockChain({ getResult: { count: 3 } });
    expect(countAccountsByCurrency(db, 'some-id')).toBe(3);
  });

  it('returns 0 when get returns undefined', () => {
    const db = makeMockChain({ getResult: undefined });
    expect(countAccountsByCurrency(db, 'some-id')).toBe(0);
  });
});
```

- [ ] **Step 2: Ejecutar el test y verificar que falla**

```bash
pnpm test -- src/lib/database/repositories/currency/currency.queries.test.ts
```

Expected: FAIL — `Cannot find module './currency.queries'`

- [ ] **Step 3: Implementar `currency.queries.ts`**

Crear `src/lib/database/repositories/currency/currency.queries.ts`:

```typescript
import type { Currency, DrizzleDB } from '../_shared/types';

import { eq, sql } from 'drizzle-orm';
import { accounts, currencies } from '../../schema';

export function findAllCurrencies(db: DrizzleDB): Currency[] {
  return db.select().from(currencies).all();
}

export function findEnabledCurrencies(db: DrizzleDB): Currency[] {
  return db.select().from(currencies).where(eq(currencies.isEnabled, 1)).all();
}

export function findDefaultCurrency(db: DrizzleDB): Currency | undefined {
  return db.select().from(currencies).where(eq(currencies.isDefault, 1)).get();
}

export function findCurrencyById(db: DrizzleDB, id: string): Currency | undefined {
  return db.select().from(currencies).where(eq(currencies.id, id)).get();
}

export function countAccountsByCurrency(db: DrizzleDB, currencyId: string): number {
  const result = db
    .select({ count: sql<number>`count(*)` })
    .from(accounts)
    .where(eq(accounts.currencyId, currencyId))
    .get();
  return result?.count ?? 0;
}
```

- [ ] **Step 4: Ejecutar el test y verificar que pasa**

```bash
pnpm test -- src/lib/database/repositories/currency/currency.queries.test.ts
```

Expected: PASS — 8 tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/lib/database/repositories/currency/currency.queries.ts src/lib/database/repositories/currency/currency.queries.test.ts
git commit -m "feat(db): add CurrencyRepository queries with tests"
```

---

## Task 5: Currency commands + tests (TDD)

**Files:**
- Create: `src/lib/database/repositories/currency/currency.commands.ts`
- Create: `src/lib/database/repositories/currency/currency.commands.test.ts`

- [ ] **Step 1: Escribir el test**

Crear `src/lib/database/repositories/currency/currency.commands.test.ts`:

```typescript
import type { DrizzleDB } from '../_shared/types';
import {
  disableCurrency,
  enableCurrency,
  setDefaultCurrency,
  updateExchangeRate,
} from './currency.commands';

function makeMockChain(opts: { getResult?: any } = {}) {
  const chain: any = {};
  ['update', 'set', 'where', 'select', 'from'].forEach((m) => {
    chain[m] = jest.fn(() => chain);
  });
  chain.run = jest.fn();
  chain.get = jest.fn(() => opts.getResult ?? undefined);
  chain.transaction = jest.fn((cb: (tx: any) => void) => cb(chain));
  return chain as DrizzleDB;
}

describe('enableCurrency', () => {
  it('calls update without throwing', () => {
    const db = makeMockChain();
    expect(() => enableCurrency(db, 'some-id')).not.toThrow();
    expect(db.update).toHaveBeenCalled();
  });
});

describe('disableCurrency', () => {
  it('calls update when no accounts use the currency', () => {
    const db = makeMockChain({ getResult: { count: 0 } });
    expect(() => disableCurrency(db, 'some-id')).not.toThrow();
    expect(db.update).toHaveBeenCalled();
  });

  it('throws when accounts are using the currency', () => {
    const db = makeMockChain({ getResult: { count: 2 } });
    expect(() => disableCurrency(db, 'some-id')).toThrow(
      'Cannot disable currency: 2 account(s) use it',
    );
  });
});

describe('setDefaultCurrency', () => {
  it('calls transaction and updates two rows', () => {
    const db = makeMockChain();
    expect(() => setDefaultCurrency(db, 'new-default-id')).not.toThrow();
    expect(db.transaction).toHaveBeenCalled();
    expect(db.update).toHaveBeenCalledTimes(2);
  });
});

describe('updateExchangeRate', () => {
  it('calls update without throwing', () => {
    const db = makeMockChain();
    expect(() => updateExchangeRate(db, 'some-id', 17.5)).not.toThrow();
    expect(db.update).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Ejecutar el test y verificar que falla**

```bash
pnpm test -- src/lib/database/repositories/currency/currency.commands.test.ts
```

Expected: FAIL — `Cannot find module './currency.commands'`

- [ ] **Step 3: Implementar `currency.commands.ts`**

Crear `src/lib/database/repositories/currency/currency.commands.ts`:

```typescript
import type { DrizzleDB } from '../_shared/types';

import { eq } from 'drizzle-orm';
import { currencies } from '../../schema';
import { countAccountsByCurrency } from './currency.queries';

export function enableCurrency(db: DrizzleDB, id: string): void {
  db.update(currencies).set({ isEnabled: 1 }).where(eq(currencies.id, id)).run();
}

export function disableCurrency(db: DrizzleDB, id: string): void {
  const count = countAccountsByCurrency(db, id);
  if (count > 0)
    throw new Error(`Cannot disable currency: ${count} account(s) use it`);
  db.update(currencies).set({ isEnabled: 0 }).where(eq(currencies.id, id)).run();
}

export function setDefaultCurrency(db: DrizzleDB, id: string): void {
  db.transaction((tx) => {
    tx.update(currencies).set({ isDefault: 0 }).where(eq(currencies.isDefault, 1)).run();
    tx.update(currencies).set({ isDefault: 1, isEnabled: 1 }).where(eq(currencies.id, id)).run();
  });
}

export function updateExchangeRate(db: DrizzleDB, id: string, rate: number): void {
  db.update(currencies).set({ exchangeRate: rate }).where(eq(currencies.id, id)).run();
}
```

- [ ] **Step 4: Ejecutar el test y verificar que pasa**

```bash
pnpm test -- src/lib/database/repositories/currency/currency.commands.test.ts
```

Expected: PASS — 5 tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/lib/database/repositories/currency/currency.commands.ts src/lib/database/repositories/currency/currency.commands.test.ts
git commit -m "feat(db): add CurrencyRepository commands with tests"
```

---

## Task 6: CurrencyRepository + DatabaseProvider

**Files:**
- Create: `src/lib/database/repositories/currency/index.ts`
- Modify: `src/lib/database/provider.tsx`

- [ ] **Step 1: Crear `src/lib/database/repositories/currency/index.ts`**

```typescript
import type { Currency, DrizzleDB } from '../_shared/types';

import {
  disableCurrency,
  enableCurrency,
  setDefaultCurrency,
  updateExchangeRate as updateExchangeRateCmd,
} from './currency.commands';
import {
  countAccountsByCurrency,
  findAllCurrencies,
  findCurrencyById,
  findDefaultCurrency,
  findEnabledCurrencies,
} from './currency.queries';

export class CurrencyRepository {
  constructor(private db: DrizzleDB) {}

  findAll(): Currency[] {
    return findAllCurrencies(this.db);
  }

  findEnabled(): Currency[] {
    return findEnabledCurrencies(this.db);
  }

  findDefault(): Currency | undefined {
    return findDefaultCurrency(this.db);
  }

  findById(id: string): Currency | undefined {
    return findCurrencyById(this.db, id);
  }

  countAccountsUsing(id: string): number {
    return countAccountsByCurrency(this.db, id);
  }

  enable(id: string): void {
    enableCurrency(this.db, id);
  }

  disable(id: string): void {
    disableCurrency(this.db, id);
  }

  setDefault(id: string): void {
    setDefaultCurrency(this.db, id);
  }

  updateExchangeRate(id: string, rate: number): void {
    updateExchangeRateCmd(this.db, id, rate);
  }
}
```

- [ ] **Step 2: Modificar `src/lib/database/provider.tsx`** — agregar CurrencyRepository

```typescript
/* eslint-disable react-refresh/only-export-components */
// src/lib/database/provider.tsx
import * as React from 'react';

import { createDatabase } from './client';
import { runMigrations } from './migrations';
import { AccountRepository } from './repositories/account';
import { AccountCategoryRepository } from './repositories/account-category';
import { BudgetRepository } from './repositories/budget';
import { BudgetCategoryRepository } from './repositories/budget-category';
import { CurrencyRepository } from './repositories/currency';
import { TransactionRepository } from './repositories/transaction';

type DatabaseContextValue = {
  currencies: CurrencyRepository;
  accountCategories: AccountCategoryRepository;
  accounts: AccountRepository;
  budgetCategories: BudgetCategoryRepository;
  budgets: BudgetRepository;
  transactions: TransactionRepository;
};

const DatabaseContext = React.createContext<DatabaseContextValue | null>(null);

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [repositories, setRepositories]
    = React.useState<DatabaseContextValue | null>(null);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    const db = createDatabase();
    runMigrations(db)
      .then(() => {
        if (!cancelled) {
          setRepositories({
            currencies: new CurrencyRepository(db),
            accountCategories: new AccountCategoryRepository(db),
            accounts: new AccountRepository(db),
            budgetCategories: new BudgetCategoryRepository(db),
            budgets: new BudgetRepository(db),
            transactions: new TransactionRepository(db),
          });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error)
    throw error;
  if (!repositories)
    return null;

  return (
    <DatabaseContext value={repositories}>
      {children}
    </DatabaseContext>
  );
}

export function useDatabase(): DatabaseContextValue {
  const ctx = React.use(DatabaseContext);
  if (!ctx)
    throw new Error('useDatabase must be used inside DatabaseProvider');
  return ctx;
}
```

- [ ] **Step 3: Verificar type-check**

```bash
pnpm type-check
```

Expected: sin errores.

- [ ] **Step 4: Ejecutar todos los tests**

```bash
pnpm test
```

Expected: todos los tests existentes siguen pasando.

- [ ] **Step 5: Commit**

```bash
git add src/lib/database/repositories/currency/index.ts src/lib/database/provider.tsx
git commit -m "feat(db): add CurrencyRepository and wire into DatabaseProvider"
```

---

## Task 7: Utilidad de conversión + tests (TDD)

**Files:**
- Create: `src/lib/currency/conversion.ts`
- Create: `src/lib/currency/conversion.test.ts`

- [ ] **Step 1: Escribir el test**

Crear `src/lib/currency/conversion.test.ts`:

```typescript
import { toDefaultCurrency } from './conversion';

describe('toDefaultCurrency', () => {
  it('returns balance unchanged when exchange rate is 1 (default currency)', () => {
    expect(toDefaultCurrency(1000, 1)).toBe(1000);
  });

  it('converts MXN to USD correctly (rate=17.5 → 13125 MXN = 750 USD)', () => {
    expect(toDefaultCurrency(13125, 17.5)).toBeCloseTo(750, 2);
  });

  it('converts EUR to USD correctly (rate=0.92 → 690 EUR ≈ 750 USD)', () => {
    expect(toDefaultCurrency(690, 0.92)).toBeCloseTo(750, 0);
  });

  it('returns 0 when exchange rate is 0 (avoids division by zero)', () => {
    expect(toDefaultCurrency(500, 0)).toBe(0);
  });

  it('returns 0 when balance is 0', () => {
    expect(toDefaultCurrency(0, 17.5)).toBe(0);
  });
});
```

- [ ] **Step 2: Ejecutar el test y verificar que falla**

```bash
pnpm test -- src/lib/currency/conversion.test.ts
```

Expected: FAIL — `Cannot find module './conversion'`

- [ ] **Step 3: Implementar `conversion.ts`**

Crear `src/lib/currency/conversion.ts`:

```typescript
export function toDefaultCurrency(balance: number, exchangeRate: number): number {
  if (exchangeRate === 0)
    return 0;
  return balance / exchangeRate;
}
```

- [ ] **Step 4: Ejecutar el test y verificar que pasa**

```bash
pnpm test -- src/lib/currency/conversion.test.ts
```

Expected: PASS — 5 tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/lib/currency/conversion.ts src/lib/currency/conversion.test.ts
git commit -m "feat(currency): add toDefaultCurrency conversion utility with tests"
```

---

## Task 8: CurrencyRow + CurrenciesScreen + rutas

**Files:**
- Create: `src/features/currencies/components/currency-row.tsx`
- Create: `src/features/currencies/currencies-screen.tsx`
- Create: `src/app/(app)/monedas/_layout.tsx`
- Create: `src/app/(app)/monedas/index.tsx`
- Modify: `src/app/(app)/_layout.tsx`

- [ ] **Step 1: Crear `src/features/currencies/components/currency-row.tsx`**

```typescript
import type { Currency } from '@/lib/database/repositories/_shared/types';

import { Pressable, Text, View } from '@/components/ui';

type Props = {
  currency: Currency;
  defaultCurrencyCode: string;
  onPress: () => void;
};

export function CurrencyRow({ currency, defaultCurrencyCode, onPress }: Props) {
  const isDefault = currency.isDefault === 1;
  const isEnabled = currency.isEnabled === 1;

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between border-b border-neutral-100 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900"
    >
      <View>
        <View className="flex-row items-center gap-2">
          <Text className="font-semibold dark:text-neutral-100">
            {currency.code}
          </Text>
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">
            {currency.name} · {currency.symbol}
          </Text>
          {isDefault && (
            <View className="rounded-full bg-green-100 px-2 py-0.5 dark:bg-green-900">
              <Text className="text-xs font-bold text-green-700 dark:text-green-300">
                PRINCIPAL
              </Text>
            </View>
          )}
        </View>
        {isEnabled && !isDefault && (
          <Text className="text-xs text-neutral-400">
            1 {defaultCurrencyCode} = {currency.exchangeRate.toFixed(4)} {currency.code}
          </Text>
        )}
      </View>
      <Text className="text-neutral-400">›</Text>
    </Pressable>
  );
}
```

- [ ] **Step 2: Crear `src/features/currencies/currencies-screen.tsx`**

```typescript
import type { Currency } from '@/lib/database/repositories/_shared/types';

import { Stack, useFocusEffect } from 'expo-router';
import * as React from 'react';
import { useCallback, useRef, useState } from 'react';

import { ScrollView, Text, View } from '@/components/ui';
import { useDatabase } from '@/lib/database/provider';
import { CurrencyRow } from './components/currency-row';

type Props = {
  BottomSheet?: React.ComponentType<{
    currency: Currency | null;
    defaultCurrency: Currency | null;
    onAction: () => void;
    sheetRef: React.RefObject<any>;
  }>;
};

export function CurrenciesScreen({ BottomSheet }: Props) {
  const { currencies } = useDatabase();
  const [enabledList, setEnabledList] = useState<Currency[]>([]);
  const [availableList, setAvailableList] = useState<Currency[]>([]);
  const [defaultCurrency, setDefaultCurrency] = useState<Currency | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  const sheetRef = useRef<any>(null);

  const reload = useCallback(() => {
    const all = currencies.findAll();
    setEnabledList(all.filter(c => c.isEnabled === 1));
    setAvailableList(all.filter(c => c.isEnabled === 0));
    setDefaultCurrency(currencies.findDefault() ?? null);
  }, [currencies]);

  useFocusEffect(reload);

  const handlePress = useCallback((currency: Currency) => {
    setSelectedCurrency(currency);
    sheetRef.current?.present();
  }, []);

  const defaultCode = defaultCurrency?.code ?? '';

  return (
    <>
      <Stack.Screen options={{ title: 'Monedas' }} />
      <ScrollView className="flex-1">
        {enabledList.length > 0 && (
          <View className="border-t-2 border-neutral-200 dark:border-neutral-700">
            <View className="border-b border-neutral-200 bg-neutral-100 px-4 py-2 dark:border-neutral-700 dark:bg-neutral-800">
              <Text className="text-xs font-bold tracking-widest text-neutral-600 uppercase dark:text-neutral-400">
                Habilitadas
              </Text>
            </View>
            {enabledList.map(c => (
              <CurrencyRow key={c.id} currency={c} defaultCurrencyCode={defaultCode} onPress={() => handlePress(c)} />
            ))}
          </View>
        )}

        {availableList.length > 0 && (
          <View className="mt-4 border-t-2 border-neutral-200 dark:border-neutral-700">
            <View className="border-b border-neutral-200 bg-neutral-100 px-4 py-2 dark:border-neutral-700 dark:bg-neutral-800">
              <Text className="text-xs font-bold tracking-widest text-neutral-600 uppercase dark:text-neutral-400">
                Disponibles
              </Text>
            </View>
            {availableList.map(c => (
              <CurrencyRow key={c.id} currency={c} defaultCurrencyCode={defaultCode} onPress={() => handlePress(c)} />
            ))}
          </View>
        )}
      </ScrollView>

      {BottomSheet && (
        <BottomSheet
          currency={selectedCurrency}
          defaultCurrency={defaultCurrency}
          onAction={reload}
          sheetRef={sheetRef}
        />
      )}
    </>
  );
}
```

- [ ] **Step 3: Crear `src/app/(app)/monedas/_layout.tsx`**

```typescript
import { Stack } from 'expo-router';

export default function MonedasLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Monedas' }} />
    </Stack>
  );
}
```

- [ ] **Step 4: Crear `src/app/(app)/monedas/index.tsx`**

```typescript
import { CurrenciesScreen } from '@/features/currencies/currencies-screen';

export default function MonedasPage() {
  return <CurrenciesScreen />;
}
```

- [ ] **Step 5: Modificar `src/app/(app)/_layout.tsx`** — registrar ruta `monedas` con `href: null`

Agregar después del bloque `<Tabs.Screen name="cuentas" ...>`:

```typescript
<Tabs.Screen
  name="monedas"
  options={{
    href: null,
    headerShown: false,
  }}
/>
```

El archivo completo resultante:

```typescript
import { Link, Redirect, SplashScreen, Tabs } from 'expo-router';
import * as React from 'react';
import { useCallback, useEffect } from 'react';

import { Pressable, Text } from '@/components/ui';
import {
  Feed as FeedIcon,
  Settings as SettingsIcon,
  Style as StyleIcon,
} from '@/components/ui/icons';
import { useAuthStore as useAuth } from '@/features/auth/use-auth-store';
import { useIsFirstTime } from '@/lib/hooks/use-is-first-time';

export default function TabLayout() {
  const status = useAuth.use.status();
  const [isFirstTime] = useIsFirstTime();
  const hideSplash = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);
  useEffect(() => {
    if (status !== 'idle') {
      const timer = setTimeout(() => {
        hideSplash();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hideSplash, status]);

  if (isFirstTime) {
    return <Redirect href="/onboarding" />;
  }
  if (status === 'signOut') {
    return <Redirect href="/login" />;
  }
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color }) => <FeedIcon color={color} />,
          headerRight: () => <CreateNewPostLink />,
          tabBarButtonTestID: 'feed-tab',
        }}
      />
      <Tabs.Screen
        name="style"
        options={{
          title: 'Style',
          headerShown: false,
          tabBarIcon: ({ color }) => <StyleIcon color={color} />,
          tabBarButtonTestID: 'style-tab',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerShown: false,
          tabBarIcon: ({ color }) => <SettingsIcon color={color} />,
          tabBarButtonTestID: 'settings-tab',
        }}
      />
      <Tabs.Screen
        name="cuentas"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="monedas"
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}

function CreateNewPostLink() {
  return (
    <Link href="/feed/add-post" asChild>
      <Pressable>
        <Text className="px-3 text-primary-300">Create</Text>
      </Pressable>
    </Link>
  );
}
```

- [ ] **Step 6: Verificar type-check**

```bash
pnpm type-check
```

Expected: sin errores.

- [ ] **Step 7: Commit**

```bash
git add src/features/currencies/components/currency-row.tsx src/features/currencies/currencies-screen.tsx src/app/(app)/monedas/_layout.tsx src/app/(app)/monedas/index.tsx src/app/(app)/_layout.tsx
git commit -m "feat(currencies): add CurrenciesScreen with sectioned list and routes"
```

---

## Task 9: CurrencyBottomSheet

**Files:**
- Create: `src/features/currencies/components/currency-bottom-sheet.tsx`
- Modify: `src/app/(app)/monedas/index.tsx`

- [ ] **Step 1: Crear `src/features/currencies/components/currency-bottom-sheet.tsx`**

```typescript
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import type { Currency } from '@/lib/database/repositories/_shared/types';

import * as React from 'react';
import { Alert } from 'react-native';
import { showMessage } from 'react-native-flash-message';

import { Button, Input, showErrorMessage, Text, View } from '@/components/ui';
import { Modal } from '@/components/ui/modal';
import { useDatabase } from '@/lib/database/provider';

type Props = {
  currency: Currency | null;
  defaultCurrency: Currency | null;
  onAction: () => void;
  sheetRef: React.RefObject<BottomSheetModal>;
};

function DefaultCurrencyContent({ currency }: { currency: Currency }) {
  return (
    <View className="p-4">
      <View className="mb-4">
        <Text className="text-2xl font-bold dark:text-white">
          {currency.symbol} {currency.code}
        </Text>
        <Text className="text-sm text-neutral-500 dark:text-neutral-400">
          {currency.name}
        </Text>
        <View className="mt-2 self-start rounded-full bg-green-100 px-3 py-1 dark:bg-green-900">
          <Text className="text-xs font-bold text-green-700 dark:text-green-300">
            Moneda principal
          </Text>
        </View>
      </View>
      <Text className="text-sm text-neutral-500 italic dark:text-neutral-400">
        Esta es la moneda principal. El tipo de cambio siempre es 1.
      </Text>
    </View>
  );
}

function DisabledCurrencyContent({
  currency,
  onEnable,
}: {
  currency: Currency;
  onEnable: () => void;
}) {
  return (
    <View className="p-4">
      <View className="mb-4">
        <Text className="text-2xl font-bold text-neutral-400 dark:text-neutral-500">
          {currency.symbol} {currency.code}
        </Text>
        <Text className="text-sm text-neutral-400">{currency.name}</Text>
        <View className="mt-2 self-start rounded-full bg-neutral-100 px-3 py-1 dark:bg-neutral-800">
          <Text className="text-xs text-neutral-500">Deshabilitada</Text>
        </View>
      </View>
      <Button label="Habilitar moneda" onPress={onEnable} />
    </View>
  );
}

function EnabledCurrencyContent({
  currency,
  defaultCurrency,
  onSetDefault,
  onDisable,
  onSaveRate,
}: {
  currency: Currency;
  defaultCurrency: Currency | null;
  onSetDefault: () => void;
  onDisable: () => void;
  onSaveRate: (rate: number) => void;
}) {
  const [rateText, setRateText] = React.useState(
    currency.exchangeRate.toFixed(4),
  );

  const defaultCode = defaultCurrency?.code ?? 'USD';

  return (
    <View className="p-4">
      <View className="mb-4 border-b border-neutral-100 pb-4 dark:border-neutral-800">
        <Text className="text-2xl font-bold dark:text-white">
          {currency.symbol} {currency.code}
        </Text>
        <Text className="text-sm text-neutral-500 dark:text-neutral-400">
          {currency.name}
        </Text>
        <View className="mt-2 self-start rounded-full bg-green-50 px-3 py-1 dark:bg-green-950">
          <Text className="text-xs text-green-700 dark:text-green-400">
            Habilitada
          </Text>
        </View>
      </View>

      <View className="mb-4">
        <Text className="mb-1 text-xs font-bold tracking-widest text-neutral-500 uppercase">
          Tipo de cambio
        </Text>
        <Text className="mb-2 text-sm text-neutral-500 dark:text-neutral-400">
          1 {defaultCode} equivale a
        </Text>
        <View className="flex-row items-center gap-2">
          <View className="flex-1">
            <Input
              keyboardType="decimal-pad"
              value={rateText}
              onChangeText={setRateText}
            />
          </View>
          <Text className="font-semibold text-neutral-700 dark:text-neutral-300">
            {currency.code}
          </Text>
        </View>
        <View className="mt-3">
          <Button
            label="Guardar tipo de cambio"
            onPress={() => {
              const rate = Number(rateText);
              if (!Number.isFinite(rate) || rate <= 0) {
                showErrorMessage('Ingresa un tipo de cambio válido mayor a 0');
                return;
              }
              onSaveRate(rate);
            }}
          />
        </View>
      </View>

      <View className="gap-3 border-t border-neutral-100 pt-4 dark:border-neutral-800">
        <Button
          label="Establecer como moneda principal"
          variant="outline"
          onPress={onSetDefault}
        />
        <Button
          label="Deshabilitar moneda"
          variant="destructive"
          onPress={onDisable}
        />
      </View>
    </View>
  );
}

export function CurrencyBottomSheet({ currency, defaultCurrency, onAction, sheetRef }: Props) {
  const { currencies } = useDatabase();

  const handleEnable = () => {
    if (!currency) return;
    try {
      currencies.enable(currency.id);
      showMessage({ message: 'Moneda habilitada', type: 'success' });
      onAction();
      sheetRef.current?.dismiss();
    }
    catch {
      showErrorMessage('Error al habilitar la moneda');
    }
  };

  const handleDisable = () => {
    if (!currency) return;
    try {
      currencies.disable(currency.id);
      showMessage({ message: 'Moneda deshabilitada', type: 'success' });
      onAction();
      sheetRef.current?.dismiss();
    }
    catch (err) {
      const message = err instanceof Error ? err.message : 'Error al deshabilitar';
      showErrorMessage(message);
    }
  };

  const handleSetDefault = () => {
    if (!currency) return;
    Alert.alert(
      'Cambiar moneda principal',
      `¿Establecer ${currency.code} como moneda principal? Los totales de activos y pasivos se mostrarán en esta moneda.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            try {
              currencies.setDefault(currency.id);
              showMessage({ message: 'Moneda principal actualizada', type: 'success' });
              onAction();
              sheetRef.current?.dismiss();
            }
            catch {
              showErrorMessage('Error al cambiar la moneda principal');
            }
          },
        },
      ],
    );
  };

  const handleSaveRate = (rate: number) => {
    if (!currency) return;
    try {
      currencies.updateExchangeRate(currency.id, rate);
      showMessage({ message: 'Tipo de cambio actualizado', type: 'success' });
      onAction();
    }
    catch {
      showErrorMessage('Error al guardar el tipo de cambio');
    }
  };

  const renderContent = () => {
    if (!currency) return null;
    if (currency.isDefault === 1) {
      return <DefaultCurrencyContent currency={currency} />;
    }
    if (currency.isEnabled === 0) {
      return <DisabledCurrencyContent currency={currency} onEnable={handleEnable} />;
    }
    return (
      <EnabledCurrencyContent
        currency={currency}
        defaultCurrency={defaultCurrency}
        onSetDefault={handleSetDefault}
        onDisable={handleDisable}
        onSaveRate={handleSaveRate}
      />
    );
  };

  return (
    <Modal ref={sheetRef} snapPoints={['55%']} title={currency?.code ?? ''}>
      {renderContent()}
    </Modal>
  );
}
```

- [ ] **Step 2: Modificar `src/app/(app)/monedas/index.tsx`** — conectar el bottom sheet

```typescript
import { CurrencyBottomSheet } from '@/features/currencies/components/currency-bottom-sheet';
import { CurrenciesScreen } from '@/features/currencies/currencies-screen';

export default function MonedasPage() {
  return <CurrenciesScreen BottomSheet={CurrencyBottomSheet} />;
}
```

- [ ] **Step 3: Verificar type-check**

```bash
pnpm type-check
```

Expected: sin errores.

- [ ] **Step 4: Commit**

```bash
git add src/features/currencies/components/currency-bottom-sheet.tsx src/app/(app)/monedas/index.tsx
git commit -m "feat(currencies): add CurrencyBottomSheet with enable/disable/set-default/exchange-rate"
```

---

## Task 10: SettingsScreen — entrada de monedas

**Files:**
- Modify: `src/features/settings/settings-screen.tsx`

- [ ] **Step 1: Modificar `src/features/settings/settings-screen.tsx`** — agregar `SettingsItem` de monedas dentro del `SettingsContainer` de finanzas

Localizar el bloque:

```typescript
<SettingsContainer title="settings.finances">
  <SettingsItem
    text="settings.accounts"
    onPress={() => router.push('/cuentas')}
  />
</SettingsContainer>
```

Reemplazarlo con:

```typescript
<SettingsContainer title="settings.finances">
  <SettingsItem
    text="settings.accounts"
    onPress={() => router.push('/cuentas')}
  />
  <SettingsItem
    text="settings.currencies"
    onPress={() => router.push('/monedas')}
  />
</SettingsContainer>
```

- [ ] **Step 2: Verificar type-check**

```bash
pnpm type-check
```

Expected: sin errores. La clave `"settings.currencies"` ya existe en los JSON de traducción (Task 1).

- [ ] **Step 3: Commit**

```bash
git add src/features/settings/settings-screen.tsx
git commit -m "feat(settings): add Monedas entry linking to /monedas"
```

---

## Task 11: AccountFormScreen — campo de moneda

**Files:**
- Modify: `src/features/accounts/account-form-screen.tsx`

- [ ] **Step 1: Reemplazar `src/features/accounts/account-form-screen.tsx`**

```typescript
import type { AccountCategory, Currency } from '@/lib/database/repositories/_shared/types';

import { useForm } from '@tanstack/react-form';
import { Stack, useRouter } from 'expo-router';
import * as React from 'react';
import { showMessage } from 'react-native-flash-message';
import * as z from 'zod';

import { Button, Input, Select, showErrorMessage, Text, View } from '@/components/ui';
import { getFieldError } from '@/components/ui/form-utils';
import { useDatabase } from '@/lib/database/provider';

const schema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  accountCategoryId: z.string().min(1, 'Categoría requerida'),
  currencyId: z.string().min(1, 'Moneda requerida'),
  initialBalance: z.coerce.number(),
  currentBalance: z.coerce.number(),
  status: z.enum(['active', 'inactive']),
});

const STATUS_OPTIONS = [
  { label: 'Activa', value: 'active' },
  { label: 'Inactiva', value: 'inactive' },
];

type Props = { accountId?: string };
type SelectOption = { label: string; value: string };

function NoCategoriesView({ onPress }: { onPress: () => void }) {
  return (
    <View className="flex-1 items-center justify-center p-4">
      <Text className="mb-4 text-center text-neutral-500 dark:text-neutral-400">
        Primero crea una categoría de cuenta
      </Text>
      <Button label="Crear categoría" onPress={onPress} />
    </View>
  );
}

function useAccountForm(
  accountId: string | undefined,
  onDone: () => void,
  defaultCurrencyId: string,
) {
  const { accounts } = useDatabase();
  const isEdit = !!accountId;
  const existing = accountId ? accounts.findById(accountId) : undefined;
  return useForm({
    defaultValues: {
      name: existing?.name ?? '',
      accountCategoryId: existing?.accountCategoryId ?? '',
      currencyId: existing?.currencyId ?? defaultCurrencyId,
      initialBalance: String(existing?.initialBalance ?? 0),
      currentBalance: String(existing?.currentBalance ?? 0),
      status: (existing?.status ?? 'active') as 'active' | 'inactive',
    },
    validators: { onChange: schema as any },
    onSubmit: ({ value }) => {
      try {
        const data = {
          name: value.name,
          accountCategoryId: value.accountCategoryId,
          currencyId: value.currencyId,
          initialBalance: Number(value.initialBalance),
          currentBalance: Number(value.currentBalance),
          status: value.status,
        };
        if (isEdit) {
          accounts.update(accountId!, data);
          showMessage({ message: 'Cuenta actualizada', type: 'success' });
        }
        else {
          accounts.create(data);
          showMessage({ message: 'Cuenta creada', type: 'success' });
        }
        onDone();
      }
      catch {
        showErrorMessage('Error al guardar la cuenta');
      }
    },
  });
}

function FormFields({
  form,
  categoryOptions,
  currencyOptions,
  isEdit,
}: {
  form: ReturnType<typeof useAccountForm>;
  categoryOptions: SelectOption[];
  currencyOptions: SelectOption[];
  isEdit: boolean;
}) {
  return (
    <View className="flex-1 p-4">
      <form.Field
        name="name"
        children={field => (
          <Input
            label="Nombre"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChangeText={field.handleChange}
            error={getFieldError(field)}
          />
        )}
      />
      <form.Field
        name="accountCategoryId"
        children={field => (
          <Select
            label="Categoría"
            value={field.state.value}
            options={categoryOptions}
            onSelect={val => field.handleChange(String(val))}
            error={getFieldError(field)}
          />
        )}
      />
      <form.Field
        name="currencyId"
        children={field => (
          <Select
            label="Moneda"
            value={field.state.value}
            options={currencyOptions}
            onSelect={val => field.handleChange(String(val))}
            error={getFieldError(field)}
          />
        )}
      />
      <form.Field
        name="initialBalance"
        children={field => (
          <Input
            label="Saldo inicial"
            keyboardType="decimal-pad"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChangeText={field.handleChange}
            error={getFieldError(field)}
          />
        )}
      />
      <form.Field
        name="currentBalance"
        children={field => (
          <Input
            label="Saldo actual"
            keyboardType="decimal-pad"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChangeText={field.handleChange}
            error={getFieldError(field)}
          />
        )}
      />
      <form.Field
        name="status"
        children={field => (
          <Select
            label="Estado"
            value={field.state.value}
            options={STATUS_OPTIONS}
            onSelect={val => field.handleChange(val as 'active' | 'inactive')}
            error={getFieldError(field)}
          />
        )}
      />
      <form.Subscribe
        selector={state => [state.isSubmitting]}
        children={([isSubmitting]) => (
          <Button
            label={isEdit ? 'Actualizar cuenta' : 'Guardar cuenta'}
            loading={isSubmitting}
            onPress={form.handleSubmit}
          />
        )}
      />
    </View>
  );
}

export function AccountFormScreen({ accountId }: Props) {
  const router = useRouter();
  const { accountCategories, currencies } = useDatabase();
  const isEdit = !!accountId;

  const categories: AccountCategory[] = accountCategories.findAll();
  const enabledCurrencies: Currency[] = currencies.findEnabled();
  const defaultCurrency = currencies.findDefault();

  const categoryOptions = categories.map(c => ({ label: c.name, value: c.id }));
  const currencyOptions = enabledCurrencies.map(c => ({
    label: `${c.symbol} ${c.code} — ${c.name}`,
    value: c.id,
  }));

  const form = useAccountForm(
    accountId,
    () => router.back(),
    defaultCurrency?.id ?? '',
  );
  const title = isEdit ? 'Editar Cuenta' : 'Nueva Cuenta';

  if (categories.length === 0) {
    return (
      <>
        <Stack.Screen options={{ title }} />
        <NoCategoriesView onPress={() => router.push('/cuentas/categorias/nueva')} />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title }} />
      <FormFields
        form={form}
        categoryOptions={categoryOptions}
        currencyOptions={currencyOptions}
        isEdit={isEdit}
      />
    </>
  );
}
```

- [ ] **Step 2: Verificar type-check**

```bash
pnpm type-check
```

Expected: sin errores. El tipo `Account` ahora incluye `currencyId` (inferido del schema), y el `AccountRepository.create` acepta el nuevo campo porque `NewAccount` también lo incluye.

- [ ] **Step 3: Commit**

```bash
git add src/features/accounts/account-form-screen.tsx
git commit -m "feat(accounts): add currency selector to AccountFormScreen"
```

---

## Task 12: AccountsScreen — símbolo de moneda + totales convertidos

**Files:**
- Modify: `src/features/accounts/accounts-screen.tsx`

- [ ] **Step 1: Reemplazar `src/features/accounts/accounts-screen.tsx`**

```typescript
import type { Account, AccountCategory, Currency } from '@/lib/database/repositories/_shared/types';

import { Stack, useFocusEffect, useRouter } from 'expo-router';
import * as React from 'react';
import { useCallback, useState } from 'react';

import { Pressable, ScrollView, Text, View } from '@/components/ui';
import { useDatabase } from '@/lib/database/provider';
import { toDefaultCurrency } from '@/lib/currency/conversion';

type AccountRowProps = {
  account: Account;
  currency: Currency | undefined;
  onPress: () => void;
  balanceClassName: string;
};

function AccountRow({ account, currency, onPress, balanceClassName }: AccountRowProps) {
  const symbol = currency?.symbol ?? '$';
  const code = currency?.code ?? '';
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between border-b border-neutral-100 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900"
    >
      <View>
        <Text className="font-medium dark:text-neutral-100">{account.name}</Text>
        <Text className={`text-xs ${account.status === 'active' ? 'text-green-600' : 'text-neutral-400'}`}>
          {account.status === 'active' ? 'Activa' : 'Inactiva'}
        </Text>
      </View>
      <View className="items-end">
        <Text className={`font-semibold ${balanceClassName}`}>
          {symbol}{account.currentBalance.toFixed(2)}
          {' '}
          <Text className="text-xs text-neutral-400">{code}</Text>
        </Text>
        <Text className="text-xs text-neutral-400">
          Inicial: {symbol}{account.initialBalance.toFixed(2)}
        </Text>
      </View>
    </Pressable>
  );
}

type SectionHeaderProps = {
  label: string;
  total: number;
  defaultCurrency: Currency | undefined;
};

function SectionHeader({ label, total, defaultCurrency }: SectionHeaderProps) {
  const symbol = defaultCurrency?.symbol ?? '$';
  const code = defaultCurrency?.code ?? '';
  return (
    <View className="flex-row justify-between border-t-2 border-b border-neutral-200 border-t-neutral-300 bg-neutral-100 px-4 py-2 dark:border-neutral-700 dark:border-t-neutral-600 dark:bg-neutral-800">
      <Text className="text-xs font-bold tracking-widest text-neutral-700 uppercase dark:text-neutral-300">
        {label}
      </Text>
      <Text className="text-xs text-neutral-500">
        {symbol}{total.toFixed(2)} {code}
      </Text>
    </View>
  );
}

export function AccountsScreen() {
  const { accounts, accountCategories, currencies } = useDatabase();
  const router = useRouter();
  const [accountList, setAccountList] = useState<Account[]>([]);
  const [categoryList, setCategoryList] = useState<AccountCategory[]>([]);
  const [currencyMap, setCurrencyMap] = useState<Map<string, Currency>>(new Map());
  const [defaultCurrency, setDefaultCurrency] = useState<Currency | undefined>(undefined);

  useFocusEffect(
    useCallback(() => {
      setAccountList(accounts.findAll());
      setCategoryList(accountCategories.findAll());
      const all = currencies.findAll();
      setCurrencyMap(new Map(all.map(c => [c.id, c])));
      setDefaultCurrency(currencies.findDefault());
    }, [accounts, accountCategories, currencies]),
  );

  const activoCategories = categoryList.filter(c => c.type === 'activo');
  const pasivoCategories = categoryList.filter(c => c.type === 'pasivo');

  const getAccountsForCategory = (categoryId: string) =>
    accountList.filter(a => a.accountCategoryId === categoryId);

  const totalForType = (type: 'activo' | 'pasivo') => {
    const ids = new Set(categoryList.filter(c => c.type === type).map(c => c.id));
    return accountList
      .filter(a => ids.has(a.accountCategoryId))
      .reduce((sum, a) => {
        const currency = currencyMap.get(a.currencyId);
        if (!currency) return sum;
        return sum + toDefaultCurrency(a.currentBalance, currency.exchangeRate);
      }, 0);
  };

  const renderCategoryGroup = (cat: AccountCategory, balanceClassName: string) => (
    <React.Fragment key={cat.id}>
      <View className="border-b border-neutral-100 bg-neutral-50 px-4 py-1 dark:border-neutral-800 dark:bg-neutral-900">
        <Text className="text-xs text-neutral-400 italic">{cat.name}</Text>
      </View>
      {getAccountsForCategory(cat.id).map(account => (
        <AccountRow
          key={account.id}
          account={account}
          currency={currencyMap.get(account.currencyId)}
          onPress={() => router.push(`/cuentas/${account.id}`)}
          balanceClassName={balanceClassName}
        />
      ))}
    </React.Fragment>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Cuentas',
          headerRight: () => (
            <Pressable onPress={() => router.push('/cuentas/nueva')}>
              <Text className="px-3 text-lg text-primary-300">+</Text>
            </Pressable>
          ),
        }}
      />
      <ScrollView className="flex-1">
        <SectionHeader
          label="Activos"
          total={totalForType('activo')}
          defaultCurrency={defaultCurrency}
        />
        {activoCategories.map(cat => renderCategoryGroup(cat, 'text-green-600'))}

        <SectionHeader
          label="Pasivos"
          total={totalForType('pasivo')}
          defaultCurrency={defaultCurrency}
        />
        {pasivoCategories.map(cat => renderCategoryGroup(cat, 'text-danger-600'))}

        <Pressable
          onPress={() => router.push('/cuentas/categorias')}
          className="mt-2 flex-row items-center justify-between border-t border-neutral-200 px-4 py-3 dark:border-neutral-700"
        >
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">
            Gestionar categorías
          </Text>
          <Text className="text-neutral-400">›</Text>
        </Pressable>
      </ScrollView>
    </>
  );
}
```

- [ ] **Step 2: Verificar type-check**

```bash
pnpm type-check
```

Expected: sin errores.

- [ ] **Step 3: Ejecutar todos los tests**

```bash
pnpm test
```

Expected: todos los tests pasan.

- [ ] **Step 4: Commit**

```bash
git add src/features/accounts/accounts-screen.tsx
git commit -m "feat(accounts): show currency symbol per account and convert section totals to default currency"
```

---

## Verificación final

- [ ] **Correr todos los tests y type-check**

```bash
pnpm test && pnpm type-check
```

Expected: todos los tests pasan, sin errores de TypeScript.

- [ ] **Verificar en el emulador/dispositivo**

1. Abrir Settings → Finanzas → Monedas
2. Habilitar MXN, configurar tipo de cambio 17.5
3. Intentar deshabilitar USD (la default) → no debe aparecer el botón
4. Crear una cuenta nueva → el selector de moneda muestra USD y MXN
5. Crear cuenta en MXN con saldo 17,500
6. En AccountsScreen → el saldo muestra `$17,500.00 MXN`
7. El total de Activos muestra `$1,000.00 USD` (17500 / 17.5 = 1000)
8. Intentar deshabilitar MXN con esa cuenta → debe mostrar error "1 cuenta(s) la usan"
9. Cambiar moneda default a MXN → confirmar alert → totales se muestran en MXN
