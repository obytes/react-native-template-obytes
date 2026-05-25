import { toDefaultCurrency } from './conversion';

describe('toDefaultCurrency', () => {
  it('returns balance unchanged when exchange rate is 1 (default currency)', () => {
    expect(toDefaultCurrency(1000, 1)).toBe(1000);
  });

  it('converts MXN to USD correctly (rate=17.5 → 13125 MXN = 750 USD)', () => {
    expect(toDefaultCurrency(13125, 17.5)).toBeCloseTo(750, 2);
  });

  it('converts EUR to USD correctly (rate=0.92 → 690 EUR ≈ 750 USD)', () => {
    expect(toDefaultCurrency(690, 0.92)).toBeCloseTo(750, 0);
  });

  it('returns 0 when exchange rate is 0 (avoids division by zero)', () => {
    expect(toDefaultCurrency(500, 0)).toBe(0);
  });

  it('returns 0 when balance is 0', () => {
    expect(toDefaultCurrency(0, 17.5)).toBe(0);
  });
});
