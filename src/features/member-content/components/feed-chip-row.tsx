import type { FeedChip } from '@/features/member-content/types';

import * as React from 'react';
import { Pressable, ScrollView, Text } from 'react-native';

type FeedChipRowProps = {
  chips: FeedChip[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export function FeedChipRow({ chips, selectedId, onSelect }: FeedChipRowProps) {
  if (chips.length === 0) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="-mx-1 mb-4"
      contentContainerStyle={{ paddingHorizontal: 4, gap: 8 }}
    >
      {chips.map((chip) => {
        const selected = chip.id === selectedId;
        return (
          <Pressable
            key={chip.id}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            hitSlop={8}
            onPress={() => onSelect(chip.id)}
            className={
              selected
                ? 'rounded-full bg-primary px-4 py-2'
                : 'rounded-full border border-outline-variant bg-white px-4 py-2'
            }
          >
            <Text
              className={
                selected
                  ? 'font-sans-medium text-sm text-white'
                  : 'font-sans-medium text-sm text-ink-variant'
              }
            >
              {chip.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
