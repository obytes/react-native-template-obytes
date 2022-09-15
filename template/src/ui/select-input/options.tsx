import { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as React from 'react';

import { Pressable, Text, View } from '../core';

export type Option = { label: string; value: string };

type OptionsProps = {
  options: Option[];
  onSelect: (option: Option) => void;
};

export const Options = React.forwardRef<BottomSheetModal, OptionsProps>(
  ({ options, onSelect }, ref) => {
    const height = options.length * 70;
    const snapPoints = React.useMemo(() => [height], [height]);
    return (
      <BottomSheetModal ref={ref} index={0} snapPoints={snapPoints}>
        <View className="bg-white">
          {options.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => onSelect(option)}
              className="flex-row items-center border-[1px] border-neutral-300 py-1 px-2"
            >
              <Text variant="md">{option.label}</Text>
            </Pressable>
          ))}
        </View>
      </BottomSheetModal>
    );
  }
);
