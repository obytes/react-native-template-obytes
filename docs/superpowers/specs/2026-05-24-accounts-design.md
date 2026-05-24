# Cuentas y Categorías de Cuenta

**Fecha:** 2026-05-24
**Estado:** Aprobado

## Resumen

Agregar la funcionalidad de cuentas financieras prácticas (ej. "BBVA", "Efectivo", "Visa Platinum") y sus categorías (ej. "Cuentas bancarias", "Tarjetas de crédito"). Cada categoría tiene un tipo: activo o pasivo. Las cuentas incluyen saldo inicial, saldo actual, fecha de creación y estado. Las transacciones existentes se vinculan a una cuenta mediante `account_id NOT NULL`.

---

## Base de datos

### Tabla `account_category`

| Campo       | Tipo                              | Notas        |
|-------------|-----------------------------------|--------------|
| id          | text PRIMARY KEY                  | UUID         |
| name        | text NOT NULL                     | ej. "Efectivo" |
| type        | text enum('activo', 'pasivo') NOT NULL |         |
| createdAt   | text NOT NULL                     | ISO string   |

### Tabla `account`

| Campo              | Tipo                                   | Notas                              |
|--------------------|----------------------------------------|------------------------------------|
| id                 | text PRIMARY KEY                       | UUID                               |
| accountCategoryId  | text NOT NULL FK → account_category.id | CASCADE DELETE                     |
| name               | text NOT NULL                          | ej. "BBVA"                         |
| initialBalance     | real NOT NULL                          | Saldo al momento de crear          |
| currentBalance     | real NOT NULL                          | Saldo actual (actualizable)        |
| status             | text enum('active', 'inactive') NOT NULL |                                  |
| createdAt          | text NOT NULL                          | ISO string                         |
| updatedAt          | text NOT NULL                          | ISO string                         |

### Tabla `transaction` (modificación)

Se agrega la columna:

| Campo     | Tipo                          | Notas          |
|-----------|-------------------------------|----------------|
| accountId | text NOT NULL FK → account.id | CASCADE DELETE |

### Migración

Una nueva migración SQL `0001_accounts.sql` que:
1. Crea `account_category`
2. Crea `account`
3. Agrega columna `account_id` a `transaction`

---

## Repositorios

Todos siguen el patrón existente (clase con métodos, funciones de queries/commands separadas).

### `AccountCategoryRepository`
- `findAll(): AccountCategory[]`
- `findByType(type: 'activo' | 'pasivo'): AccountCategory[]`
- `findById(id: string): AccountCategory | undefined`
- `create(data): AccountCategory`
- `update(id, data): AccountCategory`
- `delete(id): void`

### `AccountRepository`
- `findAll(): Account[]`
- `findByType(type: 'activo' | 'pasivo'): Account[]`
- `findByCategory(categoryId: string): Account[]`
- `findById(id: string): Account | undefined`
- `create(data): Account`
- `update(id, data): Account`
- `delete(id): void`

### `TransactionRepository`
- Actualizar tipos inferidos para incluir `accountId`
- No cambia la lógica existente

### `DatabaseProvider`
- Exponer `accountCategories: AccountCategoryRepository`
- Exponer `accounts: AccountRepository`

---

## Navegación y pantallas

Acceso desde Settings → fila "Cuentas" que navega a `/(app)/cuentas`.

### Rutas Expo Router

```
src/app/(app)/
  cuentas/
    index.tsx           ← Lista de cuentas
    nueva.tsx           ← Crear cuenta
    [id].tsx            ← Editar cuenta
    categorias/
      index.tsx         ← Lista de categorías
      nueva.tsx         ← Crear categoría
      [id].tsx          ← Editar categoría
```

### Pantalla: Lista de Cuentas (`/cuentas`)

- Header: "Cuentas" + botón `+` (→ `/cuentas/nueva`)
- Lista agrupada: sección **ACTIVOS** (total) → sub-header por categoría → filas de cuenta; sección **PASIVOS** (total) → ídem
- Cada fila de cuenta muestra: nombre, estado (badge), saldo actual (verde si activo, rojo si pasivo), saldo inicial
- Tocar una fila navega a `/cuentas/[id]` (editar)
- Link "Gestionar categorías" al pie → `/cuentas/categorias`

### Pantalla: Crear/Editar Cuenta (`/cuentas/nueva` y `/cuentas/[id]`)

Formulario con `@tanstack/react-form` + Zod:
- **Nombre** (Input, requerido)
- **Categoría** (Select con opciones de `account_category`, requerido. Si no hay categorías creadas, mostrar mensaje "Primero crea una categoría" con link a `/cuentas/categorias/nueva`)
- **Saldo inicial** (Input numérico, requerido, default 0)
- **Saldo actual** (Input numérico, requerido, default igual al inicial)
- **Estado** (Select: Activa / Inactiva, requerido)
- Botón "Guardar cuenta" / "Actualizar cuenta"

### Pantalla: Lista de Categorías (`/cuentas/categorias`)

- Header: "Categorías" + botón `+` (→ `/cuentas/categorias/nueva`)
- Lista agrupada: sección **ACTIVOS** → filas; sección **PASIVOS** → filas
- Cada fila muestra nombre y badge de tipo
- Tocar navega a `/cuentas/categorias/[id]` (editar)

### Pantalla: Crear/Editar Categoría (`/cuentas/categorias/nueva` y `/cuentas/categorias/[id]`)

Formulario con `@tanstack/react-form` + Zod:
- **Nombre** (Input, requerido)
- **Tipo** (Select: Activo / Pasivo, requerido)
- Botón "Guardar categoría" / "Actualizar categoría"

### Actualización: Formulario de Transacción

El formulario existente de nueva transacción recibe un campo adicional:
- **Cuenta** (Select con cuentas activas, requerido)

---

## Componentes y convenciones

- UI: `Input`, `Select`, `Button`, `Text`, `View` de `@/components/ui`
- Estilos: NativeWind con paleta existente (`neutral`, `primary`, `danger`)
- Validación: Zod + `@tanstack/react-form`, patrón de `add-post-screen.tsx`
- Listas: `FlashList` / patrón de `list.tsx`
- Notificaciones: `react-native-flash-message` (éxito/error al guardar)
- IDs: `randomUUID()` de `expo-crypto`
- Features en: `src/features/accounts/` y `src/features/account-categories/`

---

## Flujo de datos

1. `DatabaseProvider` expone `accountCategories` y `accounts`
2. Las pantallas llaman a `useDatabase()` para acceder a los repositorios directamente (mismo patrón que el resto del proyecto)
3. `_shared/types.ts` se actualiza para exportar `AccountCategory`, `NewAccountCategory`, `Account`, `NewAccount`
4. `currentBalance` se actualiza manualmente desde el formulario de edición; en el futuro puede calcularse automáticamente desde transacciones

---

## Fuera de alcance

- Cálculo automático de `currentBalance` desde transacciones (queda para iteración futura)
- Eliminar cuentas con transacciones asociadas (el CASCADE DELETE maneja la integridad referencial)
- Historial de movimientos por cuenta
