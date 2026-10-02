import * as React from 'react';
import { Pressable, View } from 'react-native';
import { twMerge } from 'tailwind-merge';

import colors from './colors';
import { CaretRightV2 } from './icons/v2';
import { Text } from './text';

export type ListRowProps = {
  label: string;
  /** Right-hand value. A string renders as body text; pass a node for tags/mono. */
  value?: React.ReactNode;
  /** Trailing caret (navigates). */
  chevron?: boolean;
  /** Trailing slot for a control, e.g. a Switch. Replaces value/chevron. */
  accessory?: React.ReactNode;
  /** Hairline divider under the row (turn off for the last row). */
  divider?: boolean;
  onPress?: () => void;
  accessibilityHint?: string;
  className?: string;
  testID?: string;
};

/**
 * Label-left / value-right row with a hairline divider (S13-01 §7): pedigree
 * rows, Profile rows, Notifications. 44pt minimum height.
 */
export function ListRow({
  label,
  value,
  chevron = false,
  accessory,
  divider = true,
  onPress,
  accessibilityHint,
  className,
  testID,
}: ListRowProps) {
  const trailing = accessory ?? (
    <>
      {typeof value === 'string'
        ? <Text variant="body" className="text-ink-variant" numberOfLines={1}>{value}</Text>
        : value}
      {chevron && <CaretRightV2 size={20} color={colors.ink} testID={testID ? `${testID}-chevron` : undefined} />}
    </>
  );

  const content = (
    <>
      <Text variant="body-lg" className="flex-1" numberOfLines={2}>{label}</Text>
      <View className="flex-row items-center gap-2">{trailing}</View>
    </>
  );

  const rowClass = twMerge(
    'min-h-11 flex-row items-center gap-3 py-3',
    divider && 'border-b border-outline-variant',
    className,
  );

  if (onPress) {
    return (
      <Pressable
        testID={testID}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={typeof value === 'string' ? `${label}, ${value}` : label}
        accessibilityHint={accessibilityHint}
        className={rowClass}
        style={({ pressed }) => (pressed ? { opacity: 0.6 } : null)}
      >
        {content}
      </Pressable>
    );
  }
  return (
    <View testID={testID} className={rowClass} accessible={!accessory}>
      {content}
    </View>
  );
}
