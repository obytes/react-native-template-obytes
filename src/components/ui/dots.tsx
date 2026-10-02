import * as React from 'react';
import { View } from 'react-native';
import { twMerge } from 'tailwind-merge';

export type DotsProps = {
  count: number;
  /** Zero-based active page. */
  index: number;
  className?: string;
  testID?: string;
};

/** Carousel page dots (S13-01 §7): 6×6 lilac, inactive at 30%, gap 6. */
export function Dots({ count, index, className, testID }: DotsProps) {
  return (
    <View
      testID={testID}
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 1, max: count, now: index + 1, text: `${index + 1} / ${count}` }}
      className={twMerge('flex-row items-center gap-1.5', className)}
    >
      {Array.from({ length: count }, (_, i) => (
        <View
          key={i}
          testID={testID ? `${testID}-${i}` : undefined}
          className={twMerge('size-1.5 rounded-full bg-on-primary-container', i !== index && 'opacity-30')}
        />
      ))}
    </View>
  );
}
