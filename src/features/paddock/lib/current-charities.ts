import type { Charity, CurrentCharity } from '@/features/paddock/types';

/** S13-15 `charities[]` when present, else the single active charity. */
export function currentCharities(charity: Charity): CurrentCharity[] {
  if (charity.charities && charity.charities.length > 0)
    return charity.charities;
  return [{ name: charity.charityName, url: charity.websiteUrl }];
}
