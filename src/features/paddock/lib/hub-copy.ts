import { formatEuro } from '@/features/paddock/lib/format-euro';

export const BENEFITS_FALLBACK = 'Restaurants, hotels, lifestyle partners';
export const CHARITY_FALLBACK = 'Total donated, voting and impact stories';

/** "N offers" once the count is known and non-zero, else the static line. */
export function offersSubtitle(count: number | null): string {
  if (count === null || count === 0)
    return BENEFITS_FALLBACK;
  return `${count} ${count === 1 ? 'offer' : 'offers'}`;
}

/** "€X raised to date." plus the vote clause only when a poll is linked. */
export function charitySubtitle(charity: { totalCents: number; pollId: string | null } | null | undefined): string {
  if (!charity)
    return CHARITY_FALLBACK;
  const raised = `${formatEuro(charity.totalCents)} raised to date`;
  return charity.pollId ? `${raised}. Vote on what’s next` : raised;
}
