import type { CurrentCharity } from '@/features/paddock/types';

import { Card, MonoLabel, View } from '@/components/ui';
import { ListRow } from '@/components/ui/list-row';

/** Sage card of current charities. Rows link out only when a url exists. */
export function CurrentCharitiesCard({ charities, onOpen }: { charities: CurrentCharity[]; onOpen: (url: string) => void }) {
  if (charities.length === 0)
    return null;
  return (
    <Card variant="sage" testID="current-charities" className="gap-4">
      <MonoLabel>Current charities</MonoLabel>
      <View>
        {charities.map((c, i) => (
          <ListRow
            key={`${c.name}-${i}`}
            testID={`charity-row-${i}`}
            label={c.name}
            chevron={Boolean(c.url)}
            onPress={c.url ? () => onOpen(c.url ?? '') : undefined}
            divider={i < charities.length - 1}
          />
        ))}
      </View>
    </Card>
  );
}
