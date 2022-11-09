import { BottomSheetFlatList, BottomSheetModal } from '@gorhom/bottom-sheet';
import * as React from 'react';
import type { PressableProps } from 'react-native';

import { renderBackdrop } from '../bottom-sheet';
import { Pressable } from '../pressable';
import { Text } from '../text';
import { Check } from './icons';

export type Option = { label: string; value: string | number };

type OptionsProps = {
  options: Option[];
  onSelect: (option: Option) => void;
  value?: string | number;
};

function keyExtractor(item: Option) {
  return `select-item-${item.value}`;
}

export const Options = React.forwardRef<BottomSheetModal, OptionsProps>(
  ({ options, onSelect, value }, ref) => {
    const height = options.length * 70 + 100;
    const snapPoints = React.useMemo(() => [height], [height]);
    const renderSelectItem = React.useCallback(
      ({ item }: { item: Option }) => (
        <Option
          key={`select-item-${item.value}`}
          label={item.label}
          selected={value === item.value}
          onPress={() => onSelect(item)}
        />
      ),
      [onSelect, value]
    );

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
      >
        <BottomSheetFlatList
          data={options}
          keyExtractor={keyExtractor}
          renderItem={renderSelectItem}
        />
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
