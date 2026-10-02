import type { Charity } from '@/features/paddock/types';

import { Text, View } from '@/components/ui';
import { formatEuro } from '@/features/paddock/lib/format-euro';

export function goalLine(charity: Pick<Charity, 'goalCents' | 'goalProgress'>): string | null {
  if (charity.goalCents === null || charity.goalProgress === null)
    return null;
  return `${Math.round(charity.goalProgress * 100)}% of the ${formatEuro(charity.goalCents)} goal`;
}

export function CharityHeader({ charity }: { charity: Charity }) {
  const goal = goalLine(charity);
  const percent = charity.goalProgress === null ? 0 : Math.round(charity.goalProgress * 100);
  return (
    <View className="gap-3 rounded-2xl bg-surface-container-lowest p-6">
      <Text className="font-mono text-[10px] tracking-widest text-label uppercase">Raised together, to date</Text>
      <Text className="font-display text-5xl tracking-tight text-ink">{formatEuro(charity.totalCents)}</Text>
      {goal
        ? (
            <View className="gap-2">
              <Text className="font-sans text-sm text-ink-variant">{goal}</Text>
              <View className="h-2 overflow-hidden rounded-full bg-surface-container">
                <View testID="charity-goal-bar" className="h-2 rounded-full bg-forest" style={{ width: `${percent}%` }} />
              </View>
            </View>
          )
        : null}
      <Text className="font-sans-semibold text-base text-ink">
        {`${charity.percentage}% of every membership goes to ${charity.charityName}`}
      </Text>
    </View>
  );
}
