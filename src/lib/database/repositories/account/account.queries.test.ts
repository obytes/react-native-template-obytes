import type { DrizzleDB } from '../_shared/types';
import {
  findAccountByCategory,
  findAccountById,
  findAccountsByStatus,
  findAllAccounts,
} from './account.queries';

function makeMockChain(opts: { allResult?: any[]; getResult?: any } = {}) {
  const chain: any = {};
  ['select', 'from', 'where'].forEach((m) => {
    chain[m] = jest.fn(() => chain);
  });
  chain.all = jest.fn(() => opts.allResult ?? []);
  chain.get = jest.fn(() => opts.getResult ?? undefined);
  return chain as DrizzleDB;
}

const sampleAccount = {
  id: '1',
  accountCategoryId: 'cat-1',
  name: 'BBVA',
  initialBalance: 8000,
  currentBalance: 8500,
  status: 'active',
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

describe('findAllAccounts', () => {
  it('returns all accounts', () => {
    const db = makeMockChain({ allResult: [sampleAccount] });
    expect(findAllAccounts(db)).toEqual([sampleAccount]);
  });

  it('returns empty array when none exist', () => {
    const db = makeMockChain({ allResult: [] });
    expect(findAllAccounts(db)).toEqual([]);
  });
});

describe('findAccountById', () => {
  it('returns account when found', () => {
    const db = makeMockChain({ getResult: sampleAccount });
    expect(findAccountById(db, '1')).toEqual(sampleAccount);
  });

  it('returns undefined when not found', () => {
    const db = makeMockChain({ getResult: undefined });
    expect(findAccountById(db, 'missing')).toBeUndefined();
  });
});

describe('findAccountByCategory', () => {
  it('returns accounts for the given category', () => {
    const db = makeMockChain({ allResult: [sampleAccount] });
    expect(findAccountByCategory(db, 'cat-1')).toEqual([sampleAccount]);
  });
});

describe('findAccountsByStatus', () => {
  it('returns accounts matching the status', () => {
    const db = makeMockChain({ allResult: [sampleAccount] });
    expect(findAccountsByStatus(db, 'active')).toEqual([sampleAccount]);
  });
});
