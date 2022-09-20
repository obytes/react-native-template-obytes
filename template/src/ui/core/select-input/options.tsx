import { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as React from 'react';
import type { PressableProps } from 'react-native';

import { renderBackdrop } from '../bottom-sheet';
import { Pressable } from '../pressable';
import { Text } from '../text';
import { View } from '../view';
import { Check } from './check';

export type Option = { label: string; value: string };

type OptionsProps = {
  options: Option[];
  onSelect: (option: Option) => void;
  value?: Option;
};

export const Options = React.forwardRef<BottomSheetModal, OptionsProps>(
  ({ options, onSelect, value }, ref) => {
    const height = options.length * 70 + 100;
    const snapPoints = React.useMemo(() => [height], [height]);

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
      >
        <View className="bg-white pt-2">
          {options.map((option) => (
            <Option
              label={option.label}
              key={option.value}
              selected={value?.value === option.value}
              onPress={() => onSelect(option)}
            />
          ))}
        </View>
      </BottomSheetModal>
    );
  }
);

const Option = ({
  label,
  selected = false,
  ...props
}: PressableProps & { selected?: boolean; label: string }) => {
  return (
    <Pressable
      className="flex-row items-center border-b-[1px] border-neutral-300 py-2 px-3"
      {...props}
    >
      <Text variant="md" className="flex-1">
        {label}
      </Text>
      {selected && <Check />}
    </Pressable>
  );
};
