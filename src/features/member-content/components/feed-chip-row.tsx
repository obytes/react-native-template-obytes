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
                ? 'rounded-full bg-neutral-950 px-4 py-2'
                : 'rounded-full border border-neutral-300 bg-white px-4 py-2'
            }
          >
            <Text
              className={
                selected
                  ? 'font-sans text-sm font-medium text-white'
                  : 'font-sans text-sm font-medium text-neutral-700'
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
