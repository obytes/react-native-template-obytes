# Diseño: Gestión de Monedas

**Fecha:** 2026-05-24  
**Rama:** feat/accounts  
**Estado:** Aprobado

---

## Resumen

Agregar soporte multimoneda a la app de finanzas personales. El usuario habilita monedas desde Settings, configura su tipo de cambio manualmente, y designa una como moneda principal. Cada cuenta tiene su propia moneda. Los totales de Activos y Pasivos se muestran convertidos a la moneda principal.

---

## Decisiones de diseño

| Decisión | Elección |
|---|---|
| Tipo de cambio | Manual (el usuario lo ingresa) |
| Catálogo de monedas | Pre-poblado en migración (~15 monedas), el usuario habilita |
| Moneda por defecto | El usuario la designa |
| Deshabilitar con cuentas activas | Bloqueado — no se puede |
| Layout de lista de monedas | Secciones: Habilitadas / Disponibles |
| Formato de saldo | `$13,125.00` + código pequeño (`MXN`) |

---

## 1. Modelo de datos

### Nueva tabla: `currency`

```sql
CREATE TABLE currency (
  id          TEXT PRIMARY KEY,
  code        TEXT NOT NULL UNIQUE,   -- "USD", "MXN", "EUR"
  name        TEXT NOT NULL,          -- "Dólar Estadounidense"
  symbol      TEXT NOT NULL,          -- "$", "€", "Q"
  exchange_rate REAL NOT NULL DEFAULT 1.0,  -- cuántas unidades de esta = 1 default
  is_enabled  INTEGER NOT NULL DEFAULT 0,   -- 0 | 1
  is_default  INTEGER NOT NULL DEFAULT 0,   -- 0 | 1 (solo una puede ser 1)
  created_at  TEXT NOT NULL
);
```

**Invariante:** exactamente una fila tiene `is_default = 1` en todo momento. Cuando el usuario cambia la moneda default, el comando actualiza ambas filas en una transacción.

### Modificación: tabla `account`

Agregar columna `currency_id` (FK → currency, NOT NULL).

```sql
ALTER TABLE account ADD COLUMN currency_id TEXT NOT NULL REFERENCES currency(id);
```

> Nota: SQLite no soporta `ADD COLUMN ... NOT NULL` sin default en tablas existentes. La migración debe proveer un valor default para filas existentes. Se usará el `id` de la moneda habilitada por defecto (USD) como valor inicial, insertado en la misma migración.

### Monedas pre-pobladas (migración)

Las siguientes monedas se insertan todas con `is_enabled = 0`, excepto USD que se inserta con `is_enabled = 1, is_default = 1`:

| Code | Nombre | Símbolo |
|------|--------|---------|
| USD | Dólar Estadounidense | $ |
| EUR | Euro | € |
| MXN | Peso Mexicano | $ |
| GTQ | Quetzal guatemalteco | Q |
| COP | Peso Colombiano | $ |
| ARS | Peso Argentino | $ |
| BRL | Real Brasileño | R$ |
| CLP | Peso Chileno | $ |
| PEN | Sol Peruano | S/ |
| BOB | Boliviano | Bs. |
| PYG | Guaraní Paraguayo | ₲ |
| UYU | Peso Uruguayo | $ |
| CRC | Colón Costarricense | ₡ |
| HNL | Lempira Hondureño | L |
| NIO | Córdoba Nicaragüense | C$ |

---

## 2. Capa de datos

### Archivos nuevos

```
src/lib/database/schema/currency.ts
src/lib/database/repositories/currency/
  currency.queries.ts
  currency.commands.ts
  currency.queries.test.ts
  currency.commands.test.ts
  index.ts
```

### Shared types

Agregar en `_shared/types.ts`:
```ts
export type Currency = typeof currencies.$inferSelect;
export type NewCurrency = typeof currencies.$inferInsert;
```

### Queries

- `findAllCurrencies(db)` → `Currency[]`
- `findEnabledCurrencies(db)` → `Currency[]`
- `findDefaultCurrency(db)` → `Currency | undefined`
- `findCurrencyById(db, id)` → `Currency | undefined`
- `countAccountsByCurrency(db, currencyId)` → `number`

### Commands

- `enableCurrency(db, id)` — activa la moneda, exchange_rate debe ser > 0
- `disableCurrency(db, id)` — lanza error si `countAccountsByCurrency > 0`
- `setDefaultCurrency(db, id)` — transacción: pone `is_default=0` en la actual, `is_default=1` en la nueva; no cambia `is_enabled` (la nueva queda habilitada si no lo estaba)
- `updateExchangeRate(db, id, rate)` — actualiza `exchange_rate`; no aplica a la moneda default (siempre 1.0)

### Migración

Nueva migración `0002_currencies.sql`:
1. Crear tabla `currency`
2. Insertar las 15 monedas. USD usa UUID fijo `'currency-usd-000000000001'` para poder referenciarlo en el paso siguiente; el resto usa UUIDs fijos igualmente pre-generados.
3. `ALTER TABLE account ADD COLUMN currency_id TEXT NOT NULL DEFAULT 'currency-usd-000000000001'`
4. SQLite no permite agregar FK constraints via `ALTER TABLE`. La columna queda sin FK enforcement en filas existentes, pero el schema de Drizzle la declara como FK — las escrituras futuras a través del ORM sí respetan la restricción. No se requiere recrear la tabla.

### DatabaseProvider

Agregar `CurrencyRepository` al contexto:
```ts
type DatabaseContextValue = {
  currencies: CurrencyRepository;
  accountCategories: AccountCategoryRepository;
  accounts: AccountRepository;
  // ...
};
```

---

## 3. Navegación y rutas

