import type { YardChips } from '@/features/home/lib/yard-chips';

import { useRouter } from 'expo-router';
import * as React from 'react';
import { View } from 'react-native';

import { ChipRow, MonoLabel } from '@/components/ui';

/**
 * "Today at the yard" (S13-03 §3). Chips are navigational shortcuts, not
 * filters. The row bleeds to the screen edge (−16) and insets its content by
 * the gutter so scrolled chips aren't clipped at the margin.
 */
export function YardChipsRow({ chips }: { chips: YardChips }) {
  const router = useRouter();
  const onSelect = (key: string) => {
    const chip = chips.items.find(c => c.key === key);
    if (chip)
      router.push(chip.href);
  };
  return (
    <View className="gap-2.5">
      <MonoLabel>Today at the yard</MonoLabel>
      <View className="-mx-4">
        <ChipRow
          testID="home-chips"
          items={chips.items}
          selectedKey={chips.selectedKey}
          onSelect={onSelect}
          contentInset={16}
        />
      </View>
    </View>
  );
}
