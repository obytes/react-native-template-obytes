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
