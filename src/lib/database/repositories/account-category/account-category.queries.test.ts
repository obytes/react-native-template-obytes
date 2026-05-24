import type { DrizzleDB } from '../_shared/types';
import {
  findAccountCategoriesByType,
  findAccountCategoryById,
  findAllAccountCategories,
} from './account-category.queries';

function makeMockChain(opts: { allResult?: any[]; getResult?: any } = {}) {
  const chain: any = {};
  ['select', 'from', 'where'].forEach((m) => {
    chain[m] = jest.fn(() => chain);
  });
  chain.all = jest.fn(() => opts.allResult ?? []);
  chain.get = jest.fn(() => opts.getResult ?? undefined);
  return chain as DrizzleDB;
}

describe('findAllAccountCategories', () => {
  it('returns all categories', () => {
    const rows = [{ id: '1', name: 'Bancos', type: 'activo', createdAt: '2026-01-01' }];
    const db = makeMockChain({ allResult: rows });
    expect(findAllAccountCategories(db)).toEqual(rows);
  });

  it('returns empty array when none exist', () => {
    const db = makeMockChain({ allResult: [] });
    expect(findAllAccountCategories(db)).toEqual([]);
  });
});

describe('findAccountCategoryById', () => {
  it('returns the category when found', () => {
    const row = { id: '1', name: 'Bancos', type: 'activo', createdAt: '2026-01-01' };
    const db = makeMockChain({ getResult: row });
    expect(findAccountCategoryById(db, '1')).toEqual(row);
  });

  it('returns undefined when not found', () => {
    const db = makeMockChain({ getResult: undefined });
    expect(findAccountCategoryById(db, 'missing')).toBeUndefined();
  });
});

describe('findAccountCategoriesByType', () => {
  it('returns filtered categories', () => {
    const rows = [{ id: '2', name: 'Tarjetas', type: 'pasivo', createdAt: '2026-01-01' }];
    const db = makeMockChain({ allResult: rows });
    expect(findAccountCategoriesByType(db, 'pasivo')).toEqual(rows);
  });
});
