import type { Charity } from '@/features/paddock/types';

import { Card, colors, MonoLabel, ProgressBar, Text, View } from '@/components/ui';
import { StarV2 } from '@/components/ui/icons/v2';
import { formatEuro } from '@/features/paddock/lib/format-euro';

export function goalLine(charity: Pick<Charity, 'goalCents' | 'goalProgress'>): string | null {
  if (charity.goalCents === null || charity.goalProgress === null)
    return null;
  return `${Math.round(charity.goalProgress * 100)}% of this year’s ${formatEuro(charity.goalCents)} goal`;
}

/** Forest hero card (frame 15): total, goal bar with star thumb, goal line. */
export function CharityTotalCard({ charity }: { charity: Charity }) {
  const goal = goalLine(charity);
  const percent = charity.goalProgress === null ? 0 : Math.min(100, Math.max(0, Math.round(charity.goalProgress * 100)));
  return (
    <Card variant="forest" testID="charity-total-card" className="gap-8">
      <View className="gap-2">
        <MonoLabel tone="white">Raised together, to date</MonoLabel>
        <Text variant="display-xl" className="text-secondary-container">{formatEuro(charity.totalCents)}</Text>
      </View>
      {goal
        ? (
            <View className="gap-2">
              <ProgressBar
                testID="charity-goal-bar"
                tone="on-dark"
                value={percent}
                accessibilityLabel={goal}
                renderThumb={() => <StarV2 size={21} color={colors.secondaryContainer} />}
              />
              <Text variant="body-sm" className="text-white">{goal}</Text>
            </View>
          )
        : null}
    </Card>
  );
}
