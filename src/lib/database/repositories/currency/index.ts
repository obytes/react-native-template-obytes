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
