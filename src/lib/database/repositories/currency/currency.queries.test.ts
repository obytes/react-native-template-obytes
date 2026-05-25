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
