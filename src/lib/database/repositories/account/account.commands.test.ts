import type { DrizzleDB } from '../_shared/types';
import { createAccount, deleteAccount, updateAccount } from './account.commands';

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

const sampleAccount = {
  id: 'test-uuid',
  accountCategoryId: 'cat-1',
  name: 'BBVA',
  initialBalance: 8000,
  currentBalance: 8500,
  status: 'active',
  createdAt: expect.any(String),
  updatedAt: expect.any(String),
};

describe('createAccount', () => {
  it('returns the created account', () => {
    const db = makeMockChain({ getResult: sampleAccount });
    const result = createAccount(db, {
      accountCategoryId: 'cat-1',
      currencyId: 'curr-1',
      name: 'BBVA',
      initialBalance: 8000,
      currentBalance: 8500,
      status: 'active',
    });
    expect(result).toEqual(sampleAccount);
  });

  it('throws when insert returns nothing', () => {
    const db = makeMockChain({ getResult: undefined });
    expect(() =>
      createAccount(db, {
        accountCategoryId: 'cat-1',
        currencyId: 'curr-1',
        name: 'BBVA',
        initialBalance: 0,
        currentBalance: 0,
        status: 'active',
      }),
    ).toThrow('Failed to create account');
  });
});

describe('updateAccount', () => {
  it('returns the updated account', () => {
    const updated = { ...sampleAccount, name: 'BBVA Updated' };
    const db = makeMockChain({ getResult: updated });
    expect(updateAccount(db, 'test-uuid', { name: 'BBVA Updated' })).toEqual(updated);
  });

  it('throws when account not found', () => {
    const db = makeMockChain({ getResult: undefined });
    expect(() => updateAccount(db, 'missing', { name: 'X' })).toThrow('Account missing not found');
  });
});

describe('deleteAccount', () => {
  it('calls delete without throwing', () => {
    const db = makeMockChain();
    expect(() => deleteAccount(db, '1')).not.toThrow();
    expect(db.delete).toHaveBeenCalled();
  });
});
