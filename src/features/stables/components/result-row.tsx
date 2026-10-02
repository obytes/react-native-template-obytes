import type { Entry } from '@/features/stables/types';

import * as React from 'react';
import { View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { Button, MonoLabel, Text } from '@/components/ui';
import { formatResultLine, formatResultMeta } from '@/features/stables/lib/horse-facts';
import { translate } from '@/lib/i18n';
import { openExternalLink } from '@/lib/open-external-link';

type ResultRowProps = {
  entry: Entry;
  divider?: boolean;
};

/**
 * Past result on the navy Racing card (S13-04 detail §4): "Naas, 6f mdn —
 * 3rd⏳ of 11" over mono "21 JUNE · ⏳6/1", with a "Watch Replay" button when
 * the admin has set `replayUrl` (S8-01 behaviour: opens externally).
 */
export function ResultRow({ entry, divider = false }: ResultRowProps) {
  const replayUrl = entry.replayUrl;
  return (
    <View
      testID={`result-row-${entry.id}`}
      className={twMerge('min-h-14 flex-row items-center justify-between gap-3 py-3', divider && 'border-b border-white/12')}
    >
      <View className="flex-1 gap-1">
        <Text variant="body" className="text-white">{formatResultLine(entry)}</Text>
        <MonoLabel tone="white">{formatResultMeta(entry)}</MonoLabel>
      </View>
      {replayUrl
        ? (
            <Button
              size="sm"
              fullWidth={false}
              className="w-[100px] bg-primary-container"
              label={translate('stables.detail.watchReplay')}
              onPress={() => openExternalLink(replayUrl)}
            />
          )
        : null}
    </View>
  );
}
