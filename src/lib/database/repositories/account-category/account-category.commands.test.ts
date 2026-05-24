import type { DrizzleDB } from '../_shared/types';
import {
  createAccountCategory,
  deleteAccountCategory,
  updateAccountCategory,
} from './account-category.commands';

jest.mock('expo-crypto', () => ({ randomUUID: jest.fn(() => 'test-uuid') }));

function makeMockChain(opts: { getResult?: any } = {}) {
  const chain: any = {};
  ['insert', 'values', 'update', 'set', 'where', 'returning', 'delete'].forEach((m) => {
    chain[m] = jest.fn(() => chain);
  });
  chain.get = jest.fn(() => opts.getResult ?? undefined);
  chain.run = jest.fn();
  return chain as DrizzleDB;
}

describe('createAccountCategory', () => {
  it('returns the created category', () => {
    const created = { id: 'test-uuid', name: 'Bancos', type: 'activo', createdAt: expect.any(String) };
    const db = makeMockChain({ getResult: created });
    const result = createAccountCategory(db, { name: 'Bancos', type: 'activo' });
    expect(result).toEqual(created);
  });

  it('throws when insert returns nothing', () => {
    const db = makeMockChain({ getResult: undefined });
    expect(() => createAccountCategory(db, { name: 'Bancos', type: 'activo' })).toThrow(
      'Failed to create account category',
    );
  });
});

describe('updateAccountCategory', () => {
  it('returns the updated category', () => {
    const updated = { id: '1', name: 'Efectivo', type: 'activo', createdAt: '2026-01-01' };
    const db = makeMockChain({ getResult: updated });
    expect(updateAccountCategory(db, '1', { name: 'Efectivo' })).toEqual(updated);
  });

  it('throws when category not found', () => {
    const db = makeMockChain({ getResult: undefined });
    expect(() => updateAccountCategory(db, 'missing', { name: 'X' })).toThrow(
      'Account category missing not found',
    );
  });
});

describe('deleteAccountCategory', () => {
  it('calls delete without throwing', () => {
    const db = makeMockChain();
    expect(() => deleteAccountCategory(db, '1')).not.toThrow();
    expect(db.delete).toHaveBeenCalled();
  });
});
