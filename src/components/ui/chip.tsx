import type { PressableProps } from 'react-native';
import * as React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import { minHitSlop } from './button';
import { Text } from './text';

/**
 * Filter chip (Figma "Labels M", S13-01 §7): 32h r6, padding 7/12,
 * SemiBold 12 navy. Selected = lilac fill + hairline lilac-darker border;
 * unselected = white. Optional count badge 18h r9 (white on selected, cream
 * on unselected).
 */
export type ChipProps = Omit<PressableProps, 'children'> & {
  label: string;
  selected?: boolean;
  count?: number;
  className?: string;
};

export function Chip({ label, selected = false, count, className, testID, ...props }: ChipProps) {
  const a11yLabel = count !== undefined ? `${label}, ${count}` : label;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
      accessibilityState={{ selected }}
      hitSlop={minHitSlop(32)}
      testID={testID}
      className={twMerge(
        'h-8 flex-row items-center gap-1.5 rounded-md px-3',
        selected ? 'border-[0.5px] border-on-primary-container bg-primary-fixed' : 'bg-white',
        className,
      )}
      style={({ pressed }) => (pressed ? { opacity: 0.7 } : null)}
      {...props}
    >
      <Text variant="body-sm" className="font-semibold" numberOfLines={1}>
        {label}
      </Text>
      {count !== undefined && (
        <View
          testID={testID ? `${testID}-count` : undefined}
          className={twMerge(
            'h-[18px] min-w-[18px] items-center justify-center rounded-[9px] px-1.5',
            selected ? 'bg-white' : 'bg-secondary-container',
          )}
        >
          <Text className="font-sans text-[10px]/[13px] font-semibold text-ink">{count}</Text>
        </View>
      )}
    </Pressable>
  );
}

export type ChipRowItem = { key: string; label: string; count?: number };

export type ChipRowProps = {
  items: ChipRowItem[];
  /** Key of the selected chip (single selection, e.g. Horse detail sections). */
  selectedKey?: string;
  onSelect?: (key: string) => void;
  /** Horizontal inset so the first chip lines up with the page gutter. */
  contentInset?: number;
  testID?: string;
};

/** Horizontally scrolling chip row with single selection. */
export function ChipRow({ items, selectedKey, onSelect, contentInset = 0, testID }: ChipRowProps) {
  return (
    <ScrollView
      horizontal
      testID={testID}
      showsHorizontalScrollIndicator={false}
      accessibilityRole="tablist"
      contentContainerStyle={{ gap: 8, paddingHorizontal: contentInset }}
    >
      {items.map(item => (
        <Chip
          key={item.key}
          testID={testID ? `${testID}-${item.key}` : undefined}
          label={item.label}
          count={item.count}
          selected={item.key === selectedKey}
          onPress={() => onSelect?.(item.key)}
        />
      ))}
    </ScrollView>
  );
}
