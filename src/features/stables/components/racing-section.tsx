import type { Entry } from '@/features/stables/types';

import * as React from 'react';
import { View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { Card, MonoLabel, Text } from '@/components/ui';
import { ResultRow } from '@/features/stables/components/result-row';
import { formatRaceDayTime, formatRaceDescriptor } from '@/features/stables/lib/horse-facts';
import { tx } from '@/features/stables/lib/tx';
import { translate } from '@/lib/i18n';

type RacingSectionProps = {
  nextEntry: Entry | undefined;
  results: Entry[];
};

function NextEntryRow({ entry, divider }: { entry: Entry; divider: boolean }) {
  const declared = entry.status === 'DECLARED';
  return (
    <View
      testID="next-entry-row"
      className={twMerge('min-h-14 flex-row items-center justify-between gap-3 py-3', divider && 'border-b border-white/12')}
    >
      <View className="flex-1 gap-1">
        <Text variant="body" className="text-white">
          {tx('stables.detail.racingNext', { race: formatRaceDescriptor(entry.race) })}
        </Text>
        <MonoLabel tone="white">{formatRaceDayTime(entry.race.postTime)}</MonoLabel>
      </View>
      {declared
        ? (
            <View testID="next-entry-declared" className="h-[27px] w-[100px] items-center justify-center rounded-sm bg-on-primary-container px-3">
              <Text variant="body-sm" className="font-sans-semibold text-plum">{translate('stables.detail.declared')}</Text>
            </View>
          )
        : null}
    </View>
  );
}

/**
 * Navy "Racing" card (S13-04 detail §4): next entry, then past results.
 * Hidden by the caller when there's neither.
 */
export function RacingSection({ nextEntry, results }: RacingSectionProps) {
  if (!nextEntry && results.length === 0)
    return null;
  return (
    <Card testID="racing-section" variant="navy" className="gap-2">
      <MonoLabel className="text-ice">{translate('stables.detail.racingLabel')}</MonoLabel>
      <View>
        {nextEntry ? <NextEntryRow entry={nextEntry} divider={results.length > 0} /> : null}
        {results.map((entry, i) => (
          <ResultRow key={entry.id} entry={entry} divider={i < results.length - 1} />
        ))}
      </View>
    </Card>
  );
}
