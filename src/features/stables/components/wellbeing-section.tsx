import type { HorseUpdate } from '@/features/stables/types';

import * as React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { Card, colors, MonoLabel, Text } from '@/components/ui';
import { CaretRightV2 } from '@/components/ui/icons/v2';
import { formatShortDate } from '@/features/stables/lib/horse-facts';
import { tx } from '@/features/stables/lib/tx';
import { translate } from '@/lib/i18n';

type WellbeingSectionProps = {
  updates: HorseUpdate[];
  onOpenUpdate: (update: HorseUpdate) => void;
};

/**
 * Sage "Wellbeing" card (S13-04 detail §6). In S13 it lists the latest
 * `wellbeing` horse updates: title, date (mono, right) and a chevron to the
 * update. The structured "Vet check" / "Training load" rows are S13-10
 * Phase B. Hidden by the caller when there are none.
 */
export function WellbeingSection({ updates, onOpenUpdate }: WellbeingSectionProps) {
  if (updates.length === 0)
    return null;
  return (
    <Card testID="wellbeing-section" variant="sage" className="gap-2 border border-outline-variant">
      <MonoLabel className="text-ink">{translate('stables.detail.wellbeingLabel')}</MonoLabel>
      <View>
        {updates.map((update, i) => (
          <Pressable
            key={update.id}
            testID={`wellbeing-row-${update.id}`}
            onPress={() => onOpenUpdate(update)}
            accessibilityRole="button"
            accessibilityLabel={tx('stables.detail.wellbeingRowA11y', { title: update.title })}
            className={twMerge(
              'min-h-11 flex-row items-center gap-3 py-2.5',
              i < updates.length - 1 && 'border-b border-forest/20',
            )}
            style={({ pressed }) => (pressed ? styles.pressed : null)}
          >
            <Text variant="body-lg" className="flex-1" numberOfLines={2}>{update.title}</Text>
            <MonoLabel className="text-forest">{formatShortDate(update.publishedAt)}</MonoLabel>
            <CaretRightV2 size={18} color={colors.ink} />
          </Pressable>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.6 },
});