### Settings

Agregar entrada "Gestionar monedas" en `SettingsScreen` dentro del contenedor `settings.finances`:
```tsx
<SettingsItem text="settings.currencies" onPress={() => router.push('/monedas')} />
```

### Nuevas rutas

```
src/app/(app)/monedas/_layout.tsx
src/app/(app)/monedas/index.tsx      ← CurrenciesScreen
```

No se necesitan rutas `[id]` ni `nueva` — todo se maneja desde el bottom sheet en la lista.

---

## 4. Pantallas y componentes

### CurrenciesScreen (`/monedas`)

Lista de monedas en dos secciones:

**Habilitadas** (arriba):
- Cada fila: `CODE · Nombre · símbolo` | tipo de cambio (excepto default) | badge "PRINCIPAL" si es default
- Al tocar → abre `CurrencyBottomSheet`

**Disponibles** (abajo, atenuadas):
- Cada fila: `CODE · Nombre · símbolo`
- Al tocar → abre `CurrencyBottomSheet`

### CurrencyBottomSheet

Modal bottom sheet con tres estados:

**Estado: Moneda habilitada (no default)**
- Header: code + nombre + badge "Habilitada"
- Campo: "Tipo de cambio" — `1 [DEFAULT_CODE] equivale a [input] [ESTE_CODE]`
- Botón primario: "Guardar tipo de cambio"
- Botón secundario: "Establecer como moneda principal" → Alert de confirmación → llama `setDefaultCurrency`
- Botón destructivo: "Deshabilitar moneda" → llama `disableCurrency` (muestra error si tiene cuentas)

**Estado: Moneda default**
- Header: code + nombre + badge "Moneda principal"
- Texto informativo: "Esta es la moneda principal. El tipo de cambio siempre es 1."
- Sin botones de acción (no se puede deshabilitar la default)

**Estado: Moneda deshabilitada**
- Header: code + nombre + badge "Deshabilitada" (atenuado)
- Botón: "Habilitar moneda" → habilita y muestra el campo de tipo de cambio

### AccountFormScreen

Agregar campo `currencyId`:
- Select con solo las monedas habilitadas (label: `"$ MXN — Peso Mexicano"`)
- Default value: moneda principal
- Validación: requerida

### AccountsScreen

**Cada fila de cuenta:**
```
[Nombre cuenta]          [símbolo][monto] [CODE pequeño]
[estado]                 Inicial: [símbolo][monto]
```
Ejemplo: `$13,125.00 MXN` (code en texto xs atenuado)

**Totales de sección (SectionHeader):**
- Suma de `currentBalance` de todas las cuentas de esa sección
- Cuentas en moneda default → suma directa
- Cuentas en otras monedas → `balance / exchange_rate` para convertir a la default
- Formato: `$3,250.00 USD` (con código de la moneda default)

---

## 5. Lógica de conversión

```ts
function toDefaultCurrency(balance: number, currency: Currency, defaultCurrency: Currency): number {
  if (currency.id === defaultCurrency.id) return balance;
  // exchange_rate = cuántas unidades de currency = 1 default
  return balance / currency.exchange_rate;
}
```

Esta función vive en `src/lib/currency/conversion.ts` para ser testeable de forma aislada.

---

## 6. i18n

Agregar claves en `es.json`, `en.json`, `ar.json`:

```json
{
  "settings": {
    "currencies": "Monedas"
  },
  "currencies": {
    "title": "Monedas",
    "section_enabled": "Habilitadas",
    "section_available": "Disponibles",
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
    "account_currency_label": "Moneda"
  }
}
```

---

## 7. Restricciones y casos límite

- La moneda default no puede deshabilitarse (el botón no aparece)
- `setDefaultCurrency` habilita la moneda si estaba deshabilitada
- `exchange_rate` de la moneda default siempre es 1.0 (no editable)
- Si no hay moneda default (estado inválido), los totales muestran 0 y se loguea un warning
- El selector de moneda en AccountForm solo muestra monedas habilitadas
- Al cambiar la moneda default, los exchange_rates de las demás monedas NO se recalculan automáticamente — el usuario debe actualizarlos si es necesario

---

## 8. Archivos que se crean o modifican

| Archivo | Acción |
|---|---|
| `src/lib/database/schema/currency.ts` | Nuevo |
| `src/lib/database/schema/index.ts` | Modificar (exportar currency) |
| `src/lib/database/migrations/0002_currencies.sql` | Nuevo |
| `src/lib/database/migrations/index.ts` | Modificar (agregar migración) |
| `src/lib/database/repositories/currency/*` | Nuevo (5 archivos) |
| `src/lib/database/repositories/_shared/types.ts` | Modificar |
| `src/lib/database/provider.tsx` | Modificar |
| `src/lib/currency/conversion.ts` | Nuevo |
| `src/app/(app)/monedas/_layout.tsx` | Nuevo |
| `src/app/(app)/monedas/index.tsx` | Nuevo |
| `src/app/(app)/_layout.tsx` | Modificar (agregar tab/ruta monedas) |
| `src/features/currencies/currencies-screen.tsx` | Nuevo |
| `src/features/currencies/components/currency-bottom-sheet.tsx` | Nuevo |
| `src/features/currencies/components/currency-row.tsx` | Nuevo |
| `src/features/accounts/account-form-screen.tsx` | Modificar (agregar campo moneda) |
| `src/features/accounts/accounts-screen.tsx` | Modificar (símbolo + conversión) |
| `src/features/settings/settings-screen.tsx` | Modificar (agregar entrada monedas) |
| `src/translations/es.json` | Modificar |
| `src/translations/en.json` | Modificar |
| `src/translations/ar.json` | Modificar |
