export function toDefaultCurrency(balance: number, exchangeRate: number): number {
  if (exchangeRate === 0)
    return 0;
  return balance / exchangeRate;
}
